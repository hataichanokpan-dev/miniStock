/**
 * API Route: Real-time stock quote
 * GET /api/stock/[symbol]/quote
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/api/quotes';
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

    const quote = await getQuote(upperSymbol);

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote', details: (error as Error).message },
      { status: 500 }
    );
  }
}
