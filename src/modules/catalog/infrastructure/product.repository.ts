import "server-only";
import { eq, ilike, or, and, desc } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { db } from "@/db/db";
import { product, brand, productToCategory } from "@/db/schema/store";
import { CACHE_TAGS, getProductTag } from "@/lib/constants/cache-tags";
import { escapeLike } from "@/lib/escape-like";

export async function getPublicProductBySlug(slug: string) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCTS, getProductTag(slug));

  try {
    const foundProduct = await db.query.product.findFirst({
      where: and(eq(product.slug, slug), eq(product.isActive, true)),
      with: {
        categories: {
          with: {
            category: true
          }
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

export async function getTopProductSlugs(limit = 100) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCTS);
  const products = await db
    .select({ slug: product.slug })
    .from(product)
    .where(eq(product.isActive, true))
    .orderBy(desc(product.salesCount))
    .limit(limit);
  return products.map((p) => ({ slug: p.slug }));
}

export async function getNewArrivals(limit = 8) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCTS, CACHE_TAGS.NEW_ARRIVALS);

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

export async function getBestsellers(limit = 8) {
  "use cache";
  cacheTag(CACHE_TAGS.PRODUCTS, CACHE_TAGS.BESTSELLERS);

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

    return { success: true as const, data: results };
  } catch (error) {
    console.error("searchProductsQuick error:", error);
    return { success: false as const, error: "Помилка пошуку" };
  }
}
