---
name: playwright-global
description: Browser automation testing with Playwright. Use for UI testing, E2E testing,
  or automating browser interactions. (Global)
argument-hint:
- test-description
metadata:
  openclaw:
    user-invocable: true
    requires:
      bins:
      - node
      - npx
permalink: project-context/skills/playwright/skill
tags:
  - claude-code
---

# Playwright Browser Automation Skill

Write and execute browser automation for testing, scraping, or interaction verification.

## When to Use

- E2E testing of web applications
- Visual regression testing
- Automating browser workflows
- Testing responsive design
- Verifying user flows
- Screenshots and visual verification

## Setup Check

```bash
# Check if Playwright is available
npx playwright --version 2>/dev/null || echo "Need to install Playwright"

# Install if needed
npm install -D @playwright/test
npx playwright install chromium
```

## Quick Start

### Run a Simple Test

```typescript
import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/My App/);
});
```

### Execute Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run in headed mode (visible browser)
npx playwright test --headed

# Run with debug mode
npx playwright test --debug
```

## Common Patterns

### 1. Page Navigation & Waiting

```typescript
// Navigate and wait for network idle
await page.goto('https://example.com', { waitUntil: 'networkidle' });

// Wait for element to be visible
await page.waitForSelector('.content-loaded');

// Wait for specific response
await page.waitForResponse(resp => resp.url().includes('/api/data'));
```

### 2. Element Interaction

```typescript
// Click
await page.click('button.submit');
await page.click('text=Sign In');

// Fill form
await page.fill('input[name="email"]', 'test@example.com');
await page.fill('input[name="password"]', 'password123');

// Select dropdown
await page.selectOption('select#country', 'US');

// Check/uncheck
await page.check('input[type="checkbox"]');
```

### 3. Assertions

```typescript
// Text content
await expect(page.locator('.message')).toHaveText('Success!');

// Visibility
await expect(page.locator('.modal')).toBeVisible();
await expect(page.locator('.loading')).toBeHidden();

// Count
await expect(page.locator('.item')).toHaveCount(5);

// URL
await expect(page).toHaveURL(/.*dashboard/);
```

### 4. Screenshots

```typescript
// Full page
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// Element only
await page.locator('.chart').screenshot({ path: 'chart.png' });

// Visual comparison
await expect(page).toHaveScreenshot('homepage.png');
```

### 5. Network Interception

```typescript
// Mock API response
await page.route('**/api/users', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify([{ id: 1, name: 'Test User' }]),
  });
});

// Block resources
await page.route('**/*.{png,jpg,jpeg}', route => route.abort());
```

## Testing Workflows

### Login Flow Test

```typescript
test('user can log in', async ({ page }) => {
  // Go to login page
  await page.goto('/login');

  // Fill credentials
  await page.fill('[name="email"]', 'user@example.com');
  await page.fill('[name="password"]', 'password123');

  // Submit
  await page.click('button[type="submit"]');

  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('.welcome')).toContainText('Welcome');
});
```

### Form Validation Test

```typescript
test('shows validation errors', async ({ page }) => {
  await page.goto('/signup');

  // Submit empty form
  await page.click('button[type="submit"]');

  // Check for error messages
  await expect(page.locator('.error-email')).toHaveText('Email is required');
  await expect(page.locator('.error-password')).toHaveText('Password is required');

  // Fill invalid email
  await page.fill('[name="email"]', 'invalid-email');
  await page.click('button[type="submit"]');

  await expect(page.locator('.error-email')).toHaveText('Invalid email format');
});
```

### Responsive Design Test

```typescript
test('mobile menu works', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('/');

  // Desktop nav should be hidden
  await expect(page.locator('nav.desktop')).toBeHidden();

  // Mobile menu button should be visible
  await expect(page.locator('button.mobile-menu')).toBeVisible();

  // Click mobile menu
  await page.click('button.mobile-menu');

  // Nav should now be visible
  await expect(page.locator('nav.mobile')).toBeVisible();
});
```

## Configuration

### playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
});
```

## Debugging

```bash
# Run with UI mode
npx playwright test --ui

# Generate test from recording
npx playwright codegen localhost:3000

# Show trace viewer
npx playwright show-trace trace.zip
```

## Project Integration

### Add to package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

## Example Session

```
User: /playwright test the checkout flow

Claude:
## Playwright: Checkout Flow Test

Creating E2E test for checkout...

**Test file:** `tests/checkout.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart first
    await page.goto('/products/test-product');
    await page.click('button.add-to-cart');
  });

  test('complete checkout', async ({ page }) => {
    await page.goto('/cart');
    await page.click('button.checkout');

    // Fill shipping
    await page.fill('[name="address"]', '123 Test St');
    await page.fill('[name="city"]', 'Test City');
    await page.click('button.continue');

    // Fill payment
    await page.fill('[name="card"]', '4111111111111111');
    await page.fill('[name="exp"]', '12/25');
    await page.fill('[name="cvv"]', '123');

    // Place order
    await page.click('button.place-order');

    // Verify success
    await expect(page).toHaveURL(/order-confirmation/);
    await expect(page.locator('.order-number')).toBeVisible();
  });
});
```

Running test...
PASS (12.3s)

Screenshot saved: `tests/screenshots/checkout-success.png`
```

## Important Rules

1. **Always wait for elements** before interacting
2. **Use locators** that are stable (data-testid > class > text)
3. **Don't hardcode waits** - use proper waiting mechanisms
4. **Run headed mode** when debugging
5. **Check network tab** for failed requests

## Check for Repo-Specific Skill

```bash
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -f "$REPO_ROOT/.claude/skills/playwright/SKILL.md" ]; then
  echo "Using repo-specific playwright skill"
fi
```