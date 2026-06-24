-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "last_state" TEXT NOT NULL,
    "branch_id" INTEGER,
    "has_booked" BOOLEAN NOT NULL DEFAULT false,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "first_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leads_phone_key" ON "leads"("phone");

-- CreateIndex
CREATE INDEX "leads_last_message_at_idx" ON "leads"("last_message_at");

-- CreateIndex
CREATE INDEX "leads_has_booked_last_message_at_idx" ON "leads"("has_booked", "last_message_at");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
