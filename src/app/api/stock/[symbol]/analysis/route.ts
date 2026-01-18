/**
 * API Route: Stock Analysis Scores
 * GET /api/stock/[symbol]/analysis
 *
 * Returns CAN SLIM, SPEA, Value, Growth, and Quality scores
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQuote } from '@/lib/api/quotes';
import { getCompanyMetrics, getCompanyProfile } from '@/lib/api/fundamentals';
import { getFinancialStatements } from '@/lib/api/statements';
import { validateApiKey } from '@/lib/api/stock-api';
import { calculateCanslimScore } from '@/lib/analysis/canslim';
import { calculateSpeaScore } from '@/lib/analysis/spea';
import { calculateValueMetrics } from '@/lib/analysis/value-scoring';
import { calculateGrowthMetrics } from '@/lib/analysis/growth-scoring';
import { calculateQualityMetrics } from '@/lib/analysis/quality-scoring';
import type { AnalysisSummary } from '@/types/analysis';

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

    // Fetch all necessary data
    const [quote, metrics, profile, statements] = await Promise.all([
      getQuote(upperSymbol),
      getCompanyMetrics(upperSymbol),
      getCompanyProfile(upperSymbol),
      getFinancialStatements(upperSymbol),
    ]);

    const annualData = statements.annual || [];
    const quarterlyData = statements.quarterly || [];

    // Calculate CAN SLIM score
    const canslimInput = {
      symbol: upperSymbol,
      currentPrice: quote.regularMarketPrice || 0,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || quote.regularMarketPrice || 0,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || quote.regularMarketPrice || 0,
      marketCap: metrics.marketCap || 0,
      volume: quote.volume || 0,
      avgVolume: quote.averageDailyVolume10Day || quote.volume || 0,
      quarterlyEarnings: quarterlyData,
      annualEarnings: annualData,
      financialMetrics: metrics,
      industry: profile.industry || '',
      sector: profile.sector || '',
      hasRecentNews: false, // Would need news API for this
      institutionalOwnership: undefined, // Would need additional data source
      marketTrend: 'neutral' as const, // Would need market data
    };
    const canslim = calculateCanslimScore(canslimInput);

    // Calculate SPEA score
    const speaInput = {
      financialMetrics: metrics,
      annualData,
      industry: profile.industry || '',
      sector: profile.sector || '',
      currentPrice: quote.regularMarketPrice || 0,
      wacc: 0.10, // 10% discount rate
      growthRate: 0.05, // 5% growth rate
    };
    const spea = calculateSpeaScore(speaInput);

    // Calculate Value metrics
    const valueInput = {
      financialMetrics: metrics,
      annualData,
      currentPrice: quote.regularMarketPrice || 0,
    };
    const valueMetrics = calculateValueMetrics(valueInput);

    // Calculate Growth metrics
    const growthInput = {
      financialMetrics: metrics,
      annualData,
    };
    const growthMetrics = calculateGrowthMetrics(growthInput);

    // Calculate Quality metrics
    const qualityInput = {
      financialMetrics: metrics,
      annualData,
    };
    const qualityMetrics = calculateQualityMetrics(qualityInput);

    // Calculate overall score (weighted average)
    const overallScore =
      canslim.totalScore * 0.35 +
      spea.totalScore * 0.35 +
      growthMetrics.consistencyScore * 0.15 +
      // Using quality as proxy for value + quality
      qualityMetrics.altmanZScore > 2.7 ? 85 * 0.15 : 50 * 0.15;

    const analysis: AnalysisSummary = {
      symbol: upperSymbol,
      canslim,
      spea,
      valueMetrics,
      growthMetrics,
      qualityMetrics,
      overallScore: Math.round(overallScore),
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error calculating analysis:', error);
    return NextResponse.json(
      { error: 'Failed to calculate analysis', details: (error as Error).message },
      { status: 500 }
    );
  }
}
