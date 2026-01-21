/**
 * Valuation Scorer - Q3: "Is it EXPENSIVE?"
 *
 * Phase 1.4: Valuation scorer module
 *
 * Evaluates valuation using 4 weighted metrics (inverse scoring):
 * - Intrinsic Value (35%): Price vs calculated intrinsic value (DCF-based)
 * - P/E Ratio (25%): Current vs historical average
 * - P/B Ratio (20%): Current vs historical average
 * - Margin of Safety (20%): Downside protection percentage
 *
 * SCORING LOGIC (Inverse):
 * - High score (80-100) = Undervalued (attractive)
 * - Medium score (40-79) = Fair Value
 * - Low score (0-39) = Overvalued (expensive)
 *
 * All functions are pure and deterministic for testing.
 */

import type { DecisionInput, ValuationAnswer } from '@/types/decision';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Metric weights - must sum to 1.0
 */
const WEIGHTS = {
  intrinsicValue: 0.35,
  peRatio: 0.25,
  pbRatio: 0.20,
  marginOfSafety: 0.20,
} as const;

/**
 * Status thresholds based on score (0-100)
 *
 * Note: Inverse logic - high score = undervalued (good)
 */
const STATUS_THRESHOLDS = {
  Undervalued: 80,
  FairValue: 40,
  Overvalued: 0,
} as const;

/**
 * Default P/E thresholds for absolute valuation when no historical data available
 */
const DEFAULT_PE_THRESHOLDS = {
  undervalued: 12, // P/E below 12 = potentially undervalued
  overvalued: 25, // P/E above 25 = potentially overvalued
} as const;

/**
 * Default P/B thresholds for absolute valuation when no historical data available
 */
const DEFAULT_PB_THRESHOLDS = {
  undervalued: 1.0, // P/B below 1.0 = potentially undervalued
  overvalued: 3.0, // P/B above 3.0 = potentially overvalued
} as const;

// ============================================================================
// METRIC EXTRACTION
// ============================================================================

/**
 * Extract metric value from fundamentals or quote, handling missing/null values.
 * Searches multiple possible key names for flexibility.
 */
function extractMetric(
  fundamentals: Record<string, number | string | null> | undefined,
  keys: string[]
): number | null {
  if (!fundamentals) return null;

  for (const key of keys) {
    const value = fundamentals[key];
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
  }
  return null;
}

/**
 * Extract current price from quote, handling edge cases.
 */
function extractPrice(quote: DecisionInput['quote']): number | null {
  const price = quote?.price;
  if (typeof price !== 'number' || isNaN(price) || price <= 0) {
    return null;
  }
  return price;
}

/**
 * Validate if a number is a valid positive metric (for valuation ratios).
 */
function isValidPositiveMetric(value: number | null): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Extract all valuation metrics from DecisionInput.
 */
function extractMetrics(input: DecisionInput) {
  const { fundamentals, quote } = input;

  // Extract intrinsic value, treating negative values as null
  const intrinsicValueRaw = extractMetric(fundamentals, [
    'intrinsicValue',
    'fairValue',
    'dcfValue',
  ]);
  const intrinsicValue =
    intrinsicValueRaw !== null && intrinsicValueRaw > 0
      ? intrinsicValueRaw
      : null;

  return {
    // From quote
    currentPrice: extractPrice(quote),

    // From fundamentals
    intrinsicValue,
    peRatio: extractMetric(fundamentals, [
      'peRatio',
      'trailingPE',
      'forwardPE',
      'pe',
      'priceToEarnings',
    ]),
    pbRatio: extractMetric(fundamentals, [
      'pbRatio',
      'pb',
      'priceToBook',
      'priceToBookRatio',
    ]),
    peHistoricalAvg: extractMetric(fundamentals, [
      'peHistoricalAvg',
      'pe5yAvg',
      'peHistorical',
      'peHistorical5y',
    ]),
    pbHistoricalAvg: extractMetric(fundamentals, [
      'pbHistoricalAvg',
      'pb5yAvg',
      'pbHistorical',
      'pbHistorical5y',
    ]),
  };
}

// ============================================================================
// DERIVED METRICS
// ============================================================================

/**
 * Calculate margin of safety from intrinsic value and current price.
 *
 * Formula: (intrinsicValue - currentPrice) / currentPrice × 100
 * Positive = undervalued (good), Negative = overvalued (bad)
 */
