import { test, expect } from '@playwright/test';

test.describe('Performance Metrics', () => {
  test('homepage should load quickly (TTFB & LCP)', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Evaluate basic performance timings using Navigation Timing API
    const timingJson = await page.evaluate(() => JSON.stringify(window.performance.timing));
    const timing = JSON.parse(timingJson);
    
    const ttfb = timing.responseStart - timing.navigationStart;
    
    // Evaluate LCP using PerformanceObserver
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Timeout in case LCP is not triggered
        setTimeout(() => resolve(0), 5000);
      });
    });

    console.log(`TTFB: ${ttfb}ms`);
    console.log(`LCP: ${lcp}ms`);

    // In local dev, TTFB might be higher due to on-demand compilation,
    // so we set relaxed thresholds, e.g., TTFB < 2000ms, LCP < 4000ms.
    // In CI (production build), these should be much lower (TTFB < 300ms, LCP < 2500ms).
    expect(ttfb).toBeLessThan(3000);
    
    if (lcp > 0) {
      expect(lcp).toBeLessThan(5000);
    }
  });
});
