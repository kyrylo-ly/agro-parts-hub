"use server";

import { eq, count } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { db } from "@/db/db";
import { brand, product } from "@/db/schema/store";
import { brandSchema, type BrandInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "./admin-auth";

export async function getBrands() {
  try {
    const brands = await db.query.brand.findMany({
      orderBy: (brands, { asc }) => [asc(brands.name)],
    });
    return { success: true as const, data: brands };
  } catch (error) {
    console.error("Failed to get brands:", error);
    return { success: false as const, error: "Failed to fetch brands" };
  }
}

export async function createBrand(input: BrandInput) {
  try {
    await requireAdmin();

    const result = brandSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.name);

    const [newBrand] = await db
      .insert(brand)
      .values({
        name: validatedData.name,
        slug,
        imageUrl: validatedData.imageUrl,
      })
      .returning();

    revalidatePath("/admin/brands");
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.BRANDS, "max" as any);
    return { success: true as const, data: newBrand };
  } catch (error) {
    console.error("Failed to create brand:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Бренд з такою назвою або slug вже існує" };
    }
    return { success: false as const, error: "Failed to create brand" };
  }
}

export async function updateBrand(id: number, input: BrandInput) {
  try {
    await requireAdmin();

    const result = brandSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.name);

    const [updatedBrand] = await db
      .update(brand)
      .set({
        name: validatedData.name,
        slug,
        imageUrl: validatedData.imageUrl,
      })
      .where(eq(brand.id, id))
      .returning();

    revalidatePath("/admin/brands");
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.BRANDS, "max" as any);
    return { success: true as const, data: updatedBrand };
  } catch (error) {
    console.error("Failed to update brand:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Бренд з такою назвою або slug вже існує" };
    }
    return { success: false as const, error: "Failed to update brand" };
  }
}

export async function deleteBrand(id: number) {
  try {
    await requireAdmin();

    // Check for products with this brand
    const [productCount] = await db
      .select({ count: count() })
      .from(product)
      .where(eq(product.brandId, id));

    if (productCount.count > 0) {
      return {
        success: false as const,
        error: `Неможливо видалити бренд, який використовується у ${productCount.count} продукт(ах). Спочатку змініть бренд цих продуктів.`,
      };
    }

    await db.delete(brand).where(eq(brand.id, id));
    revalidatePath("/admin/brands");
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.BRANDS, "max" as any);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete brand:", error);
    return { success: false as const, error: "Failed to delete brand" };
  }
}
