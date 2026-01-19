/**
 * Financial Statements API
 * Phase 1: Data Layer Foundation
 */

import { apiRequest, getApiProvider } from './stock-api';
import { getFinancialStatementsYahoo } from './yahoo-finance';
import type { IncomeStatement, BalanceSheet, CashFlowStatement } from '@/types/financials';

/**
 * Fetch income statement
 */
export async function getIncomeStatement(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual'
): Promise<IncomeStatement[]> {
  const provider = getApiProvider();

  if (provider === 'yahoo') {
    const statements = await getFinancialStatementsYahoo(symbol);
    return statements.incomeStatement;
  } else if (provider === 'fmp') {
    return getIncomeStatementFMP(symbol, period);
  } else {
    // Alpha Vantage - limited support
    return [];
  }
}

/**
 * Fetch balance sheet
 */
export async function getBalanceSheet(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual'
): Promise<BalanceSheet[]> {
  const provider = getApiProvider();

  if (provider === 'yahoo') {
    const statements = await getFinancialStatementsYahoo(symbol);
    return statements.balanceSheet;
  } else if (provider === 'fmp') {
    return getBalanceSheetFMP(symbol, period);
  } else {
    // Alpha Vantage - limited support
    return [];
  }
}

/**
 * Fetch cash flow statement
 */
export async function getCashFlowStatement(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual'
): Promise<CashFlowStatement[]> {
  const provider = getApiProvider();

  if (provider === 'yahoo') {
    const statements = await getFinancialStatementsYahoo(symbol);
    return statements.cashFlow;
  } else if (provider === 'fmp') {
    return getCashFlowStatementFMP(symbol, period);
  } else {
    // Alpha Vantage - limited support
    return [];
  }
}

/**
 * Fetch all financial statements
 */
export async function getFinancialStatements(symbol: string) {
  const provider = getApiProvider();

  if (provider === 'yahoo') {
    return getFinancialStatementsYahoo(symbol);
  } else if (provider === 'fmp') {
    const [incomeStatement, balanceSheet, cashFlow] = await Promise.all([
      getIncomeStatementFMP(symbol, 'annual'),
      getBalanceSheetFMP(symbol, 'annual'),
      getCashFlowStatementFMP(symbol, 'annual'),
    ]);

    return {
      incomeStatement,
      balanceSheet,
      cashFlow,
    };
  } else {
    // Alpha Vantage - limited support
    return {
      incomeStatement: [],
      balanceSheet: [],
      cashFlow: [],
    };
  }
}

/**
 * Financial Modeling Prep: Income statement
 */
async function getIncomeStatementFMP(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual'
): Promise<IncomeStatement[]> {
  const endpoint = period === 'annual' ? 'income-statement' : 'income-statement-as-reported';
  const data = await apiRequest<any[]>(`${endpoint}/${symbol}`);

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
 * Financial Modeling Prep: Balance sheet
 */
async function getBalanceSheetFMP(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual'
): Promise<BalanceSheet[]> {
  const endpoint = period === 'annual' ? 'balance-sheet-statement' : 'balance-sheet-statement-as-reported';
  const data = await apiRequest<any[]>(`${endpoint}/${symbol}`);

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
 * Financial Modeling Prep: Cash flow statement
 */
async function getCashFlowStatementFMP(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual'
): Promise<CashFlowStatement[]> {
  const endpoint = period === 'annual' ? 'cash-flow-statement' : 'cash-flow-statement-as-reported';
  const data = await apiRequest<any[]>(`${endpoint}/${symbol}`);

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
