/**
 * Decision Engine Type Definitions
 *
 * Phase 1: Foundation - Type system for decision summary
 *
 * These types define the core data structures for the Decision Engine
 * that answers 6 key investment questions and provides actionable guidance.
 */

// ============================================================================
// INPUT TYPE
// ============================================================================

/**
 * Input data required for decision analysis.
 *
 * All fields are optional to allow incremental integration.
 * This type will be refined in Phase 2 when data sources are fully integrated.
 *
 * @phase2 - Add specific field requirements as data sources are finalized
 */
export interface DecisionInput {
  /** Current quote data (price, volume, etc.) */
  quote?: {
    price?: number;
    volume?: number;
    currency?: string;
    marketCap?: number;
    dayChange?: number;
    dayChangePercent?: number;
  };

  /** Fundamental metrics and ratios */
  fundamentals?: Record<string, number | string | null>;

  /** Financial statement data */
  financials?: {
    income?: unknown;
    balance?: unknown;
    cashflow?: unknown;
  };

  /** Historical price data for technical analysis */
  history?: {
    prices?: Array<{
      date: string;
      close?: number;
      volume?: number;
    }>;
  };

  /** Market context data */
  market?: {
    sector?: string;
    industry?: string;
    indexTrend?: string;
  };
}

// ============================================================================
// ACTION RATING
// ============================================================================

/**
 * Investment action rating representing the recommended action.
 */
export type ActionRating =
  | 'Strong Buy'
  | 'Buy'
  | 'Hold'
  | 'Sell'
  | 'Strong Sell';

// ============================================================================
// ANSWER TYPES (The 6 Questions)
// ============================================================================

/**
 * Q1: Is this stock GOOD? (Quality/Business Strength)
 */
export interface QualityAnswer {
  score: number; // 0-100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Weak' | 'Poor';
  keyPoints: string[];
  metrics: {
    roe: number;
    profitMargin: number;
    fcfConversion: number;
    altmanZScore: number;
    competitivePosition: number;
  };
  summary: string;
}

/**
 * Q2: Does it really GROW? (Growth + Durability)
 */
export interface GrowthAnswer {
  score: number; // 0-100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Weak' | 'Poor';
  keyPoints: string[];
  metrics: {
    revenueCagr3y: number;
    revenueCagr5y: number;
    epsCagr3y: number;
    epsCagr5y: number;
    consistency: number;
  };
  sustainability: 'high' | 'medium' | 'low';
  summary: string;
}

/**
 * Q3: Is it EXPENSIVE? (Valuation + Margin of Safety)
 */
export interface ValuationAnswer {
  score: number; // 0-100
  status: 'Undervalued' | 'Fair Value' | 'Overvalued';
  marginOfSafety: number; // percentage
  keyPoints: string[];
  metrics: {
    intrinsicValue: number;
    currentPrice: number;
    upsidePotential: number; // percentage
    peVsHistorical: number;
    pbVsHistorical: number;
  };
  summary: string;
}

/**
 * Q4: Is the TIMING right? (Market Direction/Technical Regime)
 */
export interface TimingAnswer {
  score: number; // 0-100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Weak' | 'Poor';
  regime: 'bullish' | 'neutral' | 'bearish';
  keyPoints: string[];
  metrics: {
    marketTrend: string;
    priceVs52wHigh: number; // percentage from 52-week high
    volumeTrend: string;
    technicalPosition: string;
  };
  summary: string;
}

/**
 * Q5: What are the RISKS? (Downside, Leverage, Cyclicality)
 */
export interface RiskAnswer {
  level: 'Low' | 'Medium' | 'High' | 'Very High';
  score: number; // 0-100 (inverse - higher is safer)
  riskFactors: RiskFactor[];
  downsideEstimate: number; // percentage potential drop
  summary: string;
}

/**
 * Individual risk factor with severity classification.
 */
export interface RiskFactor {
  category: 'financial' | 'market' | 'business' | 'valuation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metric?: string;
  value?: number;
}

/**
 * Q6: What's the PLAN? (Entry/Exit + Invalidation)
 */
export interface ActionPlan {
  rating: ActionRating;
  entryZone: {
    min: number;
    optimal: number;
    max: number;
  };
  targetPrice: {
    base: number;
    bullish: number;
    bearish: number;
  };
  stopLoss: number;
  positionSizing: {
    minPercent: number; // of portfolio
    optimalPercent: number;
    maxPercent: number;
  };
  timeHorizon: string; // e.g., "6-12 months"
  invalidationTriggers: string[];
  reasoning: string;
}

// ============================================================================
// MAIN OUTPUT TYPE
// ============================================================================

/**
 * Complete decision summary answering 6 investment questions.
 *
 * This is the primary output of the Decision Engine, providing
 * a comprehensive investment recommendation with supporting evidence.
 */
export interface DecisionSummary {
  symbol: string;
  timestamp: number;

  // The 6 Core Answers
  quality: QualityAnswer;
  growth: GrowthAnswer;
  valuation: ValuationAnswer;
  timing: TimingAnswer;
  risk: RiskAnswer;
  plan: ActionPlan;

  // Overall verdict
  overall: {
    score: number; // 0-100
    rating: ActionRating;
    confidence: 'high' | 'medium' | 'low';
    summary: string; // 1-2 sentence thesis
  };

  // Framework contributions (for transparency)
  frameworkScores: {
    canslim: number;
    spea: number;
    value: number;
    growth: number;
    quality: number;
  };
}

/**
 * Links to detailed evidence for drill-down navigation.
 */
export interface EvidenceLinks {
  financials: string; // link to financial statements view
  technical: string; // link to chart view
  peers: string; // link to peer comparison
  frameworks: string; // link to detailed framework scores
}
