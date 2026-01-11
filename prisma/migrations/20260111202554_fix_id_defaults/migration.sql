/*
  Warnings:

  - You are about to drop the column `disclosure` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `kind` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `partnerName` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Question` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "disclosure",
DROP COLUMN "kind",
DROP COLUMN "partnerName",
DROP COLUMN "source",
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
