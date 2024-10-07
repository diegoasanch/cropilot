import { conversation, message, user } from "@/db/schema.js";
import type { Message, Conversation, User } from "@/db/schema.js";
import type { DB } from "@/db/db.js";
import { eq, and, desc, gt } from "drizzle-orm";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export type CreateMessageInput = {
	content: string;
	messageType: "text" | "image" | "location";
	conversationId: number;
	system: boolean;
	initiator: "user" | "assistant";
};

export class ChatsRepository {
	constructor(private readonly db: DB) {}

	async createConversation(
		userExternalId: string,
		fullName: string,
	): Promise<Conversation> {
		let dbUser: User;
		[dbUser] = await this.db
			.select()
			.from(user)
			.where(eq(user.externalId, userExternalId));

		if (!dbUser) {
			[dbUser] = await this.db
				.insert(user)
				.values({ externalId: userExternalId, fullName })
				.onConflictDoNothing()
				.returning();
		}

		if (!dbUser) throw new Error("Error creating user");

		const [newConversation] = await this.db
			.insert(conversation)
			.values({ userId: dbUser.id })
			.returning();
		if (!newConversation) throw new Error("Error creating conversation");

		return newConversation;
	}

	async findOpenConversation(
		userExternalId: string,
	): Promise<Conversation | null> {
		try {
			const [messageInOpenConversation] = await this.db
				.select()
				.from(user)
				.leftJoin(conversation, eq(user.id, conversation.userId))
				.leftJoin(message, eq(conversation.id, message.conversationId))
				.where(
					and(
						eq(user.externalId, userExternalId),
						eq(conversation.userStopped, false),
						gt(
							message.createdAt,
							dayjs().utc().subtract(5, "minutes").toDate(),
						),
					),
				)
				.orderBy(desc(message.createdAt))
				.limit(1);

			if (!messageInOpenConversation || !messageInOpenConversation.conversation)
				return null;

			return messageInOpenConversation.conversation;
		} catch (error) {
			console.error(error);
			return null;
		}
	}

	async stopConversation(conversationId: number) {
		await this.db
			.update(conversation)
			.set({ userStopped: true })
			.where(eq(conversation.id, conversationId));
	}

	async findConversationMessages(conversationId: number): Promise<Message[]> {
		return this.db
			.select()
			.from(message)
			.where(eq(message.conversationId, conversationId));
	}

	async saveMessage(input: CreateMessageInput) {
		await this.db.insert(message).values(input).onConflictDoNothing();
	}
}
