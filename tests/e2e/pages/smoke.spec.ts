import { test, expect } from '@playwright/test';
import { blockUnnecessaryResources, waitForPageReady } from '../utils/helpers';

test.describe('Gold Price Ticker - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await blockUnnecessaryResources(page, 'balanced');
  });

  test('app should load without errors', async ({ page }) => {
    // Navigate to the app root
    const response = await page.goto('/');

    // Should not return error status
    expect(response?.status()).toBeLessThan(400);

    // Wait for page to be ready
    await waitForPageReady(page);
  });

  test('API proxy should return gold prices', async ({ request }) => {
    // Test the gold prices API endpoint
    const response = await request.get('/api/proxy/gold-prices');

    // Should return success or proper error
    const status = response.status();

    if (status === 200) {
      const data = await response.json();

      // Should have prices object
      expect(data).toHaveProperty('prices');

      // Should have timestamp
      expect(data).toHaveProperty('timestamp');

      // Prices should include expected karats
      const karats = Object.keys(data.prices || {});
      expect(karats.length).toBeGreaterThan(0);
    } else {
      // If not 200, should be a known error status (not server error)
      expect(status).toBeLessThan(500);
    }
  });
});
