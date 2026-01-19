/**
 * API Route: Industry Sector Data from Firebase
 * GET /api/settrade/industry-sector
 * GET /api/settrade/industry-sector?date=2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getLatestIndustrySector,
  getIndustrySectorByDate,
} from '@/lib/firebase/settrade';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    const data = date
      ? await getIndustrySectorByDate(date)
      : await getLatestIndustrySector();

    if (!data) {
      return NextResponse.json(
        { error: 'No data found', details: date ? `No data for date: ${date}` : 'No latest data available' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching industry sector data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industry sector data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
