import { env } from "./env.js";
import { interpretUserMessage } from "./modules/llm/use-cases/interpret-user-messages/interpret-user-message.js";
import { getClient } from "./modules/messaging/client.js";

import { TemporalApi } from "./modules/nasa/infra/temporal-api.js";
import { Bot } from "grammy";
import { queryTemporalData } from "./modules/nasa/use-cases/temporal-query.js";
import { EClimateParameters } from "./modules/nasa/infra/t-temporal-api.js";
import { groupAndAverageMeasurementsByStages } from "./modules/nasa/utils/group-average-measurements-by-stages.js";
import { interpretViabilityForCropSowing } from "./modules/llm/use-cases/interpret-viability-for-crop-sowing/interpret-viavility-for-crop-sowing.js";

const { Telegram } = require("puregram");

async function startServer() {
	// const db = await initDb();
	const messages = await getClient();

	const telegram = Telegram.fromToken(env.TELEGRAM_BOT_TOKEN);
	// const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

	// telegram.command("start", async (ctx) => {
	// 	ctx.reply("Welcome to Cropilot!");
	// });

	// telegram.command("new_chat", async (ctx) => {
	// 	console.log(ctx.update.message?.from.id);
	// 	const senderId = ctx.update.message?.from.id;
	// 	if (senderId) await messages.closeChat(senderId.toString());

	// 	ctx.reply("New chat started!");
	// });

	telegram.updates.on("message", async (ctx) => {
		// bot.on("message", async (ctx) => {
		console.log(ctx);
		if (!ctx.text && !ctx.location) return;
		const type = ctx.text ? "text" : "location";
		const content = ctx.text || JSON.stringify(ctx.location);

		const chat = await messages.getChatMessages({
			userExternalId: ctx.from.id.toString(),
			userFullName: `${ctx.from.first_name} ${ctx.from.last_name}`,
		});
		await messages.saveMessage({
			content,
			messageType: type,
			conversationId: chat.conversationId,
		});

		let chatHistory = chat.messages.reduce((acc, msg) => {
			if (msg.system) return acc;
			return `${acc}\n- user-message:${msg.messageType} ${msg.content}`;
		}, "");
		chatHistory += `\n- user-message:${type} ${content}`;

		ctx.reply("Estoy pensando...");

		const result = await processMessage(chatHistory);
		ctx.reply(result);
	});

	telegram.updates.on("location", async (ctx) => {
		// bot.on("message", async (ctx) => {
		console.log(ctx);

		const type = "location";
		const content = JSON.stringify({
			latitude: ctx.eventLocation.latitude,
			longitude: ctx.eventLocation.longitude,
		});

		const chat = await messages.getChatMessages({
			userExternalId: ctx.from.id.toString(),
			userFullName: `${ctx.from.first_name} ${ctx.from.last_name}`,
		});
		await messages.saveMessage({
			content,
			messageType: type,
			conversationId: chat.conversationId,
		});

		let chatHistory = chat.messages.reduce((acc, msg) => {
			if (msg.system) return acc;
			return `${acc}\n- user-message:${msg.messageType} ${msg.content}`;
		}, "");
		chatHistory += `\n- user-message:${type} ${content}`;

		console.log(chatHistory);

		ctx.reply("Estoy pensando...");

		const result = await processMessage(chatHistory);
		ctx.reply(result);
	});
	// telegram.updates.on("message", async (ctx) => {
	// 	// bot.on("message", async (ctx) => {
	// 	console.log(ctx);
	// 	if (!ctx.message.text && !ctx.message.location) return;
	// 	const type = ctx.message.text ? "text" : "location";
	// 	const content = ctx.message.text || JSON.stringify(ctx.message.location);

	// 	const chat = await messages.getChatMessages({
	// 		userExternalId: ctx.message.from.id.toString(),
	// 		userFullName: `${ctx.message.from.first_name} ${ctx.message.from.last_name}`,
	// 	});
	// 	await messages.saveMessage({
	// 		content,
	// 		messageType: type,
	// 		conversationId: chat.conversationId,
	// 	});

	// 	let chatHistory = chat.messages.reduce((acc, msg) => {
	// 		if (msg.system) return acc;
	// 		return `${acc}\n- user-message:${msg.messageType} ${msg.content}`;
	// 	}, "");
	// 	chatHistory += `\n- user-message:${type} ${content}`;

	// 	console.log(chatHistory);
	// 	ctx.reply("hi");
	// });
	// bot.start();
	telegram.updates.startPolling();
}

console.log("evaluating...");

async function processMessage(message: string) {
	// STAGE 1: FORMAT INPUT
	const userMessage = message;

	const interpretedUserMessage = await interpretUserMessage(userMessage);

	if (!interpretedUserMessage) throw new Error("ERROR FORMATTING USER MESSAGE");

	if (interpretedUserMessage.status === "needs_more_info")
		throw new Error(`Message Incomplete: ${interpretedUserMessage.message}`);

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
		latitude: interpretedUserMessage.intention.location.latitude,
		longitude: interpretedUserMessage.intention.location.longitude,
		start: new Date(2000, 1, 1),
		end: new Date(),
		interval: "daily",
	});

	if (!nasaMeasurements) throw new Error("FAILED TO RETRIEVE DATA FROM NASA");

	const stages = interpretedUserMessage.intention.stages;

	const measurementsGroupedByStage = groupAndAverageMeasurementsByStages(
		stages,
		nasaMeasurements,
	);

	// STAGE 3: ANSWER

	const isFirstMessage = true; // Receive this
	const answer = await interpretViabilityForCropSowing(
		interpretedUserMessage.intention,
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
