import { env } from "./env.js";
import { getClient } from "./modules/messaging/client.js";

import { Bot } from "grammy";

async function startServer() {
	// const db = await initDb();
	const messages = await getClient();

	const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

	bot.command("start", async (ctx) => {
		ctx.reply("Welcome to Cropilot!");
	});

	bot.command("new_chat", async (ctx) => {
		console.log(ctx.update.message?.from.id);
		const senderId = ctx.update.message?.from.id;
		if (senderId) await messages.closeChat(senderId.toString());

		ctx.reply("New chat started!");
	});

	bot.on("message", async (ctx) => {
		console.log(ctx.message);
		if (!ctx.message.text && !ctx.message.location) return;
		const type = ctx.message.text ? "text" : "location";
		const content = ctx.message.text || JSON.stringify(ctx.message.location);

		const chat = await messages.getChatMessages({
			userExternalId: ctx.message.from.id.toString(),
			userFullName: `${ctx.message.from.first_name} ${ctx.message.from.last_name}`,
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
	});

	bot.start();

	// const fastify = Fastify({
	// 	logger: true,
	// });

	// fastify.get("/", (request, reply) => {
	// 	reply.send({ team: "Los Andevelopers", project: "Cropilot" });
	// });

	// fastify.get("/users", async (request, reply) => {
	// 	const users = await db.select().from(user);
	// 	reply.send(users);
	// });
	// fastify.get("/temporal", async (request, reply) => {
	// 	const temporalApi = new TemporalApi(env.TEMPORAL_API_BASE_URL);
	// 	const temporalDataQuery = queryTemporalData(temporalApi);

	// 	const userMessage =
	// 		"Quiero hacer una siembra de papa el proximo mes de noviembre en estas coordenadas  9.353614 -70.316381";

	// 	const interpretedUserMessage = await interpretUserMessage(userMessage);

	// 	if (!interpretedUserMessage)
	// 		throw new Error("ERROR FORMATTING USER MESSAGE");

	// 	const nasaMeasurements = await temporalDataQuery({
	// 		parameters: [
	// 			EClimateParameters.T2M, // Temperature at 2 meters (°C)
	// 			EClimateParameters.TS, // Earth Skin Temperature (°C)
	// 			EClimateParameters.PRECTOTCORR, // Precipitation (mm/day)
	// 			EClimateParameters.QV2M, // Specific Humidity at 2 meters (g/kg)
	// 			EClimateParameters.WS2M, // Wind Speed at 2 meters (m/s)
	// 			EClimateParameters.GWETTOP, // Surface Soil Wetness (1)
	// 			EClimateParameters.GWETROOT, // Root Zone Soil Wetness (1)
	// 			EClimateParameters.GWETPROF, // Profile Soil Moisture (1)
	// 		],
	// 		latitude: interpretedUserMessage.location.latitude,
	// 		longitude: interpretedUserMessage.location.longitude,
	// 		start: new Date(2000, 1, 1),
	// 		end: new Date(),
	// 		interval: "daily",
	// 	});

	// 	if (!nasaMeasurements) throw new Error("FAILED TO RETRIEVE DATA FROM NASA");

	// 	const stages = interpretedUserMessage.stages;

	// 	const measurementsGroupedByStage = groupAndAverageMeasurementsByStages(
	// 		stages,
	// 		nasaMeasurements,
	// 	);

	// 	const answer = await interpretViabilityForCropSowing(
	// 		interpretedUserMessage,
	// 		{
	// 			...measurementsGroupedByStage,
	// 		},
	// 	);

	// 	reply.send({
	// 		answer,
	// 	});
	// });

	// fastify.listen({ port: env.PORT }, (err) => {
	// 	if (err) {
	// 		fastify.log.error(err);
	// 		process.exit(1);
	// 	}
	// });
}

startServer().catch((err) => {
	console.error("Failed to start server:", err);
	process.exit(1);
});
