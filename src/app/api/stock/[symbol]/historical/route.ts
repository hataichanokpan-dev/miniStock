/**
 * API Route: Historical price data
 * GET /api/stock/[symbol]/historical?period=1y
 */

import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalPricesYahoo } from '@/lib/api/yahoo-finance';
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

    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') as any) || '1y';

    const historical = await getHistoricalPricesYahoo(upperSymbol, period);

    return NextResponse.json({
      symbol: upperSymbol,
      period,
      data: historical,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error('Error fetching historical data:', errorMessage);
    return NextResponse.json(
      {
        error: 'Failed to fetch historical data',
        details: errorMessage,
        provider: getApiProvider(),
      },
      { status: 500 }
    );
  }
}
