/**
 * Valuation Scorer Tests
 *
 * Phase 1.4: Valuation scorer test suite
 *
 * Tests cover:
 * - Full data scenarios (Undervalued, Fair Value, Overvalued)
 * - Partial data scenarios (missing metrics)
 * - No data scenarios (empty/null fundamentals)
 * - Edge cases (deep undervaluation, overvaluation, missing intrinsic, extreme P/E/PB)
 * - Deterministic behavior
 * - Weight verification
 */

import { describe, test, expect } from 'vitest';
import { computeValuationAnswer } from './valuation';
import type { DecisionInput } from '@/types/decision';

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Helper to create a DecisionInput with valuation fundamentals.
 */
function createInput(
  overrides: {
    quote?: Partial<DecisionInput['quote']>;
    fundamentals?: Partial<DecisionInput['fundamentals']>;
  } = {}
): DecisionInput {
  const quote: DecisionInput['quote'] = overrides.quote ?? {};
  const fundamentals: Record<string, string | number | null> = {
    ...overrides.fundamentals,
  };

  return {
    quote,
    fundamentals,
  };
}

// ============================================================================
// TEST CASE 1: Full Data (All Metrics Available)
// ============================================================================

describe('full data - all metrics available', () => {
  test('should return Undervalued status for attractive valuation', () => {
    // Price $100, intrinsic $150, P/E 12 (below hist 20), P/B 1.5 (below hist 2.5)
    const input = createInput({
      quote: { price: 100 },
      fundamentals: {
        intrinsicValue: 150,
        peRatio: 12,
        pbRatio: 1.5,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.status).toBe('Undervalued');
    expect(result.marginOfSafety).toBeGreaterThan(30);
    expect(result.keyPoints.length).toBeGreaterThan(0);
    expect(result.keyPoints.length).toBeLessThanOrEqual(6);
    expect(result.summary).toContain('Undervalued');
  });

  test('should return Fair Value status for reasonable valuation', () => {
    // Price $150, intrinsic $148, P/E 19 (near hist 20), P/B 2.4 (near hist 2.5)
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        intrinsicValue: 148,
        peRatio: 19,
        pbRatio: 2.4,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(80);
    expect(result.status).toBe('Fair Value');
  });

  test('should return Overvalued status for expensive valuation', () => {
    // Price $200, intrinsic $120, P/E 35 (above hist 20), P/B 4.0 (above hist 2.5)
    const input = createInput({
      quote: { price: 200 },
      fundamentals: {
        intrinsicValue: 120,
        peRatio: 35,
        pbRatio: 4.0,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeLessThan(40);
    expect(result.status).toBe('Overvalued');
    expect(result.marginOfSafety).toBeLessThan(0);
  });

  test('should calculate margin of safety correctly', () => {
    // intrinsic $200, price $150 = (200-150)/150 = 33.3%
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        intrinsicValue: 200,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.marginOfSafety).toBeCloseTo(33.3, 1);
    expect(result.metrics.upsidePotential).toBeCloseTo(33.3, 1);
  });

  test('should calculate negative margin of safety correctly', () => {
    // intrinsic $100, price $150 = (100-150)/150 = -33.3%
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        intrinsicValue: 100,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.marginOfSafety).toBeCloseTo(-33.3, 1);
    expect(result.metrics.upsidePotential).toBeCloseTo(-33.3, 1);
  });

  test('should calculate PE vs Historical correctly', () => {
    // PE 15, hist 20 = (15/20) - 1 = -25%
    const input = createInput({
      fundamentals: {
        peRatio: 15,
        peHistoricalAvg: 20,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.metrics.peVsHistorical).toBeCloseTo(-0.25, 0.01);
  });

  test('should calculate PB vs Historical correctly', () => {
    // PB 3.0, hist 2.0 = (3.0/2.0) - 1 = +50%
    const input = createInput({
      fundamentals: {
        pbRatio: 3.0,
        pbHistoricalAvg: 2.0,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.metrics.pbVsHistorical).toBeCloseTo(0.5, 0.01);
  });

  test('should handle perfect fair value (price = intrinsic)', () => {
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        intrinsicValue: 150,
        peRatio: 20,
        pbRatio: 2.5,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(80);
    expect(result.status).toBe('Fair Value');
    expect(result.marginOfSafety).toBe(0);
  });
});

// ============================================================================
// TEST CASE 2: Partial Data (Some Metrics Missing)
// ============================================================================

describe('partial data - some metrics missing', () => {
  test('should handle missing intrinsic value gracefully', () => {
    // Only P/E and P/B available, no intrinsic value
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        peRatio: 15,
        pbRatio: 2.0,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThan(0);
    expect(result.keyPoints).toContain('Limited data: intrinsicValue, marginOfSafety not available');
  });

  test('should handle missing P/E ratio gracefully', () => {
    const input = createInput({
      quote: { price: 120 },
      fundamentals: {
        intrinsicValue: 160,
        pbRatio: 1.8,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThan(0);
    const allText = result.keyPoints.join(' ');
    expect(allText).toContain('Limited data');
  });

  test('should handle missing historical averages (use absolute thresholds)', () => {
    // Low P/E without historical should still score well
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        intrinsicValue: 180,
        peRatio: 10, // Below default undervalued threshold of 12
        pbRatio: 0.8, // Below default undervalued threshold of 1.0
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThan(50);
    expect(result.status).toBe('Undervalued');
  });

  test('should calculate score based only on available metrics (reweighting)', () => {
    // Only intrinsic value and P/E available
    // Margin of safety is calculated from intrinsic value and price, so it's available
    const input = createInput({
      quote: { price: 100 },
      fundamentals: {
        intrinsicValue: 150,
        peRatio: 12,
        peHistoricalAvg: 18,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThan(0);
    expect(result.keyPoints).toContain('Limited data: pbRatio not available');
  });

  test('should use absolute P/E thresholds when historical not available', () => {
    // P/E = 30 (above default overvalued threshold of 25)
    const input = createInput({
      fundamentals: {
        peRatio: 30,
      },
    });

    const result = computeValuationAnswer(input);

    // Should have low score due to high P/E
    expect(result.score).toBeLessThan(50);
  });
});

// ============================================================================
// TEST CASE 3: No Data (All Metrics Missing)
// ============================================================================

describe('no data - empty or null fundamentals', () => {
  test('should return Fair Value with no data', () => {
    const input = createInput({
      quote: {},
      fundamentals: {},
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBe(50);
    expect(result.status).toBe('Fair Value');
    expect(result.marginOfSafety).toBe(0);
  });

  test('should return Fair Value with undefined quote and fundamentals', () => {
    const input: DecisionInput = {};

    const result = computeValuationAnswer(input);

    expect(result.score).toBe(50);
    expect(result.status).toBe('Fair Value');
  });

  test('should handle null current price gracefully', () => {
    // When price is null but we have P/E, we can still score using absolute thresholds
    const input = createInput({
      quote: { price: null },
      fundamentals: {
        intrinsicValue: 150,
        peRatio: 15,
      },
    });

    const result = computeValuationAnswer(input);

    // P/E 15 without historical uses absolute thresholds (12-25 range)
    // This gives a moderate score since 15 is in the middle of the range
    expect(result.score).toBeGreaterThan(40);
    expect(result.score).toBeLessThan(80);
    expect(result.status).toBe('Fair Value');
  });
});

// ============================================================================
// TEST CASE 4: Edge Cases
// ============================================================================

describe('edge cases', () => {
  test('should handle deep undervaluation (50% below intrinsic)', () => {
    // Price $100, intrinsic $200
    const input = createInput({
      quote: { price: 100 },
      fundamentals: {
        intrinsicValue: 200,
        peRatio: 8,
        pbRatio: 0.8,
        peHistoricalAvg: 15,
        pbHistoricalAvg: 2.0,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.status).toBe('Undervalued');
    expect(result.marginOfSafety).toBe(100);
  });

  test('should handle deep overvaluation (2x intrinsic)', () => {
    // Price $200, intrinsic $100
    const input = createInput({
      quote: { price: 200 },
      fundamentals: {
        intrinsicValue: 100,
        peRatio: 40,
        pbRatio: 5.0,
        peHistoricalAvg: 15,
        pbHistoricalAvg: 2.0,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeLessThan(20);
    expect(result.status).toBe('Overvalued');
    expect(result.marginOfSafety).toBeCloseTo(-50, 1);
  });

  test('should handle extremely low P/E ratio', () => {
    const input = createInput({
      fundamentals: {
        peRatio: 5,
        peHistoricalAvg: 20,
      },
    });

    const result = computeValuationAnswer(input);

    // Very low P/E = very undervalued = high score
    expect(result.score).toBeGreaterThan(80);
  });

  test('should handle extremely high P/E ratio', () => {
    const input = createInput({
      fundamentals: {
        peRatio: 100,
        peHistoricalAvg: 20,
      },
    });

    const result = computeValuationAnswer(input);

    // Very high P/E = very overvalued = low score
    expect(result.score).toBeLessThan(20);
  });

  test('should handle zero or negative P/E ratio', () => {
    const input = createInput({
      fundamentals: {
        peRatio: -5,
      },
    });

    const result = computeValuationAnswer(input);

    // Invalid P/E should be treated as null
    expect(result.score).toBe(50); // Neutral since only one metric and it's invalid
  });

  test('should handle NaN values as null', () => {
    const input = createInput({
      quote: { price: NaN },
      fundamentals: {
        intrinsicValue: 150,
        peRatio: 15,
      },
    });

    const result = computeValuationAnswer(input);

    // NaN price is treated as null, but we can still score using P/E absolute thresholds
    // P/E 15 gives a moderate score in the 12-25 range
    expect(result.score).toBeGreaterThan(40);
    expect(result.score).toBeLessThan(80);
  });

  test('should handle margin of safety near zero', () => {
    // Price $149.50, intrinsic $150
    const input = createInput({
      quote: { price: 149.5 },
      fundamentals: {
        intrinsicValue: 150,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.marginOfSafety).toBeCloseTo(0.33, 1);
    expect(result.status).toBe('Fair Value');
  });

  test('should handle negative intrinsic value as null', () => {
    const input = createInput({
      quote: { price: 100 },
      fundamentals: {
        intrinsicValue: -50,
      },
    });

    const result = computeValuationAnswer(input);

    // Negative intrinsic should be treated as null
    expect(result.score).toBe(50);
  });

  test('should handle zero current price as null', () => {
    const input = createInput({
      quote: { price: 0 },
      fundamentals: {
        intrinsicValue: 150,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBe(50);
  });

  test('should handle zero historical average gracefully', () => {
    const input = createInput({
      fundamentals: {
        peRatio: 15,
        peHistoricalAvg: 0,
      },
    });

    const result = computeValuationAnswer(input);

    // Should use absolute thresholds instead
    expect(result.score).toBeGreaterThan(0);
  });
});

// ============================================================================
// TEST CASE 5: Deterministic Behavior
// ============================================================================

describe('deterministic behavior', () => {
  test('should return same output for same input (deterministic)', () => {
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        intrinsicValue: 180,
        peRatio: 16,
        pbRatio: 2.2,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result1 = computeValuationAnswer(input);
    const result2 = computeValuationAnswer(input);

    expect(result1).toEqual(result2);
  });

  test('should produce consistent results across multiple calls', () => {
    const input = createInput({
      quote: { price: 120 },
      fundamentals: {
        intrinsicValue: 160,
        peRatio: 14,
        pbRatio: 1.8,
        peHistoricalAvg: 18,
        pbHistoricalAvg: 2.2,
      },
    });

    const results = Array.from({ length: 5 }, () => computeValuationAnswer(input));

    results.forEach((result) => {
      expect(result).toEqual(results[0]);
    });
  });
});

// ============================================================================
// TEST CASE 6: Weight Verification
// ============================================================================

describe('weight verification', () => {
  test('should use correct weights for all metrics', () => {
    // intrinsicValue: 35%, peRatio: 25%, pbRatio: 20%, marginOfSafety: 20%
    // With these values:
    // - price 150, intrinsic 148 → ratio 1.013 → intrinsic score ≈ 49
    // - P/E 19 vs hist 20 → ratio 0.95 → PE score ≈ 53
    // - P/B 2.4 vs hist 2.5 → ratio 0.96 → PB score ≈ 53
    // - MoS = (148-150)/150 = -1.33% → MoS score ≈ 49
    // Weighted: 49*0.35 + 53*0.25 + 53*0.20 + 49*0.20 ≈ 50
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        intrinsicValue: 148,
        peRatio: 19,
        pbRatio: 2.4,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    // With these near-fair values, score should be around 50
    expect(result.score).toBeGreaterThan(40);
    expect(result.score).toBeLessThan(70);
  });

  test('should reweight proportionally when metrics are missing', () => {
    // Only intrinsicValue (35%) and peRatio (25%) available
    // Margin of safety is calculated, so total weight = 60%
    // Adjusted: intrinsic = 35/60 ≈ 58%, pe = 25/60 ≈ 42%
    const input = createInput({
      quote: { price: 100 },
      fundamentals: {
        intrinsicValue: 160,
        peRatio: 12,
        peHistoricalAvg: 18,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThan(0);
    expect(result.keyPoints).toContain('Limited data: pbRatio not available');
  });
});

// ============================================================================
// TEST CASE 7: Status Mapping
// ============================================================================

describe('status mapping', () => {
  test('should return Undervalued for score >= 80', () => {
    const input = createInput({
      quote: { price: 80 },
      fundamentals: {
        intrinsicValue: 200,
        peRatio: 8,
        pbRatio: 0.6,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.status).toBe('Undervalued');
  });

  test('should return Fair Value for score 40-79', () => {
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        intrinsicValue: 145,
        peRatio: 18,
        pbRatio: 2.3,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(80);
    expect(result.status).toBe('Fair Value');
  });

  test('should return Overvalued for score < 40', () => {
    const input = createInput({
      quote: { price: 200 },
      fundamentals: {
        intrinsicValue: 100,
        peRatio: 40,
        pbRatio: 5.0,
        peHistoricalAvg: 15,
        pbHistoricalAvg: 2.0,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.score).toBeLessThan(40);
    expect(result.status).toBe('Overvalued');
  });
});

// ============================================================================
// TEST CASE 8: Key Points and Summary
// ============================================================================

describe('key points and summary', () => {
  test('should generate 3-6 key points', () => {
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        intrinsicValue: 180,
        peRatio: 16,
        pbRatio: 2.2,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.keyPoints.length).toBeGreaterThanOrEqual(3);
    expect(result.keyPoints.length).toBeLessThanOrEqual(6);
  });

  test('should include margin of safety insights in key points', () => {
    const input = createInput({
      quote: { price: 100 },
      fundamentals: {
        intrinsicValue: 150,
      },
    });

    const result = computeValuationAnswer(input);

    const allText = result.keyPoints.join(' ');
    expect(allText.toLowerCase()).toContain('margin of safety');
  });

  test('should include P/E comparison insights', () => {
    const input = createInput({
      fundamentals: {
        peRatio: 15,
        peHistoricalAvg: 20,
      },
    });

    const result = computeValuationAnswer(input);

    const allText = result.keyPoints.join(' ');
    expect(allText.toLowerCase()).toContain('p/e');
  });

  test('should generate summary with status and score', () => {
    // Need stronger undervaluation to reach Undervalued status (80+)
    const input = createInput({
      quote: { price: 120 },
      fundamentals: {
        intrinsicValue: 200,
        peRatio: 12,
        pbRatio: 1.5,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.summary).toContain('Undervalued');
    expect(result.summary).toContain('/100');
  });

  test('should indicate data quality in summary', () => {
    const input = createInput({
      quote: { price: 120 },
      fundamentals: {
        peRatio: 15,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.summary).toContain('available data');
  });
});

// ============================================================================
// TEST CASE 8: Metrics Output
// ============================================================================

describe('metrics output', () => {
  test('should include all derived metrics in output', () => {
    const input = createInput({
      quote: { price: 150 },
      fundamentals: {
        intrinsicValue: 180,
        peRatio: 16,
        pbRatio: 2.2,
        peHistoricalAvg: 20,
        pbHistoricalAvg: 2.5,
      },
    });

    const result = computeValuationAnswer(input);

    expect(result.metrics.intrinsicValue).toBe(180);
    expect(result.metrics.currentPrice).toBe(150);
    expect(result.metrics.peVsHistorical).toBeCloseTo(-0.2, 0.01);
    expect(result.metrics.pbVsHistorical).toBeCloseTo(-0.12, 0.01);
    expect(result.metrics.upsidePotential).toBeCloseTo(20, 1);
  });

  test('should use 0 for missing derived metrics in output', () => {
    const input = createInput({
      quote: {},  // No price provided
      fundamentals: {},  // No fundamentals
    });

    const result = computeValuationAnswer(input);

    expect(result.metrics.intrinsicValue).toBe(0);
    expect(result.metrics.currentPrice).toBe(0);
    expect(result.metrics.peVsHistorical).toBe(0);
    expect(result.metrics.pbVsHistorical).toBe(0);
    expect(result.metrics.upsidePotential).toBe(0);
  });
});
