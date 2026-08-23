"use server";

import { searchProductsQuick as serviceSearchProductsQuick, getProductsByIds as serviceGetProductsByIds } from "@/services/product-service";
import { rateLimitSearch } from "@/lib/ratelimit";

/**
 * These are Server Actions explicitly exposed to Client Components.
 * They wrap the Data Access Layer methods safely.
 */

export async function searchProductsQuick(query: string) {
  try {
    await rateLimitSearch();
  } catch (error) {
    console.error(error);
    return []; // Return empty array on rate limit
  }
  return serviceSearchProductsQuick(query);
}

export async function getProductsByIds(ids: string[], maxLimit = 100) {
  return serviceGetProductsByIds(ids, maxLimit);
}
