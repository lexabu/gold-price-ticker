---
name: gold-ticker-extension-global
description: Build the theme app extension ticker bar for storefronts (Global)
argument-hint:
metadata:
  openclaw:
    user-invocable: true
    requires:
      bins: [claude, git, shopify]
---

# Gold Ticker Extension

Build the Shopify Theme App Extension that renders the gold price ticker bar on merchant storefronts.

## Usage

```
/gold-ticker-extension
```

## Context

This is Phase 4 of the gold-price-ticker project. See the master plan:
`~/Code/project-context/projects/gold-price-ticker/README.md`

**Requires Phase 1 (scaffold) and Phase 3 (proxy) to be complete.**

## Workflow

1. **Generate the theme extension (if not already done in scaffold)**
   ```bash
   cd ~/Code/gold-price-ticker
   shopify app generate extension --type theme_app_extension --name gold-ticker-bar
   ```
   This creates `extensions/gold-ticker-bar/`

2. **Extension directory structure**
   ```
   extensions/gold-ticker-bar/
   ├── blocks/
   │   └── gold-ticker.liquid       # The ticker bar block
   ├── assets/
   │   ├── gold-ticker.js           # Fetch + render logic
   │   └── gold-ticker.css          # Styling
   ├── locales/
   │   └── en.default.json          # Schema translations
   └── shopify.extension.toml       # Extension config
   ```

3. **Create `blocks/gold-ticker.liquid`**
   ```liquid
   {% comment %}
     Gold Price Ticker Bar
     Fetches live gold prices via app proxy and displays as scrolling ticker
   {% endcomment %}

   <div
     id="gold-ticker-bar"
     class="gold-ticker"
     data-proxy-url="{{ shop.url }}/apps/gold-ticker/prices"
     data-position="{{ block.settings.position }}"
     data-speed="{{ block.settings.ticker_speed }}"
     style="
       --ticker-bg: {{ block.settings.bg_color }};
       --ticker-text: {{ block.settings.text_color }};
       --ticker-accent: {{ block.settings.accent_color }};
     "
   >
     <div class="gold-ticker__container">
       <div class="gold-ticker__track">
         <span class="gold-ticker__loading">Loading gold prices...</span>
       </div>
     </div>
   </div>

   {{ 'gold-ticker.css' | asset_url | stylesheet_tag }}
   <script src="{{ 'gold-ticker.js' | asset_url }}" defer></script>

   {% schema %}
   {
     "name": "Gold Price Ticker",
     "target": "section",
     "enabled_on": {
       "templates": ["*"],
       "groups": ["header"]
     },
     "settings": [
       {
         "type": "select",
         "id": "position",
         "label": "Position",
         "default": "top",
         "options": [
           { "value": "top", "label": "Top of page" },
           { "value": "bottom", "label": "Bottom of page" }
         ]
       },
       {
         "type": "color",
         "id": "bg_color",
         "label": "Background color",
         "default": "#1a1a2e"
       },
       {
         "type": "color",
         "id": "text_color",
         "label": "Text color",
         "default": "#e8d44d"
       },
       {
         "type": "color",
         "id": "accent_color",
         "label": "Accent color (labels)",
         "default": "#ffffff"
       },
       {
         "type": "range",
         "id": "ticker_speed",
         "label": "Scroll speed",
         "min": 20,
         "max": 100,
         "step": 10,
         "default": 50,
         "unit": "px/s"
       }
     ]
   }
   {% endschema %}
   ```

4. **Create `assets/gold-ticker.css`**
   ```css
   .gold-ticker {
     --ticker-bg: #1a1a2e;
     --ticker-text: #e8d44d;
     --ticker-accent: #ffffff;
     position: relative;
     width: 100%;
     background: var(--ticker-bg);
     overflow: hidden;
     z-index: 999;
     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
   }

   .gold-ticker[data-position="top"] { position: sticky; top: 0; }
   .gold-ticker[data-position="bottom"] { position: fixed; bottom: 0; }

   .gold-ticker__container {
     padding: 8px 0;
     overflow: hidden;
   }

   .gold-ticker__track {
     display: flex;
     gap: 40px;
     white-space: nowrap;
     will-change: transform;
   }

   .gold-ticker__track--animate {
     animation: ticker-scroll var(--ticker-duration, 30s) linear infinite;
   }

   .gold-ticker__item {
     display: inline-flex;
     align-items: center;
     gap: 6px;
     font-size: 13px;
     line-height: 1;
   }

   .gold-ticker__karat {
     color: var(--ticker-accent);
     font-weight: 600;
     font-size: 11px;
     text-transform: uppercase;
     letter-spacing: 0.5px;
   }

   .gold-ticker__price {
     color: var(--ticker-text);
     font-weight: 700;
     font-variant-numeric: tabular-nums;
   }

   .gold-ticker__unit {
     color: var(--ticker-accent);
     opacity: 0.7;
     font-size: 11px;
   }

   .gold-ticker__loading {
     color: var(--ticker-text);
     font-size: 13px;
     opacity: 0.7;
     padding: 0 20px;
   }

   .gold-ticker__timestamp {
     color: var(--ticker-accent);
     opacity: 0.5;
     font-size: 10px;
     margin-left: 20px;
   }

   /* Desktop: static row. Mobile: scrolling marquee */
   @media (min-width: 768px) {
     .gold-ticker__track {
       justify-content: center;
     }
     .gold-ticker__track--static {
       animation: none;
     }
   }

   @keyframes ticker-scroll {
     0% { transform: translateX(0); }
     100% { transform: translateX(-50%); }
   }

   /* Accessibility */
   @media (prefers-reduced-motion: reduce) {
     .gold-ticker__track { animation: none !important; }
   }
   ```

