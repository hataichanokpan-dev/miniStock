/**
 * Value Investing Scoring System
 * Phase 2: Analysis Systems
 *
 * Value metrics including Graham Number, Piotroski F-Score, Margin of Safety, DCF
 */

import type { FinancialMetrics, AnnualData } from '@/types/financials';
import type { ValueMetrics } from '@/types/analysis';

export interface ValueInput {
  financialMetrics: FinancialMetrics;
  annualData: AnnualData[];
  currentPrice: number;
  bookValuePerShare?: number;
}

/**
 * Calculate value metrics
 */
export function calculateValueMetrics(input: ValueInput): ValueMetrics {
  const grahamNumber = calculateGrahamNumber(input);
  const grahamNumberPrice = input.currentPrice > 0 ? grahamNumber / input.currentPrice : 0;
  const marginOfSafety = calculateMarginOfSafety(input);
  const intrinsicValue = calculateIntrinsicValue(input);
  const piotroskiFScore = calculatePiotroskiFScore(input);

  return {
    grahamNumber,
    grahamNumberPrice,
    marginOfSafety,
    intrinsicValue,
    piotroskiFScore,
  };
}

/**
 * Calculate Graham Number
 * Formula: sqrt(22.5 * EPS * Book Value per Share)
 * Benjamin Graham's formula for finding undervalued stocks
 */
export function calculateGrahamNumber(input: ValueInput): number {
  const { financialMetrics, bookValuePerShare } = input;

  const eps = financialMetrics.eps;
  const bvps = bookValuePerShare ?? (financialMetrics.pbRatio && financialMetrics.peRatio && financialMetrics.eps
    ? (financialMetrics.eps * financialMetrics.peRatio) / financialMetrics.pbRatio
    : null);

  if (!eps || eps <= 0 || !bvps || bvps <= 0) return 0;

  const grahamNumber = Math.sqrt(22.5 * eps * bvps);
  return grahamNumber;
}

/**
 * Calculate Margin of Safety
 * (Intrinsic Value - Current Price) / Current Price
 * Based on DCF intrinsic value
 */
export function calculateMarginOfSafety(input: ValueInput): number {
  const intrinsicValue = calculateIntrinsicValue(input);
  const { currentPrice } = input;

  if (currentPrice <= 0 || intrinsicValue <= 0) return 0;

  const marginOfSafety = ((intrinsicValue - currentPrice) / currentPrice) * 100;
  return marginOfSafety;
}

/**
 * Calculate DCF Intrinsic Value
 * Simplified Discounted Cash Flow model
 */
export function calculateIntrinsicValue(input: ValueInput): number {
  const { financialMetrics, annualData } = input;

  const freeCashFlow = financialMetrics.freeCashFlow;
  if (!freeCashFlow || freeCashFlow <= 0) return 0;

  // Growth assumptions (conservative)
  const growthRate = 0.05; // 5% growth
  const discountRate = 0.10; // 10% WACC
  const terminalGrowthRate = 0.025; // 2.5% terminal growth

  // High growth period (5 years)
  const highGrowthYears = 5;
  let presentValue = 0;

  for (let i = 1; i <= highGrowthYears; i++) {
    const futureFCF = freeCashFlow * Math.pow(1 + growthRate, i);
    const pv = futureFCF / Math.pow(1 + discountRate, i);
    presentValue += pv;
  }

  // Terminal value
  const terminalFCF = freeCashFlow * Math.pow(1 + growthRate, highGrowthYears);
  const terminalValue =
    (terminalFCF * (1 + terminalGrowthRate)) / (discountRate - terminalGrowthRate);
  const pvTerminalValue = terminalValue / Math.pow(1 + discountRate, highGrowthYears);

  presentValue += pvTerminalValue;

  // Estimate shares outstanding
  const peRatio = financialMetrics.peRatio ?? 15;
  const sharesOutstanding =
    financialMetrics.eps && financialMetrics.eps > 0 && financialMetrics.marketCap
      ? financialMetrics.marketCap / (financialMetrics.eps * peRatio)
      : 0;

  if (sharesOutstanding <= 0) return 0;

  const intrinsicValue = presentValue / sharesOutstanding;
  return intrinsicValue;
}

/**
 * Calculate Piotroski F-Score
 * 9-point scoring system for financial strength
 * Scores 0-9, with 9 being the strongest
 */
export function calculatePiotroskiFScore(input: ValueInput): number {
  const { financialMetrics, annualData } = input;
  let score = 0;

  if (!annualData || annualData.length < 2) {
    return 0; // Not enough data
  }

  const latest = annualData[0];
  const previous = annualData[1];

  // Profitability Signals (4 points)

  // F1: Positive net income
  if (latest.netIncome && latest.netIncome > 0) score += 1;

  // F2: Positive cash flow from operations (using free cash flow as proxy)
  if (financialMetrics.freeCashFlow && financialMetrics.freeCashFlow > 0) score += 1;

  // F3: Increasing net income
  if (latest.netIncome && previous.netIncome && latest.netIncome > previous.netIncome) score += 1;

  // F4: ROA higher than cost of capital (10% as benchmark)
  const roa = (latest.netIncome || 0) / (latest.totalAssets || 1);
  if (latest.totalAssets && roa > 0.10) score += 1;

  // Leverage, Liquidity, and Source of Funds (3 points)

  // F5: Lower debt ratio
  const currentDebtRatio = (latest.totalDebt || 0) / (latest.totalAssets || 1);
  const previousDebtRatio = (previous.totalDebt || 0) / (previous.totalAssets || 1);
  if (latest.totalAssets && previous.totalAssets && currentDebtRatio < previousDebtRatio) score += 1;

  // F6: Improved current ratio
  const currentCurrentRatio = latest.totalAssets / (latest.totalLiabilities || 1);
  const previousCurrentRatio = previous.totalAssets / (previous.totalLiabilities || 1);
  if (latest.totalAssets && previous.totalAssets && currentCurrentRatio > previousCurrentRatio) score += 1;

  // F7: No new shares issued
  // This would require share count data, using equity growth as proxy
  if (latest.equity && previous.equity && latest.equity > previous.equity) score += 1;

  // Operating Efficiency (2 points)

  // F8: Improved profit margin
  const latestMargin = latest.revenue && latest.netIncome ? (latest.netIncome / latest.revenue) * 100 : 0;
  const previousMargin = previous.revenue && previous.netIncome ? (previous.netIncome / previous.revenue) * 100 : 0;
  if (latest.revenue && previous.revenue && latestMargin > previousMargin) score += 1;

  // F9: Improved asset turnover
  const latestTurnover = latest.totalAssets && latest.revenue ? latest.revenue / latest.totalAssets : 0;
  const previousTurnover = previous.totalAssets && previous.revenue ? previous.revenue / previous.totalAssets : 0;
  if (latest.totalAssets && previous.totalAssets && latestTurnover > previousTurnover) score += 1;

  return score;
}

/**
 * Get value rating based on Graham Number
 */
export function getValueRating(grahamNumberPrice: number): string {
  if (grahamNumberPrice >= 1.3) return 'Significantly Undervalued';
  if (grahamNumberPrice >= 1.1) return 'Undervalued';
  if (grahamNumberPrice >= 0.9) return 'Fair Value';
  if (grahamNumberPrice >= 0.7) return 'Overvalued';
  return 'Significantly Overvalued';
}

/**
 * Get Piotroski F-Score interpretation
 */
export function getPiotroskiRating(score: number): string {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Fair';
  if (score >= 2) return 'Weak';
  return 'Poor';
}
