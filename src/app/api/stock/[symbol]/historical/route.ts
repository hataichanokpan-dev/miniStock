import { NextRequest, NextResponse } from 'next/server';
import { getHistoricalPricesYahoo } from '@/lib/api/yahoo-finance';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') as any) || '1y';

    const historical = await getHistoricalPricesYahoo(symbol.toUpperCase(), period);

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      period,
      data: historical,
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data', details: (error as Error).message },
      { status: 500 }
    );
  }
}
