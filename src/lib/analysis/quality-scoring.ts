/**
 * Quality Scoring System
 * Phase 2: Analysis Systems
 *
 * Quality metrics including margins, FCF conversion, Altman Z-Score
 */

import type { FinancialMetrics, AnnualData } from '@/types/financials';
import type { QualityMetrics } from '@/types/analysis';
import { calculateAltmanZScore } from './spea';

export interface QualityInput {
  financialMetrics: FinancialMetrics;
  annualData: AnnualData[];
}

/**
 * Calculate quality metrics
 */
export function calculateQualityMetrics(input: QualityInput): QualityMetrics {
  const grossMargin = calculateGrossMargin(input);
  const operatingMargin = calculateOperatingMargin(input);
  const fcfConversionRatio = calculateFCFConversionRatio(input);
  const altmanZScore = calculateAltmanZScore(input.financialMetrics, input.annualData);

  return {
    grossMargin,
    operatingMargin,
    fcfConversionRatio,
    altmanZScore,
  };
}

/**
 * Calculate Gross Margin
 * (Revenue - COGS) / Revenue
 * Using profit margin as proxy if gross margin not available
 */
export function calculateGrossMargin(input: QualityInput): number {
  const { financialMetrics } = input;

  // Using profit margin as proxy
  // In a full implementation, this would use actual COGS data
  const grossMargin = financialMetrics.profitMargin * 1.5; // Approximate conversion

  return Math.min(100, Math.max(0, grossMargin));
}

/**
 * Calculate Operating Margin
 * Operating Income / Revenue
 */
export function calculateOperatingMargin(input: QualityInput): number {
  const { financialMetrics } = input;

  // Using profit margin as proxy
  // In a full implementation, this would use actual operating income data
  const operatingMargin = financialMetrics.profitMargin * 1.2;

  return Math.min(100, Math.max(0, operatingMargin));
}

/**
 * Calculate FCF Conversion Ratio
 * Free Cash Flow / Net Income
 * Measures quality of earnings
 */
export function calculateFCFConversionRatio(input: QualityInput): number {
  const { financialMetrics, annualData } = input;

  const netIncome = financialMetrics.netIncome || 0;
  const freeCashFlow = financialMetrics.freeCashFlow || 0;

  if (netIncome <= 0) return 0;

  const ratio = freeCashFlow / netIncome;

  return ratio;
}

/**
 * Get margin rating
 */
export function getMarginRating(margin: number): string {
  if (margin >= 50) return 'Exceptional';
  if (margin >= 40) return 'Excellent';
  if (margin >= 30) return 'Very Good';
  if (margin >= 20) return 'Good';
  if (margin >= 10) return 'Fair';
  return 'Poor';
}

/**
 * Get FCF conversion rating
 */
export function getFCFConversionRating(ratio: number): string {
  if (ratio >= 1.3) return 'Excellent';
  if (ratio >= 1.1) return 'Very Good';
  if (ratio >= 0.9) return 'Good';
  if (ratio >= 0.7) return 'Fair';
  return 'Poor';
}

/**
 * Calculate overall quality score (0-100)
 */
export function calculateQualityScore(input: QualityInput): number {
  const metrics = calculateQualityMetrics(input);

  let score = 0;

  // Gross margin scoring
  if (metrics.grossMargin >= 50) score += 25;
  else if (metrics.grossMargin >= 40) score += 20;
  else if (metrics.grossMargin >= 30) score += 15;
  else if (metrics.grossMargin >= 20) score += 10;
  else if (metrics.grossMargin >= 10) score += 5;

  // Operating margin scoring
  if (metrics.operatingMargin >= 30) score += 25;
  else if (metrics.operatingMargin >= 20) score += 20;
  else if (metrics.operatingMargin >= 15) score += 15;
  else if (metrics.operatingMargin >= 10) score += 10;
  else if (metrics.operatingMargin >= 5) score += 5;

  // FCF conversion scoring
  if (metrics.fcfConversionRatio >= 1.2) score += 25;
  else if (metrics.fcfConversionRatio >= 1.0) score += 20;
  else if (metrics.fcfConversionRatio >= 0.8) score += 15;
  else if (metrics.fcfConversionRatio >= 0.6) score += 10;
  else if (metrics.fcfConversionRatio >= 0.4) score += 5;

  // Altman Z-Score scoring
  if (metrics.altmanZScore >= 3.0) score += 25;
  else if (metrics.altmanZScore >= 2.7) score += 20;
  else if (metrics.altmanZScore >= 2.0) score += 15;
  else if (metrics.altmanZScore >= 1.8) score += 5;

  return score;
}

/**
 * Get quality rating
 */
export function getQualityRating(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Very Good';
  if (score >= 45) return 'Good';
  if (score >= 30) return 'Fair';
  return 'Poor';
}
