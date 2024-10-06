import { conversation, message, user } from "@/db/schema.js";
import type { Chat } from "../domain/chat.js";
import type { DB } from "@/db/db.js";
import { eq, and, lt, desc, gt } from "drizzle-orm";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(utc);

export class ChatsRepository {
	constructor(private readonly db: DB) {}

	async findOpenConversation(userExternalId: string): Promise<Chat | null> {
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
						gt(message.createdAt, dayjs.utc().subtract(5, "minutes").toDate()),
					),
				)
				.orderBy(desc(message.createdAt))
				.limit(1);

			if (!messageInOpenConversation || !messageInOpenConversation.conversation)
				return null;

			return {
				id: messageInOpenConversation.conversation.id,
				userId: messageInOpenConversation.user.id,
			};
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}
