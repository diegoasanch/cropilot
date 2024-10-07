import type { ChatsRepository, CreateMessageInput } from "../infra/chats.js";

export type SaveMessageDeps = {
	chatsRepository: ChatsRepository;
};

export function saveMessage({ chatsRepository }: SaveMessageDeps) {
	return async (input: CreateMessageInput) => {
		await chatsRepository.saveMessage(input);
	};
}
