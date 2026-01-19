/**
 * SPEA Analysis System
 * Phase 2: Analysis Systems
 *
 * SPEA Framework: Strategic Position, Financial Health, Earnings Quality, Attractive Valuation
 */

import type { FinancialMetrics, AnnualData } from '@/types/financials';
import type { SpeaScore } from '@/types/analysis';

export interface SpeaInput {
  financialMetrics: FinancialMetrics;
  annualData: AnnualData[];
  industry: string;
  sector: string;
  currentPrice: number;
  industryAvgPE?: number;
  industryAvgPB?: number;
  historicalAvgPE?: number;
  historicalAvgPB?: number;
  wacc?: number; // Weighted Average Cost of Capital for DCF
  growthRate?: number; // Expected growth rate for DCF
}

/**
 * Calculate SPEA score (0-100)
 */
export function calculateSpeaScore(input: SpeaInput): SpeaScore {
  const strategicPosition = scoreStrategicPosition(input);
  const financialHealth = scoreFinancialHealth(input);
  const earningsQuality = scoreEarningsQuality(input);
  const attractiveValuation = scoreAttractiveValuation(input);

  // Calculate weighted total score
  const totalScore =
    strategicPosition * 0.25 +
    financialHealth * 0.30 +
    earningsQuality * 0.25 +
    attractiveValuation * 0.20;

  const valuation = determineValuation(input);

  return {
    totalScore: Math.round(totalScore),
    strategicPosition,
    financialHealth,
    earningsQuality,
    attractiveValuation,
    valuation,
    lastUpdate: Date.now(),
  };
}

/**
 * Strategic Position (25% weight)
 * Industry position, competitive advantage, brand strength
 */
function scoreStrategicPosition(input: SpeaInput): number {
  const { financialMetrics, industry } = input;
  let score = 0;

  const roe = financialMetrics.roe ?? 0;
  const profitMargin = financialMetrics.profitMargin ?? 0;
  const marketCap = financialMetrics.marketCap ?? 0;

  // ROE as proxy for competitive position
  if (roe >= 25) score += 40;
  else if (roe >= 20) score += 35;
  else if (roe >= 15) score += 25;
  else if (roe >= 10) score += 15;
  else if (roe > 0) score += 5;

  // Profit margin as proxy for competitive advantage
  if (profitMargin >= 25) score += 35;
  else if (profitMargin >= 20) score += 30;
  else if (profitMargin >= 15) score += 20;
  else if (profitMargin >= 10) score += 10;
  else if (profitMargin >= 5) score += 5;

  // Market cap as proxy for market position
  if (marketCap >= 50e9) score += 25;
  else if (marketCap >= 10e9) score += 20;
  else if (marketCap >= 1e9) score += 15;
  else if (marketCap >= 500e6) score += 10;

  return Math.min(100, score);
}

/**
 * Financial Health (30% weight)
 * Debt ratios, liquidity, Altman Z-Score
 */
function scoreFinancialHealth(input: SpeaInput): number {
  const { financialMetrics, annualData } = input;
  let score = 0;

  const deRatio = financialMetrics.deRatio ?? 0;
  const profitMargin = financialMetrics.profitMargin ?? 0;

  // Debt-to-Equity ratio (lower is generally better)
  const de = deRatio;
  if (de >= 0 && de <= 0.5) score += 30;
  else if (de > 0.5 && de <= 1.0) score += 25;
  else if (de > 1.0 && de <= 1.5) score += 15;
  else if (de > 1.5 && de <= 2.0) score += 5;

  // Current ratio approximation (using balance sheet data if available)
  if (annualData && annualData.length > 0) {
    const latest = annualData[0];
    const currentRatio = latest.totalAssets / (latest.totalDebt || 1);
    if (currentRatio >= 2.0) score += 25;
    else if (currentRatio >= 1.5) score += 20;
    else if (currentRatio >= 1.0) score += 10;
  }

  // Interest coverage (using profit margin as proxy)
  if (profitMargin >= 20) score += 25;
  else if (profitMargin >= 15) score += 20;
  else if (profitMargin >= 10) score += 10;
  else if (profitMargin >= 5) score += 5;

  // Altman Z-Score calculation
  const altmanZ = calculateAltmanZScore(financialMetrics, annualData);
  if (altmanZ >= 3.0) score += 20;
  else if (altmanZ >= 2.7) score += 15;
  else if (altmanZ >= 1.8) score += 5;

  return Math.min(100, score);
}

