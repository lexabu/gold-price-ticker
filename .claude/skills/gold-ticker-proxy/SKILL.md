---
name: gold-ticker-proxy-global
description: Set up Shopify app proxy for gold price data delivery (Global)
argument-hint:
metadata:
  openclaw:
    user-invocable: true
    requires:
      bins: [claude, git]
---

# Gold Ticker Proxy

Configure and implement the Shopify app proxy endpoint that serves gold price data to merchant storefronts.

## Usage

```
/gold-ticker-proxy
```

## Context

This is Phase 3 of the gold-price-ticker project. See the master plan:
`~/Code/project-context/projects/gold-price-ticker/README.md`

**Requires Phase 1 (scaffold) and Phase 2 (prices) to be complete.**

## Workflow

1. **Verify app proxy config in shopify.app.toml**
   ```toml
   [app_proxy]
   url = "https://example.com/api/proxy"
   subpath = "gold-ticker"
   prefix = "apps"
   ```
   This means the storefront endpoint will be: `https://{shop}.myshopify.com/apps/gold-ticker/prices`

2. **Create the proxy route handler**

   Create `app/routes/api.proxy.$.tsx` (catch-all proxy route):

   ```typescript
   import type { LoaderFunctionArgs } from "@react-router/node";
   import { authenticate } from "../shopify.server";
   import { getGoldPrices } from "../services/gold-price.server";
   import db from "../db.server";

   export async function loader({ request }: LoaderFunctionArgs) {
     // Authenticate the app proxy request
     const { session } = await authenticate.public.appProxy(request);

     if (!session) {
       return new Response("Unauthorized", { status: 401 });
     }

     try {
       // Get shop settings
       const settings = await db.shopSettings.findUnique({
         where: { shop: session.shop },
       });

       // Get gold prices
       const priceData = await getGoldPrices();

       // Filter to only enabled karats
       const enabledKarats = settings?.karats?.split(",") || ["24", "22", "21", "18", "14"];
       const filteredPrices: Record<string, any> = {};

       for (const karat of enabledKarats) {
         const key = `${karat.trim()}K`;
         if (priceData.prices[key]) {
           filteredPrices[key] = priceData.prices[key];
         }
       }

       const response = {
         spotPrice: priceData.spotPrice,
         prices: filteredPrices,
         fetchedAt: new Date(priceData.fetchedAt).toISOString(),
         source: priceData.source,
         settings: {
           colorScheme: settings?.colorScheme || "dark",
           bgColor: settings?.bgColor || "#1a1a2e",
           textColor: settings?.textColor || "#e8d44d",
           tickerSpeed: settings?.tickerSpeed || 50,
           position: settings?.position || "top",
           isActive: settings?.isActive ?? true,
         },
       };

       return new Response(JSON.stringify(response), {
         headers: {
           "Content-Type": "application/json",
           "Cache-Control": "public, max-age=300", // 5 min cache
           "Access-Control-Allow-Origin": "*",
         },
       });
     } catch (error) {
       console.error("Gold price proxy error:", error);
       return new Response(
         JSON.stringify({
           error: "Unable to fetch gold prices",
           prices: {},
           fetchedAt: new Date().toISOString(),
         }),
         {
           status: 503,
           headers: {
             "Content-Type": "application/json",
             "Cache-Control": "no-cache",
           },
         }
       );
     }
   }
   ```

3. **Reference the clerk app for app proxy patterns**
   ```
   ~/Code/clerk/shopify.app.toml  # Has app_proxy configuration
   ~/Code/clerk/app/routes/       # Has proxy route handlers
   ```

4. **JSON Response Schema**
   ```json
   {
     "spotPrice": 2650.50,
     "prices": {
       "24K": { "pricePerGram": 85.20, "karat": 24, "purity": 1.0 },
       "22K": { "pricePerGram": 78.10, "karat": 22, "purity": 0.917 },
       "21K": { "pricePerGram": 74.55, "karat": 21, "purity": 0.875 },
       "18K": { "pricePerGram": 63.90, "karat": 18, "purity": 0.75 },
       "14K": { "pricePerGram": 49.70, "karat": 14, "purity": 0.583 }
     },
     "fetchedAt": "2026-02-06T12:00:00.000Z",
     "source": "swissquote",
     "settings": {
       "colorScheme": "dark",
       "bgColor": "#1a1a2e",
       "textColor": "#e8d44d",
       "tickerSpeed": 50,
       "position": "top",
       "isActive": true
     }
   }
   ```

5. **Test the proxy endpoint**
   - Start dev server: `npm run dev`
   - Use Shopify CLI tunnel
   - Access via: `https://{shop}.myshopify.com/apps/gold-ticker/prices`
   - Verify JSON response format
   - Verify caching headers
   - Test with missing shop settings (should return defaults)

## Reference Repos

- `~/Code/clerk` - App proxy setup (this app has a working proxy)
- `~/Code/discount-ai` - Route handler patterns

## Output

When complete, update Phase 3 tasks in:
`~/Code/project-context/projects/gold-price-ticker/README.md`

## Dependencies

- Phase 1 (scaffold) - App must exist
- Phase 2 (prices) - `getGoldPrices()` service must be implemented

## Blocks

- `gold-ticker-extension` (Phase 4) - Theme extension fetches from this proxy
