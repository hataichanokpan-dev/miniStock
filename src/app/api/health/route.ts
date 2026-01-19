/**
 * API Route: Health check / smoke test
 * GET /api/health
 *
 * Use this endpoint to verify:
 * - API is reachable
 * - Environment is configured correctly
 * - Stock API provider is ready
 */

import { NextResponse } from 'next/server';
import { getApiValidationStatus, getApiProvider, validateApiKey } from '@/lib/api/stock-api';

export async function GET() {
  const validationStatus = getApiValidationStatus();
  const provider = getApiProvider();

  return NextResponse.json({
    status: 'ok',
    timestamp: Date.now(),
    api: {
      provider,
      configured: validationStatus.valid,
      message: validationStatus.message,
    },
    endpoints: {
      stockQuote: '/api/stock/[symbol]/quote',
      stockFundamentals: '/api/stock/[symbol]/fundamentals',
      stockHistorical: '/api/stock/[symbol]/historical?period=1y',
      stockAll: '/api/stock/[symbol]',
    },
    test: {
      endpoint: '/api/stock/AAPL',
      description: 'Test with a real stock symbol to verify full pipeline',
    },
  });
}
