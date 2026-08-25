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

  test('should show validation errors on invalid checkout data', async ({ page }) => {
    await page.goto('/');
    await page.goto('/product/test-product-e2e');
    await page.getByRole('button', { name: /до кошика/i }).first().click();
    
    const cartBtn = page.getByRole('button', { name: 'Кошик', exact: true });
    await cartBtn.click();

    const checkoutLink = page.getByRole('link', { name: /повного оформлення/i }).first();
    await checkoutLink.waitFor({ state: 'visible' });
    await checkoutLink.click();
    
    await expect(page).toHaveURL(/.*checkout/);

    // Try to submit without filling required data
    const submitBtn = page.getByRole('button', { name: /підтвердити замовлення|оплатити|підтвердити/i });
    await submitBtn.click();

    // Оскільки використовується нативна HTML5 валідація (атрибут required),
    // ми не побачимо текстового повідомлення в DOM. 
    // Замість цього перевіряємо, що поле не валідне через JS API.
    const firstNameInput = page.getByLabel(/ім'я/i).first();
    const isInvalid = await firstNameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
    
    // Переконуємось, що ми залишились на сторінці чекауту (форма не відправилась)
    await expect(page).toHaveURL(/.*checkout/);
  });

  test.skip('should handle out of stock scenario gracefully', async ({ page }) => {
    // Цей тест вимагає специфічного товару, якого немає в наявності.
    // Пропускаємо доки не додамо такий товар в mocks.
    await page.goto('/product/out-of-stock-product');
    
    // Перевірка, що кнопка "До кошика" заблокована
    const addToCartBtn = page.getByRole('button', { name: /до кошика/i }).first();
    await expect(addToCartBtn).toBeDisabled();
    
    // Або є текст "Немає в наявності"
    await expect(page.getByText(/немає в наявності|закінчився/i)).toBeVisible();
  });
});
