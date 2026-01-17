/**
 * API Route: Stock scanner
 * GET /api/market/scanner
 * Query params:
 * - marketCap: micro, small, mid, large, mega
 * - sector: technology, healthcare, finance, etc.
 * - minPE, maxPE: P/E ratio range
 * - minDiv, maxDiv: Dividend yield range
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api/stock-api';

// MVP: Placeholder screener data
// Production: This would query actual database or API screener endpoint

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    if (!validateApiKey()) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const marketCap = searchParams.get('marketCap');
    const sector = searchParams.get('sector');
    const minPE = searchParams.get('minPE');
    const maxPE = searchParams.get('maxPE');

    // MVP: Return placeholder screener results
    // In production, this would use Financial Modeling Prep's screener API
    const results = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 178.50,
        changePercent: 1.25,
        marketCap: 2800000000000,
        peRatio: 28.5,
        volume: 52000000,
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 378.90,
        changePercent: 0.95,
        marketCap: 2750000000000,
        peRatio: 35.2,
        volume: 22000000,
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 141.80,
        changePercent: -0.45,
        marketCap: 1780000000000,
        peRatio: 25.1,
        volume: 18000000,
      },
    ];

    // Apply basic filters (MVP implementation)
    let filtered = results;

    if (minPE) {
      filtered = filtered.filter((r) => r.peRatio >= parseFloat(minPE));
    }
    if (maxPE) {
      filtered = filtered.filter((r) => r.peRatio <= parseFloat(maxPE));
    }

    return NextResponse.json({
      results: filtered,
      total: filtered.length,
      filters: {
        marketCap,
        sector,
        minPE,
        maxPE,
      },
    });
  } catch (error) {
    console.error('Error running scanner:', error);
    return NextResponse.json(
      { error: 'Failed to run scanner', details: (error as Error).message },
      { status: 500 }
    );
  }
}
