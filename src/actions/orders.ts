"use server";

import { db } from "@/db/db";
import { order, orderItem, product } from "@/db/schema/store";
import { eq, sql, and, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// ─── Quick Order (Buy in 1 click) ──────────────────────────────────────────

const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;

export async function createQuickOrder(data: {
  productId: string;
  name: string;
  phone: string;
}) {
  const { productId, name, phone } = data;

  if (!name.trim() || name.trim().length < 2) {
    return { success: false as const, error: "Введіть ваше ім'я" };
  }

  if (!phoneRegex.test(phone)) {
    return { success: false as const, error: "Невірний номер телефону" };
  }

  try {
    // Check product exists and in stock
    const p = await db.query.product.findFirst({
      where: and(eq(product.id, productId), eq(product.isActive, true)),
      columns: { id: true, price: true, stock: true, name: true },
    });

    if (!p) {
      return { success: false as const, error: "Товар не знайдено" };
    }
    if (p.stock <= 0) {
      return { success: false as const, error: "Товар закінчився" };
    }

    // Check for auth session (optional)
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user.id ?? null;

    const newOrderId = await db.transaction(async (tx) => {
      // Create order
      const [newOrder] = await tx
        .insert(order)
        .values({
          userId,
          status: "pending",
          totalPrice: p.price,
          paymentMethod: "callback",
          paymentStatus: "unpaid",
          shippingDetails: { name: name.trim(), phone: phone.trim() },
        })
        .returning({ id: order.id });

      // Create order item
      await tx.insert(orderItem).values({
        orderId: newOrder.id,
        productId,
        quantity: 1,
        priceAtPurchase: p.price,
      });

      // Decrement stock, increment salesCount
      const [updated] = await tx
        .update(product)
        .set({
          stock: sql`${product.stock} - 1`,
          salesCount: sql`${product.salesCount} + 1`,
        })
        .where(and(eq(product.id, productId), sql`${product.stock} >= 1`))
        .returning({ id: product.id });

      if (!updated) {
        throw new Error("OUT_OF_STOCK");
      }

      return newOrder.id;
    });

    return { success: true as const, orderId: newOrderId };
  } catch (error) {
    console.error("createQuickOrder error:", error);
    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return { success: false as const, error: "Товар щойно закінчився на складі" };
    }
    return { success: false as const, error: "Помилка створення замовлення" };
  }
}

// ─── Full Checkout Order ────────────────────────────────────────────────────

interface CheckoutData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  deliveryType: "nova_poshta" | "ukrposhta" | "pickup";
  city?: string;
  warehouse?: string;
  zipCode?: string;
  paymentMethod: "cash_on_delivery" | "card_prepayment" | "mono_pay";
  comment?: string;
  items: { productId: string; quantity: number }[];
}

