import type { MetadataRoute } from "next";
import { db } from "@/db/db";
import { product, category, collection, brand } from "@/db/schema/store";
import { eq, count } from "drizzle-orm";

const PRODUCTS_PER_SITEMAP = 5000;

/**
 * Generate sitemap index entries.
 * Sitemap 0 = static pages + categories + collections + brands
 * Sitemap 1..N = products split into chunks of PRODUCTS_PER_SITEMAP
 */
export async function generateSitemaps() {
  const [result] = await db
    .select({ count: count() })
    .from(product)
    .where(eq(product.isActive, true));

  const productCount = result.count;
  const productSitemapCount = Math.max(1, Math.ceil(productCount / PRODUCTS_PER_SITEMAP));

  // id 0 = static + categories + brands + collections
  // id 1..N = products
  const sitemaps = [{ id: 0 }];
  for (let i = 1; i <= productSitemapCount; i++) {
    sitemaps.push({ id: i });
  }

  return sitemaps;
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Sitemap 0: Static pages + categories + collections + brands
  if (id === 0) {
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${siteUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${siteUrl}/brands`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${siteUrl}/new`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.7,
      },
      {
        url: `${siteUrl}/bestsellers`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.7,
      },
      {
        url: `${siteUrl}/delivery`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${siteUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${siteUrl}/contacts`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${siteUrl}/warranty`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      },
      {
        url: `${siteUrl}/returns`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.4,
      },
    ];

    // Categories
    const categories = await db
      .select({ slug: category.slug, updatedAt: category.updatedAt })
      .from(category);

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${siteUrl}/categories/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    // Collections
    const collections = await db
      .select({ slug: collection.slug, updatedAt: collection.updatedAt })
      .from(collection);

    const collectionPages: MetadataRoute.Sitemap = collections.map((col) => ({
      url: `${siteUrl}/collection/${col.slug}`,
      lastModified: col.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    // Brands
    const brands = await db
      .select({ slug: brand.slug, updatedAt: brand.updatedAt })
      .from(brand);

    const brandPages: MetadataRoute.Sitemap = brands.map((br) => ({
      url: `${siteUrl}/brands/${br.slug}`,
      lastModified: br.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...collectionPages, ...brandPages];
  }

  // Sitemap 1..N: Products (paginated)
  const offset = (id - 1) * PRODUCTS_PER_SITEMAP;

  const products = await db
    .select({ slug: product.slug, updatedAt: product.updatedAt })
    .from(product)
    .where(eq(product.isActive, true))
    .limit(PRODUCTS_PER_SITEMAP)
    .offset(offset);

  return products.map((prod) => ({
    url: `${siteUrl}/product/${prod.slug}`,
    lastModified: prod.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
}
