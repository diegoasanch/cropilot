DO $$ BEGIN
 CREATE TYPE "public"."message_initiator" AS ENUM('user', 'assistant');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "initiator" "message_initiator" DEFAULT 'user' NOT NULL;