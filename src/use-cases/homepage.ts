import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { getAllBrandsWithCountsUseCase } from "@/use-cases/brands";
import { getAllCategoriesWithCountsUseCase } from "@/use-cases/categories";
import { getAllCollectionsWithCountsUseCase } from "@/use-cases/collections";
import { getNewArrivalsUseCase, getBestsellersUseCase } from "@/use-cases/products";

export async function getHomepageDataUseCase() {
  "use cache";
  cacheLife("max");
  cacheTag(
    CACHE_TAGS.PRODUCTS,
    CACHE_TAGS.CATEGORIES,
    CACHE_TAGS.BRANDS,
    CACHE_TAGS.COLLECTIONS,
    CACHE_TAGS.NEW_ARRIVALS,
    CACHE_TAGS.BESTSELLERS,
  );

  const [newArrivals, bestsellers, categories, collections, brands] =
    await Promise.all([
      getNewArrivalsUseCase(8),
      getBestsellersUseCase(8),
      getAllCategoriesWithCountsUseCase(),
      getAllCollectionsWithCountsUseCase(),
      getAllBrandsWithCountsUseCase(),
    ]);

  return { newArrivals, bestsellers, categories, collections, brands };
}
