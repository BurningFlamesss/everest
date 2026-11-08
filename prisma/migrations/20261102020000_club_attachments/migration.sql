-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN "clubId" TEXT;

-- CreateIndex
CREATE INDEX "Attachment_clubId_idx" ON "Attachment"("clubId");

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
