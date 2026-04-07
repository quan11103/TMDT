-- AlterEnum: add PRODUCT to promo_product_scope (PostgreSQL)
ALTER TYPE "promo_product_scope" ADD VALUE 'PRODUCT';

-- AlterTable
ALTER TABLE "promotions" DROP COLUMN IF EXISTS "applies_to_gender";

-- CreateTable
CREATE TABLE "promotion_products" (
    "promotion_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,

    CONSTRAINT "promotion_products_pkey" PRIMARY KEY ("promotion_id","product_id"),
    CONSTRAINT "promotion_products_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "promotion_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
