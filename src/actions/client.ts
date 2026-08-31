"use server";

import { searchProductsQuickUseCase, getProductsByIdsUseCase } from "@/use-cases/products";

/**
 * These are Server Actions explicitly exposed to Client Components.
 * They wrap the Use Cases methods safely.
 */

export async function searchProductsQuick(query: string) {
  return searchProductsQuickUseCase(query);
}

export async function getProductsByIds(ids: string[], maxLimit = 100) {
  return getProductsByIdsUseCase(ids, maxLimit);
}
