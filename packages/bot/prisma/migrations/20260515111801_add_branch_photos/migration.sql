-- CreateTable
CREATE TABLE "branch_photos" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "branch_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "branch_photos" ADD CONSTRAINT "branch_photos_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
