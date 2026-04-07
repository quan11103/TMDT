-- CreateTable
CREATE TABLE "store_settings" (
    "id" SERIAL NOT NULL,
    "products_per_page" INTEGER NOT NULL DEFAULT 12,
    "products_per_row" INTEGER NOT NULL DEFAULT 4,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

