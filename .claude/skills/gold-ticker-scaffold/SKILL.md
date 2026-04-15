---
name: gold-ticker-scaffold-global
description: Scaffold the gold-price-ticker Shopify app from template (Global)
argument-hint: [--force]
metadata:
  openclaw:
    user-invocable: true
    requires:
      bins: [npm, git, gh, shopify]
---

# Gold Ticker Scaffold

Create the gold-price-ticker Shopify app repository from the Shopify React Router 7 template.

## Usage

```
/gold-ticker-scaffold
/gold-ticker-scaffold --force  # Overwrite existing repo
```

## Context

This is Phase 1 of the gold-price-ticker project. See the master plan:
`~/Code/project-context/projects/gold-price-ticker/README.md`

## Workflow

1. **Create Shopify app from template**
   ```bash
   cd ~/Code
   npm init @shopify/app@latest -- --template remix gold-price-ticker
   cd gold-price-ticker
   ```

2. **Initialize git repo and push to GitHub**
   ```bash
   git init
   gh repo create lexabu/gold-price-ticker --public --source=.
   git add -A && git commit -m "Initial scaffold from Shopify CLI template"
   git push -u origin main
   ```

3. **Configure shopify.app.toml**
   ```toml
   client_id = ""  # Will be set by shopify app dev
   name = "Gold Price Ticker"
   application_url = "https://example.com"
   embedded = true

   [build]
   automatically_update_urls_on_dev = true

   [webhooks]
   api_version = "2025-07"

     [[webhooks.subscriptions]]
     topics = ["app/uninstalled"]
     uri = "/webhooks/app/uninstalled"

   [access_scopes]
   scopes = ""

   [auth]
   redirect_urls = ["https://example.com/api/auth"]

   [app_proxy]
   url = "https://example.com/api/proxy"
   subpath = "gold-ticker"
   prefix = "apps"

   [billing]
     [billing.gold-ticker-monthly]
     amount = 4.99
     currency_code = "USD"
     interval = "EVERY_30_DAYS"
     trial_days = 7
   ```

4. **Update Prisma schema**
   Add ShopSettings model to `prisma/schema.prisma`:
   ```prisma
   model Session {
     id          String    @id
     shop        String
     state       String
     isOnline    Boolean   @default(false)
     scope       String?
     expires     DateTime?
     accessToken String
     userId      BigInt?
   }

   model ShopSettings {
     id              String   @id @default(cuid())
     shop            String   @unique
     karats          String   @default("24,22,21,18,14")
     colorScheme     String   @default("dark")
     bgColor         String   @default("#1a1a2e")
     textColor       String   @default("#e8d44d")
     tickerSpeed     Int      @default(50)
     position        String   @default("top")
     showChange      Boolean  @default(true)
     currencySymbol  String   @default("$")
     isActive        Boolean  @default(true)
     createdAt       DateTime @default(now())
     updatedAt       DateTime @updatedAt
   }
   ```

5. **Run Prisma migration**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Install additional dependencies**
   ```bash
   npm install wretch @sentry/node
   ```

7. **Create directory structure**
   ```
   app/
   ├── routes/
   │   ├── app._index.tsx        # Main admin page (settings)
   │   ├── app.settings.tsx      # Settings route
   │   ├── app.billing.tsx       # Billing management
   │   └── api.proxy.gold-prices.tsx  # App proxy handler
   ├── services/
   │   ├── gold-price.server.ts  # Gold price fetching + cache
   │   ├── settings.server.ts    # Shop settings CRUD
   │   └── billing.server.ts     # Billing helpers
   ├── components/
   │   ├── TickerPreview.tsx      # Admin preview component
   │   ├── KaratToggles.tsx       # Karat selection
   │   └── ColorPicker.tsx        # Color configuration
   └── shopify.server.ts          # Shopify API config
   ```

8. **Create theme app extension scaffold**
   ```bash
   shopify app generate extension --type theme_app_extension --name gold-ticker-bar
   ```

9. **Verify setup**
   ```bash
   npm run dev  # Should start without errors
   npx prisma studio  # Should show Session and ShopSettings tables
   ```

## Reference Repos

- `~/Code/discount-ai` - App structure, shopify.app.toml format, Prisma setup
- `~/Code/clerk` - App proxy configuration, theme extension scaffold

## Output

When complete, update the Phase 1 tasks in:
`~/Code/project-context/projects/gold-price-ticker/README.md`

Mark all Phase 1 tasks as `done` and add any relevant notes.

## Dependencies

- None (this is Phase 1 - must complete before all other phases)

## Blocks

- `gold-ticker-prices` (Phase 2)
- `gold-ticker-proxy` (Phase 3)
- `gold-ticker-extension` (Phase 4)
- `gold-ticker-admin` (Phase 5)
- `gold-ticker-billing` (Phase 6)
