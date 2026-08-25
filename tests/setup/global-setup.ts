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
    const products = await sql`
      INSERT INTO product (
        sku, name, slug, price, stock, is_active
      ) VALUES (
        'TEST-SKU-001', 'Тестовий Товар E2E', 'test-product-e2e', 1500.00, 10, true
      ), (
        'TEST-SKU-002', 'Відсутній Товар E2E', 'out-of-stock-product', 2000.00, 0, true
      )
      ON CONFLICT (slug) DO UPDATE SET 
        name = EXCLUDED.name,
        sku = EXCLUDED.sku,
        price = EXCLUDED.price,
        stock = EXCLUDED.stock,
        is_active = EXCLUDED.is_active
      RETURNING id
    `;

    // Seed attribute
    const [attr] = await sql`
      INSERT INTO attribute (name, slug, type, unit)
      VALUES ('Вага', 'weight', 'number', 'кг')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, type = EXCLUDED.type, unit = EXCLUDED.unit
      RETURNING id
    `;

    // Associate attribute with category
    await sql`
      INSERT INTO category_attribute (category_id, attribute_id, is_required)
      VALUES (${cat.id}, ${attr.id}, true)
      ON CONFLICT DO NOTHING
    `;

    for (const p of products) {
      await sql`
        INSERT INTO product_to_category (product_id, category_id)
        VALUES (${p.id}, ${cat.id})
        ON CONFLICT DO NOTHING
      `;

      await sql`
        INSERT INTO product_attribute_value (product_id, attribute_id, value)
        VALUES (${p.id}, ${attr.id}, '10')
        ON CONFLICT DO NOTHING
      `;
    }
    // Seed admin user
    const [adminUser] = await sql`
      INSERT INTO "user" (id, name, email, email_verified, role, created_at, updated_at)
      VALUES ('admin-e2e-id', 'Admin Test', 'admin@example.com', true, 'admin', NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET role = 'admin'
      RETURNING id
    `;
    
    // Seed admin session
    await sql`
      INSERT INTO session (id, expires_at, token, created_at, updated_at, user_id)
      VALUES ('session-admin-id', NOW() + INTERVAL '1 day', 'admin-session-token-e2e', NOW(), NOW(), ${adminUser.id})
      ON CONFLICT (token) DO NOTHING
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
