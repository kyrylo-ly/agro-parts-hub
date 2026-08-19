"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/db";
import { category } from "@/db/schema/store";
import { categorySchema, type CategoryInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function getCategories() {
  try {
    const categories = await db.query.category.findMany({
      orderBy: (categories, { desc }) => [desc(categories.id)],
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Failed to get categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function createCategory(input: CategoryInput) {
  try {
    const validatedData = categorySchema.parse(input);
    const slug = validatedData.slug || slugify(validatedData.name);

    const [newCategory] = await db
      .insert(category)
      .values({
        name: validatedData.name,
        slug,
        parentId: validatedData.parentId,
      })
      .returning();

    revalidatePath("/admin/categories");
    return { success: true, data: newCategory };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(id: number, input: CategoryInput) {
  try {
    const validatedData = categorySchema.parse(input);
    const slug = validatedData.slug || slugify(validatedData.name);

    const [updatedCategory] = await db
      .update(category)
      .set({
        name: validatedData.name,
        slug,
        parentId: validatedData.parentId,
      })
      .where(eq(category.id, id))
      .returning();

    revalidatePath("/admin/categories");
    return { success: true, data: updatedCategory };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: number) {
  try {
    await db.delete(category).where(eq(category.id, id));
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
