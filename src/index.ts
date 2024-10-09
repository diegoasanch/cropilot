import { env } from "./env.js";
import { getMessagesClient } from "./modules/messaging/client.js";
import { getLlmClient } from "./modules/llm/client.js";
import { Telegram } from "puregram";
import type {
	TelegramCommandContext,
	TelegramContext,
	TelegramPayload,
	TelegramMessageContext,
	TelegramPayloadContext,
} from "./api/telegram/types.js";
import { isCommand, isMessage } from "./api/telegram/validators.js";
import * as api from "./api/handler.js";
import i18next from "./i18n/index.js";

function getContext(ctx: unknown) {
	Object.defineProperty(ctx, "setLanguage", {
		value: (language: string) => {
			i18next.changeLanguage(language);
		},
	});
}

function getLanguageCode(
	ctx: TelegramMessageContext | TelegramCommandContext | TelegramPayload,
) {
	if ("payload" in ctx) return ctx.payload?.from?.language_code ?? "en";
	return ctx?.from?.languageCode ?? "en";
}

async function startServer() {
	const messages = await getMessagesClient();
	const telegram = Telegram.fromToken(env.TELEGRAM_BOT_TOKEN);
	const llm = await getLlmClient();

	telegram.updates.use(async (ctx) => {
		getContext(ctx);
	});

	telegram.updates.on(
		"message",
		async (
			ctx:
				| TelegramMessageContext
				| TelegramCommandContext
				| TelegramPayloadContext,
		) => {
			console.log("msg:ctx", ctx);
			ctx.setLanguage(getLanguageCode(ctx));

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

	telegram.updates.on("location", async (ctx: TelegramContext) => {
		console.log("location:ctx", ctx);
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
