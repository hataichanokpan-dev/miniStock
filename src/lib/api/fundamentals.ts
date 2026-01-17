/**
 * Company Fundamentals API
 * Phase 1: Data Layer Foundation
 */

import { apiRequest, getApiProvider } from './stock-api';
import type { FinancialMetrics } from '@/types/financials';

/**
 * Fetch company profile and key metrics
 */
export async function getCompanyMetrics(symbol: string): Promise<FinancialMetrics> {
  const provider = getApiProvider();

  if (provider === 'fmp') {
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

  return {
    revenue: metrics.revenue || 0,
    revenueGrowth: parseFloat(metrics.revenueGrowth || '0'),
    netIncome: metrics.netIncome || 0,
    profitMargin: parseFloat(metrics.netProfitMargin || '0'),
    peRatio: parseFloat(metrics.peRatio || '0'),
    pbRatio: parseFloat(metrics.pbRatio || '0'),
    roe: parseFloat(metrics.roe || '0'),
    deRatio: parseFloat(metrics.debtToEquity || '0'),
    eps: parseFloat(metrics.eps || '0'),
    epsGrowth: parseFloat(metrics.epsGrowth || '0'),
    freeCashFlow: metrics.freeCashFlow || 0,
    dividendYield: parseFloat(metrics.dividendYield || '0'),
    marketCap: prof.mktCap || 0,
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

  return {
    revenue: parseFloat(data.RevenueTTM || '0'),
    revenueGrowth: parseFloat(data.RevenueGrowth || '0'),
    netIncome: parseFloat(data.ProfitMargin || '0') * parseFloat(data.RevenueTTM || '0'),
    profitMargin: parseFloat(data.ProfitMargin || '0'),
    peRatio: parseFloat(data.PERatio || '0'),
    pbRatio: parseFloat(data.PriceToBookRatio || '0'),
    roe: parseFloat(data.ReturnOnEquityTTM || '0'),
    deRatio: parseFloat(data.DebtToEquityRatio || '0'),
    eps: parseFloat(data.EPS || '0'),
    epsGrowth: 0, // Not directly available
    freeCashFlow: 0, // Need cash flow endpoint
    dividendYield: parseFloat(data.DividendYield || '0'),
    marketCap: parseInt(data.MarketCapitalization || '0'),
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

  if (provider === 'fmp') {
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
