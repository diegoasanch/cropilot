import { env } from "./env.js";
import { interpretUserMessage } from "./modules/llm/use-cases/interpret-user-messages/interpret-user-message.js";
import { getClient } from "./modules/messaging/client.js";

import { TemporalApi } from "./modules/nasa/infra/temporal-api.js";
import { queryTemporalData } from "./modules/nasa/use-cases/temporal-query.js";
import { EClimateParameters } from "./modules/nasa/infra/t-temporal-api.js";
import { groupAndAverageMeasurementsByStages } from "./modules/nasa/utils/group-average-measurements-by-stages.js";
import { interpretViabilityForCropSowing } from "./modules/llm/use-cases/interpret-viability-for-crop-sowing/interpret-viavility-for-crop-sowing.js";
import type { InterpretedUserMessage } from "./modules/llm/use-cases/interpret-user-messages/t-interpret-user-message.js";

type Messages = Awaited<ReturnType<typeof getClient>>;

const { Telegram } = require("puregram");

async function startServer() {
	const messages = await getClient();
	const telegram = Telegram.fromToken(env.TELEGRAM_BOT_TOKEN);

	telegram.updates.on("message", async (ctx) => {
		if (ctx.entities) {
			const [entity] = ctx.entities;
			if (entity.type === "bot_command") {
				if (ctx.text === "/start") {
					ctx.reply("Welcome to Cropilot!");
				} else if (ctx.text === "/new_chat") {
					const senderId = ctx.from.id;
					if (senderId) await messages.closeChat(senderId.toString());
					ctx.reply("New chat started!");
				} else {
					ctx.reply("Unknown command");
				}
				return;
			}
		}

		console.log(ctx);
		await handleMessage(ctx, ctx.text, "text", messages);
	});

	telegram.updates.on("location", async (ctx) => {
		console.log(ctx);
		const content = JSON.stringify({
			latitude: ctx.eventLocation.latitude,
			longitude: ctx.eventLocation.longitude,
		});
		await handleMessage(ctx, content, "location", messages);
	});
	telegram.updates.startPolling();
}

console.log("evaluating...");

async function handleMessage(
	ctx: any,
	messageContent: string,
	messageType: "text" | "location",
	messages: Messages,
) {
	await ctx.sendChatAction("typing", { suppress: true });

	const chat = await messages.getChatMessages({
		userExternalId: ctx.from.id.toString(),
		userFullName: `${ctx.from.first_name} ${ctx.from.last_name}`,
	});
	await messages.saveMessage({
		content: messageContent,
		messageType,
		conversationId: chat.conversationId,
	});

	let chatHistory = chat.messages.reduce((acc, msg) => {
		if (msg.system) return acc;
		return `${acc}\n- user-message:${msg.messageType} ${msg.content}`;
	}, "");
	chatHistory += `\n- user-message:${messageType} ${messageContent}`;

	const interpretedUserMessage = await interpretUserMessage(chatHistory);
	if (!interpretedUserMessage) {
		ctx.reply("Error interpreting your message");
		throw new Error("Error interpreting your message");
	}

	if (interpretedUserMessage.status === "needs_more_info") {
		ctx.reply(interpretedUserMessage.message);
		return;
	}

	await ctx.reply("Estoy pensando...");
	await ctx.sendChatAction("typing", { suppress: true });

	const result = await processMessage(
		interpretedUserMessage.intention,
		chat.messages.length === 0,
	);
	ctx.reply(result);
}

async function processMessage(
	message: InterpretedUserMessage,
	isFirstMessage: boolean,
) {
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
	const answer = await interpretViabilityForCropSowing(
		message,
		{
			...measurementsGroupedByStage,
		},
		isFirstMessage,
	);

	return answer;
}

console.log("evaluated...");

startServer().catch((err) => {
	console.error("Failed to start server:", err);
	process.exit(1);
});
