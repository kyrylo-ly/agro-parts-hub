import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { _getNewArrivalsRaw, _getBestsellersRaw } from "./product-service";
import { _getPublicCategoriesRaw } from "./category-service";
import { _getPublicCollectionsRaw } from "./collection-service";
import { _getPublicBrandsRaw } from "./brand-service";

export const getHomepageData = unstable_cache(
  async function _getHomepageData() {
    const [newArrivals, bestsellers, categories, collections, brands] =
      await Promise.all([
        _getNewArrivalsRaw(8),
        _getBestsellersRaw(8),
        _getPublicCategoriesRaw(),
        _getPublicCollectionsRaw(),
        _getPublicBrandsRaw(),
      ]);

    return { newArrivals, bestsellers, categories, collections, brands };
  },
  ["homepage-data"],
  {
    revalidate: 7200,
    tags: [
      CACHE_TAGS.PRODUCTS,
      CACHE_TAGS.CATEGORIES,
      CACHE_TAGS.BRANDS,
      CACHE_TAGS.COLLECTIONS,
      CACHE_TAGS.NEW_ARRIVALS,
      CACHE_TAGS.BESTSELLERS,
    ],
  }
);
