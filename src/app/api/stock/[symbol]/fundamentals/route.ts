/**
 * API Route: Company fundamentals
 * GET /api/stock/[symbol]/fundamentals
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyMetrics, getCompanyProfile } from '@/lib/api/fundamentals';
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
    console.error('Error fetching fundamentals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fundamentals', details: (error as Error).message },
      { status: 500 }
    );
  }
}
