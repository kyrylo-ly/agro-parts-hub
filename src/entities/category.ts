import { z } from "zod";
import { slugValidation } from "./common";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: slugValidation,
  parentId: z.number().int().positive().optional().nullable(),
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type CategoryInput = z.infer<typeof categorySchema>;
