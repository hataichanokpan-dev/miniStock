/**
 * API Route: Real-time stock quote
 * GET /api/stock/[symbol]/quote
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/api/quotes';
import { getApiValidationStatus, getApiProvider } from '@/lib/api/stock-api';

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

    const quote = await getQuote(upperSymbol);

    return NextResponse.json(quote);
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error('Error fetching quote:', errorMessage);
    return NextResponse.json(
      {
        error: 'Failed to fetch quote',
        details: errorMessage,
        provider: getApiProvider(),
      },
      { status: 500 }
    );
  }
}
