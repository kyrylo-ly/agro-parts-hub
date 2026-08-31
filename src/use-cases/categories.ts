import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { categorySchema, type CategoryInput } from "@/entities/category";
import { slugify } from "@/lib/utils";
import {
  getAllCategoriesDb,
  getCategoryBySlugDb,
  getCategoryByIdDb,
  getCategoryProductCountsDb,
  insertCategoryDb,
  updateCategoryDb,
  deleteCategoryDb,
  countProductsByCategoryIdDb,
  hasChildCategoriesDb,
  getCategoryProductImagesDb,
} from "@/data-access/categories";

export async function getAllCategoriesWithCountsUseCase() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.CATEGORIES);

  try {
    const categories = await getAllCategoriesDb();
    const productCounts = await getCategoryProductCountsDb();

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

export async function getCategoryBySlugUseCase(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.CATEGORIES);

  try {
    const foundCategory = await getCategoryBySlugDb(slug);
    if (!foundCategory) {
      return { success: false as const, error: "Category not found" };
    }
    return { success: true as const, data: foundCategory };
  } catch (error) {
    console.error("Failed to get category by slug:", error);
    return { success: false as const, error: "Failed to fetch category" };
  }
}

export async function getAllCategoriesUseCase() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.CATEGORIES);

  try {
    const categories = await getAllCategoriesDb();
    return { success: true as const, data: categories };
  } catch (error) {
    console.error("Failed to get categories:", error);
    return { success: false as const, error: "Failed to fetch categories" };
  }
}

export async function getCategoryByIdUseCase(id: number) {
  try {
    const foundCategory = await getCategoryByIdDb(id);
    if (!foundCategory) {
      return { success: false as const, error: "Category not found" };
    }
    return { success: true as const, data: foundCategory };
  } catch (error) {
    console.error("Failed to get category:", error);
    return { success: false as const, error: "Failed to fetch category" };
  }
}

export async function createCategoryUseCase(input: CategoryInput) {
  try {
    const result = categorySchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.name);

    const [newCategory] = await insertCategoryDb({
      name: validatedData.name,
      slug,
      parentId: validatedData.parentId,
      imageUrl: validatedData.imageUrl,
    });

    return { success: true as const, data: newCategory };
  } catch (error) {
    console.error("Failed to create category:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Категорія з таким slug вже існує" };
    }
    return { success: false as const, error: "Failed to create category" };
  }
}

export async function updateCategoryUseCase(id: number, input: CategoryInput) {
  try {
    const result = categorySchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.name);

    if (validatedData.parentId === id) {
      return { success: false as const, error: "Категорія не може бути своїм батьком" };
    }

    const [updatedCategory] = await updateCategoryDb(id, {
      name: validatedData.name,
      slug,
      parentId: validatedData.parentId,
      imageUrl: validatedData.imageUrl,
    });

    return { success: true as const, data: updatedCategory };
  } catch (error) {
    console.error("Failed to update category:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Категорія з таким slug вже існує" };
    }
    return { success: false as const, error: "Failed to update category" };
  }
}

export async function deleteCategoryUseCase(id: number) {
  try {
    const hasChildren = await hasChildCategoriesDb(id);
    if (hasChildren) {
      return {
        success: false as const,
        error: "Неможливо видалити категорію з дочірніми категоріями. Спочатку видаліть або перемістіть їх.",
      };
    }

    const productCount = await countProductsByCategoryIdDb(id);
    if (productCount > 0) {
      return {
        success: false as const,
        error: `Неможливо видалити категорію, яка містить ${productCount} продукт(ів). Спочатку перемістіть їх.`,
      };
    }

    await deleteCategoryDb(id);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false as const, error: "Failed to delete category" };
  }
}

export async function getCategoryProductImagesUseCase(categoryId: number) {
  try {
    const urls = await getCategoryProductImagesDb(categoryId);
    return { success: true as const, data: urls };
  } catch (error) {
    console.error("Failed to fetch category product images:", error);
    return { success: false as const, error: "Failed to fetch images" };
  }
}
