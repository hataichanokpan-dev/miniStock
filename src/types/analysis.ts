/**
 * Analysis scoring type definitions
 * Phase 1: Data Layer Foundation
 */

export interface CanslimScore {
  totalScore: number; // 0-100
  currentEarnings: number; // 0-100 (15% weight)
  annualEarnings: number; // 0-100 (20% weight)
  newProducts: number; // 0-100 (10% weight)
  supplyDemand: number; // 0-100 (10% weight)
  leader: number; // 0-100 (15% weight)
  institutional: number; // 0-100 (15% weight)
  marketDirection: number; // 0-100 (15% weight)
  lastUpdate: number;
}

export interface SpeaScore {
  totalScore: number; // 0-100
  strategicPosition: number; // 0-100 (25% weight)
  financialHealth: number; // 0-100 (30% weight)
  earningsQuality: number; // 0-100 (25% weight)
  attractiveValuation: number; // 0-100 (20% weight)
  valuation: 'undervalued' | 'fair' | 'overvalued';
  lastUpdate: number;
}

export interface ValueMetrics {
  grahamNumber: number;
  grahamNumberPrice: number;
  marginOfSafety: number; // percentage
  intrinsicValue: number; // DCF
  piotroskiFScore: number; // 0-9
}

export interface GrowthMetrics {
  revenueCagr3y: number;
  revenueCagr5y: number;
  epsCagr3y: number;
  epsCagr5y: number;
  roeTrend: number; // positive/negative trend
  consistencyScore: number; // 0-100
}

export interface QualityMetrics {
  grossMargin: number;
  operatingMargin: number;
  fcfConversionRatio: number;
  altmanZScore: number; // bankruptcy risk
}

export interface AnalysisSummary {
  symbol: string;
  canslim: CanslimScore;
  spea: SpeaScore;
  valueMetrics: ValueMetrics;
  growthMetrics: GrowthMetrics;
  qualityMetrics: QualityMetrics;
  overallScore: number; // 0-100 weighted average
}
