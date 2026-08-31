"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { type ProductInput } from "@/entities/product";
import { requireAdmin } from "./admin-auth";
import { createProductUseCase, updateProductUseCase, deleteProductUseCase } from "@/use-cases/products";

export async function createProduct(input: ProductInput) {
  try {
    await requireAdmin();
    const result = await createProductUseCase(input);
    if (result.success) {
      updateTag(CACHE_TAGS.PRODUCTS);
      updateTag(CACHE_TAGS.NEW_ARRIVALS);
      updateTag(CACHE_TAGS.BESTSELLERS);
      revalidatePath("/admin/products");
    }
    return result;
  } catch (error) {
    console.error("Failed to create product action:", error);
    return { success: false as const, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  try {
    await requireAdmin();
    const result = await updateProductUseCase(id, input);
    if (result.success) {
      updateTag(CACHE_TAGS.PRODUCTS);
      updateTag(CACHE_TAGS.NEW_ARRIVALS);
      updateTag(CACHE_TAGS.BESTSELLERS);
      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${id}`);
    }
    return result;
  } catch (error) {
    console.error("Failed to update product action:", error);
    return { success: false as const, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireAdmin();
    const result = await deleteProductUseCase(id);
    if (result.success) {
      updateTag(CACHE_TAGS.PRODUCTS);
      updateTag(CACHE_TAGS.NEW_ARRIVALS);
      updateTag(CACHE_TAGS.BESTSELLERS);
      revalidatePath("/admin/products");
    }
    return result;
  } catch (error) {
    console.error("Failed to delete product action:", error);
    return { success: false as const, error: "Failed to delete product" };
  }
}
