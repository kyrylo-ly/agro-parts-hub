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
  attributes?: Record<string, string[]>; // e.g. { "inner_diameter": ["30mm", "35mm"] }
  sort?: "price_asc" | "price_desc" | "newest" | "popular" | "bestsellers";
  page?: number;
  limit?: number;
}

// ─── Categories ──────────────────────────────────────────────────────────────

/** Get all categories with product counts for navigation */
export async function getPublicCategories() {
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

    // Increment view count (fire-and-forget, don't block response)
    db.update(product)
      .set({ viewCount: sql`${product.viewCount} + 1` })
      .where(eq(product.id, foundProduct.id))
      .then(() => {})
      .catch(() => {});

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
export async function getPublicCollections() {
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

// ─── Brands ──────────────────────────────────────────────────────────────────

/** Get all brands with product counts */
export async function getPublicBrands() {
  try {
    const brands = await db.query.brand.findMany({
      orderBy: (brands, { asc }) => [asc(brands.name)],
    });

    const productCounts = await db
      .select({
        brandId: product.brandId,
        count: count(),
      })
      .from(product)
      .where(eq(product.isActive, true))
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
export async function getNewArrivals(limit = 8) {
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

/** Popular products — by viewCount */
export async function getPopularProducts(limit = 8) {
  try {
    const products = await db.query.product.findMany({
      where: eq(product.isActive, true),
      limit,
      orderBy: (products, { desc }) => [desc(products.viewCount)],
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
    console.error("Failed to get popular products:", error);
    return {
      success: false as const,
      error: "Failed to fetch popular products",
    };
  }
}

/** Bestsellers — by salesCount */
export async function getBestsellers(limit = 8) {
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

  // Price range filter
  if (priceMin !== undefined) {
    conditions.push(gte(product.price, String(priceMin)));
  }
  if (priceMax !== undefined) {
    conditions.push(lte(product.price, String(priceMax)));
  }

  // In-stock filter
  if (inStock) {
    conditions.push(sql`${product.stock} > 0`);
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
    case "popular":
      orderBy = [desc(product.viewCount)];
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

