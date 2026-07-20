-- AlterTable
ALTER TABLE "trainers" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "trainer_photos" (
    "id" SERIAL NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trainer_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trainer_photos" ADD CONSTRAINT "trainer_photos_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
