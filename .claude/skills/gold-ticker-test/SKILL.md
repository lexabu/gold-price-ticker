---
name: gold-ticker-test-global
description: Write test suite for gold-price-ticker app (Global)
argument-hint: [--unit|--e2e|--all]
metadata:
  openclaw:
    user-invocable: true
    requires:
      bins: [claude, git, npm]
---

# Gold Ticker Test

Write comprehensive tests for the gold-price-ticker app: unit tests for the price service, integration tests for the proxy, and E2E tests for the admin panel.

## Usage

```
/gold-ticker-test           # Write all tests
/gold-ticker-test --unit    # Unit tests only
/gold-ticker-test --e2e     # E2E tests only
```

## Context

This is Phase 7 of the gold-price-ticker project. See the master plan:
`~/Code/project-context/projects/gold-price-ticker/README.md`

**Requires Phases 1-6 to be complete.**

## Workflow

### 1. Install test dependencies
```bash
cd ~/Code/gold-price-ticker
npm install -D vitest @testing-library/react @testing-library/jest-dom @playwright/test msw
```

### 2. Unit Tests: Gold Price Service

Create `app/services/__tests__/gold-price.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Gold Price Service', () => {
  describe('getPrimaryGoldPrice', () => {
    it('returns standard profile price when available');
    it('falls back to premium profile when standard unavailable');
    it('falls back to prime profile as last resort');
    it('throws when no profiles available');
    it('throws on network error');
  });

  describe('getFallbackGoldPrice', () => {
    it('returns price from GoldAPI');
    it('throws when price is missing from response');
    it('sends correct auth header');
    it('throws on network error');
  });

  describe('getPriceOfGold (main function)', () => {
    it('returns primary price when primary API succeeds');
    it('returns fallback price when primary fails');
    it('throws when both APIs fail');
    it('logs to Sentry on primary API failure');
    it('logs to Sentry when using fallback');
  });

  describe('calculateKaratPrices', () => {
    it('calculates correct price per gram for 24K', () => {
      // At $2,650/oz: 2650 / 31.1035 * (24/24) = $85.20/g
    });
    it('calculates correct price per gram for 22K');
    it('calculates correct price per gram for 21K');
    it('calculates correct price per gram for 18K');
    it('calculates correct price per gram for 14K');
    it('rounds to 2 decimal places');
  });

  describe('Cache', () => {
    it('returns cached data within TTL');
    it('fetches fresh data after TTL expires');
    it('updates cache on successful fetch');
  });
});
```

### 3. Unit Tests: Settings Service

Create `app/services/__tests__/settings.test.ts`:

```typescript
describe('Settings Service', () => {
  it('returns defaults for new shop');
  it('returns saved settings for existing shop');
  it('creates settings on first save');
  it('updates existing settings');
  it('handles partial updates');
});
```

### 4. Integration Tests: App Proxy

Create `app/routes/__tests__/proxy.test.ts`:

```typescript
describe('App Proxy Endpoint', () => {
  it('returns gold prices as JSON');
  it('returns only enabled karats based on shop settings');
  it('returns default settings when shop has no saved settings');
  it('returns 503 when price service fails');
  it('sets correct cache headers');
  it('returns isActive: false when subscription expired');
});
```

### 5. E2E Tests: Admin Panel

Create `e2e/admin-settings.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Settings', () => {
  test('loads settings page with default values');
  test('toggles karat checkboxes');
  test('changes color scheme');
  test('adjusts ticker speed slider');
  test('saves settings successfully');
  test('shows live preview of ticker');
  test('displays current gold price');
  test('shows billing status');
});
```

### 6. Mock Setup (MSW)

Create `app/test/mocks/handlers.ts`:

```typescript
import { http, HttpResponse } from 'msw';

// Mock SwissQuote API
const swissQuoteHandler = http.get(
  'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD',
  () => {
    return HttpResponse.json([{
      spreadProfilePrices: [
        { spreadProfile: 'standard', ask: 2650.50, bid: 2649.80, askSpread: 0.7, bidSpread: 0.7 },
        { spreadProfile: 'premium', ask: 2650.40, bid: 2649.70, askSpread: 0.7, bidSpread: 0.7 },
      ],
      ts: Date.now(),
      topo: { platform: 'prod', server: 'mock' },
    }]);
  }
);

// Mock GoldAPI
const goldApiHandler = http.get(
  'https://www.goldapi.io/api/XAU/USD',
  () => {
    return HttpResponse.json({
      price: 2650.50,
      timestamp: Date.now() / 1000,
      currency: 'USD',
    });
  }
);

export const handlers = [swissQuoteHandler, goldApiHandler];
```

### 7. Configure Vitest

Update `vite.config.ts`:
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./app/test/setup.ts'],
  },
  // ... existing config
});
```

### 8. Add test scripts to package.json
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Key Test Scenarios

| Category | Test | Priority |
|----------|------|----------|
| Price accuracy | 24K at $2,650/oz = $85.20/g | Critical |
| Price accuracy | 14K at $2,650/oz = $49.70/g | Critical |
| API fallback | Primary fails → uses fallback | Critical |
| API failure | Both fail → graceful error | Critical |
| Cache | Returns cached within 5min | High |
| Cache | Refreshes after 5min | High |
| Proxy | Returns filtered karats per shop | High |
| Proxy | 503 on total price failure | Medium |
| Settings | CRUD operations | Medium |
| Admin | Form saves correctly | Medium |

## Reference Repos

- `~/Code/almaza-gold-price-adjuster/` - Price calculation reference values
- `~/Code/clerk/` - Test patterns for Shopify apps

## Output

When complete, update Phase 7 tasks in:
`~/Code/project-context/projects/gold-price-ticker/README.md`

## Dependencies

- Phases 1-6 must be complete (testing the full app)
