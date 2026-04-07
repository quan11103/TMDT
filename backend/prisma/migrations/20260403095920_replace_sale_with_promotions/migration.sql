/*
  Warnings:

  - You are about to drop the `sale_campaigns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sale_rules` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "promo_discount_type" AS ENUM ('PERCENT', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "promo_product_scope" AS ENUM ('ALL', 'CATEGORY');

-- DropForeignKey
ALTER TABLE "sale_rules" DROP CONSTRAINT "fk_rule_campaign";

-- DropTable
DROP TABLE "sale_campaigns";

-- DropTable
DROP TABLE "sale_rules";

-- DropEnum
DROP TYPE "sale_operator";

-- DropEnum
DROP TYPE "sale_rule_type";

-- DropEnum
DROP TYPE "sale_scope_type";

-- CreateTable
CREATE TABLE "promotions" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "discount_type" "promo_discount_type" NOT NULL DEFAULT 'PERCENT',
    "discount_value" DECIMAL(12,2) NOT NULL,
    "product_scope" "promo_product_scope" NOT NULL DEFAULT 'ALL',
    "category_id" INTEGER,
    "applies_to_gender" VARCHAR(10),
    "starts_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ends_at" TIMESTAMP(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");

-- AddForeignKey
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
