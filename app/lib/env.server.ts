/**
 * Environment variable validation for Gold Price Ticker
 * Validates required and optional environment variables on startup
 */

interface EnvConfig {
  // Required - Shopify App credentials
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;

  // Database
  DATABASE_URL: string;

  // Optional - Gold API fallback
  GOLD_API_KEY?: string;

  // Optional - OpenAI for advanced features
  OPENAI_API_KEY?: string;
  OPENAI_MODEL: string;
  OPENAI_TEST_MODE: boolean;

  // Optional - Development settings
  RATE_LIMIT_DEV_MODE: boolean;
  NODE_ENV: string;
}

class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnvValidationError";
  }
}

function validateEnv(): EnvConfig {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
  const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;

  if (!SHOPIFY_API_KEY) {
    errors.push("SHOPIFY_API_KEY is required");
  }

  if (!SHOPIFY_API_SECRET) {
    errors.push("SHOPIFY_API_SECRET is required");
  }

  // Database URL - defaults to SQLite for development
  const DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

  // Optional variables with warnings
  const GOLD_API_KEY = process.env.GOLD_API_KEY;
  if (!GOLD_API_KEY) {
    warnings.push(
      "GOLD_API_KEY not set - will use SwissQuote only (no fallback API)"
    );
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    warnings.push(
      "OPENAI_API_KEY not set - AI-powered features will be disabled"
    );
  }

  // Optional with defaults
  const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const OPENAI_TEST_MODE = process.env.OPENAI_TEST_MODE === "true";
  const RATE_LIMIT_DEV_MODE = process.env.RATE_LIMIT_DEV_MODE === "true";
  const NODE_ENV = process.env.NODE_ENV || "development";

  // Log warnings (don't throw)
  if (warnings.length > 0) {
    console.warn("\n⚠️  Environment Warnings:");
    warnings.forEach((w) => console.warn(`   - ${w}`));
    console.warn("");
  }

  // Throw if any required variables are missing
  if (errors.length > 0) {
    throw new EnvValidationError(
      `Missing required environment variables:\n${errors.map((e) => `  - ${e}`).join("\n")}\n\nPlease check your .env file or environment configuration.`
    );
  }

  return {
    SHOPIFY_API_KEY: SHOPIFY_API_KEY!,
    SHOPIFY_API_SECRET: SHOPIFY_API_SECRET!,
    DATABASE_URL,
    GOLD_API_KEY,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    OPENAI_TEST_MODE,
    RATE_LIMIT_DEV_MODE,
    NODE_ENV,
  };
}

// Validate on module load
export const env = validateEnv();

// Re-export for convenience
export type { EnvConfig };
