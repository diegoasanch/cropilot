import type { TelegramApi } from "../infra/telegram-api.js";

export function sendResponse(telegramApi: Pick<TelegramApi, "sendMessage">) {
	return async (chatId: string, message: string) => {
		console.log("Sending response to", chatId, message);
		await telegramApi.sendMessage(chatId, message);
	};
}
