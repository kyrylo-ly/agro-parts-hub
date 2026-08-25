import { test, expect } from '@playwright/test';
import { setupMocks } from '../utils/mocks';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test('should complete a full checkout process', async ({ page, isMobile }) => {
    await page.goto('/');

    // Go directly to the seeded product
    await page.goto('/product/test-product-e2e');
    await expect(page).toHaveURL(/.*product\/test-product-e2e/);

    // Add to cart
    const addToCartBtn = page.getByRole('button', { name: /до кошика/i }).first();
    await addToCartBtn.click();

    // Verify cart badge updated
    const cartBtn = page.getByRole('button', { name: 'Кошик', exact: true });
    await expect(cartBtn).toContainText('1');

    // Open the cart sheet
    await cartBtn.click();

    // Click "Перейти до повного оформлення"
    const checkoutLink = page.getByRole('link', { name: /повного оформлення/i }).first();
    await checkoutLink.waitFor({ state: 'visible' });
    await checkoutLink.click();
    await expect(page).toHaveURL(/.*checkout/);

    // Fill out checkout form
    await page.getByLabel(/ім'я/i).first().fill('Тестовий');
    await page.getByLabel(/прізвище/i).first().fill('Користувач');
    await page.getByLabel(/телефон|phone/i).first().fill('+380501234567');

    // Delivery (Nova Poshta)
    await page.getByLabel(/місто/i).first().fill('Київ');
    await page.getByLabel(/відділення/i).first().fill('Відділення №1');

    // Submit order
    const submitBtn = page.getByRole('button', { name: /підтвердити замовлення|оплатити|підтвердити/i });
    await submitBtn.click();

    // Verify success page
    await expect(page).toHaveURL(/.*success/);
    await expect(page.getByRole('heading', { name: /дякуємо/i })).toBeVisible();
  });
});
