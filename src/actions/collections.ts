"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/db";
import { collection, productToCollection } from "@/db/schema/store";
import { collectionSchema, type CollectionInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "./admin-auth";

export async function getCollections() {
  try {
    const collections = await db.query.collection.findMany({
      orderBy: (collections, { desc }) => [desc(collections.createdAt)],
      with: {
        products: {
          with: {
            product: true,
          }
        }
      }
    });
    return { success: true, data: collections };
  } catch (error) {
    console.error("Failed to get collections:", error);
    return { success: false, error: "Failed to fetch collections" };
  }
}

export async function createCollection(input: CollectionInput) {
  try {
    await requireAdmin();
    const validatedData = collectionSchema.parse(input);
    const slug = validatedData.slug || slugify(validatedData.title);

    const [newCollection] = await db
      .insert(collection)
      .values({
        title: validatedData.title,
        slug,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
      })
      .returning();

    revalidatePath("/admin/collections");
    return { success: true, data: newCollection };
  } catch (error) {
    console.error("Failed to create collection:", error);
    return { success: false, error: "Failed to create collection" };
  }
}

export async function updateCollection(id: number, input: CollectionInput) {
  try {
    await requireAdmin();
    const validatedData = collectionSchema.parse(input);
    const slug = validatedData.slug || slugify(validatedData.title);

    const [updatedCollection] = await db
      .update(collection)
      .set({
        title: validatedData.title,
        slug,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
      })
      .where(eq(collection.id, id))
      .returning();

    revalidatePath("/admin/collections");
    return { success: true, data: updatedCollection };
  } catch (error) {
    console.error("Failed to update collection:", error);
    return { success: false, error: "Failed to update collection" };
  }
}

export async function deleteCollection(id: number) {
  try {
    await requireAdmin();
    await db.delete(collection).where(eq(collection.id, id));
    revalidatePath("/admin/collections");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return { success: false, error: "Failed to delete collection" };
  }
}

export async function addProductToCollection(productId: string, collectionId: number) {
  try {
    await requireAdmin();
    await db.insert(productToCollection).values({
      productId,
      collectionId,
    });
    revalidatePath("/admin/collections");
    return { success: true };
  } catch (error) {
    console.error("Failed to add product to collection:", error);
    return { success: false, error: "Failed to add product to collection" };
  }
}

export async function removeProductFromCollection(productId: string, collectionId: number) {
  try {
    await requireAdmin();
    await db
      .delete(productToCollection)
      .where(
        and(
          eq(productToCollection.productId, productId),
          eq(productToCollection.collectionId, collectionId)
        )
      );
    revalidatePath("/admin/collections");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove product from collection:", error);
    return { success: false, error: "Failed to remove product from collection" };
  }
}
