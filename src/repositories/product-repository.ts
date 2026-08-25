import { eq, ilike, or, and, count, sql, desc, asc, inArray } from "drizzle-orm";
import { db } from "@/db/db";
import { product, brand, productToCollection, productImage } from "@/db/schema/store";
import { escapeLike } from "@/lib/escape-like";

import type { ProductFilterParams } from "@/services/types";

export interface InternalFilterParams extends ProductFilterParams {
  categoryIds?: number[];
  brandIds?: number[];
  productIds?: string[];
  searchQuery?: string;
}

export class ProductRepository {
  static async findBySlug(slug: string) {
    return db.query.product.findFirst({
      where: and(eq(product.slug, slug), eq(product.isActive, true)),
      with: {
        category: {
          with: { parent: true },
        },
        brand: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
        },
        collections: {
          with: { collection: true },
        },
      },
    });
  }

  static async findById(id: string) {
    return db.query.product.findFirst({
      where: eq(product.id, id),
      with: {
        category: true,
        brand: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
        },
        collections: {
          with: { collection: true },
        },
      },
    });
  }

  static async getCategoryAttributeFilters(categoryId: number) {
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

    return Array.from(attributeMap.entries()).map(([key, values]) => ({
      key,
      values: Array.from(values).sort(),
    }));
  }

  static async searchQuick(query: string) {
    return db.query.product.findMany({
      where: and(
        eq(product.isActive, true),
        or(
          ilike(product.name, `%${escapeLike(query)}%`),
          ilike(product.sku, `%${escapeLike(query)}%`)
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

  static async findByIds(ids: string[], maxLimit = 100) {
    return db.query.product.findMany({
      where: and(eq(product.isActive, true), inArray(product.id, ids)),
      limit: maxLimit,
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

  static async buildWhereClause(params: InternalFilterParams) {
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

  static async getFiltered(params: InternalFilterParams) {
    const { sort = "newest", page = 1, limit = 12 } = params;
    const offset = (page - 1) * limit;

    const whereClause = await this.buildWhereClause(params);

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

  static async getNewArrivals(limit = 8) {
    return db.query.product.findMany({
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
  }

  static async getBestsellers(limit = 8) {
    return db.query.product.findMany({
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
  }

  static async getAdminList({ page = 1, limit = 10, search }: { page?: number; limit?: number; search?: string }) {
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
          limit: 1, // Only first image for list view
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

  static async create(data: any, collectionIds?: number[]) {
    const [newProduct] = await db
      .insert(product)
      .values(data)
      .returning();

    if (collectionIds && collectionIds.length > 0) {
      await db.insert(productToCollection).values(
        collectionIds.map((collectionId) => ({
          productId: newProduct.id,
          collectionId,
        }))
      );
    }

    return newProduct;
  }

  static async update(id: string, data: any, collectionIds?: number[]) {
    const [updatedProduct] = await db
      .update(product)
      .set(data)
      .where(eq(product.id, id))
      .returning();

    if (collectionIds !== undefined) {
      await db.delete(productToCollection).where(eq(productToCollection.productId, id));
      if (collectionIds.length > 0) {
        await db.insert(productToCollection).values(
          collectionIds.map((collectionId) => ({
            productId: id,
            collectionId,
          }))
        );
      }
    }

    return updatedProduct;
  }

  static async getImages(productId: string) {
    return db.query.productImage.findMany({
      where: eq(productImage.productId, productId),
    });
  }

  static async delete(id: string) {
    await db.delete(product).where(eq(product.id, id));
  }
}