export async function createOrder(data: CheckoutData) {
  // Validation
  if (!data.firstName.trim() || !data.lastName.trim()) {
    return { success: false as const, error: "Заповніть ім'я та прізвище" };
  }
  if (!phoneRegex.test(data.phone)) {
    return { success: false as const, error: "Невірний номер телефону" };
  }
  if (data.items.length === 0) {
    return { success: false as const, error: "Кошик порожній" };
  }
  if (data.deliveryType === "nova_poshta" && (!data.city?.trim() || !data.warehouse?.trim())) {
    return { success: false as const, error: "Заповніть місто та відділення для Нової Пошти" };
  }
  if (data.deliveryType === "ukrposhta" && (!data.city?.trim() || !data.warehouse?.trim() || !data.zipCode?.trim())) {
    return { success: false as const, error: "Заповніть місто, відділення та індекс для Укрпошти" };
  }

  try {
    // Get all products for price validation
    const productIds = data.items.map((i) => i.productId);
    const products = await db.query.product.findMany({
      where: and(
        eq(product.isActive, true),
        inArray(product.id, productIds)
      ),
      columns: { id: true, price: true, stock: true, name: true },
    });

    // Validate stock
    for (const item of data.items) {
      const p = products.find((pr) => pr.id === item.productId);
      if (!p) {
        return { success: false as const, error: `Товар не знайдено` };
      }
      if (p.stock < item.quantity) {
        return {
          success: false as const,
          error: `Недостатньо товару "${p.name}" на складі (є ${p.stock})`,
        };
      }
    }

    // Calculate total
    const totalPrice = data.items.reduce((sum, item) => {
      const p = products.find((pr) => pr.id === item.productId)!;
      return sum + parseFloat(p.price) * item.quantity;
    }, 0);

    // Auth session
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user.id ?? null;

    const newOrderId = await db.transaction(async (tx) => {
      // Create order
      const [newOrder] = await tx
        .insert(order)
        .values({
          userId,
          status: "pending",
          totalPrice: totalPrice.toFixed(2),
          paymentMethod: data.paymentMethod,
          paymentStatus: "unpaid",
          shippingDetails: {
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            phone: data.phone.trim(),
            email: data.email?.trim() || undefined,
            deliveryType: data.deliveryType,
            city: data.city?.trim(),
            warehouse: data.warehouse?.trim(),
            zipCode: data.zipCode?.trim(),
            comment: data.comment?.trim() || undefined,
          },
        })
        .returning({ id: order.id });

      // Create order items
      const orderItems = data.items.map((item) => {
        const p = products.find((pr) => pr.id === item.productId)!;
        return {
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: p.price,
        };
      });
      await tx.insert(orderItem).values(orderItems);

      // Update stock and salesCount
      for (const item of data.items) {
        const [updated] = await tx
          .update(product)
          .set({
            stock: sql`${product.stock} - ${item.quantity}`,
            salesCount: sql`${product.salesCount} + ${item.quantity}`,
          })
          .where(and(
            eq(product.id, item.productId),
            sql`${product.stock} >= ${item.quantity}`
          ))
          .returning({ id: product.id });

        if (!updated) {
          throw new Error("OUT_OF_STOCK");
        }
      }

      return newOrder.id;
    });

    const redirectUrl = data.paymentMethod === "mono_pay" 
      ? `/mock-payment?orderId=${newOrderId}` 
      : `/checkout/success?orderId=${newOrderId}`;

    return { success: true as const, orderId: newOrderId, redirectUrl };
  } catch (error) {
    console.error("createOrder error:", error);
    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return { success: false as const, error: "Один з товарів щойно закінчився на складі" };
    }
    return { success: false as const, error: "Помилка створення замовлення" };
  }
}

// ─── Quick Cart Order (Checkout from Sidebar) ────────────────────────────────

