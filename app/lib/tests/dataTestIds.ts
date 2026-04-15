/**
 * Centralized data-testid constants for E2E testing
 * Following np repo methodology for maintainable test selectors
 */
export const DATA_TEST_IDS = {
  // ===================
  // Gold Ticker Settings Page
  // ===================

  // Main settings form
  settingsForm: 'settings-form',

  // Enable/Disable toggle
  tickerEnableToggle: 'ticker-enable-toggle',

  // Karat selection checkboxes
  karatCheckbox24K: 'karat-checkbox-24k',
  karatCheckbox22K: 'karat-checkbox-22k',
  karatCheckbox21K: 'karat-checkbox-21k',
  karatCheckbox18K: 'karat-checkbox-18k',
  karatCheckbox14K: 'karat-checkbox-14k',

  // Position selector
  positionSelector: 'position-selector',
  positionOptionTop: 'position-option-top',
  positionOptionBottom: 'position-option-bottom',

  // Color pickers
  backgroundColorPicker: 'background-color-picker',
  textColorPicker: 'text-color-picker',

  // Speed control
  speedSlider: 'speed-slider',
  speedValue: 'speed-value',

  // Currency
  currencyInput: 'currency-input',

  // Actions
  saveSettingsButton: 'save-settings-button',
  resetSettingsButton: 'reset-settings-button',

  // Preview
  tickerPreview: 'ticker-preview',
  tickerPreviewBar: 'ticker-preview-bar',

  // Feedback toasts
  settingsSuccessToast: 'settings-success-toast',
  settingsErrorToast: 'settings-error-toast',

  // ===================
  // Storefront Ticker Bar
  // ===================
  storefrontTicker: 'gold-ticker-bar',
  storefrontTickerContent: 'gold-ticker-content',
  storefrontTickerPrice: 'gold-ticker-price',
  storefrontTickerTimestamp: 'gold-ticker-timestamp',

  // ===================
  // Common UI Elements
  // ===================
  loadingSpinner: 'loading-spinner',
  errorBanner: 'error-banner',
  pageTitle: 'page-title',
} as const;

/**
 * Type for data-testid values
 */
export type DataTestId = (typeof DATA_TEST_IDS)[keyof typeof DATA_TEST_IDS];

/**
 * Helper to create data-testid attribute object for React components
 */
export function testId(id: DataTestId): { 'data-testid': DataTestId } {
  return { 'data-testid': id };
}

/**
 * Helper to create Playwright locator selector
 */
export function testIdSelector(id: DataTestId): string {
  return `[data-testid="${id}"]`;
}
