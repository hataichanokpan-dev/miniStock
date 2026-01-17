/**
 * Real-time Quotes API
 * Phase 1: Data Layer Foundation
 */

import { apiRequest, getApiProvider } from './stock-api';
import type { Quote } from '@/types/market';

/**
 * Fetch real-time quote for a single stock
 */
export async function getQuote(symbol: string): Promise<Quote> {
  const provider = getApiProvider();

  if (provider === 'fmp') {
    return getQuoteFMP(symbol);
  } else {
    return getQuoteAlphaVantage(symbol);
  }
}

/**
 * Fetch multiple quotes at once
 */
export async function getQuotes(symbols: string[]): Promise<Quote[]> {
  const provider = getApiProvider();

  if (provider === 'fmp') {
    return getQuotesFMP(symbols);
  } else {
    // Alpha Vantage doesn't support batch, fetch individually
    const quotes = await Promise.all(
      symbols.map((symbol) => getQuoteAlphaVantage(symbol))
    );
    return quotes;
  }
}

/**
 * Financial Modeling Prep: Quote endpoint
 */
async function getQuoteFMP(symbol: string): Promise<Quote> {
  const data = await apiRequest<any>(`quote/${symbol}`);

  if (!data || data.length === 0) {
    throw new Error(`No data found for symbol: ${symbol}`);
  }

  const quote = data[0];
  return {
    symbol: quote.symbol,
    name: quote.name || symbol,
    price: parseFloat(quote.price),
    change: parseFloat(quote.change),
    changePercent: parseFloat(quote.changesPercentage),
    high: parseFloat(quote.dayHigh),
    low: parseFloat(quote.dayLow),
    open: parseFloat(quote.open),
    previousClose: parseFloat(quote.previousClose),
    volume: parseInt(quote.volume),
    avgVolume: parseInt(quote.avgVolume || '0'),
    marketCap: parseInt(quote.marketCap || '0'),
    timestamp: Date.now(),
  };
}

/**
 * Financial Modeling Prep: Batch quotes
 */
async function getQuotesFMP(symbols: string[]): Promise<Quote[]> {
  const symbolsParam = symbols.join(',');
  const data = await apiRequest<any[]>(`quote/${symbolsParam}`);

  if (!data || data.length === 0) {
    return [];
  }

  return data.map((quote) => ({
    symbol: quote.symbol,
    name: quote.name || quote.symbol,
    price: parseFloat(quote.price),
    change: parseFloat(quote.change),
    changePercent: parseFloat(quote.changesPercentage),
    high: parseFloat(quote.dayHigh),
    low: parseFloat(quote.dayLow),
    open: parseFloat(quote.open),
    previousClose: parseFloat(quote.previousClose),
    volume: parseInt(quote.volume),
    avgVolume: parseInt(quote.avgVolume || '0'),
    marketCap: parseInt(quote.marketCap || '0'),
    timestamp: Date.now(),
  }));
}

/**
 * Alpha Vantage: GLOBAL_QUOTE endpoint
 */
async function getQuoteAlphaVantage(symbol: string): Promise<Quote> {
  const data = await apiRequest<any>('GLOBAL_QUOTE', { symbol });

  const quote = data['Global Quote'];
  if (!quote) {
    throw new Error(`No data found for symbol: ${symbol}`);
  }

  return {
    symbol: quote['01. symbol'],
    name: symbol,
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    high: parseFloat(quote['03. high']),
    low: parseFloat(quote['04. low']),
    open: parseFloat(quote['02. open']),
    previousClose: parseFloat(quote['08. previous close']),
    volume: parseInt(quote['06. volume']),
    avgVolume: 0, // Alpha Vantage doesn't provide avg volume in this endpoint
    marketCap: 0, // Need additional endpoint
    timestamp: Date.now(),
  };
}

/**
 * Fetch real-time quotes for top gainers
 */
export async function getTopGainers(): Promise<Quote[]> {
  const provider = getApiProvider();

  if (provider === 'fmp') {
    const data = await apiRequest<any[]>('actives');
    return data.slice(0, 10).map((item) => ({
      symbol: item.symbol,
      name: item.name || item.symbol,
      price: parseFloat(item.price),
      change: parseFloat(item.change),
      changePercent: parseFloat(item.changesPercentage),
      high: 0,
      low: 0,
      open: 0,
      previousClose: 0,
      volume: parseInt(item.volume),
      avgVolume: 0,
      marketCap: parseInt(item.marketCap || '0'),
      timestamp: Date.now(),
    }));
  }

  return [];
}

/**
 * Fetch real-time quotes for top losers
 */
export async function getTopLosers(): Promise<Quote[]> {
  // Similar implementation to gainers
  return getTopGainers(); // MVP: Use same endpoint
}
