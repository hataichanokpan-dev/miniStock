/**
 * API Route: Market indices
 * GET /api/market/indices
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQuotes } from '@/lib/api/quotes';
import { validateApiKey } from '@/lib/api/stock-api';

// Default market indices to track
const DEFAULT_INDICES = [
  { symbol: '^GSPC', name: 'S&P 500' }, // US
  { symbol: '^DJI', name: 'Dow Jones' }, // US
  { symbol: '^IXIC', name: 'NASDAQ' }, // US
  { symbol: '^SET.BK', name: 'SET Index' }, // Thailand
];

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
    const symbolsParam = searchParams.get('symbols');

    let symbols = DEFAULT_INDICES.map((i) => i.symbol);

    if (symbolsParam) {
      symbols = symbolsParam.split(',').map((s) => s.trim());
    }

    const quotes = await getQuotes(symbols);

    const indices = quotes.map((quote, index) => ({
      symbol: quote.symbol,
      name: DEFAULT_INDICES[index]?.name || quote.symbol,
      value: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      high: quote.high,
      low: quote.low,
      volume: quote.volume,
      timestamp: quote.timestamp,
    }));

    return NextResponse.json(indices);
  } catch (error) {
    console.error('Error fetching market indices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market indices', details: (error as Error).message },
      { status: 500 }
    );
  }
}
