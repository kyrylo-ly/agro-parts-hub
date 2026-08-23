import "server-only";
import { eq, ilike, or, and, count, sql, desc, asc, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/db/db";
import { product, brand } from "@/db/schema/store";
import { ProductFilterParams } from "./types";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";

export async function getPublicProductBySlug(slug: string) {
  try {
    const foundProduct = await db.query.product.findFirst({
      where: and(eq(product.slug, slug), eq(product.isActive, true)),
      with: {
        category: {
          with: {
            parent: true,
          },
        },
        brand: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
        },
        collections: {
          with: {
            collection: true,
          },
        },
      },
    });

    if (!foundProduct) {
      return { success: false as const, error: "Product not found" };
    }

    return { success: true as const, data: foundProduct };
  } catch (error) {
    console.error("Failed to get product by slug:", error);
    return { success: false as const, error: "Failed to fetch product" };
  }
}

export async function getCategoryAttributeFilters(categoryId: number) {
  try {
    const results = await db
      .select({ attributes: product.attributes })
      .from(product)
      .where(
        and(
          eq(product.categoryId, categoryId),
          eq(product.isActive, true),
          sql`${product.attributes} IS NOT NULL`
        )
      );

    const attributeMap = new Map<string, Set<string>>();

    for (const row of results) {
      const attrs = row.attributes as Record<string, string> | null;
      if (!attrs) continue;

      for (const [key, value] of Object.entries(attrs)) {
        if (!attributeMap.has(key)) {
          attributeMap.set(key, new Set());
        }
        attributeMap.get(key)!.add(value);
      }
    }

    const filters = Array.from(attributeMap.entries()).map(
      ([key, values]) => ({
        key,
        values: Array.from(values).sort(),
      })
    );

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

    const productsResult = await getFilteredProducts({
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
    const results = await db.query.product.findMany({
      where: and(
        eq(product.isActive, true),
        or(
          ilike(product.name, `%${trimmed}%`),
          ilike(product.sku, `%${trimmed}%`)
        )
      ),
      limit: 5,
      columns: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
      },
      with: {
        brand: { columns: { name: true } },
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
          limit: 1,
          columns: { url: true },
        },
      },
    });

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
    const products = await db.query.product.findMany({
      where: and(
        eq(product.isActive, true),
        inArray(product.id, ids)
      ),
      with: {
        brand: { columns: { name: true, slug: true } },
        category: { columns: { name: true, slug: true } },
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
          limit: 1,
          columns: { url: true },
        },
      },
    });

    return { success: true as const, data: products };
  } catch (error) {
    console.error("getProductsByIds error:", error);
    return { success: false as const, error: "Помилка завантаження" };
  }
}

interface InternalFilterParams extends ProductFilterParams {
  categoryIds?: number[];
  brandIds?: number[];
  productIds?: string[];
  searchQuery?: string;
}

export async function buildProductWhereClause(params: InternalFilterParams) {
  const {
    categoryIds,
    brandIds,
    brandSlugs,
    priceMin,
    priceMax,
    inStock,
    isPromotion,
    attributes,
    productIds,
    searchQuery,
  } = params;

  const conditions = [eq(product.isActive, true)];

  if (categoryIds && categoryIds.length > 0) {
    conditions.push(inArray(product.categoryId, categoryIds));
  }

  if (productIds && productIds.length > 0) {
    conditions.push(inArray(product.id, productIds));
  }

  if (brandIds && brandIds.length > 0) {
    conditions.push(inArray(product.brandId, brandIds));
  }

  if (brandSlugs && brandSlugs.length > 0) {
    const brandResults = await db
      .select({ id: brand.id })
      .from(brand)
      .where(inArray(brand.slug, brandSlugs));

    const resolvedBrandIds = brandResults.map((b) => b.id);
    if (resolvedBrandIds.length > 0) {
      conditions.push(inArray(product.brandId, resolvedBrandIds));
    } else {
      return null;
    }
  }

  if (priceMin !== undefined) {
    conditions.push(sql`${product.price}::numeric >= ${String(priceMin)}::numeric`);
  }
  if (priceMax !== undefined) {
    conditions.push(sql`${product.price}::numeric <= ${String(priceMax)}::numeric`);
  }

  if (inStock) {
    conditions.push(sql`${product.stock} > 0`);
  }

  if (isPromotion) {
    conditions.push(
      sql`${product.compareAtPrice} IS NOT NULL AND ${product.compareAtPrice}::numeric > ${product.price}::numeric`
    );
  }

  if (attributes) {
    for (const [key, values] of Object.entries(attributes)) {
      if (values.length > 0) {
        conditions.push(
          sql`${product.attributes}->>${key} IN (${sql.join(
            values.map((v) => sql`${v}`),
            sql`, `
          )})`
        );
      }
    }
  }

  if (searchQuery) {
    conditions.push(
      or(
        ilike(product.name, `%${searchQuery}%`),
        ilike(product.sku, `%${searchQuery}%`)
      )!
    );
  }

  return and(...conditions);
}

export async function getFilteredProducts(params: InternalFilterParams) {
  const { sort = "newest", page = 1, limit = 12 } = params;
  const offset = (page - 1) * limit;

  const whereClause = await buildProductWhereClause(params);

  if (whereClause === null) {
    return {
      products: [],
      meta: { total: 0, page, limit, totalPages: 0 },
    };
  }

  const [totalCount] = await db
    .select({ count: count() })
    .from(product)
    .where(whereClause);

  let orderBy;
  switch (sort) {
    case "price_asc":
      orderBy = [asc(product.price)];
      break;
    case "price_desc":
      orderBy = [desc(product.price)];
      break;
    case "bestsellers":
      orderBy = [desc(product.salesCount)];
      break;
    case "newest":
    default:
      orderBy = [desc(product.createdAt)];
      break;
  }

  const products = await db.query.product.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: () => orderBy,
    with: {
      category: true,
      brand: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.orderIndex)],
        limit: 1,
      },
    },
  });

  return {
    products,
    meta: {
      total: totalCount.count,
      page,
      limit,
      totalPages: Math.ceil(totalCount.count / limit),
    },
  };
}

export async function getPublicProducts(filters: ProductFilterParams = {}) {
  try {
    const productsResult = await getFilteredProducts(filters);
    return { success: true as const, data: productsResult };
  } catch (error) {
    console.error("Failed to get public products:", error);
    return { success: false as const, error: "Failed to fetch products" };
  }
}

export async function _getNewArrivalsRaw(limit = 8) {
  try {
    const products = await db.query.product.findMany({
      where: eq(product.isActive, true),
      limit,
      orderBy: (products, { desc }) => [desc(products.createdAt)],
      with: {
        brand: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
          limit: 1,
        },
      },
    });

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
    const products = await db.query.product.findMany({
      where: eq(product.isActive, true),
      limit,
      orderBy: (products, { desc }) => [desc(products.salesCount)],
      with: {
        brand: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
          limit: 1,
        },
      },
    });

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
