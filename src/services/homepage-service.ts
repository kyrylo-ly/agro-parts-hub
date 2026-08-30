import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { getNewArrivals, getBestsellers } from "./product-service";
import { getPublicCategories } from "./category-service";
import { getPublicCollections } from "./collection-service";
import { getAllBrandsWithCountsUseCase } from "@/use-cases/brands";

export async function getHomepageData() {
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
      getNewArrivals(8),
      getBestsellers(8),
      getPublicCategories(),
      getPublicCollections(),
      getAllBrandsWithCountsUseCase(),
    ]);

  return { newArrivals, bestsellers, categories, collections, brands };
}
