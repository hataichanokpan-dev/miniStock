/**
 * API Route: Top Gainers and Losers
 * GET /api/market/top-movers?type=gainers|losers&limit=10
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/api/stock-api';

interface TopMoverStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

// MVP: Mock data for top gainers and losers
// Production: This would fetch real data from the stock API
const MOCK_TOP_GAINERS: TopMoverStock[] = [
  { symbol: 'CPF', name: 'Charoen Pokphand Foods', price: 28.50, change: 1.25, changePercent: 4.59, volume: 12500000 },
  { symbol: 'ADVANC', name: 'Advanced Info Service', price: 245.00, change: 8.50, changePercent: 3.59, volume: 8200000 },
  { symbol: 'KBANK', name: 'Kasikornbank', price: 168.00, change: 5.00, changePercent: 3.07, volume: 15300000 },
  { symbol: 'AOT', name: 'Airports of Thailand', price: 75.00, change: 2.25, changePercent: 3.09, volume: 9800000 },
  { symbol: 'BDMS', name: 'Bangkok Dusit Medical', price: 32.75, change: 0.95, changePercent: 2.99, volume: 6700000 },
  { symbol: 'PTTEP', name: 'PTT Exploration', price: 158.00, change: 4.50, changePercent: 2.93, volume: 11200000 },
  { symbol: 'SCB', name: 'Siam Commercial Bank', price: 138.50, change: 3.75, changePercent: 2.78, volume: 14500000 },
  { symbol: 'TU', name: 'Thai Union Group', price: 14.50, change: 0.38, changePercent: 2.69, volume: 4500000 },
  { symbol: 'CPF', name: 'Central Pattana', price: 62.00, change: 1.60, changePercent: 2.65, volume: 8900000 },
  { symbol: 'MINT', name: 'Minor International', price: 26.75, change: 0.65, changePercent: 2.49, volume: 5200000 },
];

const MOCK_TOP_LOSERS: TopMoverStock[] = [
  { symbol: 'PTT', name: 'PTT Public Company', price: 358.00, change: -12.00, changePercent: -3.24, volume: 18900000 },
  { symbol: 'SCC', name: 'Siam Cement Group', price: 412.00, change: -11.50, changePercent: -2.72, volume: 6500000 },
  { symbol: 'TRUE', name: 'True Corporation', price: 4.85, change: -0.14, changePercent: -2.80, volume: 15800000 },
  { symbol: 'BBL', name: 'Bangkok Bank', price: 128.00, change: -3.50, changePercent: -2.66, volume: 9200000 },
  { symbol: 'EA', name: 'Energy Absolute', price: 4.25, change: -0.11, changePercent: -2.52, volume: 18700000 },
  { symbol: 'BGRIM', name: 'B.Grimm Power', price: 42.50, change: -1.05, changePercent: -2.41, volume: 7800000 },
  { symbol: 'BH', name: 'Bangkok Harbour', price: 3.65, change: -0.09, changePercent: -2.40, volume: 12100000 },
  { symbol: 'IVL', name: 'Indorama Ventures', price: 48.00, change: -1.15, changePercent: -2.34, volume: 6300000 },
  { symbol: 'TPIPL', name: 'TPI Polene', price: 2.95, change: -0.07, changePercent: -2.32, volume: 8400000 },
  { symbol: 'SUPER', name: 'Super Energy', price: 6.50, change: -0.15, changePercent: -2.26, volume: 9600000 },
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
    const type = searchParams.get('type') || 'gainers';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Select the appropriate data based on type
    const data = type === 'losers' ? MOCK_TOP_LOSERS : MOCK_TOP_GAINERS;

    // Limit results
    const results = data.slice(0, Math.min(limit, data.length));

    return NextResponse.json({
      type,
      results,
      count: results.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching top movers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top movers', details: (error as Error).message },
      { status: 500 }
    );
  }
}
