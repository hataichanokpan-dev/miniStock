/**
 * Yahoo Finance API Integration
 * Phase 1: Data Layer Foundation
 * Using yahoo-finance2 library for data fetching
 */

import YahooFinance from 'yahoo-finance2';
import type { Quote } from '@/types/market';
import type { FinancialMetrics } from '@/types/financials';
import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '@/types/financials';
import { withCache, CACHE_TTL } from './cache';

// Initialize Yahoo Finance instance with configuration
const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey', 'ripHistorical'],
  validation: {
    logErrors: false, // Disable verbose validation logging
  }
});

/**
 * Fetch financial statements from Yahoo Finance
 * Yahoo Finance provides income statement, balance sheet, and cash flow data
 */
export async function getFinancialStatementsYahoo(symbol: string): Promise<{
  incomeStatement: IncomeStatement[];
  balanceSheet: BalanceSheet[];
  cashFlow: CashFlowStatement[];
}> {
  const cacheKey = 'yahoo:statements:' + symbol;

  return withCache(cacheKey, CACHE_TTL.FUNDAMENTALS, async () => {
    try {
      const [incomeData, balanceData, cashFlowData] = await Promise.all([
        yahooFinance.quoteSummary(symbol, { modules: ['incomeStatementHistory'] }) as any,
        yahooFinance.quoteSummary(symbol, { modules: ['balanceSheetHistory'] }) as any,
        yahooFinance.quoteSummary(symbol, { modules: ['cashflowStatementHistory'] }) as any,
      ]);

      const incomeStatement = parseIncomeStatement(incomeData);
      const balanceSheet = parseBalanceSheet(balanceData);
      const cashFlow = parseCashFlowStatement(cashFlowData);

      return {
        incomeStatement,
        balanceSheet,
        cashFlow,
      };
    } catch (error) {
      console.warn(`Yahoo Finance statements not available for ${symbol}:`, (error as Error).message);
      // Return empty arrays if Yahoo Finance doesn't have statement data
      return {
        incomeStatement: [],
        balanceSheet: [],
        cashFlow: [],
      };
    }
  });
}

/**
 * Parse income statement from Yahoo Finance data
 */
function parseIncomeStatement(data: any): IncomeStatement[] {
  const statements = data?.incomeStatementHistory?.incomeStatementHistory || [];
  if (!Array.isArray(statements) || statements.length === 0) {
    return [];
  }

  return statements.slice(0, 10).map((item: any) => {
    const stmt = item[0];
    const endDate = stmt.endDate?.Date || new Date().toISOString().split('T')[0];
    const dateObj = new Date(endDate);

    return {
      fiscalDate: endDate,
      fiscalYear: dateObj.getFullYear(),
      fiscalPeriod: 'FY',
      revenue: stmt.totalRevenue || 0,
      costOfRevenue: stmt.costOfRevenue || 0,
      grossProfit: stmt.grossProfit || 0,
      operatingExpenses: stmt.totalOperatingExpenses || 0,
      operatingIncome: stmt.operatingIncome || 0,
      netIncome: stmt.netIncome || 0,
      eps: stmt.epsBasic || 0,
      epsDiluted: stmt.epsDiluted || 0,
    };
  });
}

/**
 * Parse balance sheet from Yahoo Finance data
 */
function parseBalanceSheet(data: any): BalanceSheet[] {
  const statements = data?.balanceSheetHistory?.balanceSheetStatements || [];
  if (!Array.isArray(statements) || statements.length === 0) {
    return [];
  }

  return statements.slice(0, 10).map((item: any) => {
    const stmt = item[0];
    const endDate = stmt.endDate?.Date || new Date().toISOString().split('T')[0];
    const dateObj = new Date(endDate);

    return {
      fiscalDate: endDate,
      fiscalYear: dateObj.getFullYear(),
      fiscalPeriod: 'FY',
      totalAssets: stmt.totalAssets || 0,
      totalCurrentAssets: stmt.totalCurrentAssets || 0,
      totalLiabilities: stmt.totalLiab || 0,
      totalCurrentLiabilities: stmt.totalCurrentLiabilities || 0,
      totalDebt: stmt.totalDebt || 0,
      totalEquity: stmt.totalStockholderEquity || 0,
      cashAndEquivalents: stmt.cash || 0,
      inventory: stmt.inventory || 0,
    };
  });
}

