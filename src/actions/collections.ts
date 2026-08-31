"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { type CollectionInput } from "@/entities/collection";
import { requireAdmin } from "./admin-auth";
import {
  createCollectionUseCase,
  updateCollectionUseCase,
  deleteCollectionUseCase,
} from "@/use-cases/collections";
import { addProductToCollectionDb, removeProductFromCollectionDb } from "@/data-access/collections";

export async function createCollection(input: CollectionInput) {
  try {
    await requireAdmin();
    const result = await createCollectionUseCase(input);
    if (result.success) {
      updateTag(CACHE_TAGS.COLLECTIONS);
      revalidatePath("/admin/collections");
    }
    return result;
  } catch (error) {
    console.error("Failed to create collection:", error);
    return { success: false as const, error: "Failed to create collection" };
  }
}

export async function updateCollection(id: number, input: CollectionInput) {
  try {
    await requireAdmin();
    const result = await updateCollectionUseCase(id, input);
    if (result.success) {
      updateTag(CACHE_TAGS.COLLECTIONS);
      revalidatePath("/admin/collections");
    }
    return result;
  } catch (error) {
    console.error("Failed to update collection:", error);
    return { success: false as const, error: "Failed to update collection" };
  }
}

export async function deleteCollection(id: number) {
  try {
    await requireAdmin();
    await deleteCollectionUseCase(id);
    updateTag(CACHE_TAGS.COLLECTIONS);
    revalidatePath("/admin/collections");
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return { success: false as const, error: "Failed to delete collection" };
  }
}

export async function addProductToCollection(productId: string, collectionId: number) {
  try {
    await requireAdmin();
    await addProductToCollectionDb(productId, collectionId);
    updateTag(CACHE_TAGS.COLLECTIONS);
    revalidatePath("/admin/collections");
    return { success: true as const };
  } catch (error) {
    console.error("Failed to add product to collection:", error);
    return { success: false as const, error: "Failed to add product to collection" };
  }
}

export async function removeProductFromCollection(productId: string, collectionId: number) {
  try {
    await requireAdmin();
    await removeProductFromCollectionDb(productId, collectionId);
    updateTag(CACHE_TAGS.COLLECTIONS);
    revalidatePath("/admin/collections");
    return { success: true as const };
  } catch (error) {
    console.error("Failed to remove product from collection:", error);
    return { success: false as const, error: "Failed to remove product from collection" };
  }
}
