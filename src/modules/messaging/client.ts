import { ChatsRepository } from "./infra/chats.js";
import { getOrCreateChat } from "./use-cases/get-or-create-chat.js";
// import { closeChat } from "./use-cases/close-chat.js";

import { initDb } from "@/db/db.js";
export async function getClient() {
	const db = await initDb();
	const chatsRepository = new ChatsRepository(db);

	return {
		getOrCreateChat: getOrCreateChat({ chatsRepository }),
		// closeChat: closeChat({ chatsRepository }),
	};
}
