import "server-only";
import { eq, count } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db/db";
import { collection, productToCollection } from "@/db/schema/store";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { ProductFilterParams } from "./types";
import { getFilteredProducts } from "./product-service";

export async function getPublicCollectionBySlug(
  slug: string,
  filters: ProductFilterParams = {}
) {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.COLLECTIONS);
  try {
    const foundCollection = await db.query.collection.findFirst({
      where: eq(collection.slug, slug),
    });

    if (!foundCollection) {
      return { success: false as const, error: "Collection not found" };
    }

    const collectionProducts = await db
      .select({ productId: productToCollection.productId })
      .from(productToCollection)
      .where(eq(productToCollection.collectionId, foundCollection.id));

    const productIds = collectionProducts.map((cp) => cp.productId);

    if (productIds.length === 0) {
      return {
        success: true as const,
        data: {
          collection: foundCollection,
          products: [],
          meta: { total: 0, page: 1, limit: filters.limit ?? 12, totalPages: 0 },
        },
      };
    }

    const productsResult = await getFilteredProducts({
      ...filters,
      productIds,
    });

    return {
      success: true as const,
      data: {
        collection: foundCollection,
        ...productsResult,
      },
    };
  } catch (error) {
    console.error("Failed to get collection by slug:", error);
    return { success: false as const, error: "Failed to fetch collection" };
  }
}

export async function getPublicCollections() {
  "use cache";
  cacheLife("max");
  cacheTag(CACHE_TAGS.COLLECTIONS);

  try {
    const collections = await db.query.collection.findMany({
      orderBy: (collections, { desc }) => [desc(collections.createdAt)],
    });

    const productCounts = await db
      .select({
        collectionId: productToCollection.collectionId,
        count: count(),
      })
      .from(productToCollection)
      .groupBy(productToCollection.collectionId);

    const countMap = new Map(
      productCounts.map((c) => [c.collectionId, c.count])
    );

    const collectionsWithCounts = collections.map((col) => ({
      ...col,
      productCount: countMap.get(col.id) ?? 0,
    }));

    return { success: true as const, data: collectionsWithCounts };
  } catch (error) {
    console.error("Failed to get public collections:", error);
    return { success: false as const, error: "Failed to fetch collections" };
  }
}
