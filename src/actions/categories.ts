"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { type CategoryInput } from "@/entities/category";
import { requireAdmin } from "./admin-auth";
import {
  createCategoryUseCase,
  updateCategoryUseCase,
  deleteCategoryUseCase,
  getCategoryProductImagesUseCase,
} from "@/use-cases/categories";

export async function createCategory(input: CategoryInput) {
  try {
    await requireAdmin();
    const result = await createCategoryUseCase(input);
    if (result.success) {
      updateTag(CACHE_TAGS.CATEGORIES);
      revalidatePath("/admin/categories");
    }
    return result;
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false as const, error: "Failed to create category" };
  }
}

export async function updateCategory(id: number, input: CategoryInput) {
  try {
    await requireAdmin();
    const result = await updateCategoryUseCase(id, input);
    if (result.success) {
      updateTag(CACHE_TAGS.CATEGORIES);
      revalidatePath("/admin/categories");
    }
    return result;
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false as const, error: "Failed to update category" };
  }
}

export async function deleteCategory(id: number) {
  try {
    await requireAdmin();
    const result = await deleteCategoryUseCase(id);
    if (result.success) {
      updateTag(CACHE_TAGS.CATEGORIES);
      revalidatePath("/admin/categories");
    }
    return result;
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false as const, error: "Failed to delete category" };
  }
}

export async function getCategoryProductImages(categoryId: number) {
  try {
    await requireAdmin();
    return await getCategoryProductImagesUseCase(categoryId);
  } catch (error) {
    console.error("Failed to fetch category product images:", error);
    return { success: false as const, error: "Failed to fetch images" };
  }
}
