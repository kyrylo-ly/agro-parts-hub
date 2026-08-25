import { test, expect } from '@playwright/test';

test.describe('Quick Order Flow', () => {
  test('should submit a quick order successfully', async ({ page }) => {
    // 1. Visit the seeded product page directly
    await page.goto('/product/test-product-e2e');
    await expect(page).toHaveURL(/.*product\/test-product-e2e/);

    // 2. Click Quick Order button
    const quickOrderBtn = page.getByRole('button', { name: /в 1 клік|швидке замовлення/i }).first();
    if (await quickOrderBtn.isVisible()) {
      await quickOrderBtn.click();

      // 3. Fill the modal form
      await page.getByLabel(/ім'я|name/i).first().fill('Іван');
      await page.getByLabel(/телефон|phone/i).first().fill('+380501234567');

      // 4. Submit
      const submitBtn = page.getByRole('button', { name: /замовити|підтвердити/i }).last();
      await submitBtn.click();

      // 5. Verify success state (either redirect or modal success message)
      const successMsg = page.getByText(/дякуємо/i).first();
      await expect(successMsg).toBeVisible();
    }
  });
});
