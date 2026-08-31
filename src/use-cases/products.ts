import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db/db";
import { product } from "@/db/schema/store";
import { CACHE_TAGS, getProductTag } from "@/lib/constants/cache-tags";
import {
  productSchema,
  type ProductInput,
  type ProductFilterParams,
} from "@/entities/product";
import { slugify } from "@/lib/utils";
import { deleteManyFromR2, getKeyFromUrl } from "@/lib/r2";
import {
  getProductBySlugDb,
  getProductByIdDb,
  getTopProductSlugsDb,
  searchProductsQuickDb,
  getProductsByIdsDb,
  getAdminProductsDb,
  getCategoryAttributeFiltersDb,
  getFilteredProductsDb,
  insertProductDb,
  updateProductDb,
  deleteProductDb,
  getProductImagesDb,
  syncProductCollectionsDb,
} from "@/data-access/products";

export async function getPublicProductBySlugUseCase(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.PRODUCTS, getProductTag(slug));

  try {
    const foundProduct = await getProductBySlugDb(slug);
    if (!foundProduct) {
      return { success: false as const, error: "Product not found" };
    }
    return { success: true as const, data: foundProduct };
  } catch (error) {
    console.error("Failed to get product by slug:", error);
    return { success: false as const, error: "Failed to fetch product" };
  }
}

export async function getNewArrivalsUseCase(limit = 8) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.PRODUCTS, CACHE_TAGS.NEW_ARRIVALS);

  try {
    const products = await db.query.product.findMany({
      where: eq(product.isActive, true),
      limit,
      orderBy: (products, { desc }) => [desc(products.createdAt)],
      with: {
        brand: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
          limit: 1,
        },
      },
    });
    return { success: true as const, data: products };
  } catch (error) {
    console.error("Failed to get new arrivals:", error);
    return { success: false as const, error: "Failed to fetch new arrivals" };
  }
}

export async function getBestsellersUseCase(limit = 8) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.PRODUCTS, CACHE_TAGS.BESTSELLERS);

  try {
    const products = await db.query.product.findMany({
      where: eq(product.isActive, true),
      limit,
      orderBy: (products, { desc }) => [desc(products.salesCount)],
      with: {
        brand: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
          limit: 1,
        },
      },
    });
    return { success: true as const, data: products };
  } catch (error) {
    console.error("Failed to get bestsellers:", error);
    return { success: false as const, error: "Failed to fetch bestsellers" };
  }
}

export async function getTopProductSlugsUseCase() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.PRODUCTS);
  try {
    const products = await getTopProductSlugsDb();
    return products.map((p) => ({ slug: p.slug }));
  } catch (error) {
    return [];
  }
}

export async function getPublicProductsUseCase(
  filters: ProductFilterParams = {},
) {
  try {
    const productsResult = await getFilteredProductsDb(filters);
    return { success: true as const, data: productsResult };
  } catch (error) {
    console.error("Failed to get public products:", error);
    return { success: false as const, error: "Failed to fetch products" };
  }
}

export async function searchProductsUseCase(
  query: string,
  filters: ProductFilterParams = {},
) {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true as const,
        data: {
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
    const productsResult = await getFilteredProductsDb({
      ...filters,
      searchQuery: query.trim(),
    });
    return {
      success: true as const,
      data: productsResult,
    };
  } catch (error) {
    console.error("Failed to search products:", error);
    return { success: false as const, error: "Failed to search products" };
  }
}

export async function searchProductsQuickUseCase(query: string) {
  if (query.trim().length < 2) {
    return { success: true as const, data: [] };
  }
  try {
    const results = await searchProductsQuickDb(query);
    return { success: true as const, data: results };
  } catch (error) {
    console.error("searchProductsQuick error:", error);
    return { success: false as const, error: "Помилка пошуку" };
  }
}

export async function getProductsByIdsUseCase(ids: string[], maxLimit = 100) {
  if (ids.length === 0 || ids.length > maxLimit) {
    return { success: true as const, data: [] };
  }
  try {
    const products = await getProductsByIdsDb(ids);
    return { success: true as const, data: products };
  } catch (error) {
    console.error("getProductsByIds error:", error);
    return { success: false as const, error: "Помилка завантаження" };
  }
}

