"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/db";
import { productImage } from "@/db/schema/store";
import { uploadToR2, deleteFromR2, getKeyFromUrl } from "@/lib/r2";
import { requireAdmin } from "./admin-auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadProductImage(productId: string, formData: FormData) {
  try {
    await requireAdmin();

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false as const, error: "Файл не обрано" };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false as const, error: "Дозволені формати: JPEG, PNG, WebP, AVIF" };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false as const, error: "Максимальний розмір файлу — 5 МБ" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const key = `products/${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const url = await uploadToR2(buffer, key, file.type);

    // Get current max order index
    const existingImages = await db.query.productImage.findMany({
      where: eq(productImage.productId, productId),
      orderBy: (images, { desc }) => [desc(images.orderIndex)],
      limit: 1,
    });

    const nextOrderIndex = existingImages.length > 0 ? existingImages[0].orderIndex + 1 : 0;

    const [newImage] = await db
      .insert(productImage)
      .values({
        productId,
        url,
        orderIndex: nextOrderIndex,
      })
      .returning();

    revalidatePath(`/admin/products/${productId}`);
    return { success: true as const, data: newImage };
  } catch (error) {
    console.error("Failed to upload image:", error);
    return { success: false as const, error: "Не вдалося завантажити зображення" };
  }
}

export async function deleteProductImage(imageId: string) {
  try {
    await requireAdmin();

    const image = await db.query.productImage.findFirst({
      where: eq(productImage.id, imageId),
    });

    if (!image) {
      return { success: false as const, error: "Image not found" };
    }

    // Delete from R2
    const key = getKeyFromUrl(image.url);
    if (key) {
      await deleteFromR2(key);
    }

    // Delete from DB
    await db.delete(productImage).where(eq(productImage.id, imageId));

    revalidatePath(`/admin/products/${image.productId}`);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete image:", error);
    return { success: false as const, error: "Не вдалося видалити зображення" };
  }
}

export async function reorderProductImages(
  productId: string,
  imageIds: string[]
) {
  try {
    await requireAdmin();

    // Update order index for each image
    await Promise.all(
      imageIds.map((id, index) =>
        db
          .update(productImage)
          .set({ orderIndex: index })
          .where(eq(productImage.id, id))
      )
    );

    revalidatePath(`/admin/products/${productId}`);
    return { success: true as const };
  } catch (error) {
    console.error("Failed to reorder images:", error);
    return { success: false as const, error: "Не вдалося змінити порядок зображень" };
  }
}
