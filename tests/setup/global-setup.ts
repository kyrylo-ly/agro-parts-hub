import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function globalSetup() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is missing in .env file");
  const sql = postgres(connectionString);

  try {
    // Seed a category if not exists
    const [cat] = await sql`
      INSERT INTO category (name, slug) 
      VALUES ('Тестова Категорія E2E', 'test-category-e2e') 
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    // Seed test product
    await sql`
      INSERT INTO product (
        category_id, sku, name, slug, price, stock, is_active
      ) VALUES (
        ${cat.id}, 'TEST-SKU-001', 'Тестовий Товар E2E', 'test-product-e2e', 1500.00, 10, true
      )
      ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        sku = EXCLUDED.sku,
        price = EXCLUDED.price,
        stock = EXCLUDED.stock,
        is_active = EXCLUDED.is_active
    `;
    console.log('✅ Global Setup: Test data seeded successfully');
  } catch (error) {
    console.error('❌ Global Setup failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

export default globalSetup;

if (require.main === module || process.argv[1] === __filename) {
  globalSetup().catch(console.error);
}