function calculateMarginOfSafety(
  intrinsicValue: number | null,
  currentPrice: number | null
): number | null {
  if (intrinsicValue === null || currentPrice === null || currentPrice === 0) {
    return null;
  }
  return ((intrinsicValue - currentPrice) / currentPrice) * 100;
}

/**
 * Calculate P/E vs historical as percentage difference.
 *
 * Formula: (currentPE / historicalPE) - 1
 * Negative = below historical (undervalued), Positive = above historical (overvalued)
 */
function calculatePeVsHistorical(
  peRatio: number | null,
  peHistoricalAvg: number | null
): number | null {
  if (peRatio === null || peHistoricalAvg === null || peHistoricalAvg === 0) {
    return null;
  }
  return peRatio / peHistoricalAvg - 1;
}

/**
 * Calculate P/B vs historical as percentage difference.
 */
function calculatePbVsHistorical(
  pbRatio: number | null,
  pbHistoricalAvg: number | null
): number | null {
  if (pbRatio === null || pbHistoricalAvg === null || pbHistoricalAvg === 0) {
    return null;
  }
  return pbRatio / pbHistoricalAvg - 1;
}

/**
 * Upside potential is the same as margin of safety.
 */
function calculateUpsidePotential(marginOfSafety: number | null): number {
  return marginOfSafety ?? 0;
}

// ============================================================================
// NORMALIZATION (Inverse Scoring)
// ============================================================================

/**
 * Normalize intrinsic value comparison to 0-100 scale.
 *
 * Price-to-Intrinsic ratio: price / intrinsicValue
 * - Ratio < 1 = undervalued (good, high score)
 * - Ratio = 1 = fair value (medium score)
 * - Ratio > 1 = overvalued (bad, low score)
 *
 * Score mapping:
 * - Ratio 0.5 (50% undervalued) → 100 score
 * - Ratio 1.0 (fair value) → 50 score
 * - Ratio 2.0 (100% overvalued) → 0 score
 */
function normalizeIntrinsicValue(
  currentPrice: number | null,
  intrinsicValue: number | null
): number {
  if (currentPrice === null || intrinsicValue === null || intrinsicValue <= 0) {
    return 50; // Neutral if cannot compare
  }

  const ratio = currentPrice / intrinsicValue;

  // Clamp ratio to reasonable bounds [0.25, 3.0]
  const clampedRatio = Math.max(0.25, Math.min(3.0, ratio));

  // Map: 0.25 → 100, 0.5 → 83, 1.0 → 50, 2.0 → 17, 3.0 → 0
  // Formula: score = 100 - ((ratio - 0.25) / 2.75) * 100
  const score = 100 - ((clampedRatio - 0.25) / 2.75) * 100;

  return Math.max(0, Math.min(100, score));
}

/**
 * Normalize P/E ratio to 0-100 scale (inverse scoring).
 *
 * When historical data available:
 * - P/E 50% below historical = 100 score (undervalued)
 * - P/E at historical = 50 score (fair)
 * - P/E 100% above historical = 0 score (overvalued)
 *
 * When no historical data (fallback):
 * - P/E ≤ 12 = 100 score (undervalued)
 * - P/E 12-25 = linear scale
 * - P/E ≥ 25 = 0 score (overvalued)
 */
function normalizePeRatio(
  peRatio: number | null,
  peHistoricalAvg: number | null
): number {
  if (peRatio === null || peRatio <= 0) {
    return 50; // Neutral if P/E invalid
  }

  // If we have historical data, compare to it
  if (peHistoricalAvg !== null && peHistoricalAvg > 0) {
    const ratio = peRatio / peHistoricalAvg;

    // Clamp to [0.5, 2.0] range
    const clampedRatio = Math.max(0.5, Math.min(2.0, ratio));

    // Below historical = good (high score), above = bad (low score)
    // 0.5x historical → 100 score, 1.0x → 50 score, 2.0x → 0 score
    const score = 100 - ((clampedRatio - 0.5) / 1.5) * 100;
    return Math.max(0, Math.min(100, score));
  }

  // Fallback: Use absolute thresholds
  if (peRatio <= DEFAULT_PE_THRESHOLDS.undervalued) {
    return 100;
  }
  if (peRatio >= DEFAULT_PE_THRESHOLDS.overvalued) {
    return 0;
  }
  // Linear between 12 and 25
  const score = 100 - ((peRatio - DEFAULT_PE_THRESHOLDS.undervalued) /
    (DEFAULT_PE_THRESHOLDS.overvalued - DEFAULT_PE_THRESHOLDS.undervalued)) * 100;
  return Math.max(0, Math.min(100, score));
}

