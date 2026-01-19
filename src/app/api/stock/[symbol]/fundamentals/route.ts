/**
 * API Route: Company fundamentals
 * GET /api/stock/[symbol]/fundamentals
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyMetrics, getCompanyProfile } from '@/lib/api/fundamentals';
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

    const [metrics, profile] = await Promise.all([
      getCompanyMetrics(upperSymbol),
      getCompanyProfile(upperSymbol),
    ]);

    return NextResponse.json({
      symbol: upperSymbol,
      profile,
      metrics,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    console.error('Error fetching fundamentals:', errorMessage);
    return NextResponse.json(
      {
        error: 'Failed to fetch fundamentals',
        details: errorMessage,
        provider: getApiProvider(),
      },
      { status: 500 }
    );
  }
}
