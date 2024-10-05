import { sendResponse } from "./use-cases/send-response.js";
import { TelegramApi } from "./infra/telegram-api.js";

const telegramApi = new TelegramApi("TOKEN");

export const messaging = {
	sendResponse: sendResponse(telegramApi),
};
