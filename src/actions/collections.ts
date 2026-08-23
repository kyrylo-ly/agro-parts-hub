"use server";

import { and, eq, count } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { db } from "@/db/db";
import { collection, productToCollection } from "@/db/schema/store";
import { collectionSchema, type CollectionInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "./admin-auth";

export async function getCollections() {
  try {
    const collections = await db.query.collection.findMany({
      orderBy: (collections, { desc }) => [desc(collections.createdAt)],
    });

    // Get product counts per collection in one query
    const productCounts = await db
      .select({
        collectionId: productToCollection.collectionId,
        count: count(),
      })
      .from(productToCollection)
      .groupBy(productToCollection.collectionId);

    const countMap = new Map(productCounts.map((c) => [c.collectionId, c.count]));

    const collectionsWithCounts = collections.map((col) => ({
      ...col,
      productCount: countMap.get(col.id) ?? 0,
    }));

    return { success: true as const, data: collectionsWithCounts };
  } catch (error) {
    console.error("Failed to get collections:", error);
    return { success: false as const, error: "Failed to fetch collections" };
  }
}

export async function getCollectionById(id: number) {
  try {
    const foundCollection = await db.query.collection.findFirst({
      where: eq(collection.id, id),
      with: {
        products: {
          with: {
            product: {
              with: {
                images: {
                  orderBy: (images, { asc }) => [asc(images.orderIndex)],
                  limit: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!foundCollection) {
      return { success: false as const, error: "Collection not found" };
    }

    return { success: true as const, data: foundCollection };
  } catch (error) {
    console.error("Failed to get collection:", error);
    return { success: false as const, error: "Failed to fetch collection" };
  }
}

export async function createCollection(input: CollectionInput) {
  try {
    await requireAdmin();

    const result = collectionSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.title);
    const imageUrl = validatedData.imageUrl === "" ? null : validatedData.imageUrl;

    const [newCollection] = await db
      .insert(collection)
      .values({
        title: validatedData.title,
        slug,
        description: validatedData.description,
        imageUrl,
      })
      .returning();

    revalidatePath("/admin/collections");
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.COLLECTIONS, "max" as any);
    return { success: true as const, data: newCollection };
  } catch (error) {
    console.error("Failed to create collection:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Колекція з таким slug вже існує" };
    }
    return { success: false as const, error: "Failed to create collection" };
  }
}

export async function updateCollection(id: number, input: CollectionInput) {
  try {
    await requireAdmin();

    const result = collectionSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.title);
    const imageUrl = validatedData.imageUrl === "" ? null : validatedData.imageUrl;

    const [updatedCollection] = await db
      .update(collection)
      .set({
        title: validatedData.title,
        slug,
        description: validatedData.description,
        imageUrl,
      })
      .where(eq(collection.id, id))
      .returning();

    revalidatePath("/admin/collections");
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.COLLECTIONS, "max" as any);
    return { success: true as const, data: updatedCollection };
  } catch (error) {
    console.error("Failed to update collection:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Колекція з таким slug вже існує" };
    }
    return { success: false as const, error: "Failed to update collection" };
  }
}

export async function deleteCollection(id: number) {
  try {
    await requireAdmin();
    await db.delete(collection).where(eq(collection.id, id));
    revalidatePath("/admin/collections");
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.COLLECTIONS, "max" as any);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return { success: false as const, error: "Failed to delete collection" };
  }
}

export async function addProductToCollection(productId: string, collectionId: number) {
  try {
    await requireAdmin();
    await db
      .insert(productToCollection)
      .values({ productId, collectionId })
      .onConflictDoNothing();
    revalidatePath("/admin/collections");
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.COLLECTIONS, "max" as any);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to add product to collection:", error);
    return { success: false as const, error: "Failed to add product to collection" };
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
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.COLLECTIONS, "max" as any);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to remove product from collection:", error);
    return { success: false as const, error: "Failed to remove product from collection" };
  }
}
