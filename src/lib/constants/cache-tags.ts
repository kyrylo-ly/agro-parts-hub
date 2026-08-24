export const CACHE_TAGS = {
  PRODUCTS: "products",
  CATEGORIES: "categories",
  COLLECTIONS: "collections",
  BRANDS: "brands",
  NEW_ARRIVALS: "new-arrivals",
  BESTSELLERS: "bestsellers",
  HOMEPAGE_DATA: "homepage-data",
} as const;

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];

export function getProductTag(slug: string) {
  return `${CACHE_TAGS.PRODUCTS}-${slug}`;
}

export function getCategoryTag(slug: string) {
  return `${CACHE_TAGS.CATEGORIES}-${slug}`;
}
