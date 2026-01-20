/**
 * Financial data type definitions
 * Phase 1: Data Layer Foundation
 */

export interface FinancialMetrics {
  revenue: number | null;
  revenueGrowth: number | null;
  netIncome: number | null;
  profitMargin: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  roe: number | null;
  deRatio: number | null;
  interestCoverage: number | null;
  eps: number | null;
  epsGrowth: number | null;
  freeCashFlow: number | null;
  dividendYield: number | null;
  marketCap: number | null;
}

export interface QuarterlyData {
  fiscalYear: number;
  fiscalQuarter: number;
  earningsDate: string;
  eps: number;
  revenue: number;
  margin: number;
}

export interface AnnualData {
  fiscalYear: number;
  eps: number;
  revenue: number;
  netIncome: number;
  totalAssets: number;
  totalDebt: number;
  totalLiabilities: number;
  equity: number;
}

export interface IncomeStatement {
  fiscalDate: string;
  fiscalYear: number;
  fiscalPeriod: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  epsDiluted: number;
}

export interface BalanceSheet {
  fiscalDate: string;
  fiscalYear: number;
  fiscalPeriod: string;
  totalAssets: number;
  totalCurrentAssets: number;
  totalLiabilities: number;
  totalCurrentLiabilities: number;
  totalDebt: number;
  totalEquity: number;
  cashAndEquivalents: number;
  inventory: number;
}

export interface CashFlowStatement {
  fiscalDate: string;
  fiscalYear: number;
  fiscalPeriod: string;
  netIncome: number;
  depreciation: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  dividendPayments: number;
  stockBuybacks: number;
}
