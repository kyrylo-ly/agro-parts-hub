import { relations } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    numeric,
    pgTable,
    text,
    timestamp,
    primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./better-auth";
// Category Table
export const category = pgTable("category", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    parentId: text("parent_id"), // self-reference logic handled in relations
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});
export const categoryRelations = relations(category, ({ one, many }) => ({
    parent: one(category, {
        fields: [category.parentId],
        references: [category.id],
        relationName: "parent_child",
    }),
    children: many(category, {
        relationName: "parent_child",
    }),
    products: many(product),
}));
// Product Table
export const product = pgTable(
    "product",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        categoryId: text("category_id")
            .notNull()
            .references(() => category.id),
        sku: text("sku").notNull().unique(),
        name: text("name").notNull(),
        slug: text("slug").notNull().unique(),
        description: text("description"),
        price: numeric("price").notNull(),
        compareAtPrice: numeric("compare_at_price"), // For Sale case
        stock: integer("stock").notNull().default(0),
        attributes: jsonb("attributes"), // Dynamic attributes e.g. {"diameter": "12mm"}
        viewCount: integer("view_count").default(0).notNull(), // For Popular case
        salesCount: integer("sales_count").default(0).notNull(), // For Best Sellers case
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(), // For New Arrivals case
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [
        index("product_categoryId_idx").on(table.categoryId),
        index("product_sku_idx").on(table.sku),
    ]
);
export const productRelations = relations(product, ({ one, many }) => ({
    category: one(category, {
        fields: [product.categoryId],
        references: [category.id],
    }),
    images: many(productImage),
    collections: many(productToCollection),
    favorites: many(favorite),
    orderItems: many(orderItem),
}));
// Product Image Table
export const productImage = pgTable(
    "product_image",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        productId: text("product_id")
            .notNull()
            .references(() => product.id, { onDelete: "cascade" }),
        url: text("url").notNull(),
        orderIndex: integer("order_index").default(0).notNull(),
    },
    (table) => [index("productImage_productId_idx").on(table.productId)]
);
export const productImageRelations = relations(productImage, ({ one }) => ({
    product: one(product, {
        fields: [productImage.productId],
        references: [product.id],
    }),
}));
// Collection Table (for Seasonal Offers, Best Choice, etc.)
export const collection = pgTable("collection", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});
export const collectionRelations = relations(collection, ({ many }) => ({
    products: many(productToCollection),
}));
// Product to Collection Many-to-Many
export const productToCollection = pgTable(
    "product_to_collection",
    {
        productId: text("product_id")
            .notNull()
            .references(() => product.id, { onDelete: "cascade" }),
        collectionId: text("collection_id")
            .notNull()
            .references(() => collection.id, { onDelete: "cascade" }),
    },
    (t) => [primaryKey({ columns: [t.productId, t.collectionId] })]
);
export const productToCollectionRelations = relations(
    productToCollection,
    ({ one }) => ({
        product: one(product, {
            fields: [productToCollection.productId],
            references: [product.id],
        }),
        collection: one(collection, {
            fields: [productToCollection.collectionId],
            references: [collection.id],
        }),
    })
);
// Favorite Table
export const favorite = pgTable(
    "favorite",
    {
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        productId: text("product_id")
            .notNull()
            .references(() => product.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => [primaryKey({ columns: [t.userId, t.productId] })]
);
export const favoriteRelations = relations(favorite, ({ one }) => ({
    user: one(user, {
        fields: [favorite.userId],
        references: [user.id],
    }),
    product: one(product, {
        fields: [favorite.productId],
        references: [product.id],
    }),
}));
// Order Table
export const order = pgTable(
    "order",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        userId: text("user_id").references(() => user.id, { onDelete: "set null" }), // Optional, for guests
        status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
        totalPrice: numeric("total_price").notNull(),
        shippingDetails: jsonb("shipping_details"), // e.g. address, name, phone, nova poshta details
        paymentMethod: text("payment_method"), // e.g. monobank, card, cash
        paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid, paid, refunded
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("order_userId_idx").on(table.userId)]
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
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        orderId: text("order_id")
            .notNull()
            .references(() => order.id, { onDelete: "cascade" }),
        productId: text("product_id")
            .references(() => product.id, { onDelete: "set null" }),
        quantity: integer("quantity").notNull().default(1),
        priceAtPurchase: numeric("price_at_purchase").notNull(),
    },
    (table) => [index("orderItem_orderId_idx").on(table.orderId)]
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
