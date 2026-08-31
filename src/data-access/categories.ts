import "server-only";
import { eq, count } from "drizzle-orm";
import { db } from "@/db/db";
import { category, product } from "@/db/schema/store";

export async function getAllCategoriesDb() {
  return db.query.category.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
    with: {
      parent: true,
      children: {
        orderBy: (children, { asc }) => [asc(children.name)],
      },
    },
  });
}

export async function getCategoryBySlugDb(slug: string) {
  return db.query.category.findFirst({
    where: eq(category.slug, slug),
    with: {
      parent: true,
      children: {
        orderBy: (children, { asc }) => [asc(children.name)],
      },
    },
  });
}

export async function getCategoryByIdDb(id: number) {
  return db.query.category.findFirst({
    where: eq(category.id, id),
    with: {
      children: true,
      parent: true,
    },
  });
}

export async function getCategoryProductCountsDb() {
  return db
    .select({
      categoryId: product.categoryId,
      count: count(),
    })
    .from(product)
    .where(eq(product.isActive, true))
    .groupBy(product.categoryId);
}

export async function insertCategoryDb(data: {
  name: string;
  slug: string;
  parentId?: number | null;
  imageUrl?: string | null;
}) {
  return db.insert(category).values(data).returning();
}

export async function updateCategoryDb(
  id: number,
  data: {
    name: string;
    slug: string;
    parentId?: number | null;
    imageUrl?: string | null;
  }
) {
  return db
    .update(category)
    .set(data)
    .where(eq(category.id, id))
    .returning();
}

export async function deleteCategoryDb(id: number) {
  return db.delete(category).where(eq(category.id, id));
}

export async function countProductsByCategoryIdDb(categoryId: number) {
  const [productCount] = await db
    .select({ count: count() })
    .from(product)
    .where(eq(product.categoryId, categoryId));
  return productCount.count;
}

export async function hasChildCategoriesDb(parentId: number) {
  const children = await db.query.category.findFirst({
    where: eq(category.parentId, parentId),
  });
  return !!children;
}

export async function getCategoryProductImagesDb(categoryId: number) {
  const products = await db.query.product.findMany({
    where: eq(product.categoryId, categoryId),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.orderIndex)],
      },
    },
  });

  const urls = new Set<string>();
  products.forEach((p) => {
    p.images.forEach((img) => urls.add(img.url));
  });
  return Array.from(urls);
}