/**
 * Normalize P/B ratio to 0-100 scale (inverse scoring).
 *
 * Similar logic to P/E, with fallback to absolute thresholds.
 */
function normalizePbRatio(
  pbRatio: number | null,
  pbHistoricalAvg: number | null
): number {
  if (pbRatio === null || pbRatio <= 0) {
    return 50; // Neutral if P/B invalid
  }

  // If we have historical data, compare to it
  if (pbHistoricalAvg !== null && pbHistoricalAvg > 0) {
    const ratio = pbRatio / pbHistoricalAvg;

    // Clamp to [0.5, 2.0] range
    const clampedRatio = Math.max(0.5, Math.min(2.0, ratio));

    // Below historical = good (high score), above = bad (low score)
    const score = 100 - ((clampedRatio - 0.5) / 1.5) * 100;
    return Math.max(0, Math.min(100, score));
  }

  // Fallback: Use absolute thresholds
  if (pbRatio <= DEFAULT_PB_THRESHOLDS.undervalued) {
    return 100;
  }
  if (pbRatio >= DEFAULT_PB_THRESHOLDS.overvalued) {
    return 0;
  }
  // Linear between 1.0 and 3.0
  const score = 100 - ((pbRatio - DEFAULT_PB_THRESHOLDS.undervalued) /
    (DEFAULT_PB_THRESHOLDS.overvalued - DEFAULT_PB_THRESHOLDS.undervalued)) * 100;
  return Math.max(0, Math.min(100, score));
}

/**
 * Normalize margin of safety to 0-100 scale.
 *
 * Positive MoS = undervalued (good, high score)
 * Zero MoS = fair value (medium score)
 * Negative MoS = overvalued (bad, low score)
 *
 * Scale:
 * - MoS ≥ +50% → 100 score (deep value)
 * - MoS = 0% → 50 score (fair)
 * - MoS ≤ -50% → 0 score (significantly overvalued)
 */
