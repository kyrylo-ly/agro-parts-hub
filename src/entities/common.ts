import { z } from "zod";

export const slugValidation = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(200)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug can only contain lowercase letters, numbers and hyphens",
  )
  .optional()
  .or(z.literal(""));

export type Result<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };
