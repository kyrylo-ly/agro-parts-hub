import { eq, count, and, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/db/db";
import { brand, product } from "@/db/schema/store";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { ProductFilterParams } from "./types";
import { getFilteredProducts } from "./product-service";

export async function _getPublicBrandsRaw(categoryIds?: number[]) {
  try {
    const brands = await db.query.brand.findMany({
      orderBy: (brands, { asc }) => [asc(brands.name)],
    });

    const conditions = [eq(product.isActive, true)];
    if (categoryIds && categoryIds.length > 0) {
      conditions.push(inArray(product.categoryId, categoryIds));
    }

    const productCounts = await db
      .select({
        brandId: product.brandId,
        count: count(),
      })
      .from(product)
      .where(and(...conditions))
      .groupBy(product.brandId);

    const countMap = new Map(
      productCounts.map((c) => [c.brandId!, c.count])
    );

    const brandsWithCounts = brands.map((br) => ({
      ...br,
      productCount: countMap.get(br.id) ?? 0,
    }));

    return { success: true as const, data: brandsWithCounts };
  } catch (error) {
    console.error("Failed to get public brands:", error);
    return { success: false as const, error: "Failed to fetch brands" };
  }
}

export const getPublicBrands = unstable_cache(
  _getPublicBrandsRaw,
  ["public-brands"],
  { revalidate: 7200, tags: [CACHE_TAGS.BRANDS] }
);

export async function getPublicBrandBySlug(
  slug: string,
  filters: ProductFilterParams = {}
) {
  try {
    const foundBrand = await db.query.brand.findFirst({
      where: eq(brand.slug, slug),
    });

    if (!foundBrand) {
      return { success: false as const, error: "Brand not found" };
    }

    const productsResult = await getFilteredProducts({
      ...filters,
      brandIds: [foundBrand.id],
    });

    return {
      success: true as const,
      data: {
        brand: foundBrand,
        ...productsResult,
      },
    };
  } catch (error) {
    console.error("Failed to get brand by slug:", error);
    return { success: false as const, error: "Failed to fetch brand" };
  }
}
