import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import {
  getAllBrandsDb,
  getBrandBySlugDb,
  getBrandProductCountsDb,
  getBrandProductCountsByCategoryIdsDb,
  insertBrandDb,
  updateBrandDb,
  deleteBrandDb,
  countProductsByBrandIdDb
} from "@/data-access/brands";
import { brandSchema, type BrandInput } from "@/entities/brand";
import { slugify } from "@/lib/utils";

export async function getAllBrandsWithCountsUseCase() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.BRANDS);

  const brandsResult = await getAllBrandsUseCase();
  if (!brandsResult.success) return brandsResult;

  try {
    const brands = brandsResult.data;
    const rawCounts = await getBrandProductCountsDb();

    const countMap = new Map(rawCounts.map((c) => [c.brandId!, c.count]));

    const brandsWithCounts = brands.map((br) => ({
      ...br,
      productCount: countMap.get(br.id) ?? 0,
    }));

    return { success: true as const, data: brandsWithCounts };
  } catch (error) {
    console.error("Failed to get all brands with counts:", error);
    return { success: false as const, error: "Failed to fetch brands" };
  }
}

export async function getBrandsWithCountsByCategoryUseCase(
  categoryIds: number[],
) {
  const brandsResult = await getAllBrandsUseCase();
  if (!brandsResult.success) return brandsResult;

  try {
    const brands = brandsResult.data;
    const rawCounts = await getBrandProductCountsByCategoryIdsDb(categoryIds);

    const countMap = new Map(rawCounts.map((c) => [c.brandId!, c.count]));

    const brandsWithCounts = brands.map((br) => ({
      ...br,
      productCount: countMap.get(br.id) ?? 0,
    }));

    return { success: true as const, data: brandsWithCounts };
  } catch (error) {
    console.error("Failed to get brands with counts by category:", error);
    return { success: false as const, error: "Failed to fetch brands" };
  }
}

export async function getPublicBrandBySlugUseCase(slug: string) {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.BRANDS);

  try {
    const foundBrand = await getBrandBySlugDb(slug);

    if (!foundBrand) {
      return { success: false as const, error: "Brand not found" };
    }

    return { success: true as const, data: foundBrand };
  } catch (error) {
    console.error("Failed to get brand by slug:", error);
    return { success: false as const, error: "Failed to fetch brand" };
  }
}

export async function getAllBrandsUseCase() {
  "use cache";
  cacheLife("catalog");
  cacheTag(CACHE_TAGS.BRANDS);

  try {
    const brands = await getAllBrandsDb();
    return { success: true as const, data: brands };
  } catch (error) {
    console.error("Failed to get brands:", error);
    return { success: false as const, error: "Failed to fetch brands" };
  }
}

export async function createBrandUseCase(input: BrandInput) {
  const result = brandSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false as const,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const validatedData = result.data;
  const slug = validatedData.slug || slugify(validatedData.name);

  try {
    const [newBrand] = await insertBrandDb({
      name: validatedData.name,
      slug,
      imageUrl: validatedData.imageUrl,
    });

    return { success: true as const, data: newBrand };
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Бренд з такою назвою або slug вже існує" };
    }
    throw error;
  }
}

export async function updateBrandUseCase(id: number, input: BrandInput) {
  const result = brandSchema.safeParse(input);
  if (!result.success) {
    return {
      success: false as const,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors,
    };
  }

  const validatedData = result.data;
  const slug = validatedData.slug || slugify(validatedData.name);

  try {
    const [updatedBrand] = await updateBrandDb(id, {
      name: validatedData.name,
      slug,
      imageUrl: validatedData.imageUrl,
    });

    return { success: true as const, data: updatedBrand };
  } catch (error) {
    if (error instanceof Error && error.message.includes("unique")) {
      return { success: false as const, error: "Бренд з такою назвою або slug вже існує" };
    }
    throw error;
  }
}

export async function deleteBrandUseCase(id: number) {
  const productCount = await countProductsByBrandIdDb(id);

  if (productCount > 0) {
    return {
      success: false as const,
      error: `Неможливо видалити бренд, який використовується у ${productCount} продукт(ах). Спочатку змініть бренд цих продуктів.`,
    };
  }

  await deleteBrandDb(id);
  return { success: true as const };
}
