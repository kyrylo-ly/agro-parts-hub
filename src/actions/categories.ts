"use server";

import { eq, count } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { db } from "@/db/db";
import { category, product } from "@/db/schema/store";
import { categorySchema, type CategoryInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "./admin-auth";


export async function createCategory(input: CategoryInput) {
  try {
    await requireAdmin();

    const result = categorySchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.name);

    const [newCategory] = await db
      .insert(category)
      .values({
        name: validatedData.name,
        slug,
        parentId: validatedData.parentId,
        imageUrl: validatedData.imageUrl,
      })
      .returning();

    revalidatePath("/admin/categories");
    // Invalidate public ISR cache
    updateTag(CACHE_TAGS.CATEGORIES);
    return { success: true as const, data: newCategory };
  } catch (error) {
    console.error("Failed to create category:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Категорія з таким slug вже існує" };
    }
    return { success: false as const, error: "Failed to create category" };
  }
}

export async function updateCategory(id: number, input: CategoryInput) {
  try {
    await requireAdmin();

    const result = categorySchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.name);

    // Prevent setting self as parent
    if (validatedData.parentId === id) {
      return { success: false as const, error: "Категорія не може бути своїм батьком" };
    }

    const [updatedCategory] = await db
      .update(category)
      .set({
        name: validatedData.name,
        slug,
        parentId: validatedData.parentId,
        imageUrl: validatedData.imageUrl,
      })
      .where(eq(category.id, id))
      .returning();

    revalidatePath("/admin/categories");
    // Invalidate public ISR cache
    updateTag(CACHE_TAGS.CATEGORIES);
    return { success: true as const, data: updatedCategory };
  } catch (error) {
    console.error("Failed to update category:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Категорія з таким slug вже існує" };
    }
    return { success: false as const, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: number) {
  try {
    await requireAdmin();

    // Check for child categories
    const children = await db.query.category.findFirst({
      where: eq(category.parentId, id),
    });
    if (children) {
      return {
        success: false as const,
        error: "Неможливо видалити категорію з дочірніми категоріями. Спочатку видаліть або перемістіть їх.",
      };
    }

    // Check for products in this category
    const [productCount] = await db
      .select({ count: count() })
      .from(product)
      .where(eq(product.categoryId, id));

    if (productCount.count > 0) {
      return {
        success: false as const,
        error: `Неможливо видалити категорію, яка містить ${productCount.count} продукт(ів). Спочатку перемістіть їх.`,
      };
    }

    await db.delete(category).where(eq(category.id, id));
    revalidatePath("/admin/categories");
    // Invalidate public ISR cache
    updateTag(CACHE_TAGS.CATEGORIES);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false as const, error: "Failed to delete category" };
  }
}

export async function getCategoryProductImages(categoryId: number) {
  try {
    const products = await db.query.product.findMany({
      where: eq(product.categoryId, categoryId),
      with: {
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
        },
      },
    });

    // Extract unique image URLs
    const urls = new Set<string>();
    products.forEach((p) => {
      p.images.forEach((img) => urls.add(img.url));
    });

    return { success: true as const, data: Array.from(urls) };
  } catch (error) {
    console.error("Failed to fetch category product images:", error);
    return { success: false as const, error: "Failed to fetch images" };
  }
}

