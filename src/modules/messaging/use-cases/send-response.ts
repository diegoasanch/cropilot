import type { TelegramApi } from "../infra/telegram-api.js";

export function sendResponse(telegramApi: TelegramApi) {
	return async (chatId: string, message: string) => {
		console.log("Sending response to", chatId, message);
		await telegramApi.sendMessage(chatId, message);
	};
}
