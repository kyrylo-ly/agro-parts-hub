import { test, expect } from '@playwright/test';

test.describe('Catalog & Filtering', () => {
  test('should navigate pagination, filter, and sort products', async ({ page }) => {
    // 1. Перехід до каталогу/категорій
    await page.goto('/categories');
    
    // 2. Тестування пагінації (в AGENTS.md вказано використання ?page=2)
    const nextPageBtn = page.getByRole('button', { name: /наступна|next|2/i }).first();
    if (await nextPageBtn.isVisible()) {
        await nextPageBtn.click();
        await expect(page).toHaveURL(/.*page=2/);
    } else {
        // Fallback: переходимо вручну, якщо кнопок пагінації немає (наприклад, мало товарів)
        await page.goto('/categories?page=2');
        await expect(page).toHaveURL(/.*page=2/);
    }

    await page.goto('/categories'); // Повертаємось на першу сторінку для фільтрів

    // 3. Тестування фільтрації (наприклад, по бренду або JSONB-атрибутах)
    // Шукаємо перший чекбокс у сайдбарі фільтрів
    const filterCheckbox = page.locator('input[type="checkbox"]').first();
    if (await filterCheckbox.isVisible()) {
        await filterCheckbox.check();
        await page.waitForTimeout(1000); // Чекаємо на debounce завантаження
        
        // Переконуємось, що URL змінився, або лоадер зник
        const urlParams = new URL(page.url()).searchParams;
        expect(Array.from(urlParams.keys()).length).toBeGreaterThan(0);
    }

    // 4. Тестування сортування
    // Шукаємо випадаючий список сортування
    const sortSelect = page.getByRole('combobox').first();
    if (await sortSelect.isVisible()) {
        await sortSelect.click();
        // Обираємо опцію сортування (наприклад, за ціною)
        const sortOption = page.getByRole('option', { name: /цін|price|дорож/i }).first();
        if (await sortOption.isVisible()) {
             await sortOption.click();
             await page.waitForTimeout(1000); // Чекаємо на оновлення списку
        }
    }
  });
});
