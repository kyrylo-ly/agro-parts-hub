DROP INDEX "product_attributes_gin_idx";--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "parent_id" integer;--> statement-breakpoint
CREATE INDEX "ptc_category_id_idx" ON "product_to_category" USING btree ("category_id");