function normalizeMarginOfSafety(marginOfSafety: number | null): number {
  if (marginOfSafety === null) {
    return 50; // Neutral if unknown
  }

  // Clamp to [-50%, +50%] range
  const clampedMos = Math.max(-50, Math.min(50, marginOfSafety));

  // Map: -50 → 0, 0 → 50, +50 → 100
  const score = ((clampedMos + 50) / 100) * 100;

  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// STATUS CALCULATION
// ============================================================================

/**
 * Calculate status from score (inverse logic).
 *
 * High score = undervalued (good), Low score = overvalued (bad)
 */
function calculateStatus(score: number): ValuationAnswer['status'] {
  if (score >= STATUS_THRESHOLDS.Undervalued) return 'Undervalued';
  if (score >= STATUS_THRESHOLDS.FairValue) return 'Fair Value';
  return 'Overvalued';
}

// ============================================================================
// KEY POINTS GENERATION
// ============================================================================

/**
 * Generate key insights based on metric values.
 */
function generateKeyPoints(
  metrics: ReturnType<typeof extractMetrics>,
  derived: {
    marginOfSafety: number | null;
    peVsHistorical: number | null;
    pbVsHistorical: number | null;
  },
  missingMetrics: string[]
): string[] {
  const points: string[] = [];

  // Margin of safety insights
  if (derived.marginOfSafety !== null) {
    if (derived.marginOfSafety >= 30) {
      points.push(
        `Significant margin of safety (${derived.marginOfSafety.toFixed(1)}%) provides substantial downside protection.`
      );
    } else if (derived.marginOfSafety >= 10) {
      points.push(
        `Moderate margin of safety (${derived.marginOfSafety.toFixed(1)}%) offers reasonable downside protection.`
      );
    } else if (derived.marginOfSafety >= 0) {
      points.push(
        `Minimal margin of safety (${derived.marginOfSafety.toFixed(1)}%) suggests limited upside.`
      );
    } else {
      points.push(
        `Negative margin of safety (${derived.marginOfSafety.toFixed(1)}%) indicates overvaluation risk.`
      );
    }
  }

  // Intrinsic value insights
  if (metrics.intrinsicValue !== null && metrics.currentPrice !== null) {
    const pctDiff = ((metrics.intrinsicValue - metrics.currentPrice) / metrics.currentPrice) * 100;
    if (pctDiff >= 30) {
      points.push(
        `Trading ${pctDiff.toFixed(1)}% below calculated intrinsic value indicates significant undervaluation.`
      );
    } else if (pctDiff >= 10) {
      points.push(
        `Trading ${pctDiff.toFixed(1)}% below intrinsic value suggests modest undervaluation.`
      );
    } else if (pctDiff >= -10) {
      points.push(
        `Current price is near calculated intrinsic value (${pctDiff >= 0 ? '+' : ''}${pctDiff.toFixed(1)}% difference).`
      );
    } else {
      points.push(
        `Trading ${Math.abs(pctDiff).toFixed(1)}% above intrinsic value suggests overvaluation.`
      );
    }
  }

  // P/E insights
  if (metrics.peRatio !== null) {
    if (derived.peVsHistorical !== null) {
      const pctVsHist = derived.peVsHistorical * 100;
      if (pctVsHist <= -20) {
        points.push(
          `P/E ratio (${metrics.peRatio.toFixed(1)}) is ${Math.abs(pctVsHist).toFixed(1)}% below historical average - attractive.`
        );
      } else if (pctVsHist <= 10) {
        points.push(
          `P/E ratio (${metrics.peRatio.toFixed(1)}) is near historical average (${pctVsHist >= 0 ? '+' : ''}${pctVsHist.toFixed(1)}%).`
        );
      } else {
        points.push(
          `P/E ratio (${metrics.peRatio.toFixed(1)}) is ${pctVsHist.toFixed(1)}% above historical average - expensive.`
        );
      }
    } else {
      // No historical data, use absolute assessment
      if (metrics.peRatio <= DEFAULT_PE_THRESHOLDS.undervalued) {
        points.push(
          `Low P/E ratio (${metrics.peRatio.toFixed(1)}) suggests potential undervaluation.`
        );
      } else if (metrics.peRatio >= DEFAULT_PE_THRESHOLDS.overvalued) {
        points.push(
          `High P/E ratio (${metrics.peRatio.toFixed(1)}) suggests potential overvaluation.`
        );
      } else {
        points.push(
          `P/E ratio (${metrics.peRatio.toFixed(1)}) is within normal range.`
        );
      }
    }
  }

  // P/B insights
  if (metrics.pbRatio !== null) {
    if (derived.pbVsHistorical !== null) {
      const pctVsHist = derived.pbVsHistorical * 100;
      if (pctVsHist <= -20) {
        points.push(
          `P/B ratio is ${Math.abs(pctVsHist).toFixed(1)}% below historical average - attractive.`
        );
      } else if (pctVsHist <= 10) {
        points.push(
          `P/B ratio is near historical average (${pctVsHist >= 0 ? '+' : ''}${pctVsHist.toFixed(1)}%).`
        );
      } else {
        points.push(
          `P/B ratio is ${pctVsHist.toFixed(1)}% above historical average - expensive.`
        );
      }
    } else {
      // No historical data, use absolute assessment
      if (metrics.pbRatio <= DEFAULT_PB_THRESHOLDS.undervalued) {
        points.push(
          `Low P/B ratio (${metrics.pbRatio.toFixed(2)}) suggests potential undervaluation.`
        );
      } else if (metrics.pbRatio >= DEFAULT_PB_THRESHOLDS.overvalued) {
        points.push(
          `High P/B ratio (${metrics.pbRatio.toFixed(2)}) suggests potential overvaluation.`
        );
      }
    }
  }

  // Missing data warnings
  if (missingMetrics.length > 0) {
    const missingList = missingMetrics.join(', ');
    points.push(`Limited data: ${missingList} not available`);
  }

  // Ensure we have 3-6 points
  return points.slice(0, 6);
}

/**
 * Generate summary sentence.
 */
function generateSummary(
  status: ValuationAnswer['status'],
  score: number,
  marginOfSafety: number | null,
  missingMetrics: string[]
): string {
  const dataQual = missingMetrics.length === 0 ? 'comprehensive data' : 'available data';
  const mosMsg =
    marginOfSafety !== null
      ? `Margin of safety of ${marginOfSafety >= 0 ? '+' : ''}${marginOfSafety.toFixed(1)}%.`
      : 'Unable to calculate margin of safety.';
  return `${status} (${score}/100) based on ${dataQual}. ${mosMsg}`;
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Compute valuation answer from decision input.
 *
 * @param input - Decision data with quote and fundamentals
 * @returns ValuationAnswer with score, status, margin of safety, key points, metrics, and summary
 *
 * @example
 * ```ts
 * const answer = computeValuationAnswer({
 *   quote: { price: 150 },
 *   fundamentals: { intrinsicValue: 180, peRatio: 16, pbRatio: 2.2 }
 * });
 * ```
 */
export function computeValuationAnswer(input: DecisionInput): ValuationAnswer {
  // Step 1: Extract raw metrics
  const rawMetrics = extractMetrics(input);

  // Step 2: Calculate derived metrics
  const marginOfSafety = calculateMarginOfSafety(
    rawMetrics.intrinsicValue,
    rawMetrics.currentPrice
  );
  const peVsHistorical = calculatePeVsHistorical(
    rawMetrics.peRatio,
    rawMetrics.peHistoricalAvg
  );
  const pbVsHistorical = calculatePbVsHistorical(
    rawMetrics.pbRatio,
    rawMetrics.pbHistoricalAvg
  );
  const upsidePotential = calculateUpsidePotential(marginOfSafety);

  // Step 3: Normalize each metric to 0-100 (inverse scoring)
  const normalized = {
    intrinsicValue: normalizeIntrinsicValue(
      rawMetrics.currentPrice,
      rawMetrics.intrinsicValue
    ),
    peRatio: normalizePeRatio(rawMetrics.peRatio, rawMetrics.peHistoricalAvg),
    pbRatio: normalizePbRatio(rawMetrics.pbRatio, rawMetrics.pbHistoricalAvg),
    marginOfSafety: normalizeMarginOfSafety(marginOfSafety),
  };

  // Step 4: Calculate weighted score (adjusting for missing data)
  const metricEntries = Object.entries(WEIGHTS) as Array<
    [keyof typeof WEIGHTS, number]
  >;

  let totalWeight = 0;
  let weightedSum = 0;
  const missingMetrics: string[] = [];

  for (const [metric, weight] of metricEntries) {
    const rawValue = getRawValueForMetric(
      metric,
      rawMetrics,
      marginOfSafety
    );
    if (rawValue !== null) {
      totalWeight += weight;
      weightedSum += normalized[metric] * weight;
    } else {
      missingMetrics.push(metric);
    }
  }

  // Special case: if no data available, return neutral (50, Fair Value)
  const score =
    totalWeight > 0 ? weightedSum / totalWeight : 50;

  // Step 5: Determine status
  const status = calculateStatus(score);

  // Step 6: Generate key points and summary
  const keyPoints = generateKeyPoints(
    rawMetrics,
    { marginOfSafety, peVsHistorical, pbVsHistorical },
    missingMetrics
  );
  const summary = generateSummary(status, score, marginOfSafety, missingMetrics);

  // Step 7: Build metrics object
  const metricsOutput = {
    intrinsicValue: rawMetrics.intrinsicValue ?? 0,
    currentPrice: rawMetrics.currentPrice ?? 0,
    upsidePotential,
    peVsHistorical: peVsHistorical ?? 0,
    pbVsHistorical: pbVsHistorical ?? 0,
  };

  return {
    score: Math.round(score),
    status,
    marginOfSafety: marginOfSafety ?? 0,
    keyPoints,
    metrics: metricsOutput,
    summary,
  };
}

/**
 * Helper to get raw value for a metric key.
 * Used for determining if a metric is available (non-null).
 */
function getRawValueForMetric(
  metric: keyof typeof WEIGHTS,
  rawMetrics: ReturnType<typeof extractMetrics>,
  marginOfSafety: number | null
): number | null {
  switch (metric) {
    case 'intrinsicValue':
      return rawMetrics.intrinsicValue;
    case 'peRatio':
      return rawMetrics.peRatio;
    case 'pbRatio':
      return rawMetrics.pbRatio;
    case 'marginOfSafety':
      return marginOfSafety;
    default:
      return null;
  }
}
