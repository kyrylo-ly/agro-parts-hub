"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { productSchema, type ProductInput } from "@/lib/validations";
import { deleteManyFromR2, getKeyFromUrl } from "@/lib/r2";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "./admin-auth";
import { handleDbError } from "@/lib/db-errors";
import { createProductService, updateProductService, deleteProductService } from "@/services/product-service";


export async function createProduct(input: ProductInput) {
  try {
    await requireAdmin();

    const result = productSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.name);
    const compareAtPrice = validatedData.compareAtPrice === "" ? null : validatedData.compareAtPrice;

    const newProduct = await createProductService({
      categoryId: validatedData.categoryId,
      brandId: validatedData.brandId,
      sku: validatedData.sku,
      name: validatedData.name,
      slug,
      description: validatedData.description,
      price: validatedData.price,
      compareAtPrice,
      stock: validatedData.stock,
      attributes: validatedData.attributes,
      isActive: validatedData.isActive,
    }, validatedData.collectionIds);

    revalidatePath("/admin/products");
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.PRODUCTS, "max" as any);
    revalidateTag(CACHE_TAGS.NEW_ARRIVALS, "max" as any);
    revalidateTag(CACHE_TAGS.BESTSELLERS, "max" as any);
    return { success: true as const, data: newProduct };
  } catch (error) {
    console.error("Failed to create product:", error);
    return handleDbError(error, "Failed to create product");
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  try {
    await requireAdmin();

    const result = productSchema.safeParse(input);
    if (!result.success) {
      return {
        success: false as const,
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      };
    }

    const validatedData = result.data;
    const slug = validatedData.slug || slugify(validatedData.name);
    const compareAtPrice = validatedData.compareAtPrice === "" ? null : validatedData.compareAtPrice;

    const updatedProduct = await updateProductService(id, {
      categoryId: validatedData.categoryId,
      brandId: validatedData.brandId,
      sku: validatedData.sku,
      name: validatedData.name,
      slug,
      description: validatedData.description,
      price: validatedData.price,
      compareAtPrice,
      stock: validatedData.stock,
      attributes: validatedData.attributes,
      isActive: validatedData.isActive,
    }, validatedData.collectionIds);

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.PRODUCTS, "max" as any);
    revalidateTag(CACHE_TAGS.NEW_ARRIVALS, "max" as any);
    revalidateTag(CACHE_TAGS.BESTSELLERS, "max" as any);
    return { success: true as const, data: updatedProduct };
  } catch (error) {
    console.error("Failed to update product:", error);
    return handleDbError(error, "Failed to update product");
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireAdmin();

    const images = await deleteProductService(id);

    const keysToDelete = images
      .map((image) => getKeyFromUrl(image.url))
      .filter((key): key is string => key !== null);

    if (keysToDelete.length > 0) {
      await deleteManyFromR2(keysToDelete);
    }
    revalidatePath("/admin/products");
    // Invalidate public ISR cache
    revalidateTag(CACHE_TAGS.PRODUCTS, "max" as any);
    revalidateTag(CACHE_TAGS.NEW_ARRIVALS, "max" as any);
    revalidateTag(CACHE_TAGS.BESTSELLERS, "max" as any);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false as const, error: "Failed to delete product" };
  }
}