/**
 * Earnings Quality (25% weight)
 * Consistency, cash flow vs earnings, accrual ratio
 */
function scoreEarningsQuality(input: SpeaInput): number {
  const { financialMetrics, annualData } = input;
  let score = 0;

  if (!annualData || annualData.length < 3) {
    return 50; // Neutral score if insufficient data
  }

  // Earnings consistency (3-year trend)
  let consistentGrowth = true;
  for (let i = 0; i < Math.min(3, annualData.length - 1); i++) {
    const currentNetIncome = annualData[i].netIncome;
    const nextNetIncome = annualData[i + 1].netIncome;
    if (currentNetIncome != null && nextNetIncome != null && currentNetIncome < nextNetIncome) {
      consistentGrowth = false;
      break;
    }
  }
  if (consistentGrowth) score += 40;

  const netIncome = financialMetrics.netIncome ?? 0;
  const freeCashFlow = financialMetrics.freeCashFlow ?? 0;
  const epsGrowth = financialMetrics.epsGrowth ?? 0;

  // Free Cash Flow quality
  const fcfToNetIncome = netIncome > 0 ? freeCashFlow / netIncome : 0;

  if (fcfToNetIncome >= 1.2) score += 35;
  else if (fcfToNetIncome >= 1.0) score += 30;
  else if (fcfToNetIncome >= 0.8) score += 20;
  else if (fcfToNetIncome >= 0.6) score += 10;

  // EPS growth consistency
  if (epsGrowth >= 20) score += 25;
  else if (epsGrowth >= 15) score += 20;
  else if (epsGrowth >= 10) score += 10;
  else if (epsGrowth >= 5) score += 5;

  return Math.min(100, score);
}

/**
 * Attractive Valuation (20% weight)
 * P/E, P/B ratios, DCF intrinsic value
 */
function scoreAttractiveValuation(input: SpeaInput): number {
  const { financialMetrics, currentPrice, historicalAvgPE, historicalAvgPB, wacc, growthRate } = input;
  let score = 0;

  const peRatio = financialMetrics.peRatio ?? 0;
  const pbRatio = financialMetrics.pbRatio ?? 0;

  // P/E vs historical average
  const pe = peRatio;
  if (pe > 0 && historicalAvgPE) {
    const peRatio2 = pe / historicalAvgPE;
    if (peRatio2 <= 0.8) score += 30;
    else if (peRatio2 <= 1.0) score += 20;
    else if (peRatio2 <= 1.2) score += 10;
  } else if (pe > 0 && pe <= 15) {
    score += 20;
  } else if (pe > 0 && pe <= 20) {
    score += 10;
  }

  // P/B vs historical average
  const pb = pbRatio;
  if (pb > 0 && historicalAvgPB) {
    const pbRatio2 = pb / historicalAvgPB;
    if (pbRatio2 <= 0.8) score += 25;
    else if (pbRatio2 <= 1.0) score += 15;
    else if (pbRatio2 <= 1.2) score += 5;
  } else if (pb > 0 && pb <= 1.5) {
    score += 15;
  } else if (pb > 0 && pb <= 2.5) {
    score += 5;
  }

  // DCF intrinsic value comparison
  const intrinsicValue = calculateDCFIntrinsicValue(input);
  if (intrinsicValue > 0) {
    const margin = (intrinsicValue - currentPrice) / currentPrice;
    if (margin >= 0.3) score += 45;
    else if (margin >= 0.2) score += 35;
    else if (margin >= 0.1) score += 20;
    else if (margin >= 0) score += 10;
  }

  return Math.min(100, score);
}

