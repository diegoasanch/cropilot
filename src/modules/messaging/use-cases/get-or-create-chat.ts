import type { Conversation } from "@/db/schema.js";
import type { ChatsRepository } from "../infra/chats.js";

export type GetOrCreateChatDeps = {
	chatsRepository: ChatsRepository;
};

export type GetOrCreateChatInput = {
	userExternalId: string;
	userFullName: string;
};

export type GetOrCreateChat = (
	input: GetOrCreateChatInput,
) => Promise<Conversation>;

export function getOrCreateChat({
	chatsRepository,
}: GetOrCreateChatDeps): GetOrCreateChat {
	return async ({ userExternalId, userFullName }: GetOrCreateChatInput) => {
		const openChat = await chatsRepository.findOpenConversation(userExternalId);
		if (openChat) return openChat;
		return chatsRepository.createConversation(userExternalId, userFullName);
	};
}
