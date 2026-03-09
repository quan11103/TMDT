/*
  Warnings:

  - The `status` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `address` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `payments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('COD', 'VNPAY', 'MOMO');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "address" VARCHAR(500) NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "phone" VARCHAR(20) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "order_status" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "method",
ADD COLUMN     "method" "payment_method" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "payment_status" NOT NULL DEFAULT 'PENDING';
