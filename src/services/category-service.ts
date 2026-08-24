import "server-only";
import { eq, count } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/db/db";
import { category, product } from "@/db/schema/store";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { ProductFilterParams } from "./types";
import { getFilteredProducts } from "./product-service";

export async function _getPublicCategoriesRaw() {
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
  { revalidate: 7200, tags: [CACHE_TAGS.CATEGORIES] }
);

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

    const categoryIds = [
      foundCategory.id,
      ...foundCategory.children.map((c) => c.id),
    ];

    const productsResult = await getFilteredProducts({ ...filters, categoryIds });

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

export async function getAllCategories() {
  try {
    const categories = await db.query.category.findMany({
      orderBy: (categories, { asc }) => [asc(categories.name)],
      with: {
        children: true,
        parent: true,
      },
    });
    return { success: true as const, data: categories };
  } catch (error) {
    console.error("Failed to get categories:", error);
    return { success: false as const, error: "Failed to fetch categories" };
  }
}

export async function getCategoryById(id: number) {
  try {
    const foundCategory = await db.query.category.findFirst({
      where: eq(category.id, id),
      with: {
        children: true,
        parent: true,
      },
    });

    if (!foundCategory) {
      return { success: false as const, error: "Category not found" };
    }

    return { success: true as const, data: foundCategory };
  } catch (error) {
    console.error("Failed to get category:", error);
    return { success: false as const, error: "Failed to fetch category" };
  }
}

