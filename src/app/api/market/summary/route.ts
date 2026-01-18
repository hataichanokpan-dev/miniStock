/**
 * API Route: Market Summary
 * GET /api/market/summary
 */

import { NextRequest, NextResponse } from 'next/server';

interface MarketSummary {
  totalVolume: number;
  totalVolumeChange: number;
  advancing: number;
  declining: number;
  unchanged: number;
  totalStocks: number;
  newHighs: number;
  newLows: number;
}

// MVP: Mock market summary data
const MOCK_MARKET_SUMMARY: MarketSummary = {
  totalVolume: 89200000000, // ฿89.2B
  totalVolumeChange: 12.5, // +12.5% from yesterday
  advancing: 847,
  declining: 523,
  unchanged: 156,
  totalStocks: 1526,
  newHighs: 42,
  newLows: 18,
};

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      ...MOCK_MARKET_SUMMARY,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching market summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market summary', details: (error as Error).message },
      { status: 500 }
    );
  }
}
