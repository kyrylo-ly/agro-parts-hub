import { relations, sql } from "drizzle-orm";
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
  uuid,
  serial,
} from "drizzle-orm/pg-core";
import { user } from "./better-auth";
import { category } from "./categories";
import { orderItem } from "./orders";

// Brand Table
export const brand = pgTable(
  "brand",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("brand_slug_idx").on(table.slug)],
);

export const brandRelations = relations(brand, ({ many }) => ({
  products: many(product),
}));

// Product Table
export const product = pgTable(
  "product",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    categoryId: integer("category_id")
      .notNull()
      .references(() => category.id),
    brandId: integer("brand_id").references(() => brand.id, {
      onDelete: "set null",
    }),
    sku: text("sku").notNull().unique(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    price: numeric("price").notNull(),
    compareAtPrice: numeric("compare_at_price"), // For Sale case
    stock: integer("stock").notNull().default(0),
    attributes: jsonb("attributes"), // Dynamic attributes e.g. {"diameter": "12mm"}
    salesCount: integer("sales_count").default(0).notNull(), // For Best Sellers case
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(), // For New Arrivals case
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("product_categoryId_idx").on(table.categoryId),
    index("product_brandId_idx").on(table.brandId),
    index("product_sku_idx").on(table.sku),
    index("product_slug_idx").on(table.slug),
    index("product_salesCount_idx").on(table.salesCount),
    index("product_attributes_gin_idx").using("gin", table.attributes),
  ],
);

export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, {
    fields: [product.categoryId],
    references: [category.id],
  }),
  brand: one(brand, {
    fields: [product.brandId],
    references: [brand.id],
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
    id: uuid("id")
      .primaryKey()
      .default(sql`uuidv7()`),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
  },
  (table) => [index("productImage_productId_idx").on(table.productId)],
);

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, {
    fields: [productImage.productId],
    references: [product.id],
  }),
}));

// Collection Table (for Seasonal Offers, Best Choice, etc.)
export const collection = pgTable(
  "collection",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("collection_slug_idx").on(table.slug)],
);

export const collectionRelations = relations(collection, ({ many }) => ({
  products: many(productToCollection),
}));

// Product to Collection Many-to-Many
export const productToCollection = pgTable(
  "product_to_collection",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    collectionId: integer("collection_id")
      .notNull()
      .references(() => collection.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.collectionId] })],
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
  }),
);

// Favorite Table
export const favorite = pgTable(
  "favorite",
  {
    userId: text("user_id") // Keep text to match better-auth's user.id
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
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
