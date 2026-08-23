"use server";

import { db } from "@/db/db";
import { order, product } from "@/db/schema/store";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAdminOrders() {
  try {
    const orders = await db.query.order.findMany({
      orderBy: [desc(order.createdAt)],
      with: {
        items: {
          with: {
            product: {
              columns: { name: true, sku: true },
            },
          },
        },
      },
    });

    return { success: true as const, data: orders };
  } catch (error) {
    console.error("getAdminOrders error:", error);
    return { success: false as const, error: "Помилка завантаження замовлень" };
  }
}

export async function updateOrderStatus(orderId: string, status: "pending" | "processing" | "shipped" | "delivered" | "cancelled") {
  try {
    await db.update(order).set({ status }).where(eq(order.id, orderId));
    revalidatePath("/admin/orders");
    return { success: true as const };
  } catch (error) {
    console.error("updateOrderStatus error:", error);
    return { success: false as const, error: "Помилка оновлення статусу" };
  }
}
