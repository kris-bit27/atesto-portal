-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "disclosure" TEXT,
ADD COLUMN     "kind" "ContentKind" NOT NULL DEFAULT 'ANSWER',
ADD COLUMN     "partnerName" TEXT,
ADD COLUMN     "source" "SourceType" NOT NULL DEFAULT 'CORE';

-- CreateIndex
CREATE INDEX "Question_topicId_idx" ON "Question"("topicId");

-- CreateIndex
CREATE INDEX "Question_specialtyId_idx" ON "Question"("specialtyId");

-- CreateIndex
CREATE INDEX "Question_kind_idx" ON "Question"("kind");

-- CreateIndex
CREATE INDEX "Question_source_idx" ON "Question"("source");

-- CreateIndex
CREATE INDEX "Topic_specialtyId_order_idx" ON "Topic"("specialtyId", "order");

-- CreateIndex
CREATE INDEX "Topic_domainId_order_idx" ON "Topic"("domainId", "order");
