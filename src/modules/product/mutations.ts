import "server-only";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/constants/cache-tags";
import { db } from "@/db/db";
import { product, productToCollection, productToCategory, productImage } from "@/db/schema/store";
import { deleteManyFromR2, getKeyFromUrl } from "@/lib/r2";
import { slugify } from "@/lib/utils";
import { handleDbError } from "@/lib/db-errors";
import { requireAdmin } from "@/actions/admin-auth";
import { ProductInput, productSchema } from "./schemas";


export async function createProduct(input: ProductInput) {
    try {
        await requireAdmin();

        const result = productSchema.safeParse(input);
        if (!result.success) {
            return {
                success: false as const,
                error: "Validation failed",
                fieldErrors: z.flattenError(result.error).fieldErrors,
            };
        }

        const validatedData = result.data;
        const slug = validatedData.slug || slugify(validatedData.name);
        const compareAtPrice = validatedData.compareAtPrice === "" ? null : validatedData.compareAtPrice;

        const [newProduct] = await db
            .insert(product)
            .values({
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
            })
            .returning();

        // Handle collection assignments
        if (validatedData.collectionIds && validatedData.collectionIds.length > 0) {
            await db.insert(productToCollection).values(
                validatedData.collectionIds.map((collectionId) => ({
                    productId: newProduct.id,
                    collectionId,
                }))
            );
        }

        // Handle category assignments
        if (validatedData.categoryIds && validatedData.categoryIds.length > 0) {
            await db.insert(productToCategory).values(
                validatedData.categoryIds.map((categoryId) => ({
                    productId: newProduct.id,
                    categoryId,
                }))
            );
        }

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
                fieldErrors: z.flattenError(result.error).fieldErrors,
            };
        }

        const validatedData = result.data;
        const slug = validatedData.slug || slugify(validatedData.name);
        const compareAtPrice = validatedData.compareAtPrice === "" ? null : validatedData.compareAtPrice;

        const [updatedProduct] = await db
            .update(product)
            .set({
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
            })
            .where(eq(product.id, id))
            .returning();

        // Sync collection assignments
        if (validatedData.collectionIds !== undefined) {
            // Remove existing
            await db.delete(productToCollection).where(eq(productToCollection.productId, id));
            // Add new
            if (validatedData.collectionIds.length > 0) {
                await db.insert(productToCollection).values(
                    validatedData.collectionIds.map((collectionId) => ({
                        productId: id,
                        collectionId,
                    }))
                );
            }
        }

        // Sync category assignments
        if (validatedData.categoryIds !== undefined) {
            // Remove existing
            await db.delete(productToCategory).where(eq(productToCategory.productId, id));
            // Add new
            if (validatedData.categoryIds.length > 0) {
                await db.insert(productToCategory).values(
                    validatedData.categoryIds.map((categoryId) => ({
                        productId: id,
                        categoryId,
                    }))
                );
            }
        }

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

        const images = await db.query.productImage.findMany({
            where: eq(productImage.productId, id),
        });

        const keysToDelete = images
            .map((image) => getKeyFromUrl(image.url))
            .filter((key): key is string => key !== null);

        if (keysToDelete.length > 0) {
            await deleteManyFromR2(keysToDelete);
        }

        await db.delete(product).where(eq(product.id, id));
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
