import "server-only";
import { eq, ilike, or, and, count, sql, desc, asc, inArray } from "drizzle-orm";
import { db } from "@/db/db";
import { product, brand, productToCollection } from "@/db/schema/store";
import { type ProductFilterParams } from "@/entities/product";
import { escapeLike } from "@/lib/escape-like";

export async function getProductBySlugDb(slug: string) {
  return db.query.product.findFirst({
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
}

export async function getProductByIdDb(id: string) {
  return db.query.product.findFirst({
    where: eq(product.id, id),
    with: {
      category: true,
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
}

export async function getTopProductSlugsDb() {
  return db
    .select({ slug: product.slug })
    .from(product)
    .where(eq(product.isActive, true))
    .orderBy(desc(product.salesCount))
    .limit(100);
}

export async function searchProductsQuickDb(query: string) {
  const trimmed = query.trim();
  return db.query.product.findMany({
    where: and(
      eq(product.isActive, true),
      or(
        ilike(product.name, `%${escapeLike(trimmed)}%`),
        ilike(product.sku, `%${escapeLike(trimmed)}%`)
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
}

export async function getProductsByIdsDb(ids: string[]) {
  return db.query.product.findMany({
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
}

interface GetProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getAdminProductsDb({ page = 1, limit = 10, search }: GetProductsOptions = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(product.name, `%${escapeLike(search)}%`),
        ilike(product.sku, `%${escapeLike(search)}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalCount] = await db
    .select({ count: count() })
    .from(product)
    .where(whereClause);

  const products = await db.query.product.findMany({
    where: whereClause,
    limit,
    offset,
    orderBy: (products, { desc }) => [desc(products.createdAt)],
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

export async function getCategoryAttributeFiltersDb(categoryId: number) {
  return db
    .select({ attributes: product.attributes })
    .from(product)
    .where(
      and(
        eq(product.categoryId, categoryId),
        eq(product.isActive, true),
        sql`${product.attributes} IS NOT NULL`
      )
    );
}

export interface InternalFilterParams extends ProductFilterParams {
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
        ilike(product.name, `%${escapeLike(searchQuery)}%`),
        ilike(product.sku, `%${escapeLike(searchQuery)}%`)
      )!
    );
  }

  return and(...conditions);
}

export async function getFilteredProductsDb(params: InternalFilterParams) {
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

export async function insertProductDb(data: any) {
  const [newProduct] = await db.insert(product).values(data).returning();
  return newProduct;
}

export async function updateProductDb(id: string, data: any) {
  const [updatedProduct] = await db
    .update(product)
    .set(data)
    .where(eq(product.id, id))
    .returning();
  return updatedProduct;
}

export async function deleteProductDb(id: string) {
  await db.delete(product).where(eq(product.id, id));
}

export async function getProductImagesDb(productId: string) {
  return db.query.productImage.findMany({
    where: (pi, { eq }) => eq(pi.productId, productId),
  });
}

export async function syncProductCollectionsDb(productId: string, collectionIds: number[]) {
  // Remove existing
  await db.delete(productToCollection).where(eq(productToCollection.productId, productId));
  // Add new
  if (collectionIds.length > 0) {
    await db.insert(productToCollection).values(
      collectionIds.map((collectionId) => ({
        productId,
        collectionId,
      }))
    );
  }
}
