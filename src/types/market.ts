/**
 * Market data type definitions
 * Phase 1: Data Layer Foundation
 */

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  timestamp: number;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  timestamp: number;
}

export interface Sector {
  name: string;
  performance: number;
  changePercent: number;
  volume: number;
  marketCap: number;
}

export interface MarketBreadth {
  advancing: number;
  declining: number;
  unchanged: number;
  totalVolume: number;
  advanceDeclineRatio: number;
  newHighs: number;
  newLows: number;
}

export interface StockScreenerCriteria {
  marketCap?: { min?: number; max?: number };
  sector?: string[];
  industry?: string[];
  peRatio?: { min?: number; max?: number };
  pbRatio?: { min?: number; max?: number };
  dividendYield?: { min?: number; max?: number };
  roe?: { min?: number; max?: number };
  deRatio?: { min?: number; max?: number };
  revenueGrowth?: { min?: number; max?: number };
  epsGrowth?: { min?: number; max?: number };
  canslimScore?: { min?: number };
  speaScore?: { min?: number };
}

export interface ScreenerResult {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  volume: number;
  score?: number;
}
