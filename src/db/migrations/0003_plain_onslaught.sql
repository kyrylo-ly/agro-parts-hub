CREATE TABLE "brand" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_name_unique" UNIQUE("name"),
	CONSTRAINT "brand_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "brand_id" integer;--> statement-breakpoint
CREATE INDEX "brand_slug_idx" ON "brand" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_brand_id_brand_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brand"("id") ON DELETE set null ON UPDATE no action;