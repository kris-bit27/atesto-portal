-- CreateTable
CREATE TABLE "UserQuestionProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionSlug" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "isFav" BOOLEAN NOT NULL DEFAULT false,
    "lastOpenedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuestionProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserQuestionProgress_userId_lastOpenedAt_idx" ON "UserQuestionProgress"("userId", "lastOpenedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestionProgress_userId_questionSlug_key" ON "UserQuestionProgress"("userId", "questionSlug");

-- AddForeignKey
ALTER TABLE "UserQuestionProgress" ADD CONSTRAINT "UserQuestionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
