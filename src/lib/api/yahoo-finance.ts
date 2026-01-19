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
 * Maps Yahoo Finance fields to FinancialMetrics with proper null handling
 *
 * Yahoo Finance field mapping:
 * - financialData module: revenueGrowth, profitMargins, operatingMargins, grossMargins
 * - defaultKeyStatistics module: debtToEquity, returnOnEquity, interestCoverage
 * - quote/summaryDetail: trailingPE, priceToBook, dividendYield, marketCap
 * - earnings trend: for EPS growth calculation
 */
export async function getCompanyMetricsYahoo(symbol: string): Promise<FinancialMetrics> {
  const cacheKey = 'yahoo:metrics:' + symbol;

  return withCache(cacheKey, CACHE_TTL.FUNDAMENTALS, async () => {
    try {
      const [result, summary] = await Promise.all([
        yahooFinance.quote(symbol) as any,
        yahooFinance.quoteSummary(symbol, {
          modules: ['defaultKeyStatistics', 'financialData', 'summaryDetail']
        }) as any,
      ]);

      const stats = summary?.defaultKeyStatistics || {};
      const financialData = summary?.financialData || {};
      const summaryDetail = summary?.summaryDetail || {};

      // Helper to safely extract numbers, returning null for missing/invalid values
      const safeNum = (val: any): number | null => {
        if (val === null || val === undefined || !isFinite(val)) return null;
        return Number(val);
      };

      // Revenue growth is already a percentage from Yahoo (e.g., 0.05 = 5%)
      const revenueGrowth = safeNum(financialData.revenueGrowth);

      // Profit margins from Yahoo are decimals (e.g., 0.25 = 25%)
      const profitMargin = safeNum(financialData.profitMargins);
      const operatingMargin = safeNum(financialData.operatingMargins);
      const grossMargin = safeNum(financialData.grossMargins);

      // ROE from Yahoo is a decimal (e.g., 0.15 = 15%)
      const roe = safeNum(stats.returnOnEquity);

      // Debt-to-Equity ratio
      const deRatio = safeNum(stats.debtToEquity);

      // Interest coverage ratio
      const interestCoverage = safeNum(stats.interestCoverage);

      // P/E ratio - can be negative for unprofitable companies
      const peRatio = safeNum(result.trailingPE);

      // P/B ratio
      const pbRatio = safeNum(result.priceToBook);

      // Dividend yield from Yahoo is a decimal (e.g., 0.02 = 2%)
      const dividendYield = safeNum(summaryDetail.dividendYield);

      // EPS Growth - Yahoo provides earningsQuarterlyGrowth as a decimal
      // Also try earningsPreview and earningsTrend for more accurate YoY growth
      let epsGrowth: number | null = safeNum(stats.earningsQuarterlyGrowth);

      // If quarterly growth is not available, try to get from earnings trend
      if (epsGrowth === null) {
        const earningsTrend = stats?.earningsTrend;
        if (earningsTrend?.trend && earningsTrend.trend.length > 0) {
          // Get the most recent earnings growth estimate
          epsGrowth = safeNum(earningsTrend.trend[0]?.growth);
        }
      }

      return {
        revenue: safeNum(financialData.totalRevenue),
        revenueGrowth,
        netIncome: safeNum(financialData.netIncomeToCommon),
        profitMargin,
        grossMargin,
        operatingMargin,
        peRatio,
        pbRatio,
        roe,
        deRatio,
        interestCoverage,
        eps: safeNum(result.epsTrailingTwelveMonths),
        epsGrowth,
        freeCashFlow: safeNum(financialData.freeCashflow),
        dividendYield,
        marketCap: safeNum(result.marketCap),
      };
    } catch (error) {
      console.warn(`Company metrics not available for ${symbol}:`, (error as Error).message);
      // Return all null values if data is unavailable
      return {
        revenue: null,
        revenueGrowth: null,
        netIncome: null,
        profitMargin: null,
        grossMargin: null,
        operatingMargin: null,
        peRatio: null,
        pbRatio: null,
        roe: null,
        deRatio: null,
        interestCoverage: null,
        eps: null,
        epsGrowth: null,
        freeCashFlow: null,
        dividendYield: null,
        marketCap: null,
      };
    }
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
 * Always fetches 2 years of daily data for sufficient MA200 calculation
 */
export async function getHistoricalPricesYahoo(
  symbol: string,
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' = '2y'
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
        interval: '1d', // Always use daily interval for MA200 calculation
      });

      if (!result || !result.quotes || result.quotes.length === 0) {
        return [];
      }

      // Filter to only valid trading days with close prices
      // Persist only dates that actually have a price (skip null/empty days)
      const validQuotes = result.quotes
        .filter((item: any) => {
          // Must have date and valid close price
          return item.date && item.close != null && isFinite(item.close) && item.close > 0;
        })
        .map((item: any) => ({
          date: item.date.toISOString().split('T')[0],
          open: item.open ?? null,
          high: item.high ?? null,
          low: item.low ?? null,
          close: item.close,
          volume: item.volume ?? null,
        }));

      // Deduplicate by date (keep last entry if duplicates exist)
      const dedupedMap = new Map<string, typeof validQuotes[0]>();
      for (const quote of validQuotes) {
        dedupedMap.set(quote.date, quote);
      }

      // Sort ascending by date
      return Array.from(dedupedMap.values()).sort((a, b) => a.date.localeCompare(b.date));
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