export async function createQuickCartOrder(data: {
  name: string;
  phone: string;
  items: { productId: string; quantity: number }[];
}) {
  const { name, phone, items } = data;

  if (!name.trim() || name.trim().length < 2) {
    return { success: false as const, error: "Введіть ваше ім'я" };
  }
  if (!phoneRegex.test(phone)) {
    return { success: false as const, error: "Невірний номер телефону" };
  }
  if (!items || items.length === 0) {
    return { success: false as const, error: "Кошик порожній" };
  }

  try {
    const productIds = items.map((i) => i.productId);
    const products = await db.query.product.findMany({
      where: and(eq(product.isActive, true), inArray(product.id, productIds)),
      columns: { id: true, price: true, stock: true, name: true },
    });

    for (const item of items) {
      const p = products.find((pr) => pr.id === item.productId);
      if (!p) return { success: false as const, error: "Товар не знайдено" };
      if (p.stock < item.quantity) {
        return {
          success: false as const,
          error: `Недостатньо товару "${p.name}" (є ${p.stock})`,
        };
      }
    }

    const totalPrice = items.reduce((sum, item) => {
      const p = products.find((pr) => pr.id === item.productId)!;
      return sum + parseFloat(p.price) * item.quantity;
    }, 0);

    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user.id ?? null;

    const newOrderId = await db.transaction(async (tx) => {
      const [newOrder] = await tx
        .insert(order)
        .values({
          userId,
          status: "pending",
          totalPrice: totalPrice.toFixed(2),
          paymentMethod: "callback", // default for quick order
          paymentStatus: "unpaid",
          shippingDetails: { firstName: name.trim(), lastName: "", phone: phone.trim() },
        })
        .returning({ id: order.id });

      const orderItems = items.map((item) => {
        const p = products.find((pr) => pr.id === item.productId)!;
        return {
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: p.price,
        };
      });
      await tx.insert(orderItem).values(orderItems);

      for (const item of items) {
        const [updated] = await tx
          .update(product)
          .set({
            stock: sql`${product.stock} - ${item.quantity}`,
            salesCount: sql`${product.salesCount} + ${item.quantity}`,
          })
          .where(and(
            eq(product.id, item.productId),
            sql`${product.stock} >= ${item.quantity}`
          ))
          .returning({ id: product.id });

        if (!updated) {
          throw new Error("OUT_OF_STOCK");
        }
      }

      return newOrder.id;
    });

    return { success: true as const, orderId: newOrderId };
  } catch (error) {
    console.error("createQuickCartOrder error:", error);
    if (error instanceof Error && error.message === "OUT_OF_STOCK") {
      return { success: false as const, error: "Один з товарів щойно закінчився на складі" };
    }
    return { success: false as const, error: "Помилка створення замовлення" };
  }
}

// ─── Get Order ──────────────────────────────────────────────────────────────

export async function getOrderById(id: string) {
  try {
    const o = await db.query.order.findFirst({
      where: eq(order.id, id),
      with: {
        items: {
          with: {
            product: {
              columns: { name: true, slug: true, sku: true },
              with: {
                images: {
                  orderBy: (images, { asc }) => [asc(images.orderIndex)],
                  limit: 1,
                  columns: { url: true },
                },
              },
            },
          },
        },
      },
    });

    if (!o) return { success: false as const, error: "Замовлення не знайдено" };
    return { success: true as const, data: o };
  } catch (error) {
    console.error("getOrderById error:", error);
    return { success: false as const, error: "Помилка завантаження" };
  }
}

// ─── User Orders ────────────────────────────────────────────────────────────

export async function getUserOrders(page = 1, limit = 10) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user.id) {
      return { success: false as const, error: "Не авторизовано" };
    }

    const orders = await db.query.order.findMany({
      where: eq(order.userId, session.user.id),
      orderBy: (o, { desc }) => [desc(o.createdAt)],
      limit,
      offset: (page - 1) * limit,
      with: {
        items: {
          with: {
            product: {
              columns: { name: true, slug: true },
              with: {
                images: {
                  orderBy: (images, { asc }) => [asc(images.orderIndex)],
                  limit: 1,
                  columns: { url: true },
                },
              },
            },
          },
        },
      },
    });

    return { success: true as const, data: orders };
  } catch (error) {
    console.error("getUserOrders error:", error);
    return { success: false as const, error: "Помилка завантаження" };
  }
}

// ─── Mock Payment Action ───────────────────────────────────────────────────

export async function confirmMockPayment(orderId: string, status: "paid" | "cancelled") {
  try {
    const o = await db.query.order.findFirst({
      where: eq(order.id, orderId),
      columns: { id: true, status: true },
    });

    if (!o) return { success: false as const, error: "Замовлення не знайдено" };

    if (status === "paid") {
      await db.update(order)
        .set({ paymentStatus: "paid", status: "processing" })
        .where(eq(order.id, orderId));
      return { success: true as const, redirectUrl: `/checkout/success?orderId=${orderId}` };
    } else {
      await db.update(order)
        .set({ status: "cancelled" })
        .where(eq(order.id, orderId));
      return { success: true as const, redirectUrl: `/checkout?error=payment_cancelled` };
    }
  } catch (error) {
    console.error("confirmMockPayment error:", error);
    return { success: false as const, error: "Помилка оновлення статусу оплати" };
  }
}
