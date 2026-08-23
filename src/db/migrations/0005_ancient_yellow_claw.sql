DROP INDEX IF EXISTS "product_viewCount_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "product_attributes_gin_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_attributes_gin_idx" ON "product" USING gin ("attributes");--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN IF EXISTS "view_count";