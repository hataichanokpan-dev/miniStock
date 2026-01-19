/**
 * API Route: Investor Type Historical Data
 * GET /api/settrade/investor-history?days=28
 *
 * Returns historical investor type data for trend analysis over the last N days.
 * Default: 28 days (4 weeks)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getInvestorTypeHistory } from '@/lib/firebase/settrade';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 28;

    // Validate days parameter (max 90 days)
    if (days < 1 || days > 90) {
      return NextResponse.json(
        { error: 'Invalid days parameter', details: 'Days must be between 1 and 90' },
        { status: 400 }
      );
    }

    const data = await getInvestorTypeHistory(days);

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No data found', details: 'No historical investor type data available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      period: {
        startDate: data[0]?.date,
        endDate: data[data.length - 1]?.date,
        days: data.length,
      },
      data,
    });
  } catch (error) {
    console.error('Error fetching investor type history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch investor type history', details: (error as Error).message },
      { status: 500 }
    );
  }
}
