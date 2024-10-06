import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: serial("id").primaryKey(),
	fullName: text("full_name"),
	phone: varchar("phone", { length: 256 }),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdateFn(() => new Date()),
});

export type User = typeof user.$inferSelect;
