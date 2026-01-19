/**
 * Company Fundamentals API
 * Phase 1: Data Layer Foundation
 */

import { apiRequest, getApiProvider } from './stock-api';
import { getCompanyMetricsYahoo, getCompanyProfileYahoo } from './yahoo-finance';
import type { FinancialMetrics } from '@/types/financials';

/**
 * Fetch company profile and key metrics
 */
export async function getCompanyMetrics(symbol: string): Promise<FinancialMetrics> {
  const provider = getApiProvider();

  if (provider === 'yahoo') {
    return getCompanyMetricsYahoo(symbol);
  } else if (provider === 'fmp') {
    return getCompanyMetricsFMP(symbol);
  } else {
    return getCompanyMetricsAlphaVantage(symbol);
  }
}

/**
 * Financial Modeling Prep: Company metrics
 */
async function getCompanyMetricsFMP(symbol: string): Promise<FinancialMetrics> {
  // Fetch key metrics
  const keyMetrics = await apiRequest<any>(`key-metrics/${symbol}`);
  const ratios = await apiRequest<any>(`ratios/${symbol}`);
  const profile = await apiRequest<any>(`profile/${symbol}`);

  if (!keyMetrics || keyMetrics.length === 0) {
    throw new Error(`No metrics data found for symbol: ${symbol}`);
  }

  const metrics = keyMetrics[0];
  const ratio = ratios[0] || {};
  const prof = profile[0] || {};

  const safeNum = (val: any): number | null => {
    const num = parseFloat(val);
    return isNaN(num) || val === null || val === undefined ? null : num;
  };

  return {
    revenue: safeNum(metrics.revenue),
    revenueGrowth: safeNum(metrics.revenueGrowth),
    netIncome: safeNum(metrics.netIncome),
    profitMargin: safeNum(metrics.netProfitMargin),
    grossMargin: null, // Not available in FMP key-metrics
    operatingMargin: null,
    peRatio: safeNum(metrics.peRatio),
    pbRatio: safeNum(metrics.pbRatio),
    roe: safeNum(metrics.roe),
    deRatio: safeNum(metrics.debtToEquity),
    interestCoverage: null,
    eps: safeNum(metrics.eps),
    epsGrowth: safeNum(metrics.epsGrowth),
    freeCashFlow: safeNum(metrics.freeCashFlow),
    dividendYield: safeNum(metrics.dividendYield),
    marketCap: safeNum(prof.mktCap),
  };
}

/**
 * Alpha Vantage: OVERVIEW endpoint for fundamentals
 */
async function getCompanyMetricsAlphaVantage(symbol: string): Promise<FinancialMetrics> {
  const data = await apiRequest<any>('OVERVIEW', { symbol });

  if (!data || !data.Symbol) {
    throw new Error(`No overview data found for symbol: ${symbol}`);
  }

  const safeNum = (val: any): number | null => {
    const num = parseFloat(val);
    return isNaN(num) || val === null || val === undefined ? null : num;
  };

  const revenueTTM = safeNum(data.RevenueTTM);
  const profitMargin = safeNum(data.ProfitMargin);

  return {
    revenue: revenueTTM,
    revenueGrowth: safeNum(data.RevenueGrowth),
    netIncome: profitMargin && revenueTTM ? profitMargin * revenueTTM : null,
    profitMargin,
    grossMargin: null,
    operatingMargin: null,
    peRatio: safeNum(data.PERatio),
    pbRatio: safeNum(data.PriceToBookRatio),
    roe: safeNum(data.ReturnOnEquityTTM),
    deRatio: safeNum(data.DebtToEquityRatio),
    interestCoverage: null,
    eps: safeNum(data.EPS),
    epsGrowth: null, // Not directly available
    freeCashFlow: null,
    dividendYield: safeNum(data.DividendYield),
    marketCap: safeNum(data.MarketCapitalization),
  };
}

/**
 * Get company profile
 */
export async function getCompanyProfile(symbol: string): Promise<{
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
  const provider = getApiProvider();

  if (provider === 'yahoo') {
    return getCompanyProfileYahoo(symbol);
  } else if (provider === 'fmp') {
    const profiles = await apiRequest<any[]>(`profile/${symbol}`);
    if (!profiles || profiles.length === 0) {
      throw new Error(`No profile data found for symbol: ${symbol}`);
    }

    const profile = profiles[0];
    return {
      symbol: profile.symbol,
      name: profile.companyName,
      description: profile.description,
      industry: profile.industry,
      sector: profile.sector,
      website: profile.website,
      marketCap: profile.mktCap,
      country: profile.country,
      currency: profile.currency,
    };
  }

  // Alpha Vantage fallback
  const data = await apiRequest<any>('OVERVIEW', { symbol });
  return {
    symbol: data.Symbol,
    name: data.Name,
    description: data.Description,
    industry: data.Industry,
    sector: data.Sector,
    website: data.AdjacentClose || '',
    marketCap: parseInt(data.MarketCapitalization || '0'),
    country: data.Country,
    currency: data.Currency,
  };
}
