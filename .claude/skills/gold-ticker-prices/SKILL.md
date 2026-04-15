---
name: gold-ticker-prices-global
description: Implement gold price fetching service with caching (Global)
argument-hint:
metadata:
  openclaw:
    user-invocable: true
    requires:
      bins: [claude, git]
---

# Gold Ticker Prices

Implement the gold price fetching service with SwissQuote primary API, GoldAPI fallback, in-memory caching, and per-karat gram price calculations.

## Usage

```
/gold-ticker-prices
```

## Context

This is Phase 2 of the gold-price-ticker project. See the master plan:
`~/Code/project-context/projects/gold-price-ticker/README.md`

**Requires Phase 1 (scaffold) to be complete.**

## Workflow

1. **Read the existing gold price logic from almaza app**
   ```
   ~/Code/almaza-gold-price-adjuster/src/utils/updateProductPrice/getPriceOfGold/getPriceOfGold.ts
   ```
   This contains the exact SwissQuote + GoldAPI fallback pattern to port.

2. **Create `app/services/gold-price.server.ts`**

   Port and adapt the following from the almaza app:

   ### Primary API: SwissQuote (No API key needed)
   ```typescript
   const PRIMARY_GOLD_URL = 'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument/XAU/USD';
   ```
   - Returns array of objects with `spreadProfilePrices`
   - Try profiles in order: standard -> premium -> prime
   - Use the `ask` price from whichever profile is available

   ### Fallback API: GoldAPI (Requires GOLD_API_KEY)
   ```typescript
   const FALLBACK_GOLD_URL = 'https://www.goldapi.io/api/XAU/USD';
   ```
   - Requires `x-access-token` header with API key
   - Returns object with `price` field

   ### Fallback Logic
   1. Try SwissQuote first
   2. If it fails, log to Sentry and try GoldAPI
   3. If both fail, log to Sentry and throw error

3. **Add in-memory cache**
   ```typescript
   const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

   interface PriceCache {
     spotPrice: number;
     prices: KaratPrices;
     fetchedAt: number;
     source: 'swissquote' | 'goldapi';
   }

   let cache: PriceCache | null = null;

   function isCacheValid(): boolean {
     return cache !== null && (Date.now() - cache.fetchedAt) < CACHE_TTL_MS;
   }
   ```

4. **Implement per-karat gram price calculation**
   ```typescript
   const TROY_OZ_TO_GRAMS = 31.1035;
   const KARATS = [24, 22, 21, 18, 14] as const;
   type Karat = typeof KARATS[number];

   interface KaratPrices {
     [karat: string]: {
       pricePerGram: number;
       karat: number;
       purity: number; // e.g., 0.75 for 18K
     };
   }

   function calculateKaratPrices(spotPricePerOz: number): KaratPrices {
     const prices: KaratPrices = {};
     for (const karat of KARATS) {
       const purity = karat / 24;
       const pricePerGram = (spotPricePerOz / TROY_OZ_TO_GRAMS) * purity;
       prices[`${karat}K`] = {
         pricePerGram: Math.round(pricePerGram * 100) / 100,
         karat,
         purity: Math.round(purity * 1000) / 1000,
       };
     }
     return prices;
   }
   ```

5. **Export main function**
   ```typescript
   export async function getGoldPrices(): Promise<PriceCache> {
     if (isCacheValid()) return cache!;

     const spotPrice = await getPriceOfGold(); // with fallback logic
     const prices = calculateKaratPrices(spotPrice);

     cache = {
       spotPrice,
       prices,
       fetchedAt: Date.now(),
       source: 'swissquote', // or 'goldapi' if fallback was used
     };

     return cache;
   }
   ```

6. **Add Sentry integration**
   - Initialize Sentry in app entry
   - Capture API failures with appropriate severity levels
   - Tag errors with `api: primary | fallback`

7. **Write unit tests**
   Create `app/services/__tests__/gold-price.test.ts`:
   - Test SwissQuote parsing (standard, premium, prime profiles)
   - Test GoldAPI fallback
   - Test cache TTL behavior
   - Test karat price calculations
   - Test both-APIs-fail scenario

## Key Differences from Almaza App

| Almaza | Gold Price Ticker |
|--------|-------------------|
| Uses `wretch` for HTTP | Use `wretch` (same) |
| Sends email on failure | Log to Sentry only (no email) |
| Updates Shopify products | Just returns prices |
| Runs as cron job | Runs on-demand with caching |
| No caching needed | 5-minute in-memory cache |

## Reference Files

- `~/Code/almaza-gold-price-adjuster/src/utils/updateProductPrice/getPriceOfGold/getPriceOfGold.ts` - **PRIMARY REFERENCE** for API integration
- `~/Code/discount-ai/app/services/` - Service file patterns

## Output

When complete, update Phase 2 tasks in:
`~/Code/project-context/projects/gold-price-ticker/README.md`

## Dependencies

- Phase 1 (scaffold) must be complete
- `wretch` and `@sentry/node` must be installed

## Blocks

- `gold-ticker-proxy` (Phase 3) - needs price service to serve data
