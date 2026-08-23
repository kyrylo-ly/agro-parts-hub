export interface ProductFilterParams {
  brandSlugs?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  isPromotion?: boolean;
  attributes?: Record<string, string[]>;
  sort?: "price_asc" | "price_desc" | "newest" | "bestsellers";
  page?: number;
  limit?: number;
}
