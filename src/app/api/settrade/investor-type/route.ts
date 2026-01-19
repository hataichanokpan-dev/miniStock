/**
 * API Route: Investor Type Data from Firebase
 * GET /api/settrade/investor-type
 * GET /api/settrade/investor-type?date=2026-01-19
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getLatestInvestorType,
  getInvestorTypeByDate,
} from '@/lib/firebase/settrade';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');

    const data = date
      ? await getInvestorTypeByDate(date)
      : await getLatestInvestorType();

    if (!data) {
      return NextResponse.json(
        { error: 'No data found', details: date ? `No data for date: ${date}` : 'No latest data available' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching investor type data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investor type data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
