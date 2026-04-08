-- AlterTable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'store_settings'
  ) THEN
    ALTER TABLE "store_settings"
      ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);
  END IF;
END $$;
