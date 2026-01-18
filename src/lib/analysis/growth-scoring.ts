/**
 * Growth Investing Scoring System
 * Phase 2: Analysis Systems
 *
 * Growth metrics including CAGR calculations, ROE trends, consistency scoring
 */

import type { FinancialMetrics, AnnualData } from '@/types/financials';
import type { GrowthMetrics } from '@/types/analysis';

export interface GrowthInput {
  financialMetrics: FinancialMetrics;
  annualData: AnnualData[];
}

/**
 * Calculate growth metrics
 */
export function calculateGrowthMetrics(input: GrowthInput): GrowthMetrics {
  const revenueCagr3y = calculateCAGR(input, 'revenue', 3);
  const revenueCagr5y = calculateCAGR(input, 'revenue', 5);
  const epsCagr3y = calculateCAGR(input, 'eps', 3);
  const epsCagr5y = calculateCAGR(input, 'eps', 5);
  const roeTrend = calculateROETrend(input);
  const consistencyScore = calculateConsistencyScore(input);

  return {
    revenueCagr3y,
    revenueCagr5y,
    epsCagr3y,
    epsCagr5y,
    roeTrend,
    consistencyScore,
  };
}

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 * Formula: (Ending Value / Beginning Value)^(1 / n) - 1
 */
export function calculateCAGR(
  input: GrowthInput,
  metric: 'revenue' | 'eps',
  years: number
): number {
  const { annualData } = input;

  if (!annualData || annualData.length < years) return 0;

  const latest = annualData[0];
  const past = annualData.find((a) => a.fiscalYear === latest.fiscalYear - years);

  if (!past) return 0;

  const startValue = metric === 'revenue' ? past.revenue : past.eps;
  const endValue = metric === 'revenue' ? latest.revenue : latest.eps;

  if (startValue <= 0 || endValue <= 0) return 0;

  const cagr = (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  return cagr;
}

/**
 * Calculate ROE trend
 * Positive if ROE is improving, negative if declining
 */
export function calculateROETrend(input: GrowthInput): number {
  const { financialMetrics, annualData } = input;

  if (!annualData || annualData.length < 2) return 0;

  // Calculate historical ROE values
  const roeValues: number[] = [];

  for (const year of annualData.slice(0, Math.min(5, annualData.length))) {
    const roe = year.equity > 0 ? ((year.netIncome || 0) / year.equity) * 100 : 0;
    roeValues.push(roe);
  }

  if (roeValues.length < 2) return 0;

  // Simple linear regression to determine trend
  const n = roeValues.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = roeValues.reduce((sum, val) => sum + val, 0);
  const sumXY = roeValues.reduce((sum, val, i) => sum + i * val, 0);
  const sumX2 = ((n - 1) * n * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  return slope;
}

/**
 * Calculate consistency score (0-100)
 * Measures how consistent growth has been over the years
 */
export function calculateConsistencyScore(input: GrowthInput): number {
  const { annualData } = input;

  if (!annualData || annualData.length < 3) return 50;

  let score = 0;
  const yearsToCheck = Math.min(5, annualData.length - 1);

  // Check revenue consistency
  let revenueGrowthCount = 0;
  for (let i = 0; i < yearsToCheck; i++) {
    if (annualData[i].revenue > annualData[i + 1].revenue) {
      revenueGrowthCount++;
    }
  }
  const revenueConsistency = (revenueGrowthCount / yearsToCheck) * 50;

  // Check EPS consistency
  let epsGrowthCount = 0;
  for (let i = 0; i < yearsToCheck; i++) {
    if (annualData[i].eps > annualData[i + 1].eps) {
      epsGrowthCount++;
    }
  }
  const epsConsistency = (epsGrowthCount / yearsToCheck) * 50;

  score = revenueConsistency + epsConsistency;

  return Math.round(score);
}

/**
 * Get growth rating based on CAGR
 */
export function getGrowthRating(cagr: number): string {
  if (cagr >= 25) return 'Exceptional';
  if (cagr >= 15) return 'Excellent';
  if (cagr >= 10) return 'Good';
  if (cagr >= 5) return 'Moderate';
  if (cagr > 0) return 'Low';
  return 'Negative';
}

/**
 * Get consistency rating
 */
export function getConsistencyRating(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Very Good';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

/**
 * Get ROE trend rating
 */
export function getROETrendRating(trend: number): string {
  if (trend >= 2) return 'Strong Improvement';
  if (trend >= 0.5) return 'Improving';
  if (trend >= -0.5) return 'Stable';
  if (trend >= -2) return 'Declining';
  return 'Rapid Decline';
}
