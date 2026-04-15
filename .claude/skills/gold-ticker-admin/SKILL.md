---
name: gold-ticker-admin-global
description: Build the Shopify admin settings panel with Polaris (Global)
argument-hint:
metadata:
  openclaw:
    user-invocable: true
    requires:
      bins: [claude, git]
---

# Gold Ticker Admin

Build the Shopify admin panel (embedded app) with Polaris components for configuring the gold price ticker.

## Usage

```
/gold-ticker-admin
```

## Context

This is Phase 5 of the gold-price-ticker project. See the master plan:
`~/Code/project-context/projects/gold-price-ticker/README.md`

**Requires Phase 1 (scaffold) and Phase 4 (extension) to be complete.**

## Workflow

1. **Create settings service**

   Create `app/services/settings.server.ts`:
   ```typescript
   import db from "../db.server";

   export interface ShopSettings {
     karats: string;
     colorScheme: string;
     bgColor: string;
     textColor: string;
     tickerSpeed: number;
     position: string;
     showChange: boolean;
     currencySymbol: string;
     isActive: boolean;
   }

   const DEFAULTS: ShopSettings = {
     karats: "24,22,21,18,14",
     colorScheme: "dark",
     bgColor: "#1a1a2e",
     textColor: "#e8d44d",
     tickerSpeed: 50,
     position: "top",
     showChange: true,
     currencySymbol: "$",
     isActive: true,
   };

   export async function getSettings(shop: string): Promise<ShopSettings> {
     const settings = await db.shopSettings.findUnique({ where: { shop } });
     return settings || DEFAULTS;
   }

   export async function saveSettings(shop: string, data: Partial<ShopSettings>) {
     return db.shopSettings.upsert({
       where: { shop },
       create: { shop, ...DEFAULTS, ...data },
       update: data,
     });
   }
   ```

2. **Build the main settings page**

   Update `app/routes/app._index.tsx`:

   Key Polaris components to use:
   - `Page` - Main page wrapper
   - `Layout` - Two-column layout (settings + preview)
   - `Card` - Section containers
   - `FormLayout` - Form structure
   - `ChoiceList` - Karat selection (checkboxes)
   - `Select` - Dropdowns (position, color scheme)
   - `RangeSlider` - Ticker speed
   - `TextField` - Color inputs (with color type)
   - `Button` - Save button
   - `Banner` - Status messages
   - `Badge` - Billing status indicator

   ### Page Layout
   ```
   ┌──────────────────────────────────────────┐
   │  Gold Price Ticker Settings              │
   ├─────────────────────┬────────────────────┤
   │  Settings Card      │  Preview Card      │
   │                     │                    │
   │  ☑ 24K  ☑ 22K     │  ┌──────────────┐  │
   │  ☑ 21K  ☑ 18K     │  │ Live Ticker   │  │
   │  ☑ 14K             │  │ Preview       │  │
   │                     │  └──────────────┘  │
   │  Color Scheme: Dark │                    │
   │  BG: #1a1a2e       │  Current Spot:     │
   │  Text: #e8d44d     │  $2,650.50/oz      │
   │  Speed: ████░░ 50  │                    │
   │  Position: Top      │  Source: SwissQuote│
   │                     │  Updated: 12:00 PM │
   │  [Save Settings]   │                    │
   ├─────────────────────┴────────────────────┤
   │  Billing Status Card                     │
   │  Plan: Monthly ($4.99)  Status: Active   │
   └──────────────────────────────────────────┘
   ```

3. **Build TickerPreview component**

   Create `app/components/TickerPreview.tsx`:
   - Renders a miniature version of the ticker bar
   - Uses the same CSS as the theme extension
   - Updates in real-time as settings change
   - Shows mock or real price data

4. **Build KaratToggles component**

   Create `app/components/KaratToggles.tsx`:
   - Checkbox group using Polaris `ChoiceList`
   - Options: 24K, 22K, 21K, 18K, 14K
   - At least one karat must be selected (validation)

5. **Implement form submission**

   Use React Router 7 actions:
   ```typescript
   export async function action({ request }: ActionFunctionArgs) {
     const { session } = await authenticate.admin(request);
     const formData = await request.formData();

     const settings = {
       karats: formData.getAll("karats").join(","),
       colorScheme: formData.get("colorScheme") as string,
       bgColor: formData.get("bgColor") as string,
       textColor: formData.get("textColor") as string,
       tickerSpeed: parseInt(formData.get("tickerSpeed") as string),
       position: formData.get("position") as string,
       isActive: formData.get("isActive") === "true",
     };

     await saveSettings(session.shop, settings);
     return json({ success: true });
   }
   ```

6. **Add current gold price display**
   - Show current spot price in the preview card
   - Show which API source is being used (SwissQuote/GoldAPI)
   - Show last fetch timestamp
   - Show calculated prices for each enabled karat

7. **Handle onboarding flow**
   - First-time merchants see a welcome banner
   - Guide them to enable the ticker in their theme editor
   - Link to theme customizer: `https://{shop}.myshopify.com/admin/themes/current/editor`

## Reference Repos

- `~/Code/discount-ai/app/routes/app._index.tsx` - Admin page patterns with Polaris
- `~/Code/clerk/app/routes/app._index.tsx` - Settings page with form handling
- Polaris docs: https://polaris.shopify.com/components

## Output

When complete, update Phase 5 tasks in:
`~/Code/project-context/projects/gold-price-ticker/README.md`

## Dependencies

- Phase 1 (scaffold) - App must exist with Prisma schema
- Phase 4 (extension) - Need to know extension settings to mirror in admin

## Blocks

- `gold-ticker-billing` (Phase 6) - Billing status shown in admin panel
