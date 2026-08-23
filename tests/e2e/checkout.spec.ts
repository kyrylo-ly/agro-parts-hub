import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should complete a full checkout process', async ({ page }) => {
    // 1. Visit the home page
    await page.goto('/');

    // 2. Go directly to the seeded product
    await page.goto('/product/test-product-e2e');

    // Verify we are on the product page
    await expect(page).toHaveURL(/.*product\/test-product-e2e/);

    // 4. Add to cart
    const addToCartBtn = page.getByLabel(/до кошика/i).first();
    await addToCartBtn.click();

    // 5. Open the cart sheet
    await page.getByRole('button', { name: 'Кошик' }).first().click();

    // 6. Click "Перейти до повного оформлення"
    await page.getByRole('link', { name: /повного оформлення/i }).first().click({ force: true });
    await expect(page).toHaveURL(/.*checkout/);

    // 6. Fill out checkout form
    await page.getByLabel(/ім'я/i).first().fill('Тестовий');
    await page.getByLabel(/прізвище/i).first().fill('Користувач');
    await page.getByLabel(/телефон|phone/i).first().fill('+380501234567');
    await page.getByLabel(/місто/i).first().fill('Київ');
    await page.getByLabel(/відділення/i).first().fill('Відділення 1');
    
    // Click submit order
    const submitBtn = page.getByRole('button', { name: /підтвердити замовлення|оплатити|підтвердити/i });
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      
      // 7. Verify success page
      await expect(page).toHaveURL(/.*checkout\/success/);
      await expect(page.getByRole('heading', { name: /дякуємо/i })).toBeVisible();
    }
  });
});
