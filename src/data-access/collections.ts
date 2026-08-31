import "server-only";
import { db } from "@/db/db";
import { collection, productToCollection } from "@/db/schema/store";
import { eq, and, count } from "drizzle-orm";

export async function getAllCollectionsDb() {
  return db.query.collection.findMany({
    orderBy: (collections, { desc }) => [desc(collections.createdAt)],
  });
}

export async function getCollectionBySlugDb(slug: string) {
  return db.query.collection.findFirst({
    where: eq(collection.slug, slug),
  });
}

export async function getCollectionByIdDb(id: number) {
  return db.query.collection.findFirst({
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
}

export async function getCollectionProductCountsDb() {
  return db
    .select({
      collectionId: productToCollection.collectionId,
      count: count(),
    })
    .from(productToCollection)
    .groupBy(productToCollection.collectionId);
}

export async function getCollectionProductIdsDb(collectionId: number) {
  return db
    .select({ productId: productToCollection.productId })
    .from(productToCollection)
    .where(eq(productToCollection.collectionId, collectionId));
}

export async function insertCollectionDb(data: {
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
}) {
  return db.insert(collection).values(data).returning();
}

export async function updateCollectionDb(
  id: number,
  data: {
    title?: string;
    slug?: string;
    description?: string | null;
    imageUrl?: string | null;
  }
) {
  return db.update(collection).set(data).where(eq(collection.id, id)).returning();
}

export async function deleteCollectionDb(id: number) {
  return db.delete(collection).where(eq(collection.id, id));
}

export async function addProductToCollectionDb(productId: string, collectionId: number) {
  return db
    .insert(productToCollection)
    .values({ productId, collectionId })
    .onConflictDoNothing();
}

export async function removeProductFromCollectionDb(productId: string, collectionId: number) {
  return db
    .delete(productToCollection)
    .where(
      and(
        eq(productToCollection.productId, productId),
        eq(productToCollection.collectionId, collectionId)
      )
    );
}