/**
 * Determine valuation category
 */
function determineValuation(input: SpeaInput): 'undervalued' | 'fair' | 'overvalued' {
  const attractiveValuation = scoreAttractiveValuation(input);
  if (attractiveValuation >= 70) return 'undervalued';
  if (attractiveValuation >= 40) return 'fair';
  return 'overvalued';
}

/**
 * Calculate Altman Z-Score for bankruptcy risk
 * Z = 1.2X1 + 1.4X2 + 3.3X3 + 0.6X4 + 1.0X5
 */
export function calculateAltmanZScore(
  financialMetrics: FinancialMetrics,
  annualData: AnnualData[] | undefined
): number {
  if (!annualData || annualData.length === 0) return 0;

  const latest = annualData[0];

  // X1 = Working Capital / Total Assets
  const x1 =
    (latest.totalAssets - latest.totalLiabilities) / (latest.totalAssets || 1);

  // X2 = Retained Earnings / Total Assets
  const x2 = (latest.equity ?? 0) / (latest.totalAssets || 1);

  // X3 = EBIT / Total Assets (using Net Income as proxy)
  const x3 = (latest.netIncome ?? 0) / (latest.totalAssets || 1);

  // X4 = Market Value Equity / Total Liabilities
  const x4 =
    (financialMetrics.marketCap ?? 0) / (latest.totalLiabilities || 1);

  // X5 = Sales / Total Assets (using Revenue as proxy)
  const x5 = (latest.revenue ?? 0) / (latest.totalAssets || 1);

  const zScore = 1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 1.0 * x5;

  return zScore;
}

/**
 * Calculate DCF Intrinsic Value
 * Simplified 2-stage DCF model
 */
export function calculateDCFIntrinsicValue(input: SpeaInput): number {
  const { financialMetrics, annualData, wacc = 0.10, growthRate = 0.05 } = input;

  if (!annualData || annualData.length === 0) return 0;

  const freeCashFlow = financialMetrics.freeCashFlow;
  if (!freeCashFlow || freeCashFlow <= 0) return 0;

  // High growth period (5 years)
  const highGrowthYears = 5;
  let presentValue = 0;

  for (let i = 1; i <= highGrowthYears; i++) {
    const futureFCF = freeCashFlow * Math.pow(1 + growthRate, i);
    const pv = futureFCF / Math.pow(1 + wacc, i);
    presentValue += pv;
  }

  // Terminal value using Gordon Growth Model
  const terminalGrowthRate = 0.025; // 2.5% terminal growth
  const terminalFCF = freeCashFlow * Math.pow(1 + growthRate, highGrowthYears);
  const terminalValue =
    (terminalFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
  const pvTerminalValue = terminalValue / Math.pow(1 + wacc, highGrowthYears);

  presentValue += pvTerminalValue;

  // Get shares outstanding (approximate from market cap and price)
  const peRatio = financialMetrics.peRatio ?? 15;
  const eps = financialMetrics.eps;
  const marketCap = financialMetrics.marketCap;

  const sharesOutstanding =
    peRatio > 0 && eps && marketCap
      ? marketCap / (eps * peRatio)
      : 0;

  if (sharesOutstanding <= 0) return 0;

  const intrinsicValue = presentValue / sharesOutstanding;

  return intrinsicValue;
}

/**
 * Get rating label based on score
 */
export function getSpeaRating(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 35) return 'Weak';
  return 'Poor';
}

/**
 * Get color class based on score
 */
export function getSpeaColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 65) return 'text-lime-600';
  if (score >= 50) return 'text-yellow-600';
  if (score >= 35) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get bankruptcy risk level based on Altman Z-Score
 */
export function getBankruptcyRisk(zScore: number): string {
  if (zScore >= 3.0) return 'Safe';
  if (zScore >= 2.7) return 'Low Risk';
  if (zScore >= 1.8) return 'Distress Zone';
  return 'High Risk';
}
