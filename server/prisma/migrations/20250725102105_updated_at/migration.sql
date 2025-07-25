/*
  Warnings:

  - Added the required column `updatedAt` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('VIEW', 'EDIT');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Documentuser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "docId" INTEGER NOT NULL,
    "permission" "Permission" NOT NULL,

    CONSTRAINT "Documentuser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Documentuser" ADD CONSTRAINT "Documentuser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documentuser" ADD CONSTRAINT "Documentuser_docId_fkey" FOREIGN KEY ("docId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
