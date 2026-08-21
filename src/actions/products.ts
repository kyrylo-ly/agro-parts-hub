"use server";

import { eq, ilike, or, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/db";
import { product } from "@/db/schema/store";
import { productSchema, type ProductInput } from "@/lib/validations";
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

    const whereClause = search
      ? or(
        ilike(product.name, `%${search}%`),
        ilike(product.sku, `%${search}%`),
        ilike(sql`cast(${product.attributes} as text)`, `%${search}%`)
      )
      : undefined;

    const [totalCount] = await db
      .select({ count: count() })
      .from(product)
      .where(whereClause);

    const products = await db.query.product.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (products, { desc }) => [desc(products.id)],
      with: {
        category: true,
      },
    });

    return {
      success: true,
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
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function getProductById(id: string) {
  try {
    const foundProduct = await db.query.product.findFirst({
      where: eq(product.id, id),
      with: {
        category: true,
        images: {
          orderBy: (images, { asc }) => [asc(images.orderIndex)],
        },
      },
    });

    if (!foundProduct) {
      return { success: false, error: "Product not found" };
    }

    return { success: true, data: foundProduct };
  } catch (error) {
    console.error("Failed to get product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

export async function createProduct(input: ProductInput) {
  try {
    await requireAdmin();
    const validatedData = productSchema.parse(input);
    const slug = validatedData.slug || slugify(validatedData.name);

    const [newProduct] = await db
      .insert(product)
      .values({
        categoryId: validatedData.categoryId,
        sku: validatedData.sku,
        name: validatedData.name,
        slug,
        description: validatedData.description,
        price: validatedData.price,
        compareAtPrice: validatedData.compareAtPrice,
        stock: validatedData.stock,
        attributes: validatedData.attributes,
        isActive: validatedData.isActive,
      })
      .returning();

    revalidatePath("/admin/products");
    return { success: true, data: newProduct };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(id: string, input: ProductInput) {
  try {
    await requireAdmin();
    const validatedData = productSchema.parse(input);
    const slug = validatedData.slug || slugify(validatedData.name);

    const [updatedProduct] = await db
      .update(product)
      .set({
        categoryId: validatedData.categoryId,
        sku: validatedData.sku,
        name: validatedData.name,
        slug,
        description: validatedData.description,
        price: validatedData.price,
        compareAtPrice: validatedData.compareAtPrice,
        stock: validatedData.stock,
        attributes: validatedData.attributes,
        isActive: validatedData.isActive,
      })
      .where(eq(product.id, id))
      .returning();

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);
    return { success: true, data: updatedProduct };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireAdmin();
    await db.delete(product).where(eq(product.id, id));
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
