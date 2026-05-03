-- CreateTable
CREATE TABLE "price_images" (
    "id" SERIAL NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "price_images_branch_id_key" ON "price_images"("branch_id");

-- AddForeignKey
ALTER TABLE "price_images" ADD CONSTRAINT "price_images_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
