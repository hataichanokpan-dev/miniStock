/**
 * API Route: Complete stock data
 * GET /api/stock/[symbol]
 * Returns: Quote, Profile, Metrics, Financial Statements
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/api/quotes';
import { getCompanyMetrics, getCompanyProfile } from '@/lib/api/fundamentals';
import { getFinancialStatements } from '@/lib/api/statements';
import { validateApiKey, getApiValidationStatus, getApiProvider } from '@/lib/api/stock-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    // Validate API configuration
    const validationStatus = getApiValidationStatus();
    if (!validationStatus.valid) {
      return NextResponse.json(
        {
          error: 'Stock API configuration error',
          details: validationStatus.message,
          provider: getApiProvider(),
        },
        { status: 500 }
      );
    }

    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    if (!upperSymbol || upperSymbol.length === 0) {
      return NextResponse.json(
        {
          error: 'Invalid symbol',
          details: 'Stock symbol is required',
        },
        { status: 400 }
      );
    }

    const [quote, metrics, profile, statements] = await Promise.all([
      getQuote(upperSymbol),
      getCompanyMetrics(upperSymbol),
      getCompanyProfile(upperSymbol),
      getFinancialStatements(upperSymbol),
    ]);

    return NextResponse.json({
      symbol: upperSymbol,
      quote,
      profile,
      metrics,
      statements,
      _meta: {
        provider: getApiProvider(),
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error('Error fetching stock data:', errorMessage);

    // Return actionable error details
    return NextResponse.json(
      {
        error: 'Failed to fetch stock data',
        details: errorMessage,
        provider: getApiProvider(),
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
