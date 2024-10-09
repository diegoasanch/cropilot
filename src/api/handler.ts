import type {
	TelegramApi,
	TelegramCommand,
	TelegramContext,
	TelegramOptions,
} from "./telegram/types.js";
import type { MessagesClient } from "@/modules/messaging/client.js";
import type { LlmClient } from "@/modules/llm/client.js";
import type { InterpretedUserMessage } from "@/modules/llm/use-cases/interpret-user-messages/t-interpret-user-message.js";
import { TemporalApi } from "@/modules/nasa/infra/temporal-api.js";
import { queryTemporalData } from "@/modules/nasa/use-cases/temporal-query.js";
import { EClimateParameters } from "@/modules/nasa/infra/t-temporal-api.js";
import { env } from "@/env.js";
import { groupAndAverageMeasurementsByStages } from "@/modules/nasa/utils/group-average-measurements-by-stages.js";

async function send({
	ctx,
	message,
	messages,
	options,
	conversationId,
}: {
	ctx: TelegramContext;
	message: string;
	messages: MessagesClient;
	conversationId: number;
	options?: TelegramOptions;
}) {
	await ctx.send(message, options);
	await messages.saveMessage({
		content: message,
		messageType: "text",
		conversationId,
		system: true,
		initiator: "assistant",
	});
}

export async function handleCommand({
	ctx,
	messages,
}: {
	ctx: TelegramApi & TelegramCommand;
	messages: MessagesClient;
}) {
	const senderId = ctx.from.id;
	if (ctx.text === "/start") {
		ctx.reply("Welcome to Cropilot!");
	} else if (ctx.text === "/new") {
		if (senderId) {
			await messages.closeChat(senderId.toString());
			ctx.send("New chat started!");
		}
	} else {
		ctx.reply("Unknown command");
	}
}

export async function handleMessage(
	ctx: TelegramContext,
	messageContent: string,
	messageType: "text" | "location",
	messages: MessagesClient,
	llm: LlmClient,
) {
	// Send a typing action every second, this interval is cleared in the finally block
	const typingId = setInterval(
		async () => await ctx.sendChatAction("typing", { suppress: true }),
		1 * 1000,
	);

	try {
		const chat = await messages.getChatMessages({
			userExternalId: ctx.from.id.toString(),
			userFullName: `${ctx.from.firstName} ${ctx.from.lastName}`,
		});
		await messages.saveMessage({
			content: messageContent,
			messageType,
			conversationId: chat.conversationId,
			system: false,
			initiator: "user",
		});

		const chatHistory = chat.messages.map((msg) => ({
			content: msg.content,
			role: msg.initiator === "user" ? ("user" as const) : ("system" as const),
		}));
		chatHistory.push({
			content: messageContent,
			role: "user" as const,
		});

		const interpretedUserMessage = await llm.interpretUserMessage({
			userMessage: messageContent,
			chatHistory,
		});
		if (!interpretedUserMessage) {
			ctx.reply("Error interpreting your message");
			throw new Error("Error interpreting your message");
		}

		if (interpretedUserMessage.status === "needs_more_info") {
			return send({
				ctx,
				message: interpretedUserMessage.message,
				messages,
				conversationId: chat.conversationId,
			});
		}

		ctx.send("Estoy pensando...");
		const result = await processMessage(interpretedUserMessage.intention, llm);

		await send({
			ctx,
			message: result.toString(),
			messages,
			conversationId: chat.conversationId,
			options: { parse_mode: "HTML" },
		});
	} catch (error) {
		console.error("Error processing message:", error);
		ctx.reply("Error processing your message");
	} finally {
		clearInterval(typingId);
	}
}

async function processMessage(message: InterpretedUserMessage, llm: LlmClient) {
	// STAGE 2: RETRIEVE NASA DATA
	const temporalApi = new TemporalApi(env.TEMPORAL_API_BASE_URL);
	const temporalDataQuery = queryTemporalData(temporalApi);

	const nasaMeasurements = await temporalDataQuery({
		parameters: [
			EClimateParameters.T2M, // Temperature at 2 meters (°C)
			EClimateParameters.TS, // Earth Skin Temperature (°C)
			EClimateParameters.PRECTOTCORR, // Precipitation (mm/day)
			EClimateParameters.QV2M, // Specific Humidity at 2 meters (g/kg)
			EClimateParameters.WS2M, // Wind Speed at 2 meters (m/s)
			EClimateParameters.GWETTOP, // Surface Soil Wetness (1)
			EClimateParameters.GWETROOT, // Root Zone Soil Wetness (1)
			EClimateParameters.GWETPROF, // Profile Soil Moisture (1)
		],
		latitude: message.location.latitude,
		longitude: message.location.longitude,
		start: new Date(2000, 1, 1),
		end: new Date(),
		interval: "daily",
	});

	if (!nasaMeasurements) throw new Error("FAILED TO RETRIEVE DATA FROM NASA");

	const stages = message.stages;

	const measurementsGroupedByStage = groupAndAverageMeasurementsByStages(
		stages,
		nasaMeasurements,
	);

	// STAGE 3: ANSWER
	const answer = await llm.interpretViabilityForCropSowing({
		interpretedUserMessage: message,
		measurementsGroupedByStage,
	});

	return answer;
}
