import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test('should redirect or deny access to unauthenticated user', async ({ page }) => {
    await page.goto('/admin');
    
    // Перевіряємо, що ми НЕ на дашборді адмінки, або що бачимо помилку 403 / редірект на логін
    await expect(page).not.toHaveURL(/\/admin\/dashboard/);
    
    const isLogin = page.url().includes('/login');
    const isHome = page.url() === 'http://localhost:3000/';
    const isDenied = await page.getByText(/доступ заборонено|access denied|403|404/i).isVisible().catch(() => false);
    
    // Очікуємо, що користувача або перекинуло, або йому відмовлено в доступі
    expect(isLogin || isHome || isDenied).toBeTruthy();
  });

  // Закомментований тест для CRUD, оскільки для нього потрібен налаштований адмін в базі.
  // Ви можете розкоментувати та додати валідне створення адміна в global-setup.ts
  test.skip('should allow admin to manage products and categories', async ({ page }) => {
    // 1. Логін як адмін
    // await page.goto('/login');
    // await page.getByLabel(/email/i).fill('admin@example.com');
    // await page.getByLabel(/password|пароль/i).fill('admin_password');
    // await page.getByRole('button', { name: /увійти/i }).click();

    // 2. Перехід в адмінку
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*admin/);
    await expect(page.getByRole('heading', { name: /адмін|панель/i })).toBeVisible();

    // 3. CRUD Категорій
    await page.click('text=Категорії');
    await page.click('text=Додати');
    await page.fill('input[name="name"]', 'New E2E Category');
    await page.click('button[type="submit"]');
    await expect(page.getByText('New E2E Category')).toBeVisible();
    
    // 4. Робота з замовленнями
    await page.click('text=Замовлення');
    // Вибір замовлення та зміна статусу
  });
});
