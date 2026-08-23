"use server";

import {
  eq,
  ilike,
  or,
  and,
  count,
  sql,
  desc,
  asc,
  gte,
  lte,
  inArray,
} from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/db/db";
import {
  product,
  category,
  collection,
  brand,
  productToCollection,
  productImage,
} from "@/db/schema/store";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProductFilterParams {
  brandSlugs?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  isPromotion?: boolean;
  attributes?: Record<string, string[]>; // e.g. { "inner_diameter": ["30mm", "35mm"] }
  sort?: "price_asc" | "price_desc" | "newest" | "bestsellers";
  page?: number;
  limit?: number;
}

// ─── Categories ──────────────────────────────────────────────────────────────

/** Get all categories with product counts for navigation */
async function _getPublicCategoriesRaw() {
  try {
    const categories = await db.query.category.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
      with: {
        parent: true,
        children: {
          orderBy: (children, { asc }) => [asc(children.name)],
        },
      },
    });

    // Get product counts per category
    const productCounts = await db
      .select({
        categoryId: product.categoryId,
        count: count(),
      })
      .from(product)
      .where(eq(product.isActive, true))
      .groupBy(product.categoryId);

    const countMap = new Map(
      productCounts.map((c) => [c.categoryId, c.count])
    );

    const categoriesWithCounts = categories.map((cat) => ({
      ...cat,
      productCount: countMap.get(cat.id) ?? 0,
    }));

    return { success: true as const, data: categoriesWithCounts };
  } catch (error) {
    console.error("Failed to get public categories:", error);
    return { success: false as const, error: "Failed to fetch categories" };
  }
}

export const getPublicCategories = unstable_cache(
  _getPublicCategoriesRaw,
  ["public-categories"],
  { revalidate: 7200, tags: ["categories"] }
);

/** Get a single category by slug with filtered products */
export async function getPublicCategoryBySlug(
  slug: string,
  filters: ProductFilterParams = {}
) {
  try {
    const foundCategory = await db.query.category.findFirst({
      where: eq(category.slug, slug),
      with: {
        parent: true,
        children: {
          orderBy: (children, { asc }) => [asc(children.name)],
        },
      },
    });

    if (!foundCategory) {
      return { success: false as const, error: "Category not found" };
    }

    // Get child category IDs to include products from subcategories
    const categoryIds = [
      foundCategory.id,
      ...foundCategory.children.map((c) => c.id),
    ];

    const productsResult = await getFilteredProducts(
      { ...filters, categoryIds },
    );

    return {
      success: true as const,
      data: {
        category: foundCategory,
        ...productsResult,
      },
    };
  } catch (error) {
    console.error("Failed to get category by slug:", error);
    return { success: false as const, error: "Failed to fetch category" };
  }
}

// ─── Products ────────────────────────────────────────────────────────────────

/** Get a single product by slug for the product detail page */
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

// ─── Collections ─────────────────────────────────────────────────────────────

/** Get a collection by slug with its products */
export async function getPublicCollectionBySlug(
  slug: string,
  filters: ProductFilterParams = {}
) {
  try {
    const foundCollection = await db.query.collection.findFirst({
      where: eq(collection.slug, slug),
    });

    if (!foundCollection) {
      return { success: false as const, error: "Collection not found" };
    }

    // Get product IDs in this collection
    const collectionProducts = await db
      .select({ productId: productToCollection.productId })
      .from(productToCollection)
      .where(eq(productToCollection.collectionId, foundCollection.id));

    const productIds = collectionProducts.map((cp) => cp.productId);

    if (productIds.length === 0) {
      return {
        success: true as const,
        data: {
          collection: foundCollection,
          products: [],
          meta: { total: 0, page: 1, limit: filters.limit ?? 12, totalPages: 0 },
        },
      };
    }

    const productsResult = await getFilteredProducts({
      ...filters,
      productIds,
    });

    return {
      success: true as const,
      data: {
        collection: foundCollection,
        ...productsResult,
      },
    };
  } catch (error) {
    console.error("Failed to get collection by slug:", error);
    return { success: false as const, error: "Failed to fetch collection" };
  }
}

/** Get all collections with product counts */
async function _getPublicCollectionsRaw() {
  try {
    const collections = await db.query.collection.findMany({
      orderBy: (collections, { desc }) => [desc(collections.createdAt)],
    });

    const productCounts = await db
      .select({
        collectionId: productToCollection.collectionId,
        count: count(),
      })
      .from(productToCollection)
      .groupBy(productToCollection.collectionId);

    const countMap = new Map(
      productCounts.map((c) => [c.collectionId, c.count])
    );

    const collectionsWithCounts = collections.map((col) => ({
      ...col,
      productCount: countMap.get(col.id) ?? 0,
    }));

    return { success: true as const, data: collectionsWithCounts };
  } catch (error) {
    console.error("Failed to get public collections:", error);
    return { success: false as const, error: "Failed to fetch collections" };
  }
}

export const getPublicCollections = unstable_cache(
  _getPublicCollectionsRaw,
  ["public-collections"],
  { revalidate: 7200, tags: ["collections"] }
);

// ─── Brands ──────────────────────────────────────────────────────────────────

async function _getPublicBrandsRaw(categoryIds?: number[]) {
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
  { revalidate: 7200, tags: ["brands"] }
);

