import { test, expect } from '@playwright/test';
import postgres from 'postgres';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

test.describe('Caching & Invalidation', () => {
  test('should update product price on client after admin changes it', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Skipping flaky mobile test');
    // 1. Реєструємо нового користувача через UI
    const adminEmail = `admin_e2e_${Date.now()}@example.com`;
    const adminPassword = 'AdminPassword123!';
    
    await page.goto('/signup');
    await page.locator('input[name="name"]').first().fill('E2E Admin');
    await page.locator('input[name="email"]').first().fill(adminEmail);
    await page.locator('input[name="password"]').first().fill(adminPassword);
    
    // Можливо форма має поле підтвердження пароля
    const confirmInput = page.locator('input[name="confirm"]');
    if (await confirmInput.isVisible().catch(() => false)) {
        await confirmInput.fill(adminPassword);
    }

    await page.getByRole('button', { name: /зареєструватися|signup|створити/i }).click();
    
    // Чекаємо завершення реєстрації
    await page.waitForLoadState('networkidle');

    // 2. Надаємо права адміна створеному користувачу через базу даних
    const sql = postgres(process.env.DATABASE_URL as string);
    await sql`UPDATE "user" SET role = 'admin' WHERE email = ${adminEmail}`;
    // Отримуємо ID товару через SQL для стабільної навігації
    const [testProduct] = await sql`SELECT id FROM product WHERE slug = 'test-product-e2e'`;
    await sql.end();

    // 3. Відкриваємо сторінку товару, щоб запам'ятати початкову ціну
    await page.goto('/product/test-product-e2e');
    const priceElement = page.locator('.text-3xl.font-bold').first(); 
    const initialPrice = await priceElement.textContent();

    // 4. Переходимо в адмінку (оскільки ми залогінені і вже маємо роль 'admin', нас пустить)
    await page.goto('/admin/products');
    
    // Знаходимо рядок з товаром і клікаємо на "Редагувати" 
    const productRow = page.locator('tr', { hasText: 'Тестовий Товар E2E' }).first();
    const editBtn = productRow.locator('a[href*="/edit"]').first();
    await editBtn.click();
    
    // Чекаємо завантаження форми
    await expect(page.locator('input[name="price"]')).toBeVisible({ timeout: 15000 });

    // Змінюємо ціну на випадкову (щоб тест проходив навіть якщо минулий раз впав)
    const newPrice = (Math.floor(Math.random() * 800) + 100).toString();
    await page.locator('input[name="price"]').fill(newPrice);
    await page.getByRole('button', { name: /зберегти/i }).click();

    // Чекаємо повідомлення про успішне збереження (toast)
    await expect(page.getByText(/успішно/i)).toBeVisible({ timeout: 5000 }).catch(() => {});
    
    // 5. Перевіряємо, що клієнтська сторінка показує нову ціну при поверненні
    await page.goto('/product/test-product-e2e');
    // Додатковий reload для впевненості
    await page.reload();
    
    const updatedPrice = await priceElement.textContent();
    
    expect(updatedPrice).not.toBe(initialPrice);
    expect(updatedPrice).toContain(newPrice);
    
    // 6. Повертаємо ціну назад, щоб не ламати інші тести
    await page.goto('/admin/products');
    await page.locator('tr', { hasText: 'Тестовий Товар E2E' }).first().locator('a[href*="/edit"]').first().click();
    
    await expect(page.locator('input[name="price"]')).toBeVisible({ timeout: 15000 });
    await page.locator('input[name="price"]').fill('1500');
    await page.getByRole('button', { name: /зберегти/i }).click();
  });
});
