import type { MetadataRoute } from "next";
import { db } from "@/db/db";
import { product, category, collection, brand } from "@/db/schema/store";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL!;

  // Static pages
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

  // Products (only active)
  const products = await db
    .select({ slug: product.slug, updatedAt: product.updatedAt })
    .from(product)
    .where(eq(product.isActive, true));

  const productPages: MetadataRoute.Sitemap = products.map((prod) => ({
    url: `${siteUrl}/product/${prod.slug}`,
    lastModified: prod.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
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

  return [
    ...staticPages,
    ...categoryPages,
    ...productPages,
    ...collectionPages,
    ...brandPages,
  ];
}
