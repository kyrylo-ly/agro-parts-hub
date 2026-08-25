import { test, expect } from '@playwright/test';

test.describe('Cart Flow', () => {
  test('should add and remove items from cart', async ({ page }) => {
    // 1. Visit the seeded product page directly
    await page.goto('/product/test-product-e2e');
    await expect(page).toHaveURL(/.*product\/test-product-e2e/);

    // 2. Add to cart
    const addToCartBtn = page.getByRole('button', { name: /до кошика/i }).first();
    await addToCartBtn.click();

    // 3. Verify cart badge updated
    // Instead of looking for a non-existent test-id, we can just check if the button contains '1'
    const cartBtn = page.getByRole('button', { name: 'Кошик', exact: true });
    await expect(cartBtn).toContainText('1');

    // 4. Open the cart sheet (target the header button specifically)
    await cartBtn.click();

    // 5. Verify item is in the cart sheet
    // Let's look inside the role='dialog' or use a strict locator
    const cartSheet = page.getByRole('dialog'); // Shadcn sheets use role="dialog"
    await expect(cartSheet).toBeVisible();

    const cartItem = cartSheet.getByText(/Тестовий Товар E2E/i).first();
    await expect(cartItem).toBeVisible();

    // 6. Increase quantity
    const increaseBtn = page.getByRole('button', { name: /plus|збільшити|\+/i }).first();
    await increaseBtn.click();

    // 7. Remove item
    // The button has no aria-label, so we locate it by the trash icon inside
    const removeBtn = cartSheet.locator('button').filter({ has: page.locator('.lucide-trash-2') }).first();
    await removeBtn.click();

    // 8. Verify cart is empty
    await expect(cartSheet.getByText(/порожній|немає товарів/i)).toBeVisible();
  });

  test('should sync cart state between multiple tabs', async ({ context, page }) => {
    // 1. Tab 1: Visit product and add to cart
    await page.goto('/product/test-product-e2e');
    await page.getByRole('button', { name: /до кошика/i }).first().click();
    
    // 2. Tab 2: Open a new tab and check if cart has the item
    const newPage = await context.newPage();
    await newPage.goto('/');
    
    const cartBtnNewTab = newPage.getByRole('button', { name: 'Кошик', exact: true });
    await expect(cartBtnNewTab).toContainText('1');
    
    // 3. Tab 2: Remove the item
    await cartBtnNewTab.click();
    const cartSheet = newPage.getByRole('dialog');
    const removeBtn = cartSheet.locator('button').filter({ has: newPage.locator('.lucide-trash-2') }).first();
    await removeBtn.click();
    await expect(cartSheet.getByText(/порожній|немає товарів/i)).toBeVisible();

    // 4. Tab 1: Ensure cart is updated
    const cartBtnOriginal = page.getByRole('button', { name: 'Кошик', exact: true });
    // Reloading to ensure state is fetched again or storage event triggers update
    await page.reload();
    await expect(cartBtnOriginal).not.toContainText('1');
  });
});
