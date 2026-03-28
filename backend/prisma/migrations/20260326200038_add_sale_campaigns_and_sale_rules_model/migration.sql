/*
  Warnings:

  - You are about to drop the `sale_campaigns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sale_rules` table. If the table is not empty, all the data it contains will be lost.

*/
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
