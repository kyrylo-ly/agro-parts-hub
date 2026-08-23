import { test, expect } from '@playwright/test';

test.describe('Security & Access Control', () => {
  test('unauthorized user cannot access admin dashboard', async ({ page }) => {
    // 1. Visit admin page without logging in
    const response = await page.goto('/admin');
    
    // 2. Expect redirect to login page OR a 401/403/404 response
    // Depending on the implementation, it might redirect to /login or /api/auth/signin
    await expect(page).toHaveURL(/.*login|.*signin|.*auth/i);
    // Alternatively, verify the page indicates access denied
  });

  test('XSS prevention in search', async ({ page }) => {
    // 1. Visit the home page or catalog
    await page.goto('/');

    // 2. Locate the search input
    const searchInput = page.getByRole('textbox', { name: /пошук|search/i }).first();
    
    if (await searchInput.isVisible()) {
      // 3. Enter a basic XSS payload
      const payload = '<script>alert("xss")</script>';
      await searchInput.fill(payload);
      
      // 4. Submit search
      await searchInput.press('Enter');
      
      // 5. Ensure the script didn't execute and was properly escaped or rejected
      // In Playwright, if an alert pops up we can catch it, but here we just ensure 
      // the payload is rendered as text, not HTML
      const bodyText = await page.textContent('body');
      expect(bodyText).toContain(payload);
    }
  });
});