/** Get brand by slug with its products */
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

// ─── Homepage sections ───────────────────────────────────────────────────────

/** New arrivals — latest products */
async function _getNewArrivalsRaw(limit = 8) {
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
  { revalidate: 7200, tags: ["products", "new-arrivals"] }
);

/** Bestsellers — by salesCount */
async function _getBestsellersRaw(limit = 8) {
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
  { revalidate: 7200, tags: ["products", "bestsellers"] }
);

/**
 * Homepage data — all 6 sections in a single Neon round-trip.
 * Uses Promise.all over raw (non-cached) functions so the entire
 * payload is stored as one cache entry.
 * TTL = 5 min (shortest among all sections).
 * Tags cover every entity — any admin mutation invalidates this too.
 */
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
    tags: ["products", "categories", "brands", "collections", "new-arrivals", "bestsellers"],
  }
);

// ─── Search ──────────────────────────────────────────────────────────────────

/** Search products by name or SKU */
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

// ─── Attribute filters ───────────────────────────────────────────────────────

/** Get unique attribute keys and values for a category (for dynamic filter generation) */
export async function getCategoryAttributeFilters(categoryId: number) {
  try {
    // Get all attribute objects for active products in this category
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

    // Aggregate unique keys → unique values
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

    // Convert to serializable format
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

// ─── Internal helpers ────────────────────────────────────────────────────────

interface InternalFilterParams extends ProductFilterParams {
  categoryIds?: number[];
  brandIds?: number[];
  productIds?: string[];
  searchQuery?: string;
}

async function getFilteredProducts(params: InternalFilterParams) {
  const {
    categoryIds,
    brandIds,
    brandSlugs,
    priceMin,
    priceMax,
    inStock,
    isPromotion,
    attributes,
    sort = "newest",
    page = 1,
    limit = 12,
    productIds,
    searchQuery,
  } = params;

  const offset = (page - 1) * limit;
  const conditions = [eq(product.isActive, true)];

  // Category filter
  if (categoryIds && categoryIds.length > 0) {
    conditions.push(inArray(product.categoryId, categoryIds));
  }

  // Product IDs filter (for collections)
  if (productIds && productIds.length > 0) {
    conditions.push(inArray(product.id, productIds));
  }

  // Brand filter by IDs
  if (brandIds && brandIds.length > 0) {
    conditions.push(inArray(product.brandId, brandIds));
  }

  // Brand filter by slugs
  if (brandSlugs && brandSlugs.length > 0) {
    const brandResults = await db
      .select({ id: brand.id })
      .from(brand)
      .where(inArray(brand.slug, brandSlugs));

    const resolvedBrandIds = brandResults.map((b) => b.id);
    if (resolvedBrandIds.length > 0) {
      conditions.push(inArray(product.brandId, resolvedBrandIds));
    } else {
      // No matching brands — return empty
      return {
        products: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }
  }

  // Price range filter (cast strings to numeric in Postgres)
  if (priceMin !== undefined) {
    conditions.push(sql`${product.price}::numeric >= ${String(priceMin)}::numeric`);
  }
  if (priceMax !== undefined) {
    conditions.push(sql`${product.price}::numeric <= ${String(priceMax)}::numeric`);
  }

  // In-stock filter
  if (inStock) {
    conditions.push(sql`${product.stock} > 0`);
  }

  // Promotion filter
  if (isPromotion) {
    conditions.push(
      sql`${product.compareAtPrice} IS NOT NULL AND ${product.compareAtPrice}::numeric > ${product.price}::numeric`
    );
  }

  // Attribute filters (JSONB) — use parameterized queries
  if (attributes) {
    for (const [key, values] of Object.entries(attributes)) {
      if (values.length > 0) {
        // attributes->>$key IN ($values) — uses Drizzle sql template for safety
        conditions.push(
          sql`${product.attributes}->>${key} IN (${sql.join(
            values.map((v) => sql`${v}`),
            sql`, `
          )})`
        );
      }
    }
  }

  // Search
  if (searchQuery) {
    conditions.push(
      or(
        ilike(product.name, `%${searchQuery}%`),
        ilike(product.sku, `%${searchQuery}%`)
      )!
    );
  }

  const whereClause = and(...conditions);

  // Count total
  const [totalCount] = await db
    .select({ count: count() })
    .from(product)
    .where(whereClause);

  // Sort
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

  // Fetch products
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

/** Get public products based on general filters */
export async function getPublicProducts(filters: ProductFilterParams = {}) {
  try {
    const productsResult = await getFilteredProducts(filters);
    return { success: true as const, data: productsResult };
  } catch (error) {
    console.error("Failed to get public products:", error);
    return { success: false as const, error: "Failed to fetch products" };
  }
}


// ─── Quick Search (for live search dropdown) ────────────────────────────────

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

// ─── Products for Comparison ────────────────────────────────────────────────

export async function getProductsForCompare(ids: string[]) {
  if (ids.length === 0 || ids.length > 4) {
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
    console.error("getProductsForCompare error:", error);
    return { success: false as const, error: "Помилка завантаження" };
  }
}

export async function getProductsForFavorites(ids: string[]) {
  if (ids.length === 0) {
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
    console.error("getProductsForFavorites error:", error);
    return { success: false as const, error: "Помилка завантаження" };
  }
}

