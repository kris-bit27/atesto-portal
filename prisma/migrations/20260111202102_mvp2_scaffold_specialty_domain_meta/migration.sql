/*
  Warnings:

  - You are about to drop the column `content` on the `Question` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ContentKind" AS ENUM ('ANSWER', 'FLASHCARDS', 'MCQ', 'ALGORITHM', 'CHECKLIST', 'CASE');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('CORE', 'INDUSTRY');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "content",
ADD COLUMN     "contentHtml" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "disclosure" TEXT,
ADD COLUMN     "kind" "ContentKind" NOT NULL DEFAULT 'ANSWER',
ADD COLUMN     "partnerName" TEXT,
ADD COLUMN     "source" "SourceType" NOT NULL DEFAULT 'CORE',
ADD COLUMN     "specialtyId" TEXT,
ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "domainId" TEXT,
ADD COLUMN     "specialtyId" TEXT;

-- CreateTable
CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Specialty_slug_key" ON "Specialty"("slug");

-- CreateIndex
CREATE INDEX "Specialty_order_idx" ON "Specialty"("order");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_key" ON "Domain"("slug");

-- CreateIndex
CREATE INDEX "Domain_order_idx" ON "Domain"("order");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
