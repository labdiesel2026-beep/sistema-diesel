-- AlterTable
ALTER TABLE "products" ADD COLUMN     "featured_at" TIMESTAMP(3),
ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "products_visible_is_featured_idx" ON "products"("visible", "is_featured");

-- CreateIndex
CREATE INDEX "products_featured_at_idx" ON "products"("featured_at" DESC);
