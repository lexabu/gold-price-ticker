# Gold Price Ticker - Deployment Guide

## Prerequisites

- Node.js 20.19+ or 22.12+
- Shopify Partner account
- PostgreSQL database (for production)

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Fill in your Shopify credentials
# SHOPIFY_API_KEY and SHOPIFY_API_SECRET are required
```

### 2. Database Setup

```bash
# Generate Prisma client
npm run prisma generate

# Run migrations
npm run prisma migrate deploy
```

### 3. Build & Deploy

```bash
# Build the app
npm run build

# Start production server
npm run start
```

## Shopify Partner Dashboard Setup

### Create the App

1. Go to [Shopify Partners](https://partners.shopify.com)
2. Navigate to **Apps** > **Create app**
3. Choose **Create app manually**
4. Name: "Gold Price Ticker"

### Configure App URLs

In your app settings, configure:

| Field | Value |
|-------|-------|
| App URL | `https://your-domain.com/app` |
| Allowed redirection URLs | `https://your-domain.com/auth/callback` |

### Configure App Proxy

The app proxy serves gold prices to your storefront:

1. Go to **App setup** > **App proxy**
2. Add proxy:
   - **Subpath prefix**: `apps`
   - **Subpath**: `gold-ticker`
   - **Proxy URL**: `https://your-domain.com/api/proxy`

This creates: `https://your-store.myshopify.com/apps/gold-ticker/gold-prices`

### Deploy Theme Extension

```bash
# Deploy extensions to Shopify
npm run deploy
```

## Production Database

### PostgreSQL on Fly.io

```bash
# Create database
fly postgres create --name gold-ticker-db

# Attach to app
fly postgres attach gold-ticker-db

# Get connection string (set as DATABASE_URL)
fly postgres connect -a gold-ticker-db
```

### PostgreSQL on Railway/Supabase

Use the connection string provided by your database host.

## Deployment Checklist

- [ ] Set `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET`
- [ ] Set `DATABASE_URL` to production PostgreSQL
- [ ] Run `npm run prisma migrate deploy`
- [ ] Configure App URLs in Partner Dashboard
- [ ] Configure App Proxy in Partner Dashboard
- [ ] Deploy theme extension: `npm run deploy`
- [ ] Install app on test store
- [ ] Enable ticker in theme editor (Online Store > Themes > Customize > App embeds)
- [ ] Verify ticker appears on storefront

## Optional: Gold API Fallback

For higher reliability, get a free API key from [GoldAPI.io](https://goldapi.io/) and set `GOLD_API_KEY`.

## Monitoring

Check app health:
- Admin panel: `https://your-store.myshopify.com/admin/apps/gold-price-ticker`
- API health: `https://your-domain.com/api/proxy/gold-prices`

## Troubleshooting

### Ticker not showing on storefront

1. Check app is installed on the store
2. Verify extension is enabled in theme editor
3. Check browser console for errors
4. Verify app proxy is configured correctly

### Gold prices not loading

1. Check SwissQuote API is accessible
2. Verify `GOLD_API_KEY` is set for fallback
3. Check server logs for API errors

### Database connection errors

1. Verify `DATABASE_URL` is correct
2. Ensure database is accessible from your server
3. Run `npm run prisma migrate deploy` to apply migrations
