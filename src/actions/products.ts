"use server";

import { eq, ilike, or, count, sql, and, inArray } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/db/db";
import { product, productToCollection, productImage } from "@/db/schema/store";
import { productSchema, type ProductInput } from "@/lib/validations";
import { deleteManyFromR2, getKeyFromUrl } from "@/lib/r2";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "./admin-auth";

interface GetProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getProducts({ page = 1, limit = 10, search }: GetProductsOptions = {}) {
  try {
    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(product.name, `%${search}%`),
          ilike(product.sku, `%${search}%`),
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalCount] = await db
      .select({ count: count() })
      .from(product)
      .where(whereClause);

    const products = await db.query.product.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (products, { desc }) => [desc(products.createdAt)],
      with: {
        category: true,
        brand: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
          limit: 1, // Only first image for list view
        },
      },
    });

    return {
      success: true as const,
      data: products,
      meta: {
        total: totalCount.count,
        page,
        limit,
        totalPages: Math.ceil(totalCount.count / limit),
      },
    };
  } catch (error) {
    console.error("Failed to get products:", error);
    return { success: false as const, error: "Failed to fetch products" };
  }
}

export async function getProductById(id: string) {
  try {
    const foundProduct = await db.query.product.findFirst({
      where: eq(product.id, id),
      with: {
        category: true,
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
    console.error("Failed to get product:", error);
    return { success: false as const, error: "Failed to fetch product" };
  }
}

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

    const [newProduct] = await db
      .insert(product)
      .values({
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

    revalidatePath("/admin/products");
    // Invalidate public ISR cache
    revalidateTag("products", "max");
    revalidateTag("new-arrivals", "max");
    revalidateTag("bestsellers", "max");
    revalidateTag("popular", "max");
    return { success: true as const, data: newProduct };
  } catch (error) {
    console.error("Failed to create product:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      if (error.message.includes("sku")) {
        return { success: false as const, error: "Продукт з таким SKU вже існує" };
      }
      if (error.message.includes("slug")) {
        return { success: false as const, error: "Продукт з таким slug вже існує" };
      }
      return { success: false as const, error: "Дублювання даних" };
    }
    return { success: false as const, error: "Failed to create product" };
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

    const [updatedProduct] = await db
      .update(product)
      .set({
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

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    // Invalidate public ISR cache
    revalidateTag("products", "max");
    revalidateTag("new-arrivals", "max");
    revalidateTag("bestsellers", "max");
    revalidateTag("popular", "max");
    return { success: true as const, data: updatedProduct };
  } catch (error) {
    console.error("Failed to update product:", error);
    if (error instanceof Error && error.message.includes("unique")) {
      if (error.message.includes("sku")) {
        return { success: false as const, error: "Продукт з таким SKU вже існує" };
      }
      if (error.message.includes("slug")) {
        return { success: false as const, error: "Продукт з таким slug вже існує" };
      }
      return { success: false as const, error: "Дублювання даних" };
    }
    return { success: false as const, error: "Failed to update product" };
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
    revalidateTag("products", "max");
    revalidateTag("new-arrivals", "max");
    revalidateTag("bestsellers", "max");
    revalidateTag("popular", "max");
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false as const, error: "Failed to delete product" };
  }
}
