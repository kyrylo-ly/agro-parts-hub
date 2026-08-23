import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { category, product } from "../src/db/schema/store";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  console.log("Seeding test data...");

  try {
    // Insert or update category
    const [insertedCategory] = await db.insert(category).values({
      name: "Тестова категорія",
      slug: "test-category-e2e",
    }).onConflictDoUpdate({
      target: category.slug,
      set: { name: "Тестова категорія" }
    }).returning();

    console.log("Category created/updated:", insertedCategory.name);

    // Insert or update product
    const [insertedProduct] = await db.insert(product).values({
      categoryId: insertedCategory.id,
      sku: "TEST-SKU-E2E",
      name: "Тестовий підшипник МТЗ",
      slug: "test-product-e2e",
      description: "Опис тестового товару для E2E перевірки",
      price: "150.00",
      stock: 10,
      isActive: true,
      attributes: { "diameter": "20mm", "type": "test" }
    }).onConflictDoUpdate({
      target: product.slug,
      set: { stock: 10, price: "150.00" }
    }).returning();

    console.log("Product created:", insertedProduct.name);

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.end();
  }
}

main();
