import { test, expect } from '@playwright/test';

test.describe('Search Flow', () => {
  test('should search for a product and navigate to it', async ({ page }) => {
    await page.goto('/');

    // Locate the search input
    const searchInput = page.getByPlaceholder(/пошук/i).first();
    await searchInput.waitFor({ state: 'visible' });

    // Type the search term
    await searchInput.fill('Тестовий');

    // Press enter or click search button
    await searchInput.press('Enter');

    // Wait for the search results page or dropdown
    // Assuming it navigates to /search?q=Тестовий or shows results on the page
    const productLink = page.getByRole('link', { name: /Тестовий Товар E2E/i }).first();
    await productLink.waitFor({ state: 'visible', timeout: 10000 });
    await productLink.click();

    // Verify navigation to product page
    await expect(page).toHaveURL(/.*product\/test-product-e2e/);
    await expect(page.getByRole('heading', { name: /Тестовий Товар E2E/i }).first()).toBeVisible();
  });
});
