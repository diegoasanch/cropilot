import type { ChatsRepository } from "../infra/chats.js";

export function getOrCreateChat(chatsRepository: ChatsRepository) {
	return async (userExternalId: string) => {
		return chatsRepository.findOpenConversation(userExternalId);
	};
}
