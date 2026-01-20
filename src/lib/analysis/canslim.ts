/**
 * CAN SLIM Analysis System
 * Phase 2: Analysis Systems
 *
 * CAN SLIM is a growth investing methodology developed by William O'Neil
 * Each letter represents a key factor for identifying winning stocks
 */

import type { FinancialMetrics, QuarterlyData, AnnualData } from '@/types/financials';
import type { CanslimScore } from '@/types/analysis';

export interface CanslimInput {
  symbol: string;
  currentPrice: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  quarterlyEarnings: QuarterlyData[];
  annualEarnings: AnnualData[];
  financialMetrics: FinancialMetrics;
  industry: string;
  sector: string;
  hasRecentNews: boolean;
  institutionalOwnership?: number;
  marketTrend?: 'bull' | 'bear' | 'neutral';
}

/**
 * Calculate CAN SLIM score (0-100)
 */
export function calculateCanslimScore(input: CanslimInput): CanslimScore {
  const currentEarnings = scoreCurrentEarnings(input);
  const annualEarnings = scoreAnnualEarnings(input);
  const newProducts = scoreNewProducts(input);
  const supplyDemand = scoreSupplyDemand(input);
  const leader = scoreLeader(input);
  const institutional = scoreInstitutional(input);
  const marketDirection = scoreMarketDirection(input);

  // Calculate weighted total score
  const totalScore =
    currentEarnings * 0.15 +
    annualEarnings * 0.20 +
    newProducts * 0.10 +
    supplyDemand * 0.10 +
    leader * 0.15 +
    institutional * 0.15 +
    marketDirection * 0.15;

  return {
    totalScore: Math.round(totalScore),
    currentEarnings,
    annualEarnings,
    newProducts,
    supplyDemand,
    leader,
    institutional,
    marketDirection,
    lastUpdate: Date.now(),
  };
}

/**
 * C - Current Quarterly Earnings (15% weight)
 * EPS growth should be > 25% vs same quarter last year
 */
function scoreCurrentEarnings(input: CanslimInput): number {
  const { quarterlyEarnings } = input;

  if (!quarterlyEarnings || quarterlyEarnings.length < 2) {
    return 0;
  }

  // Get most recent quarter
  const latest = quarterlyEarnings[0];
  const previous = quarterlyEarnings.find(
    (q) =>
      q.fiscalYear === latest.fiscalYear - 1 && q.fiscalQuarter === latest.fiscalQuarter
  );

  if (!previous || previous.eps === 0) {
    return 0;
  }

  // Calculate EPS growth
  const epsGrowth = ((latest.eps - previous.eps) / Math.abs(previous.eps)) * 100;

  // Score based on growth percentage
  if (epsGrowth >= 25) return 100;
  if (epsGrowth >= 20) return 85;
  if (epsGrowth >= 15) return 70;
  if (epsGrowth >= 10) return 55;
  if (epsGrowth >= 5) return 40;
  if (epsGrowth > 0) return 25;
  return 0;
}

/**
 * A - Annual Earnings Growth (20% weight)
 * 3-5 year annual EPS growth should be strong and consistent
 */
function scoreAnnualEarnings(input: CanslimInput): number {
  const { annualEarnings } = input;

  if (!annualEarnings || annualEarnings.length < 3) {
    return 0;
  }

  // Calculate 3-year CAGR
  const latest = annualEarnings[0];
  const threeYearAgo = annualEarnings.find((a) => a.fiscalYear === latest.fiscalYear - 3);

  if (!threeYearAgo || threeYearAgo.eps <= 0) {
    return 0;
  }

  const years = 3;
  const cagr = (Math.pow(latest.eps / threeYearAgo.eps, 1 / years) - 1) * 100;

  // Check consistency - earnings should grow each year
  let consistentGrowth = true;
  for (let i = 0; i < annualEarnings.length - 1; i++) {
    if (annualEarnings[i].eps < annualEarnings[i + 1].eps) {
      consistentGrowth = false;
      break;
    }
  }

  // Score based on CAGR and consistency
  let score = 0;
  if (cagr >= 25) score = 100;
  else if (cagr >= 20) score = 90;
  else if (cagr >= 15) score = 80;
  else if (cagr >= 10) score = 65;
  else if (cagr >= 5) score = 50;
  else if (cagr > 0) score = 35;
  else score = 0;

  // Boost for consistency
  if (consistentGrowth && score > 0) {
    score = Math.min(100, score + 10);
  }

  return score;
}

/**
 * N - New Products/Management (10% weight)
 * New products, management changes, or price highs
 */
