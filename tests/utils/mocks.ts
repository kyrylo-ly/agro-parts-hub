import { Page } from '@playwright/test';
export async function setupMocks(page: Page) {
  // Mock Nova Poshta API calls
  await page.route('**/api/shipping/cities*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { ref: 'mock-city-ref-1', name: 'Київ' },
        { ref: 'mock-city-ref-2', name: 'Львів' }
      ]),
    });
  });
  await page.route('**/api/shipping/warehouses*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { ref: 'mock-warehouse-ref-1', name: 'Відділення №1' },
        { ref: 'mock-warehouse-ref-2', name: 'Відділення №2' }
      ]),
    });
  });
  // Mock Payment API (if applicable)
  await page.route('**/api/payment/create*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        checkoutUrl: '/checkout/success' // Redirect directly to success for tests
      }),
    });
  });
  // Block images from R2 to speed up tests (optional, usually good for pure logical E2E)
  // We won't block them entirely so visually tests don't break layout too much,
  // but if they take long, we can abort them.
  // await page.route('**/*.{png,jpg,jpeg}', route => route.abort());
}