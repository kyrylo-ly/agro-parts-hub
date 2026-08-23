"use server";

import { searchProductsQuick as serviceSearchProductsQuick, getProductsByIds as serviceGetProductsByIds } from "@/services/product-service";

/**
 * These are Server Actions explicitly exposed to Client Components.
 * They wrap the Data Access Layer methods safely.
 */

export async function searchProductsQuick(query: string) {
  return serviceSearchProductsQuick(query);
}

export async function getProductsByIds(ids: string[], maxLimit = 100) {
  return serviceGetProductsByIds(ids, maxLimit);
}
