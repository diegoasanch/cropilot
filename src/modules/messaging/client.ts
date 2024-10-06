import { sendResponse } from "./use-cases/send-response.js";
import { TelegramApi } from "./infra/telegram-api.js";
import { initDb } from "@/db/db.js";
import { ChatsRepository } from "./infra/chats.js";
import { getOrCreateChat } from "./use-cases/get-or-create-chat.js";

const telegramApi = new TelegramApi("TOKEN");

export async function getClient() {
	const db = await initDb();
	const chatsRepository = new ChatsRepository(db);

	return {
		sendResponse: sendResponse(telegramApi),
		getOrCreateChat: getOrCreateChat(chatsRepository),
	};
}
