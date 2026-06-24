-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "manager_notified_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "notification_logs" ADD COLUMN     "lead_id" INTEGER;

-- CreateIndex
CREATE INDEX "leads_has_booked_branch_id_manager_notified_at_last_message_idx" ON "leads"("has_booked", "branch_id", "manager_notified_at", "last_message_at");

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: mark all existing leads as already-notified so the cron job
-- doesn't flood managers about historical conversations on first run.
-- New leads created after this migration will get manager_notified_at = NULL
-- and become eligible for notification per the cron's normal criteria.
UPDATE "leads" SET "manager_notified_at" = NOW() WHERE "manager_notified_at" IS NULL;
