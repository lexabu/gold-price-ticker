# Gold Price Ticker - Issue Tracking

## Status: ALL FIXES APPLIED - READY FOR TESTING

### Fixes Applied from Clerk Comparison

---

### Issue 1: shopify.app.toml - Empty Access Scopes
**Status:** [x] FIXED
**Severity:** CRITICAL
**Symptom:** App may not authenticate properly

**What was wrong:** `scopes = ""` — app had no permissions.
**Fix applied:** Set `scopes = "read_products"` (matches clerk pattern).

---

### Issue 2: shopify.app.toml - Absolute Proxy URL
**Status:** [x] FIXED
**Severity:** HIGH
**Symptom:** Proxy might not work correctly in all environments

**What was wrong:** `url = "https://example.com/api/proxy"` (absolute URL)
**Fix applied:** Changed to `url = "/api/proxy"` (relative, matches clerk pattern)

---

### Issue 3: shopify.web.toml - Missing Required Fields
**Status:** [x] FIXED (was already fixed)
**Severity:** CRITICAL
**Symptom:** Admin app page blank, extension not registering

**What was wrong:** Missing `name`, `roles`, `webhooks_path` fields.
**Fix applied:** Added all three fields to match clerk's working pattern.

---

### Issue 4: Extension toml - Wrong Format
**Status:** [x] FIXED (was already fixed)
**Severity:** CRITICAL
**Symptom:** Extension not appearing in theme editor

**What was wrong:** Used `[[extensions]]` array format.
**Fix applied:** Converted to flat format: `name`, `uid`, `type` at root level only.

---

### Issue 5: Liquid Schema - Wrong Target
**Status:** [x] FIXED (was already fixed)
**Symptom:** Extension didn't appear in App embeds.
**Fix applied:** Changed `"target": "section"` to `"target": "body"`.

---

### Issue 6: Admin UI - Not Functional
**Status:** [x] FIXED
**Severity:** HIGH
**Symptom:** Admin page only showed "shop name", no actual settings

**What was wrong:** Minimal placeholder UI, no Polaris components.
**Fix applied:** Built full settings panel with:
- General settings (enable/disable, position)
- Karat selection checkboxes
- Appearance settings (colors, currency)
- Animation speed slider
- Live preview
- How-to-enable instructions

---

### Issue 7: Missing CORS Headers
**Status:** [x] FIXED
**Severity:** MEDIUM
**Symptom:** Potential cross-origin issues on storefront

**What was wrong:** Only `Access-Control-Allow-Origin: *` hardcoded.
**Fix applied:** Dynamic CORS headers per shop domain (matches clerk pattern):
- `Access-Control-Allow-Origin` based on request origin
- `Access-Control-Allow-Credentials`
- `Access-Control-Allow-Headers`
- `Access-Control-Allow-Methods`
- `Vary: Origin`
- OPTIONS preflight handling

---

### Issue 8: Missing Polaris Provider
**Status:** [x] FIXED
**Severity:** HIGH
**Symptom:** Polaris components wouldn't render

**What was wrong:** No Polaris CSS import, no PolarisAppProvider.
**Fix applied:**
- Added `@shopify/polaris/build/esm/styles.css` import in root.tsx
- Added PolarisAppProvider wrapper in app.tsx

---

## Automated Verification Results

| Check | Result |
|-------|--------|
| Prisma generate | PASS |
| TypeScript typecheck | PASS |
| Production build | PASS |
| Extension toml format | PASS (flat, matches clerk) |
| shopify.web.toml fields | PASS (name, roles, webhooks_path, predev) |
| shopify.app.toml config | PASS (client_id, scopes=read_products, app_proxy relative) |
| Liquid schema | PASS (target=body, 5 settings, all valid) |
| Locales JSON | PASS |
| Polaris CSS | PASS (imported in root.tsx) |
| Admin Settings UI | PASS (full Polaris implementation) |

## Manual Verification Checklist

After running `npm run dev -- --reset`:
- [ ] Dev server starts without errors
- [ ] Admin app page loads with full settings UI
- [ ] Settings can be saved (check DB)
- [ ] Extension appears in App embeds in theme editor
- [ ] Ticker bar visible on storefront preview
- [ ] Gold prices fetch successfully from proxy
- [ ] Colors/settings from admin apply to ticker

## Key Patterns from Clerk

1. **Relative proxy URL** - `/api/proxy` not `https://example.com/api/proxy`
2. **Actual scopes** - `read_products` not empty
3. **Dynamic CORS** - Per-shop-domain, not wildcard
4. **Flat extension toml** - Just `name`, `uid`, `type`
5. **Full admin UI** - Polaris components with proper provider chain
