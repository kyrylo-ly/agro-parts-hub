import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { collectionSchema, type CollectionInput } from "@/entities/collection";
import { slugify } from "@/lib/utils";
import {
  getAllCollectionsDb,
  getCollectionBySlugDb,
  getCollectionByIdDb,
  getCollectionProductCountsDb,
  getCollectionProductIdsDb,
  insertCollectionDb,
  updateCollectionDb,
  deleteCollectionDb,
} from "@/data-access/collections";
import { getFilteredProductsDb as getFilteredProducts } from "@/data-access/products";
import type { ProductFilterParams } from "@/entities/product";

export async function getAllCollectionsWithCountsUseCase() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.COLLECTIONS);
  try {
    const collections = await getAllCollectionsDb();
    const productCounts = await getCollectionProductCountsDb();

    const countMap = new Map(
      productCounts.map((c) => [c.collectionId, c.count]),
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

export async function getCollectionBySlugUseCase(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.COLLECTIONS);
  try {
    const foundCollection = await getCollectionBySlugDb(slug);
    if (!foundCollection) {
      return { success: false as const, error: "Collection not found" };
    }
    return { success: true as const, data: foundCollection };
  } catch (error) {
    console.error("Failed to get collection by slug:", error);
    return { success: false as const, error: "Failed to fetch collection" };
  }
}

export async function getCollectionBySlugWithProductsUseCase(
  slug: string,
  filters: ProductFilterParams = {},
) {
  try {
    const collectionResult = await getCollectionBySlugUseCase(slug);
    if (!collectionResult.success) {
      return collectionResult;
    }
    const foundCollection = collectionResult.data;

    const collectionProducts = await getCollectionProductIdsDb(
      foundCollection.id,
    );
    const productIds = collectionProducts.map((cp) => cp.productId);

    if (productIds.length === 0) {
      return {
        success: true as const,
        data: {
          collection: foundCollection,
          products: [],
          meta: {
            total: 0,
            page: 1,
            limit: filters.limit ?? 12,
            totalPages: 0,
          },
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
    console.error("Failed to get collection by slug with products:", error);
    return {
      success: false as const,
      error: "Failed to fetch collection with products",
    };
  }
}

export async function getAllCollectionsUseCase() {
  try {
    const collections = await getAllCollectionsDb();
    const productCounts = await getCollectionProductCountsDb();

    const countMap = new Map(
      productCounts.map((c) => [c.collectionId, c.count]),
    );
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

export async function getCollectionByIdUseCase(id: number) {
  try {
    const foundCollection = await getCollectionByIdDb(id);
    if (!foundCollection) {
      return { success: false as const, error: "Collection not found" };
    }
    return { success: true as const, data: foundCollection };
  } catch (error) {
    console.error("Failed to get collection:", error);
    return { success: false as const, error: "Failed to fetch collection" };
  }
}

export async function createCollectionUseCase(input: CollectionInput) {
  try {
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
    const imageUrl =
      validatedData.imageUrl === "" ? null : validatedData.imageUrl;

    const [newCollection] = await insertCollectionDb({
      title: validatedData.title,
      slug,
      description: validatedData.description,
      imageUrl,
    });

    return { success: true as const, data: newCollection };
  } catch (error) {
    console.error("Failed to create collection:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return {
        success: false as const,
        error: "Колекція з таким slug вже існує",
      };
    }
    return { success: false as const, error: "Failed to create collection" };
  }
}

export async function updateCollectionUseCase(
  id: number,
  input: CollectionInput,
) {
  try {
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
    const imageUrl =
      validatedData.imageUrl === "" ? null : validatedData.imageUrl;

    const [updatedCollection] = await updateCollectionDb(id, {
      title: validatedData.title,
      slug,
      description: validatedData.description,
      imageUrl,
    });

    return { success: true as const, data: updatedCollection };
  } catch (error) {
    console.error("Failed to update collection:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return {
        success: false as const,
        error: "Колекція з таким slug вже існує",
      };
    }
    return { success: false as const, error: "Failed to update collection" };
  }
}

export async function deleteCollectionUseCase(id: number) {
  try {
    await deleteCollectionDb(id);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete collection:", error);
    return { success: false as const, error: "Failed to delete collection" };
  }
}
