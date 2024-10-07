import type { ChatsRepository } from "../infra/chats.js";

export type CloseChatDeps = {
	chatsRepository: ChatsRepository;
};

export function closeChat({ chatsRepository }: CloseChatDeps) {
	return async (userId: string) => {
		const openChat = await chatsRepository.findOpenConversation(userId);
		if (openChat) {
			await chatsRepository.stopConversation(openChat.id);
		}
	};
}
