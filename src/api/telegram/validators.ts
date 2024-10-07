import type {
	TelegramCommand,
	TelegramLocation,
	TelegramMessage,
} from "./types.js";

export function isCommand<T>(ctx: T): ctx is T & TelegramCommand {
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

export function isLocation<T>(ctx: T): ctx is T & TelegramLocation {
	if (!!ctx && typeof ctx === "object" && "eventLocation" in ctx) {
		return true;
	}
	return false;
}

export function isMessage<T>(ctx: T): ctx is T & TelegramMessage {
	if (!!ctx && typeof ctx === "object" && "text" in ctx) {
		return true;
	}
	return false;
}
