-- CreateIndex
CREATE INDEX "Domain_isActive_order_idx" ON "Domain"("isActive", "order");

-- CreateIndex
CREATE INDEX "Question_topicId_title_idx" ON "Question"("topicId", "title");

-- CreateIndex
CREATE INDEX "Question_updatedAt_slug_idx" ON "Question"("updatedAt", "slug");

-- CreateIndex
CREATE INDEX "Specialty_isActive_order_idx" ON "Specialty"("isActive", "order");

-- CreateIndex
CREATE INDEX "Topic_order_title_idx" ON "Topic"("order", "title");
