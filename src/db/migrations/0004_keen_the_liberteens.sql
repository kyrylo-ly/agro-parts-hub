ALTER TABLE "brand" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "image_url" text;--> statement-breakpoint
CREATE INDEX "product_brandId_idx" ON "product" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "product_attributes_gin_idx" ON "product" USING btree ("attributes");