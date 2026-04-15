import { Page, expect } from '@playwright/test';

/**
 * Resource blocking presets for E2E tests
 * Blocks unnecessary network requests to speed up tests
 */
export const BLOCK_PRESETS = {
  /** Block only analytics and ads - minimal impact on page functionality */
  minimal: [
    '**/analytics**',
    '**/gtag**',
    '**/gtm**',
    '**google-analytics**',
    '**googletagmanager**',
    '**facebook**',
    '**doubleclick**',
    '**hotjar**',
    '**segment**',
  ],
  /** Block analytics, ads, fonts, and non-critical images */
  balanced: [
    '**/analytics**',
    '**/gtag**',
    '**/gtm**',
    '**google-analytics**',
    '**googletagmanager**',
    '**facebook**',
    '**doubleclick**',
    '**hotjar**',
    '**segment**',
    '**fonts.googleapis.com**',
    '**fonts.gstatic.com**',
    '**.woff2',
    '**.woff',
  ],
  /** Block everything non-essential - fastest but may affect some UI */
  aggressive: [
    '**/analytics**',
    '**/gtag**',
    '**/gtm**',
    '**google-analytics**',
    '**googletagmanager**',
    '**facebook**',
    '**doubleclick**',
    '**hotjar**',
    '**segment**',
    '**fonts.googleapis.com**',
    '**fonts.gstatic.com**',
    '**.woff2',
    '**.woff',
    '**.png',
    '**.jpg',
    '**.jpeg',
    '**.gif',
    '**.svg',
    '**.mp4',
    '**.webm',
  ],
} as const;

export type BlockPreset = keyof typeof BLOCK_PRESETS;

/**
 * Block unnecessary resources to speed up page loads
 */
export async function blockUnnecessaryResources(
  page: Page,
  preset: BlockPreset | string[] = 'balanced'
): Promise<void> {
  const patterns = Array.isArray(preset) ? preset : BLOCK_PRESETS[preset];

  await page.route(
    (url) => patterns.some((pattern) => url.href.includes(pattern.replace(/\*/g, ''))),
    (route) => route.abort()
  );
}

/**
 * Retry options for test functions
 */
interface RetryOptions {
  attempts?: number;
  delay?: number;
  debug?: boolean;
  errorMessage?: string;
  successMessage?: string;
}

/**
 * Retry a test function multiple times before failing
 */
export async function retryTest<T>(
  testFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { attempts = 3, delay = 1000, debug = false, errorMessage, successMessage } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      if (debug) {
        console.log(`🔄 Attempt ${attempt}/${attempts}`);
      }
      const result = await testFn();
      if (debug && successMessage) {
        console.log(`✅ ${successMessage}`);
      }
      return result;
    } catch (error) {
      lastError = error as Error;
      if (debug) {
        console.log(`❌ Attempt ${attempt} failed: ${lastError.message}`);
      }
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(errorMessage || `Failed after ${attempts} attempts: ${lastError?.message}`);
}

/**
 * Wait for multiple elements to be visible
 * Returns array of booleans indicating visibility of each element
 */
export async function waitForElements(
  page: Page,
  selectors: string[],
  timeout = 5000
): Promise<boolean[]> {
  const results = await Promise.all(
    selectors.map(async (selector) => {
      try {
        await page.locator(selector).waitFor({ state: 'visible', timeout });
        return true;
      } catch {
        return false;
      }
    })
  );
  return results;
}

/**
 * Wait for page to be fully loaded including async content
 */
export async function waitForPageReady(page: Page, timeout = 10000): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('load');

  // Wait for network to be idle (no requests for 500ms)
  await page.waitForLoadState('networkidle').catch(() => {
    // Network idle timeout is ok - page might have long-polling
  });
}

/**
 * Safe click that waits for element and handles potential overlays
 */
export async function safeClick(
  page: Page,
  selector: string,
  options: { timeout?: number; force?: boolean } = {}
): Promise<void> {
  const { timeout = 5000, force = false } = options;
  const locator = page.locator(selector);

  await locator.waitFor({ state: 'visible', timeout });
  await locator.click({ force });
}

/**
 * Fill input with retry logic for flaky inputs
 */
export async function safeFill(
  page: Page,
  selector: string,
  value: string,
  options: { timeout?: number; clear?: boolean } = {}
): Promise<void> {
  const { timeout = 5000, clear = true } = options;
  const locator = page.locator(selector);

  await locator.waitFor({ state: 'visible', timeout });

  if (clear) {
    await locator.clear();
  }

  await locator.fill(value);
}
