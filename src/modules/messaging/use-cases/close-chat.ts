import type { ChatsRepository } from "../infra/chats.js";

export function closeChat(chatsRepository: ChatsRepository) {
	return async (userId: string) => {
		const openChat = await chatsRepository.findOpenConversation(userId);
		if (openChat) {
			await chatsRepository.stopConversation(openChat.id);
		}
	};
}
