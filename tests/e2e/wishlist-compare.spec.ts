import { test, expect } from '@playwright/test';

test.describe('Wishlist & Compare', () => {
  test('should add items to wishlist and compare, and persist state', async ({ page }) => {
    // 1. Перехід на сторінку тестового товару (який сідується в global-setup.ts)
    await page.goto('/product/test-product-e2e');
    await expect(page).toHaveURL(/.*product\/test-product-e2e/);

    // 2. Додавання у Вибране
    const favBtn = page.getByLabel(/додати.*улюбленого/i).first();
    await favBtn.click();
    // Чекаємо, поки кнопка змінить свій стан на "Видалити", що гарантує оновлення стору
    await expect(page.getByLabel(/видалити.*улюбленого/i).first()).toBeVisible();

    // 3. Додавання до Порівняння
    const compareBtn = page.getByLabel(/додати.*порівняння/i).first();
    await compareBtn.click();
    await expect(page.getByLabel(/видалити.*порівняння/i).first()).toBeVisible();

    // Затримка для оновлення стану Zustand
    await page.waitForTimeout(500);

    // 4. Перевірка на сторінці Вибраного
    await page.goto('/favorites');
    await expect(page).toHaveURL(/.*favorites/);
    await expect(page.getByText(/Тестовий Товар E2E/i).first()).toBeVisible();

    // 5. Перевірка на сторінці Порівняння
    await page.goto('/compare');
    await expect(page).toHaveURL(/.*compare/);
    await expect(page.getByText(/Тестовий Товар E2E/i).first()).toBeVisible();

    // 6. Перевірка збереження стану Zustand Persist (після перезавантаження)
    await page.reload();
    await expect(page.getByText(/Тестовий Товар E2E/i).first()).toBeVisible();
  });
});
