import { env } from "./env.js";
import { getMessagesClient } from "./modules/messaging/client.js";
import { getLlmClient } from "./modules/llm/client.js";
import { Telegram } from "puregram";
import type { TelegramContext } from "./api/telegram/types.js";
import { isCommand, isMessage } from "./api/telegram/validators.js";
import * as api from "./api/handler.js";

async function startServer() {
	const messages = await getMessagesClient();
	const telegram = Telegram.fromToken(env.TELEGRAM_BOT_TOKEN);
	const llm = await getLlmClient();

	telegram.updates.on("message", async (msg: TelegramContext) => {
		console.log("msg", msg);

		if (!isMessage(msg)) return;
		if (isCommand(msg)) return await api.handleCommand({ ctx: msg, messages });

		await api.handleMessage(msg, msg.text ?? "", "text", messages, llm);
	});

	telegram.updates.on("location", async (ctx: TelegramContext) => {
		console.log(ctx);
		if (!("eventLocation" in ctx)) {
			ctx.reply("Error getting your location");
			return;
		}

		const content = {
			latitude: ctx.eventLocation.latitude,
			longitude: ctx.eventLocation.longitude,
		};
		await api.handleMessage(
			ctx,
			JSON.stringify(content),
			"location",
			messages,
			llm,
		);
	});
	telegram.updates.startPolling();
}

startServer().catch((err) => {
	console.error("Failed to start server:", err);
	process.exit(1);
});
