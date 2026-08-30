import "server-only";
import { cache } from "react";
import { db } from "@/db/db";
import { brand, product } from "@/db/schema/store";
import { eq, count, and, inArray } from "drizzle-orm";

export const getAllBrandsDb = cache(async () => {
  return db.query.brand.findMany({
    orderBy: (brands, { asc }) => [asc(brands.name)],
  });
});

export const getBrandBySlugDb = cache(async (slug: string) => {
  return db.query.brand.findFirst({
    where: eq(brand.slug, slug),
  });
});

export const getBrandProductCountsDb = cache(async () => {
  return db
    .select({
      brandId: product.brandId,
      count: count(),
    })
    .from(product)
    .where(eq(product.isActive, true))
    .groupBy(product.brandId);
});

export const getBrandProductCountsByCategoryIdsDb = cache(
  async (categoryIds: number[]) => {
    return db
      .select({
        brandId: product.brandId,
        count: count(),
      })
      .from(product)
      .where(
        and(
          eq(product.isActive, true),
          inArray(product.categoryId, categoryIds),
        ),
      )
      .groupBy(product.brandId);
  },
);

export async function insertBrandDb(data: { name: string; slug: string; imageUrl?: string | null }) {
  return db.insert(brand).values(data).returning();
}

export async function updateBrandDb(id: number, data: { name: string; slug: string; imageUrl?: string | null }) {
  return db.update(brand).set(data).where(eq(brand.id, id)).returning();
}

export async function deleteBrandDb(id: number) {
  return db.delete(brand).where(eq(brand.id, id));
}

export async function countProductsByBrandIdDb(brandId: number) {
  const [result] = await db
    .select({ count: count() })
    .from(product)
    .where(eq(product.brandId, brandId));
  return result.count;
}