function scoreNewProducts(input: CanslimInput): number {
  const { hasRecentNews, currentPrice, fiftyTwoWeekHigh } = input;

  let score = 0;

  // Recent news about new products or management (30 points)
  if (hasRecentNews) {
    score += 30;
  }

  // Price proximity to 52-week high (70 points)
  // Stocks near 52-week highs show strength
  const highProximity = (currentPrice / fiftyTwoWeekHigh) * 100;
  if (highProximity >= 95) score += 70;
  else if (highProximity >= 90) score += 60;
  else if (highProximity >= 85) score += 50;
  else if (highProximity >= 80) score += 40;
  else if (highProximity >= 70) score += 25;
  else if (highProximity >= 60) score += 10;

  return Math.min(100, score);
}

/**
 * S - Supply & Demand (10% weight)
 * Market cap, float, and trading volume
 */
function scoreSupplyDemand(input: CanslimInput): number {
  const { marketCap, volume, avgVolume } = input;

  let score = 0;

  // Market cap scoring (smaller caps can grow faster)
  // But too small is risky
  if (marketCap >= 1e9 && marketCap < 10e9) {
    // $1B - $10B: sweet spot for growth
    score += 40;
  } else if (marketCap >= 10e9 && marketCap < 50e9) {
    // $10B - $50B: still good growth potential
    score += 35;
  } else if (marketCap >= 50e9 && marketCap < 100e9) {
    // $50B - $100B: slower growth
    score += 25;
  } else if (marketCap >= 100e9) {
    // Mega caps: limited growth
    score += 15;
  } else {
    // Under $1B: risky
    score += 20;
  }

  // Volume analysis (increasing volume is bullish)
  if (avgVolume > 0) {
    const volumeRatio = volume / avgVolume;
    if (volumeRatio >= 1.5) score += 40; // Strong buying
    else if (volumeRatio >= 1.2) score += 35;
    else if (volumeRatio >= 1.0) score += 30;
    else if (volumeRatio >= 0.8) score += 20;
    else score += 10;
  }

  return Math.min(100, score);
}

/**
 * L - Leader vs Laggard (15% weight)
 * Relative strength vs sector/market
 */
function scoreLeader(input: CanslimInput): number {
  const { financialMetrics, industry, sector } = input;

  // This would ideally compare against industry averages
  // For now, use ROE and profit margin as proxies

  let score = 0;

  const roe = financialMetrics.roe ?? 0;
  const profitMargin = financialMetrics.profitMargin ?? 0;

  // ROE comparison (assuming 15% is good benchmark)
  if (roe >= 20) score += 50;
  else if (roe >= 15) score += 40;
  else if (roe >= 10) score += 30;
  else if (roe >= 5) score += 15;

  // Profit margin comparison
  if (profitMargin >= 20) score += 50;
  else if (profitMargin >= 15) score += 40;
  else if (profitMargin >= 10) score += 30;
  else if (profitMargin >= 5) score += 15;

  return Math.min(100, score);
}

/**
 * I - Institutional Sponsorship (15% weight)
 * Institutional ownership trends
 */
function scoreInstitutional(input: CanslimInput): number {
  const { institutionalOwnership } = input;

  // If no data, give neutral score
  if (institutionalOwnership === undefined) {
    return 50;
  }

  // Optimal institutional ownership: 40-80%
  // Too low: no smart money interest
  // Too high: everyone already owns it
  if (institutionalOwnership >= 40 && institutionalOwnership <= 80) {
    return 100;
  } else if (institutionalOwnership >= 30 && institutionalOwnership < 40) {
    return 85;
  } else if (institutionalOwnership >= 80 && institutionalOwnership <= 90) {
    return 80;
  } else if (institutionalOwnership >= 20 && institutionalOwnership < 30) {
    return 60;
  } else if (institutionalOwnership > 90) {
    return 40; // Too saturated
  } else {
    return 30; // Too low
  }
}

/**
 * M - Market Direction (15% weight)
 * Overall market trend confirmation
 */
function scoreMarketDirection(input: CanslimInput): number {
  const { marketTrend } = input;

  // In a real implementation, this would use market indices
  // For now, use the provided market trend
  switch (marketTrend) {
    case 'bull':
      return 100;
    case 'neutral':
      return 50;
    case 'bear':
      return 10;
    default:
      return 50;
  }
}

/**
 * Get rating label based on score
 */
export function getCanslimRating(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 35) return 'Weak';
  return 'Poor';
}

/**
 * Get color class based on score
 */
export function getCanslimColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 65) return 'text-lime-600';
  if (score >= 50) return 'text-yellow-600';
  if (score >= 35) return 'text-orange-600';
  return 'text-red-600';
}
