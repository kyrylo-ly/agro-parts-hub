import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { product } from "./products";
import { orderStatusEnum, paymentStatusEnum } from "./enums";

// Order Table
export const order = pgTable(
  "order",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }), // Keep text to match better-auth's user.id
    status: orderStatusEnum("status").notNull().default("pending"),
    totalPrice: numeric("total_price").notNull(),
    shippingDetails: jsonb("shipping_details"), // e.g. address, name, phone, nova poshta details
    paymentMethod: text("payment_method"), // e.g. monobank, card, cash
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("unpaid"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("order_userId_idx").on(table.userId)],
);

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  items: many(orderItem),
}));

// Order Item Table
export const orderItem = pgTable(
  "order_item",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => product.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull().default(1),
    priceAtPurchase: numeric("price_at_purchase").notNull(),
  },
  (table) => [index("orderItem_orderId_idx").on(table.orderId)],
);

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
}));
