import { z } from "zod";
import { slugValidation } from "./common";

export const brandSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: slugValidation,
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type BrandInput = z.infer<typeof brandSchema>;

export const brandEntitySchema = brandSchema.extend({
  id: z.number(),
  slug: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Brand = z.infer<typeof brandEntitySchema>;

export type BrandWithProductCount = Brand & {
  productCount: number;
};
