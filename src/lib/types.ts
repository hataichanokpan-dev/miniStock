// Stock data types
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  market: 'SET' | 'MAI' | 'US' | 'HK' | 'CN';
  lastUpdate: number;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  market: string;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: number;
  notes?: string;
}

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface Portfolio {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdings: PortfolioHolding[];
  lastUpdate: number;
}

// User preferences
export interface UserPreferences {
  defaultMarket: 'SET' | 'MAI' | 'US' | 'HK' | 'CN';
  currency: 'THB' | 'USD' | 'HKD' | 'CNY';
  theme: 'light' | 'dark';
}
