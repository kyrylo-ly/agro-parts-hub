DROP INDEX "product_createdAt_idx";--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "parent_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "collection" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "category_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "product_to_collection" ALTER COLUMN "collection_id" SET DATA TYPE integer;