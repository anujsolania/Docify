-- DropForeignKey
ALTER TABLE "Documentuser" DROP CONSTRAINT "Documentuser_docId_fkey";

-- AddForeignKey
ALTER TABLE "Documentuser" ADD CONSTRAINT "Documentuser_docId_fkey" FOREIGN KEY ("docId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
