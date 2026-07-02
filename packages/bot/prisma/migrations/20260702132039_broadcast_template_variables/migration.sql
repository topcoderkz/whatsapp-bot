-- AlterTable
ALTER TABLE "broadcast_messages" ADD COLUMN     "template_variables" JSONB;

-- Backfill legacy rows so the bot's new code can treat every row uniformly:
-- pre-existing broadcasts stored their marketing body in message_text and
-- used the single-placeholder broadcast_message template, so [message_text]
-- is the correct variables array for them.
UPDATE "broadcast_messages"
SET "template_variables" = jsonb_build_array("message_text")
WHERE "template_variables" IS NULL;
