import {
	pgTable,
	serial,
	text,
	timestamp,
	boolean,
	pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
	id: serial("id").primaryKey(),
	externalId: text("external_id").notNull().unique(),
	fullName: text("full_name").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export const userRelations = relations(user, ({ many }) => ({
	conversations: many(conversation),
	userContexts: many(userContext),
}));

export const conversation = pgTable("conversation", {
	id: serial("id").primaryKey(),
	userId: serial("user_id")
		.notNull()
		.references(() => user.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	userStopped: boolean("user_stopped").notNull().default(false),
});

export const conversationRelations = relations(
	conversation,
	({ one, many }) => ({
		user: one(user, {
			fields: [conversation.userId],
			references: [user.id],
		}),
		messages: many(message),
	}),
);

export const messageTypeEnum = pgEnum("message_type", [
	"text",
	"image",
	"location",
]);

export const message = pgTable("message", {
	id: serial("id").primaryKey(),
	conversationId: serial("conversation_id")
		.notNull()
		.references(() => conversation.id),
	system: boolean("system").notNull().default(false),
	content: text("content").notNull(),
	messageType: messageTypeEnum("message_type").notNull().default("text"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageRelations = relations(message, ({ one }) => ({
	conversation: one(conversation, {
		fields: [message.conversationId],
		references: [conversation.id],
	}),
}));

export const userContext = pgTable("user_context", {
	id: serial("id").primaryKey(),
	content: text("content").notNull(),
	userId: serial("user_id")
		.notNull()
		.references(() => user.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.notNull()
		.$onUpdateFn(() => new Date()),
});

export const userContextRelations = relations(userContext, ({ one }) => ({
	user: one(user, {
		fields: [userContext.userId],
		references: [user.id],
	}),
}));

export type User = typeof user.$inferSelect;
export type Conversation = typeof conversation.$inferSelect;
export type Message = typeof message.$inferSelect;
export type UserContext = typeof userContext.$inferSelect;