/**
 * Parse cash flow statement from Yahoo Finance data
 */
function parseCashFlowStatement(data: any): CashFlowStatement[] {
  const statements = data?.cashflowStatementHistory?.cashflowStatements || [];
  if (!Array.isArray(statements) || statements.length === 0) {
    return [];
  }

  return statements.slice(0, 10).map((item: any) => {
    const stmt = item[0];
    const endDate = stmt.endDate?.Date || new Date().toISOString().split('T')[0];
    const dateObj = new Date(endDate);

    return {
      fiscalDate: endDate,
      fiscalYear: dateObj.getFullYear(),
      fiscalPeriod: 'FY',
      netIncome: stmt.netIncome || 0,
      depreciation: stmt.depreciation || 0,
      operatingCashFlow: stmt.totalCashFromOperatingActivities || 0,
      capitalExpenditure: stmt.capitalExpenditures || 0,
      freeCashFlow: (stmt.totalCashFromOperatingActivities || 0) + (stmt.capitalExpenditures || 0),
      dividendPayments: stmt.dividendsPaid || 0,
      stockBuybacks: Math.abs(stmt.netBorrowings || 0),
    };
  });
}

/**
 * Fetch real-time quote for a single stock from Yahoo Finance
 */
export async function getQuoteYahoo(symbol: string): Promise<Quote> {
  const cacheKey = 'yahoo:quote:' + symbol;

  return withCache(cacheKey, CACHE_TTL.QUOTE, async () => {
    const result = await yahooFinance.quote(symbol) as any;

    return {
      symbol: result.symbol,
      name: result.longName || result.shortName || symbol,
      price: result.regularMarketPrice || 0,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      high: result.regularMarketDayHigh || 0,
      low: result.regularMarketDayLow || 0,
      open: result.regularMarketOpen || 0,
      previousClose: result.previousClose || 0,
      volume: result.regularMarketVolume || 0,
      avgVolume: result.averageDailyVolume3Month || 0,
      marketCap: result.marketCap || 0,
      timestamp: Date.now(),
    };
  });
}

/**
 * Fetch multiple quotes at once from Yahoo Finance
 */
export async function getQuotesYahoo(symbols: string[]): Promise<Quote[]> {
  const cacheKey = 'yahoo:quotes:' + symbols.join(',');

  return withCache(cacheKey, CACHE_TTL.QUOTE, async () => {
    const results = await yahooFinance.quote(symbols) as any[];

    return results.map((result) => ({
      symbol: result.symbol,
      name: result.longName || result.shortName || result.symbol,
      price: result.regularMarketPrice || 0,
      change: result.regularMarketChange || 0,
      changePercent: result.regularMarketChangePercent || 0,
      high: result.regularMarketDayHigh || 0,
      low: result.regularMarketDayLow || 0,
      open: result.regularMarketOpen || 0,
      previousClose: result.previousClose || 0,
      volume: result.regularMarketVolume || 0,
      avgVolume: result.averageDailyVolume3Month || 0,
      marketCap: result.marketCap || 0,
      timestamp: Date.now(),
    }));
  });
}

/**
 * Fetch company metrics from Yahoo Finance
 */
