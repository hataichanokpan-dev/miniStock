/**
 * API Route: /api/settrade/top-rankings
 * Returns top stocks by value and volume from Firebase
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLatestTopRankings } from '@/lib/firebase/settrade';

export async function GET(request: NextRequest) {
  try {
    const data = await getLatestTopRankings();

    if (!data) {
      return NextResponse.json(
        { error: 'No top rankings data available' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in /api/settrade/top-rankings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top rankings data' },
      { status: 500 }
    );
  }
}