5. **Create `assets/gold-ticker.js`**
   ```javascript
   (function() {
     'use strict';

     const ticker = document.getElementById('gold-ticker-bar');
     if (!ticker) return;

     const proxyUrl = ticker.dataset.proxyUrl;
     const speed = parseInt(ticker.dataset.speed) || 50;
     const track = ticker.querySelector('.gold-ticker__track');
     const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

     async function fetchPrices() {
       try {
         const res = await fetch(proxyUrl);
         if (!res.ok) throw new Error(`HTTP ${res.status}`);
         return await res.json();
       } catch (err) {
         console.warn('[Gold Ticker] Failed to fetch prices:', err.message);
         return null;
       }
     }

     function renderPrices(data) {
       if (!data || !data.prices || !data.settings?.isActive) {
         ticker.style.display = 'none';
         return;
       }

       ticker.style.display = 'block';

       // Apply server-side settings if present
       if (data.settings) {
         ticker.style.setProperty('--ticker-bg', data.settings.bgColor);
         ticker.style.setProperty('--ticker-text', data.settings.textColor);
       }

       const karats = Object.keys(data.prices).sort((a, b) => {
         return parseInt(b) - parseInt(a); // 24K first
       });

       // Build price items HTML
       const items = karats.map(k => {
         const p = data.prices[k];
         return `
           <span class="gold-ticker__item" aria-label="${k} gold: $${p.pricePerGram.toFixed(2)} per gram">
             <span class="gold-ticker__karat">${k}</span>
             <span class="gold-ticker__price">$${p.pricePerGram.toFixed(2)}</span>
             <span class="gold-ticker__unit">/g</span>
           </span>
         `;
       }).join('');

       const timestamp = new Date(data.fetchedAt).toLocaleTimeString([], {
         hour: '2-digit',
         minute: '2-digit'
       });

       // Duplicate content for seamless scroll
       const content = items + `<span class="gold-ticker__timestamp">Updated ${timestamp}</span>`;
       track.innerHTML = content + content; // Duplicate for infinite scroll

       // Calculate animation duration based on content width and speed
       requestAnimationFrame(() => {
         const contentWidth = track.scrollWidth / 2;
         const duration = contentWidth / speed;
         track.style.setProperty('--ticker-duration', `${duration}s`);

         // On desktop, check if content fits without scrolling
         const containerWidth = ticker.querySelector('.gold-ticker__container').offsetWidth;
         if (contentWidth <= containerWidth) {
           track.innerHTML = content; // No need to duplicate
           track.classList.add('gold-ticker__track--static');
           track.classList.remove('gold-ticker__track--animate');
         } else {
           track.classList.add('gold-ticker__track--animate');
           track.classList.remove('gold-ticker__track--static');
         }
       });
     }

     // Initial fetch
     fetchPrices().then(renderPrices);

     // Auto-refresh
     setInterval(() => {
       fetchPrices().then(renderPrices);
     }, REFRESH_INTERVAL);
   })();
   ```

6. **Configure extension TOML**
   Update `extensions/gold-ticker-bar/shopify.extension.toml`:
   ```toml
   api_version = "2025-07"

   [[extensions]]
   name = "Gold Price Ticker"
   handle = "gold-ticker-bar"
   type = "theme"

   [[extensions.targeting]]
   module = "./blocks/gold-ticker.liquid"
   target = "section"
   ```

7. **Test the extension**
   ```bash
   shopify app dev
   ```
   - Navigate to Online Store > Themes > Customize
   - Add "Gold Price Ticker" app block to header area
   - Verify ticker displays with price data
   - Test mobile scrolling behavior
   - Test position toggle (top/bottom)
   - Test color customization

## Design Specifications

- **Font size**: 13px for prices, 11px for labels
- **Padding**: 8px vertical
- **Default colors**: Dark navy (#1a1a2e) bg, gold (#e8d44d) text, white (#ffffff) labels
- **Animation**: CSS translateX for marquee, respects prefers-reduced-motion
- **Bundle size target**: < 10KB total (JS + CSS gzipped)

## Reference Repos

- `~/Code/clerk/extensions/` - Theme extension structure and patterns
- `~/Code/team-ordering/extensions/` - Multi-extension workspace

## Output

When complete, update Phase 4 tasks in:
`~/Code/project-context/projects/gold-price-ticker/README.md`

## Dependencies

- Phase 1 (scaffold) - Extension directory must exist
- Phase 3 (proxy) - Proxy endpoint must be serving data

## Blocks

- `gold-ticker-admin` (Phase 5) - Admin panel configures these extension settings
