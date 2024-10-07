import type { Message } from "@/db/schema.js";
import type { ChatsRepository } from "../infra/chats.js";
import type { GetOrCreateChat } from "./get-or-create-chat.js";

export type GetChatMessagesDeps = {
	chatsRepository: ChatsRepository;
	getOrCreateChat: GetOrCreateChat;
};

export type GetChatMessagesInput = {
	userExternalId: string;
	userFullName: string;
};

export type GetChatMessages = (
	input: GetChatMessagesInput,
) => Promise<{ conversationId: number; messages: Message[] }>;

export function getChatMessages({
	chatsRepository,
	getOrCreateChat,
}: GetChatMessagesDeps) {
	return async ({ userExternalId, userFullName }: GetChatMessagesInput) => {
		const conversation = await getOrCreateChat({
			userExternalId,
			userFullName,
		});

		const messages = await chatsRepository.findConversationMessages(
			conversation.id,
		);

		return { conversationId: conversation.id, messages };
	};
}
