/**
 * Decision Engine - Main Exports
 *
 * Phase 1: Foundation - Barrel exports for decision module
 *
 * This module re-exports all decision engine types and functions
 * for convenient importing.
 */

// Types
export type {
  DecisionInput,
  DecisionSummary,
  ActionRating,
  QualityAnswer,
  GrowthAnswer,
  ValuationAnswer,
  TimingAnswer,
  RiskAnswer,
  ActionPlan,
  RiskFactor,
  EvidenceLinks,
} from '@/types/decision';

// Core engine
export { analyzeDecision } from './engine';

// Scorers
export { computeQualityAnswer } from './scorers/quality';
export { computeGrowthAnswer } from './scorers/growth';
export { computeValuationAnswer } from './scorers/valuation';
// export { calculateTimingScore } from './scorers/timing';
// export { calculateRiskScore } from './scorers/risk';

// Rules (to be implemented in Phase 1.7)
// export { calculateActionRating } from './rules/action-rating';
// export { calculatePositionSizing } from './rules/position-sizing';

// Aggregators (to be implemented in Phase 1.8)
// export { aggregateFrameworkScores } from './aggregators/framework-aggregator';
