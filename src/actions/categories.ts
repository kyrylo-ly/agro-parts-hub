"use server";

import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/db";
import { category, product } from "@/db/schema/store";
import { categorySchema, type CategoryInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "./admin-auth";

export async function getCategories() {
  try {
    const categories = await db.query.category.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
      with: {
        children: true,
        parent: true,
      },
    });
    return { success: true as const, data: categories };
  } catch (error) {
    console.error("Failed to get categories:", error);
    return { success: false as const, error: "Failed to fetch categories" };
  }
}

export async function getCategoryById(id: number) {
  try {
    const foundCategory = await db.query.category.findFirst({
      where: eq(category.id, id),
      with: {
        children: true,
        parent: true,
      },
    });

    if (!foundCategory) {
      return { success: false as const, error: "Category not found" };
    }

    return { success: true as const, data: foundCategory };
  } catch (error) {
    console.error("Failed to get category:", error);
    return { success: false as const, error: "Failed to fetch category" };
  }
}

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
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false as const, error: "Failed to delete category" };
  }
}
