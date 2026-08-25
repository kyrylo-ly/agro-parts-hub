import { test, expect } from '@playwright/test';

test.describe('Authentication & Profile', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test('should register, login, and view profile', async ({ page }) => {
    // 1. Реєстрація
    await page.goto('/signup');
    await expect(page).toHaveURL(/.*signup/);
    
    // Заповнюємо форму надійними селекторами за name
    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.isVisible()) await nameInput.fill('Test User');
    
    await page.locator('input[name="email"]').first().fill(testEmail);
    
    // Заповнюємо пароль та підтвердження (якщо є)
    await page.locator('input[name="password"]').first().fill(testPassword);
    const confirmInput = page.locator('input[name="confirm"]');
    if (await confirmInput.isVisible().catch(() => false)) {
        await confirmInput.fill(testPassword);
    }
    
    // Submit
    await page.getByRole('button', { name: /зареєструватися|signup|створити/i }).click();

    await page.waitForLoadState('networkidle');

    // 2. Логін (якщо після реєстрації не відбувається автологін)
    if (!page.url().includes('/profile') && !page.url().includes('http://localhost:3000/')) {
        await page.goto('/login');
        await page.locator('input[name="email"]').first().fill(testEmail);
        await page.locator('input[name="password"]').first().fill(testPassword);
        await page.getByRole('button', { name: /увійти|login/i }).click();
        await page.waitForLoadState('networkidle');
    }

    // 3. Доступ до профілю (Оскільки /profile безпосередньо не існує, переходимо в налаштування)
    await page.goto('/profile/settings');
    await expect(page).toHaveURL(/.*profile\/settings/);
    
    // Перевірка наявності даних користувача (емайл в інпуті)
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toHaveValue(testEmail);

    // 4. Перевірка збереження сесії (оновлення сторінки)
    await page.reload();
    await expect(emailInput).toHaveValue(testEmail);

    // 5. Перевірка наявності сторінки замовлень
    await page.goto('/profile/orders');
    await expect(page).toHaveURL(/.*profile\/orders/);
  });
});
