import type {
	TelegramApi,
	TelegramCommandContext,
	TelegramLocationContext,
	TelegramMessageContext,
} from "./types.js";

export function isCommand<T extends TelegramApi>(
	ctx: T,
): ctx is T & TelegramCommandContext {
	if (
		!!ctx &&
		typeof ctx === "object" &&
		"entities" in ctx &&
		Array.isArray(ctx.entities)
	) {
		return ctx.entities.some((entity) => entity.type === "bot_command");
	}
	return false;
}

export function isLocation<T>(ctx: T): ctx is T & TelegramLocationContext {
	if (!!ctx && typeof ctx === "object" && "eventLocation" in ctx) {
		return true;
	}
	return false;
}

export function isMessage<T>(ctx: T): ctx is T & TelegramMessageContext {
	if (!!ctx && typeof ctx === "object" && "text" in ctx) {
		return true;
	}
	return false;
}
