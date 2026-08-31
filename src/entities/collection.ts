import { z } from "zod";
import { slugValidation } from "./common";

export const collectionSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(200),
  slug: slugValidation,
  description: z.string().optional().nullable(),
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type CollectionInput = z.infer<typeof collectionSchema>;
