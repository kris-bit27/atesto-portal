-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subcategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "subcategoryId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_order_idx" ON "Category"("order");

-- CreateIndex
CREATE INDEX "Category_isActive_order_idx" ON "Category"("isActive", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Subcategory_slug_key" ON "Subcategory"("slug");

-- CreateIndex
CREATE INDEX "Subcategory_categoryId_order_idx" ON "Subcategory"("categoryId", "order");

-- CreateIndex
CREATE INDEX "Subcategory_isActive_order_idx" ON "Subcategory"("isActive", "order");

-- CreateIndex
CREATE INDEX "Question_categoryId_idx" ON "Question"("categoryId");

-- CreateIndex
CREATE INDEX "Question_subcategoryId_idx" ON "Question"("subcategoryId");

-- AddForeignKey
ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
