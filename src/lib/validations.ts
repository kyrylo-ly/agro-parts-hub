import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(100).optional(), // Optional because it can be auto-generated
  parentId: z.number().int().positive().optional().nullable(),
});

export const productSchema = z.object({
  categoryId: z.number().int().positive("Category is required"),
  sku: z.string().min(2, "SKU must be at least 2 characters").max(50),
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(200).optional(), // Optional because it can be auto-generated
  description: z.string().optional().nullable(),
  price: z.string().min(1, "Price is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  compareAtPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format").optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  attributes: z.record(z.string(), z.any()).optional().nullable(),
  isActive: z.boolean().default(true),
});

export const collectionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  slug: z.string().min(2, "Slug must be at least 2 characters").max(200).optional(), // Optional because it can be auto-generated
  description: z.string().optional().nullable(),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CollectionInput = z.infer<typeof collectionSchema>;
