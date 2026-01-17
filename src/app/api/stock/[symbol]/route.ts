/**
 * API Route: Complete stock data
 * GET /api/stock/[symbol]
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/api/quotes';
import { getCompanyMetrics, getCompanyProfile } from '@/lib/api/fundamentals';
import { getFinancialStatements } from '@/lib/api/statements';
import { validateApiKey } from '@/lib/api/stock-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    // Validate API key
    if (!validateApiKey()) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

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
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
