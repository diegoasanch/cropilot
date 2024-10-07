ALTER TABLE "user" RENAME COLUMN "phone" TO "external_id";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_phone_unique";--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_external_id_unique" UNIQUE("external_id");