export async function getCompanyMetricsYahoo(symbol: string): Promise<FinancialMetrics> {
  const cacheKey = 'yahoo:metrics:' + symbol;

  return withCache(cacheKey, CACHE_TTL.FUNDAMENTALS, async () => {
    const [result, keyStats] = await Promise.all([
      yahooFinance.quote(symbol) as any,
      yahooFinance.quoteSummary(symbol, { modules: ['defaultKeyStatistics', 'financialData'] }) as any,
    ]);

    const stats = keyStats?.defaultKeyStatistics || {};
    const financialData = keyStats?.financialData || {};

    return {
      revenue: financialData.totalRevenue || 0,
      revenueGrowth: financialData.revenueGrowth || 0,
      netIncome: financialData.netIncomeToCommon || 0,
      profitMargin: financialData.profitMargins || 0,
      peRatio: result.trailingPE || 0,
      pbRatio: result.priceToBook || 0,
      roe: result.returnOnEquity || 0,
      deRatio: stats.debtToEquity || 0,
      eps: result.epsTrailingTwelveMonths || 0,
      epsGrowth: stats.earningsQuarterlyGrowth || 0,
      freeCashFlow: financialData.freeCashflow || 0,
      dividendYield: result.dividendYield || 0,
      marketCap: result.marketCap || 0,
    };
  });
}

/**
 * Fetch company profile from Yahoo Finance
 */
export async function getCompanyProfileYahoo(symbol: string): Promise<{
  symbol: string;
  name: string;
  description: string;
  industry: string;
  sector: string;
  website: string;
  marketCap: number;
  country: string;
  currency: string;
}> {
  const cacheKey = 'yahoo:profile:' + symbol;

  return withCache(cacheKey, CACHE_TTL.FUNDAMENTALS, async () => {
    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ['assetProfile', 'price'],
    }) as any;

    const profile = result?.assetProfile || {};
    const price = result?.price || {};

    return {
      symbol,
      name: price.longName || symbol,
      description: profile.description || '',
      industry: profile.industry || '',
      sector: profile.sector || '',
      website: profile.website || '',
      marketCap: price.marketCap || 0,
      country: profile.country || '',
      currency: price.currency || 'USD',
    };
  });
}

/**
 * Fetch historical price data from Yahoo Finance
 * Using chart() instead of historical() as recommended by yahoo-finance2 v3
 */
export async function getHistoricalPricesYahoo(
  symbol: string,
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' = '1y'
): Promise<Array<{
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}>> {
  const cacheKey = 'yahoo:historical:' + symbol + ':' + period;

  return withCache(cacheKey, CACHE_TTL.HISTORICAL, async () => {
    try {
      const result = await yahooFinance.chart(symbol, {
        period1: getStartDate(period),
        period2: new Date(),
        interval: getInterval(period),
      });

      if (!result || !result.quotes || result.quotes.length === 0) {
        return [];
      }

      return result.quotes.map((item: any) => ({
        date: item.date.toISOString().split('T')[0],
        open: item.open || 0,
        high: item.high || 0,
        low: item.low || 0,
        close: item.close || 0,
        volume: item.volume || 0,
      }));
    } catch (error) {
      console.warn(`Historical price data not available for ${symbol}:`, (error as Error).message);
      return [];
    }
  });
}

/**
 * Helper function to calculate start date based on period
 */
function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case '1d':
      return new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    case '5d':
      return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    case '1mo':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '3mo':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '6mo':
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case '2y':
      return new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
    case '5y':
      return new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
    case '10y':
      return new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000);
    case 'ytd':
      return new Date(now.getFullYear(), 0, 1);
    case 'max':
      return new Date(2000, 0, 1);
    default:
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Helper function to get interval based on period
 */
function getInterval(period: string): '1d' | '1wk' | '1mo' {
  switch (period) {
    case '1d':
    case '5d':
      return '1d';
    case '1mo':
    case '3mo':
      return '1d';
    case '6mo':
    case '1y':
      return '1wk';
    case '2y':
    case '5y':
    case '10y':
    case 'max':
      return '1mo';
    default:
      return '1d';
  }
}
