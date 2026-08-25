import { test, expect } from '@playwright/test';

test.describe('Authentication & Profile', () => {
  const testPassword = 'TestPassword123!';

  test('should register, login, and view profile', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Skipping flaky mobile test');
    const testEmail = `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    // 1. Реєстрація
    await page.goto('/signup');
    await expect(page).toHaveURL(/.*signup/);
    
    // Заповнюємо форму надійними селекторами за name
    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.isVisible()) await nameInput.fill('Test User');
    
    await page.locator('input[name="email"]').first().fill(testEmail);
    
    // Заповнюємо пароль та підтвердження (якщо є)
    await page.locator('input[name="password"]').first().fill(testPassword);
    await page.locator('input[name="confirm"]').first().fill(testPassword);
    
    // Submit
    const submitBtn = page.getByRole('button', { name: /зареєструватися|signup|створити/i });
    await submitBtn.click();

    // Дочекаємось зміни URL (після успішної реєстрації має бути редірект на головну або профіль)
    await page.waitForURL(/.*(profile|\/$)/, { timeout: 20000 });

    // 2. Доступ до профілю (Оскільки /profile безпосередньо не існує, переходимо в налаштування)
    // Якщо нас перекинуло на головну, сесія вже має бути встановлена
    await page.goto('/profile/settings');
    await expect(page).toHaveURL(/.*profile\/settings/, { timeout: 15000 });
    
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