export async function getCategoryAttributeFiltersUseCase(categoryId: number) {
  try {
    const results = await getCategoryAttributeFiltersDb(categoryId);

    const attributeMap = new Map<string, Set<string>>();
    for (const row of results) {
      const attrs = row.attributes as Record<string, string> | null;
      if (!attrs) continue;
      for (const [key, value] of Object.entries(attrs)) {
        if (!attributeMap.has(key)) {
          attributeMap.set(key, new Set());
        }
        attributeMap.get(key)!.add(value);
      }
    }
    const filters = Array.from(attributeMap.entries()).map(([key, values]) => ({
      key,
      values: Array.from(values).sort(),
    }));
    return { success: true as const, data: filters };
  } catch (error) {
    console.error("Failed to get category attribute filters:", error);
    return {
      success: false as const,
      error: "Failed to fetch attribute filters",
    };
  }
}

export async function getAdminProductsUseCase(
  options: { page?: number; limit?: number; search?: string } = {},
) {
  try {
    const result = await getAdminProductsDb(options);
    return {
      success: true as const,
      data: result.products,
      meta: result.meta,
    };
  } catch (error) {
    console.error("Failed to get admin products:", error);
    return { success: false as const, error: "Failed to fetch products" };
  }
}

export async function getAdminProductByIdUseCase(id: string) {
  try {
    const foundProduct = await getProductByIdDb(id);
    if (!foundProduct) {
      return { success: false as const, error: "Product not found" };
    }
    return { success: true as const, data: foundProduct };
  } catch (error) {
    console.error("Failed to get product:", error);
    return { success: false as const, error: "Failed to fetch product" };
  }
}

export async function createProductUseCase(input: ProductInput) {
  try {
    const result = productSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.name);
    const compareAtPrice =
      validatedData.compareAtPrice === "" ? null : validatedData.compareAtPrice;

    const newProduct = await insertProductDb({
      categoryId: validatedData.categoryId,
      brandId: validatedData.brandId,
      sku: validatedData.sku,
      name: validatedData.name,
      slug,
      description: validatedData.description,
      price: validatedData.price,
      compareAtPrice,
      stock: validatedData.stock,
      attributes: validatedData.attributes,
      isActive: validatedData.isActive,
    });

    if (validatedData.collectionIds && validatedData.collectionIds.length > 0) {
      await syncProductCollectionsDb(
        newProduct.id,
        validatedData.collectionIds,
      );
    }

    return { success: true as const, data: newProduct };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Slug or SKU already exists" };
    }
    console.error("Failed to create product:", error);
    return { success: false as const, error: "Failed to create product" };
  }
}

export async function updateProductUseCase(id: string, input: ProductInput) {
  try {
    const result = productSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.name);
    const compareAtPrice =
      validatedData.compareAtPrice === "" ? null : validatedData.compareAtPrice;

    const updatedProduct = await updateProductDb(id, {
      categoryId: validatedData.categoryId,
      brandId: validatedData.brandId,
      sku: validatedData.sku,
      name: validatedData.name,
      slug,
      description: validatedData.description,
      price: validatedData.price,
      compareAtPrice,
      stock: validatedData.stock,
      attributes: validatedData.attributes,
      isActive: validatedData.isActive,
    });

    if (validatedData.collectionIds !== undefined) {
      await syncProductCollectionsDb(id, validatedData.collectionIds);
    }

    return { success: true as const, data: updatedProduct };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Slug or SKU already exists" };
    }
    console.error("Failed to update product:", error);
    return { success: false as const, error: "Failed to update product" };
  }
}

export async function deleteProductUseCase(id: string) {
  try {
    const images = await getProductImagesDb(id);
    const keysToDelete = images
      .map((image) => getKeyFromUrl(image.url))
      .filter((key): key is string => key !== null);

    if (keysToDelete.length > 0) {
      await deleteManyFromR2(keysToDelete);
    }

    await deleteProductDb(id);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false as const, error: "Failed to delete product" };
  }
}
