/**
 * Financial Statements API
 * Phase 1: Data Layer Foundation
 */

import { apiRequest } from './stock-api';
import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '@/types/financials';

/**
 * Fetch income statement
 */
export async function getIncomeStatement(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual'
): Promise<IncomeStatement[]> {
  const endpoint = period === 'annual' ? 'income-statement' : 'income-statement-as-reported';
  const data = await apiRequest<any[]>(`${endpoint}/${symbol}`, {}, 'fmp');

  if (!data || data.length === 0) {
    return [];
  }

  return data.slice(0, 10).map((item) => ({
    fiscalDate: item.date || item.filingDate,
    fiscalYear: item.calendarYear || new Date(item.date).getFullYear(),
    fiscalPeriod: item.period || 'FY',
    revenue: item.revenue || 0,
    costOfRevenue: item.costOfRevenue || 0,
    grossProfit: item.grossProfit || 0,
    operatingExpenses: item.operatingExpenses || 0,
    operatingIncome: item.operatingIncome || 0,
    netIncome: item.netIncome || 0,
    eps: item.eps || 0,
    epsDiluted: item.epsdiluted || 0,
  }));
}

/**
 * Fetch balance sheet
 */
export async function getBalanceSheet(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual'
): Promise<BalanceSheet[]> {
  const endpoint = period === 'annual' ? 'balance-sheet-statement' : 'balance-sheet-statement-as-reported';
  const data = await apiRequest<any[]>(`${endpoint}/${symbol}`, {}, 'fmp');

  if (!data || data.length === 0) {
    return [];
  }

  return data.slice(0, 10).map((item) => ({
    fiscalDate: item.date || item.filingDate,
    fiscalYear: item.calendarYear || new Date(item.date).getFullYear(),
    fiscalPeriod: item.period || 'FY',
    totalAssets: item.totalAssets || 0,
    totalCurrentAssets: item.totalCurrentAssets || 0,
    totalLiabilities: item.totalLiabilities || 0,
    totalCurrentLiabilities: item.totalCurrentLiabilities || 0,
    totalDebt: item.totalDebt || 0,
    totalEquity: item.totalEquity || 0,
    cashAndEquivalents: item.cashAndCashEquivalents || 0,
    inventory: item.inventory || 0,
  }));
}

/**
 * Fetch cash flow statement
 */
export async function getCashFlowStatement(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual'
): Promise<CashFlowStatement[]> {
  const endpoint = period === 'annual' ? 'cash-flow-statement' : 'cash-flow-statement-as-reported';
  const data = await apiRequest<any[]>(`${endpoint}/${symbol}`, {}, 'fmp');

  if (!data || data.length === 0) {
    return [];
  }

  return data.slice(0, 10).map((item) => ({
    fiscalDate: item.date || item.filingDate,
    fiscalYear: item.calendarYear || new Date(item.date).getFullYear(),
    fiscalPeriod: item.period || 'FY',
    netIncome: item.netIncome || 0,
    depreciation: item.depreciationAndAmortization || 0,
    operatingCashFlow: item.operatingCashFlow || 0,
    capitalExpenditure: item.capex || 0,
    freeCashFlow: item.freeCashFlow || 0,
    dividendPayments: item.dividendPayments || 0,
    stockBuybacks: item.stockBuyback || 0,
  }));
}

/**
 * Fetch all financial statements
 */
export async function getFinancialStatements(symbol: string) {
  const [incomeStatement, balanceSheet, cashFlow] = await Promise.all([
    getIncomeStatement(symbol, 'annual'),
    getBalanceSheet(symbol, 'annual'),
    getCashFlowStatement(symbol, 'annual'),
  ]);

  return {
    incomeStatement,
    balanceSheet,
    cashFlow,
  };
}
