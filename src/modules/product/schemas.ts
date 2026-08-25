import { z } from "zod";

// --- Branded Types ---
export const ProductSku = z.string().min(2, "SKU must be at least 2 characters").max(50).brand("ProductSku");
export type ProductSku = z.infer<typeof ProductSku>;

export const Price = z
    .string()
    .min(1, "Price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .brand("Price");
export type Price = z.infer<typeof Price>;

export const CompareAtPrice = z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format")
    .optional()
    .nullable()
    .or(z.literal(""))
    .brand("CompareAtPrice");
export type CompareAtPrice = z.infer<typeof CompareAtPrice>;

export const productSlug = z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers and hyphens")
    .optional()
    .or(z.literal(""));

// --- Main Schema ---
export const productSchema = z.object({
    brandId: z.number().int().positive().optional().nullable(),

    // Using branded types
    sku: ProductSku,
    price: Price,
    compareAtPrice: CompareAtPrice,

    name: z.string().min(2, "Name must be at least 2 characters").max(200),
    slug: productSlug,
    description: z.string().optional().nullable(),
    stock: z.number().int().min(0, "Stock cannot be negative").default(0),
    attributes: z.record(z.string(), z.unknown()).optional().nullable(),
    isActive: z.boolean().default(true),

    // Many-to-Many Relationships
    categoryIds: z.array(z.number().int().positive()).optional(),
    collectionIds: z.array(z.number().int().positive()).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
