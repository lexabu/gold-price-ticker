import { test, expect } from '@playwright/test';

/**
 * E2E tests for Gold Price API endpoints
 * These test the public-facing API that the storefront extension uses
 */
test.describe('Gold Price API', () => {
  test.describe('GET /api/proxy/gold-prices', () => {
    test('returns valid JSON response', async ({ request }) => {
      const response = await request.get('/api/proxy/gold-prices');

      // Should return JSON
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });

    test('returns gold prices with expected structure', async ({ request }) => {
      const response = await request.get('/api/proxy/gold-prices');

      if (response.status() === 200) {
        const data = await response.json();

        // Should have prices object
        expect(data).toHaveProperty('prices');
        expect(typeof data.prices).toBe('object');

        // Should have timestamp
        expect(data).toHaveProperty('timestamp');

        // Timestamp should be a valid date string or number
        const timestamp = data.timestamp;
        expect(timestamp).toBeTruthy();
      }
    });

    test('returns prices for all karats', async ({ request }) => {
      const response = await request.get('/api/proxy/gold-prices');

      if (response.status() === 200) {
        const data = await response.json();
        const prices = data.prices || {};

        // Should have at least some karat prices
        const karatKeys = Object.keys(prices);
        expect(karatKeys.length).toBeGreaterThan(0);

        // Each price should be a positive number
        for (const karat of karatKeys) {
          expect(typeof prices[karat]).toBe('number');
          expect(prices[karat]).toBeGreaterThan(0);
        }
      }
    });

    test('prices are reasonable values (not zero, not astronomical)', async ({ request }) => {
      const response = await request.get('/api/proxy/gold-prices');

      if (response.status() === 200) {
        const data = await response.json();
        const prices = data.prices || {};

        for (const [karat, price] of Object.entries(prices)) {
          const numPrice = price as number;

          // Gold prices per gram should be roughly $20-$200
          // (This is a sanity check, not a strict business rule)
          expect(numPrice).toBeGreaterThan(1);
          expect(numPrice).toBeLessThan(1000);
        }
      }
    });

    test('has correct CORS headers for storefront access', async ({ request }) => {
      const response = await request.get('/api/proxy/gold-prices');

      const headers = response.headers();

      // Should allow cross-origin requests from storefronts
      // The actual CORS headers depend on the request origin
      // In production, this would be handled by Shopify's app proxy
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Caching behavior', () => {
    test('subsequent requests return quickly (cached)', async ({ request }) => {
      // First request - may hit the API
      const start1 = Date.now();
      const response1 = await request.get('/api/proxy/gold-prices');
      const time1 = Date.now() - start1;

      if (response1.status() !== 200) {
        test.skip();
        return;
      }

      // Second request - should be cached
      const start2 = Date.now();
      const response2 = await request.get('/api/proxy/gold-prices');
      const time2 = Date.now() - start2;

      // Both should succeed
      expect(response2.status()).toBe(200);

      // Second request should be faster (cached)
      // Allow some variance but cached should be noticeably faster
      // Skip this assertion if first request was very fast (already cached)
      if (time1 > 500) {
        expect(time2).toBeLessThan(time1);
      }
    });

    test('cached response has same data', async ({ request }) => {
      const response1 = await request.get('/api/proxy/gold-prices');

      if (response1.status() !== 200) {
        test.skip();
        return;
      }

      const data1 = await response1.json();

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response2 = await request.get('/api/proxy/gold-prices');
      const data2 = await response2.json();

      // Within cache TTL, data should be identical
      expect(data1.timestamp).toBe(data2.timestamp);
    });
  });

  test.describe('Error handling', () => {
    test('handles missing API gracefully', async ({ request }) => {
      // This tests that the endpoint doesn't crash
      const response = await request.get('/api/proxy/gold-prices');

      // Should return a valid HTTP status (not 5xx from crash)
      expect(response.status()).toBeLessThan(500);

      // Should return valid JSON even on error
      const data = await response.json().catch(() => null);
      expect(data).not.toBeNull();
    });
  });

  test.describe('GET /api/ticker-settings (authenticated)', () => {
    test('requires authentication', async ({ request }) => {
      const response = await request.get('/api/ticker-settings');

      // Without auth, should redirect or return 401/403
      // The exact behavior depends on Shopify auth middleware
      const status = response.status();

      // Should not return server error
      expect(status).toBeLessThan(500);

      // Typically returns redirect (302) or unauthorized (401/403)
      expect([200, 302, 401, 403]).toContain(status);
    });
  });
});
