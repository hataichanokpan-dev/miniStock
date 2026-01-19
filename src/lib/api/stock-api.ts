/**
 * Main Stock API Client
 * Phase 1: Data Layer Foundation
 * Supports Yahoo Finance, Financial Modeling Prep (FMP), and Alpha Vantage
 */

import { cache, CACHE_TTL, withCache } from './cache';

export type ApiProvider = 'yahoo' | 'fmp' | 'alphavantage';

// API Configuration from environment
const API_PROVIDER = (process.env.NEXT_PUBLIC_API_PROVIDER || 'yahoo') as ApiProvider;
const STOCK_API_KEY = process.env.NEXT_PUBLIC_STOCK_API_KEY || '';
const YAHOO_API_URL = process.env.NEXT_PUBLIC_YAHOO_API_URL || '';
const FMP_API_URL = process.env.NEXT_PUBLIC_FMP_API_URL || 'https://financialmodelingprep.com/api/v3';
const ALPHA_VANTAGE_API_URL = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_URL || 'https://www.alphavantage.co/query';
const RATE_LIMIT = parseInt(process.env.STOCK_API_RATE_LIMIT || '300', 10);

// Rate limiting (simple in-memory)
let requestCount = 0;
let requestResetTime = Date.now() + 60000; // Reset every minute

/**
 * Check rate limit and wait if necessary
 */
async function checkRateLimit(): Promise<void> {
  const now = Date.now();
  if (now > requestResetTime) {
    requestCount = 0;
    requestResetTime = now + 60000;
  }

  if (requestCount >= RATE_LIMIT) {
    const waitTime = requestResetTime - now;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
    requestCount = 0;
    requestResetTime = Date.now() + 60000;
  }

  requestCount++;
}

/**
 * Build cache key for API requests
 */
function buildCacheKey(endpoint: string, params: Record<string, string | number>): string {
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${endpoint}?${paramString}`;
}

/**
 * Make HTTP request with error handling and retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  retries = 3
): Promise<T> {
  await checkRateLimit();

  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        next: { revalidate: CACHE_TTL.QUOTE }, // Next.js ISR
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Check for API errors
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      if (data['Note']) {
        throw new Error('API rate limit exceeded');
      }
      if (data.Information) {
        throw new Error(data.Information);
      }

      return data as T;
    } catch (error) {
      lastError = error as Error;
      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }

  throw lastError || new Error('Unknown error occurred');
}

/**
 * Fetch data from Financial Modeling Prep API
 */
async function fetchFMP<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
  const queryParams = new URLSearchParams({
    apikey: STOCK_API_KEY,
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ) as Record<string, string>,
  });

  const url = `${FMP_API_URL}/${endpoint}?${queryParams}`;
  return fetchWithRetry<T>(url);
}

/**
 * Fetch data from Alpha Vantage API
 */
async function fetchAlphaVantage<T>(functionName: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams({
    function: functionName,
    apikey: STOCK_API_KEY,
    ...params,
  });

  const url = `${ALPHA_VANTAGE_API_URL}?${queryParams}`;
  return fetchWithRetry<T>(url);
}

/**
 * Generic API request with provider detection
 */
export async function apiRequest<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  provider: ApiProvider = API_PROVIDER
): Promise<T> {
  const cacheKey = buildCacheKey(endpoint, params);

  return withCache(cacheKey, CACHE_TTL.QUOTE, async () => {
    if (provider === 'yahoo') {
      // Yahoo Finance uses different API pattern - handled in specific files
      throw new Error('Yahoo Finance requests should use specific yahoo-finance functions');
    } else if (provider === 'fmp') {
      return fetchFMP<T>(endpoint, params);
    } else {
      // Alpha Vantage uses function parameter instead of endpoint
      return fetchAlphaVantage<T>(endpoint, params as Record<string, string>);
    }
  });
}

/**
 * Get current API provider
 */
export function getApiProvider(): ApiProvider {
  return API_PROVIDER;
}

/**
 * Validate API key is configured
 * Note: Yahoo Finance doesn't require an API key
 */
export function validateApiKey(): boolean {
  // Yahoo Finance doesn't require an API key
  if (API_PROVIDER === 'yahoo') {
    return true;
  }
  // FMP and Alpha Vantage require an API key
  return !!STOCK_API_KEY && STOCK_API_KEY !== 'your_api_key_here';
}

/**
 * Get API validation status for error messages
 */
export function getApiValidationStatus(): { valid: boolean; message: string } {
  if (API_PROVIDER === 'yahoo') {
    return { valid: true, message: 'Using Yahoo Finance (no API key required)' };
  }
  if (!STOCK_API_KEY || STOCK_API_KEY === 'your_api_key_here') {
    return {
      valid: false,
      message: `Missing NEXT_PUBLIC_STOCK_API_KEY environment variable for ${API_PROVIDER.toUpperCase()} provider`,
    };
  }
  return { valid: true, message: `Using ${API_PROVIDER.toUpperCase()} provider` };
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear();
}
