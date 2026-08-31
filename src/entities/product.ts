import { z } from "zod";
import { slugValidation } from "./common";

export const productSchema = z.object({
  categoryId: z.number().int().positive("Category is required"),
  brandId: z.number().int().positive().optional().nullable(),
  sku: z.string().min(2, "SKU must be at least 2 characters").max(50),
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  slug: slugValidation,
  description: z.string().optional().nullable(),
  price: z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  compareAtPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .optional()
    .nullable()
    .or(z.literal("")),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  attributes: z.record(z.string(), z.string()).optional().nullable(),
  isActive: z.boolean().default(true),
  collectionIds: z.array(z.number().int().positive()).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export interface ProductFilterParams {
  brandSlugs?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  isPromotion?: boolean;
  attributes?: Record<string, string[]>;
  sort?: "price_asc" | "price_desc" | "newest" | "bestsellers";
  page?: number;
  limit?: number;
}
