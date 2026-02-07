# Gold Price Ticker - Progress Tracking

## Project Goal
A Shopify app that displays a scrolling gold price ticker bar on storefronts, showing real-time prices for different gold karats (24K, 22K, 21K, 18K, 14K).

## Current Status: WORKING

### Key Fix (Session 1)
- **Issue**: Extension not appearing in "Add section > Apps"
- **Root cause**: Schema had `"target": "body"` (app embed only)
- **Fix**: Changed to `"target": "section"` in gold-ticker.liquid

---

## Features Implemented

### 1. Gold Price Service
- SwissQuote API (primary) + GoldAPI (fallback)
- 5-minute cache with stale fallback
- Calculates prices for 24K, 22K, 21K, 18K, 14K

### 2. App Proxy
- Route: `/apps/gold-ticker/prices`
- Returns filtered prices based on shop settings
- CORS headers for storefront requests

### 3. Theme Extension
- Scrolling ticker bar with gold prices
- Customizable colors, position, speed
- Auto-refreshes every 5 minutes

### 4. Admin Settings Panel
- Enable/disable toggle
- Karat selection
- Color customization
- Position (top/bottom)
- Speed slider
- Live preview

### 5. Database
- ShopSettings model for per-shop configuration

---

## Files Structure

```
extensions/gold-ticker-bar/
├── blocks/gold-ticker.liquid    # Theme block (target: section)
├── assets/
│   ├── gold-ticker.css          # Ticker styles
│   └── gold-ticker.js           # Fetch & render logic
├── locales/en.default.json
└── shopify.extension.toml

app/
├── routes/
│   ├── app._index.tsx           # Admin settings UI
│   ├── api.proxy.$.tsx          # Gold price proxy
│   └── api.ticker-settings.ts   # Settings API
└── services/
    └── gold-price.server.ts     # Price fetching service
```

---

## Next Steps
- [ ] Add billing (optional)
- [ ] Deploy to production
- [ ] App Store submission
