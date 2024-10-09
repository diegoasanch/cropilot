import { env } from "./env.js";
import { getMessagesClient } from "./modules/messaging/client.js";
import { getLlmClient } from "./modules/llm/client.js";
import { Telegram } from "puregram";
import type {
	TelegramCommandContext,
	TelegramContext,
	TelegramMessageContext,
} from "./api/telegram/types.js";
import { isCommand, isMessage } from "./api/telegram/validators.js";
import * as api from "./api/handler.js";
import i18next from "./i18n/index.js";

function getContext<T>(
	msgApi: T,
): T & { setLanguage: (language: string) => void } {
	return {
		...msgApi,
		setLanguage: (language: string) => {
			i18next.changeLanguage(language);
		},
	};
}

async function startServer() {
	const messages = await getMessagesClient();
	const telegram = Telegram.fromToken(env.TELEGRAM_BOT_TOKEN);
	const llm = await getLlmClient();

	telegram.updates.on(
		"message",
		async (msg: TelegramMessageContext | TelegramCommandContext) => {
			const ctx = getContext(msg);

			console.log("ctx", ctx);
			ctx.setLanguage(ctx.from.languageCode);

			if (isCommand(ctx)) return await api.handleCommand({ ctx, messages });
			if (isMessage(ctx))
				return await api.handleMessage(
					ctx,
					ctx.text ?? "",
					"text",
					messages,
					llm,
				);
		},
	);

	telegram.updates.on("location", async (_ctx: TelegramContext) => {
		const ctx = getContext(_ctx);

		console.log("ctx", ctx);
		ctx.setLanguage(ctx.from.languageCode);

		if (!("eventLocation" in ctx)) {
			ctx.reply(i18next.t("errorGettingLocation"));
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
