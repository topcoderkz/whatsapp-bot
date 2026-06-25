-- CreateTable
CREATE TABLE "_BranchToPromotion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BranchToPromotion_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BranchToPromotion_B_index" ON "_BranchToPromotion"("B");

-- AddForeignKey
ALTER TABLE "_BranchToPromotion" ADD CONSTRAINT "_BranchToPromotion_A_fkey" FOREIGN KEY ("A") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BranchToPromotion" ADD CONSTRAINT "_BranchToPromotion_B_fkey" FOREIGN KEY ("B") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
