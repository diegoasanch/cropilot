import { initDb } from "@/db/db.js";
import { ChatsRepository } from "./infra/chats.js";
import { getOrCreateChat } from "./use-cases/get-or-create-chat.js";
import { getChatMessages } from "./use-cases/get-chat-messages.js";
import { closeChat } from "./use-cases/close-chat.js";
import { saveMessage } from "./use-cases/save-message.js";

export async function getClient() {
	const db = await initDb();
	const chatsRepository = new ChatsRepository(db);
	const getOrCreateChatUseCase = getOrCreateChat({ chatsRepository });

	return {
		getOrCreateChat: getOrCreateChatUseCase,
		getChatMessages: getChatMessages({
			chatsRepository,
			getOrCreateChat: getOrCreateChatUseCase,
		}),
		closeChat: closeChat({ chatsRepository }),
		saveMessage: saveMessage({ chatsRepository }),
	};
}
