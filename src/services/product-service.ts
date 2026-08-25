import "server-only";
import { unstable_cache } from "next/cache";
import { ProductRepository } from "@/repositories/product-repository";
import { CACHE_TAGS, getProductTag } from "@/lib/constants/cache-tags";
import type { ProductFilterParams } from "./types";
import type { InternalFilterParams } from "@/repositories/product-repository";

export async function _getPublicProductBySlugRaw(slug: string) {
  try {
    const foundProduct = await ProductRepository.findBySlug(slug);
    if (!foundProduct) {
      return { success: false as const, error: "Product not found" };
    }
    return { success: true as const, data: foundProduct };
  } catch (error) {
    console.error("Failed to get product by slug:", error);
    return { success: false as const, error: "Failed to fetch product" };
  }
}

export async function getPublicProductBySlug(slug: string) {
  const cachedFn = unstable_cache(
    async () => _getPublicProductBySlugRaw(slug),
    [`public-product-${slug}`],
    {
      revalidate: 7200,
      tags: [CACHE_TAGS.PRODUCTS, getProductTag(slug)],
    }
  );
  return cachedFn();
}

export async function getCategoryAttributeFilters(categoryId: number) {
  try {
    const filters = await ProductRepository.getCategoryAttributeFilters(categoryId);
    return { success: true as const, data: filters };
  } catch (error) {
    console.error("Failed to get category attribute filters:", error);
    return { success: false as const, error: "Failed to fetch attribute filters" };
  }
}

export async function searchProducts(
  query: string,
  filters: ProductFilterParams = {}
) {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true as const,
        data: {
          products: [],
          meta: { total: 0, page: 1, limit: filters.limit ?? 12, totalPages: 0 },
        },
      };
    }

    const sanitized = query.trim();

    const productsResult = await ProductRepository.getFiltered({
      ...filters,
      searchQuery: sanitized,
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

export async function searchProductsQuick(query: string) {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { success: true as const, data: [] };
  }

  try {
    const results = await ProductRepository.searchQuick(trimmed);
    return { success: true as const, data: results };
  } catch (error) {
    console.error("searchProductsQuick error:", error);
    return { success: false as const, error: "Помилка пошуку" };
  }
}

export async function getProductsByIds(ids: string[], maxLimit = 100) {
  if (ids.length === 0 || ids.length > maxLimit) {
    return { success: true as const, data: [] };
  }

  try {
    const products = await ProductRepository.findByIds(ids, maxLimit);
    return { success: true as const, data: products };
  } catch (error) {
    console.error("getProductsByIds error:", error);
    return { success: false as const, error: "Помилка завантаження" };
  }
}

export async function getFilteredProducts(params: InternalFilterParams) {
  return ProductRepository.getFiltered(params);
}

export async function getPublicProducts(filters: ProductFilterParams = {}) {
  try {
    const productsResult = await ProductRepository.getFiltered(filters);
    return { success: true as const, data: productsResult };
  } catch (error) {
    console.error("Failed to get public products:", error);
    return { success: false as const, error: "Failed to fetch products" };
  }
}

export async function _getNewArrivalsRaw(limit = 8) {
  try {
    const products = await ProductRepository.getNewArrivals(limit);
    return { success: true as const, data: products };
  } catch (error) {
    console.error("Failed to get new arrivals:", error);
    return { success: false as const, error: "Failed to fetch new arrivals" };
  }
}

export const getNewArrivals = unstable_cache(
  _getNewArrivalsRaw,
  ["new-arrivals"],
  { revalidate: 7200, tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.NEW_ARRIVALS] }
);

export async function _getBestsellersRaw(limit = 8) {
  try {
    const products = await ProductRepository.getBestsellers(limit);
    return { success: true as const, data: products };
  } catch (error) {
    console.error("Failed to get bestsellers:", error);
    return { success: false as const, error: "Failed to fetch bestsellers" };
  }
}

export const getBestsellers = unstable_cache(
  _getBestsellersRaw,
  ["bestsellers"],
  { revalidate: 7200, tags: [CACHE_TAGS.PRODUCTS, CACHE_TAGS.BESTSELLERS] }
);

interface GetProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getAdminProducts(options: GetProductsOptions = {}) {
  try {
    const result = await ProductRepository.getAdminList(options);
    return { success: true as const, data: result.products, meta: result.meta };
  } catch (error) {
    console.error("Failed to get products:", error);
    return { success: false as const, error: "Failed to fetch products" };
  }
}

export async function getAdminProductById(id: string) {
  try {
    const foundProduct = await ProductRepository.findById(id);
    if (!foundProduct) {
      return { success: false as const, error: "Product not found" };
    }
    return { success: true as const, data: foundProduct };
  } catch (error) {
    console.error("Failed to get product:", error);
    return { success: false as const, error: "Failed to fetch product" };
  }
}

// These mutation services will be called from Server Actions

export async function createProductService(data: any, collectionIds?: number[]) {
  return ProductRepository.create(data, collectionIds);
}

export async function updateProductService(id: string, data: any, collectionIds?: number[]) {
  return ProductRepository.update(id, data, collectionIds);
}

export async function deleteProductService(id: string) {
  const images = await ProductRepository.getImages(id);
  await ProductRepository.delete(id);
  return images;
}
