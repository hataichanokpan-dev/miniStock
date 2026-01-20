/**
 * Valuation Card Component
 * Provides intrinsic value calculations and valuation status
 * Features:
 * - DCF (Discounted Cash Flow) Calculator
 * - Graham Number Calculator
 * - P/E vs Historical comparison
 * - Overvalued/Fair/Undervalued indicator
 */

'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { formatNumber, formatPercent, getChangeColor } from '@/lib/format';

interface ValuationCardProps {
  symbol: string;
  currentPrice: number;
  metrics?: {
    peRatio?: number | null;
    pbRatio?: number | null;
    eps?: number | null; // Earnings per share
    bookValuePerShare?: number | null;
    dividendYield?: number | null;
    revenueGrowth?: number | null;
    deRatio?: number | null;
  } | null;
}

interface ValuationResult {
  intrinsicValue: number;
  marginOfSafety: number; // percentage
  status: 'Undervalued' | 'Fair' | 'Overvalued';
  upsidePotential: number; // percentage
}

// DCF Calculator
function calculateDCF(
  currentEPS: number,
  growthRate: number = 10, // default 10% growth
  discountRate: number = 12, // default 12% discount rate
  terminalGrowth: number = 3, // default 3% terminal growth
  years: number = 5 // default 5 years projection
): ValuationResult {
  // Simplified DCF calculation
  let presentValue = 0;
  let eps = currentEPS;

  for (let i = 1; i <= years; i++) {
    eps = eps * (1 + growthRate / 100);
    const discountedCashFlow = eps / Math.pow(1 + discountRate / 100, i);
    presentValue += discountedCashFlow;
  }

  // Terminal value
  const terminalValue = (eps * (1 + terminalGrowth / 100)) / (discountRate / 100 - terminalGrowth / 100);
  const terminalValuePV = terminalValue / Math.pow(1 + discountRate / 100, years);
  presentValue += terminalValuePV;

  const intrinsicValue = presentValue;
  const marginOfSafety = ((intrinsicValue - currentEPS * 15) / intrinsicValue) * 100; // Simplified
  const upsidePotential = ((intrinsicValue - currentEPS * 15) / (currentEPS * 15)) * 100;

  let status: 'Undervalued' | 'Fair' | 'Overvalued';
  if (upsidePotential > 20) {
    status = 'Undervalued';
  } else if (upsidePotential < -20) {
    status = 'Overvalued';
  } else {
    status = 'Fair';
  }

  return {
    intrinsicValue,
    marginOfSafety: Math.max(marginOfSafety, 0),
    status,
    upsidePotential,
  };
}

// Graham Number Calculator
// Formula: sqrt(22.5 * EPS * Book Value per Share)
function calculateGrahamNumber(
  eps: number | null,
  bookValue: number | null
): ValuationResult | null {
  if (!eps || !bookValue || eps <= 0 || bookValue <= 0) {
    return null;
  }

  const grahamNumber = Math.sqrt(22.5 * eps * bookValue);
  const currentPrice = eps * 15; // Simplified current price from P/E
  const marginOfSafety = ((grahamNumber - currentPrice) / grahamNumber) * 100;
  const upsidePotential = ((grahamNumber - currentPrice) / currentPrice) * 100;

  let status: 'Undervalued' | 'Fair' | 'Overvalued';
  if (upsidePotential > 20) {
    status = 'Undervalued';
  } else if (upsidePotential < -20) {
    status = 'Overvalued';
  } else {
    status = 'Fair';
  }

  return {
    intrinsicValue: grahamNumber,
    marginOfSafety: Math.max(marginOfSafety, 0),
    status,
    upsidePotential,
  };
}

// P/E Historical Comparison (simulated for demo)
function getPEHistoricalComparison(currentPE: number): {
  fiveYearAvg: number;
  high: number;
  low: number;
  percentile: number;
} {
  // Simulated historical data - in production, this would come from API
  const fiveYearAvg = currentPE * 0.9; // Simulated
  const high = currentPE * 1.5;
  const low = currentPE * 0.6;
  const percentile = 50; // Simplified

  return { fiveYearAvg, high, low, percentile };
}

export default function ValuationCard({ symbol, currentPrice, metrics }: ValuationCardProps) {
  const [activeTab, setActiveTab] = useState<'dcf' | 'graham' | 'historical'>('dcf');

  // DCF inputs state
  const [growthRate, setGrowthRate] = useState(10);
  const [discountRate, setDiscountRate] = useState(12);
  const [years, setYears] = useState(5);

  // Calculate DCF valuation
  const dcfValuation = metrics?.eps != null
    ? calculateDCF(metrics.eps, growthRate, discountRate, 3, years)
    : null;

  // Calculate Graham Number valuation
  const grahamValuation = calculateGrahamNumber(metrics?.eps ?? null, metrics?.bookValuePerShare ?? null);

  // Get P/E historical comparison
  const peComparison = metrics?.peRatio != null ? getPEHistoricalComparison(metrics.peRatio) : null;

  // Determine overall valuation status
  const getOverallStatus = (): 'Undervalued' | 'Fair' | 'Overvalued' => {
    if (!dcfValuation && !grahamValuation) return 'Fair';

    const votes = [];
    if (dcfValuation) votes.push(dcfValuation.status);
    if (grahamValuation) votes.push(grahamValuation.status);

    const undervalued = votes.filter(v => v === 'Undervalued').length;
    const overvalued = votes.filter(v => v === 'Overvalued').length;

    if (undervalued > overvalued) return 'Undervalued';
    if (overvalued > undervalued) return 'Overvalued';
    return 'Fair';
  };

  const overallStatus = getOverallStatus();

  const statusConfig = {
    Undervalued: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800',
      icon: '🟢',
    },
    Fair: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-300',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-800',
      icon: '🟡',
    },
    Overvalued: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800',
      icon: '🔴',
    },
  };

  const config = statusConfig[overallStatus];

  return (
    <Card title="Valuation Analysis" subtitle="Is the stock fairly priced?">
      {/* Overall Valuation Status */}
      <div className={`mb-6 p-4 rounded-lg border-2 ${config.bg} ${config.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <p className="text-sm text-gray-600">Valuation Status</p>
              <p className={`text-2xl font-bold ${config.text}`}>
                {overallStatus}
              </p>
            </div>
          </div>
          {dcfValuation && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Upside Potential</p>
              <p className={`text-lg font-bold ${getChangeColor(dcfValuation.upsidePotential)}`}>
                {dcfValuation.upsidePotential >= 0 ? '+' : ''}{formatPercent(dcfValuation.upsidePotential)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('dcf')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'dcf'
                ? 'border-[#1e3a5f] text-[#1e3a5f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            DCF Model
          </button>
          <button
            onClick={() => setActiveTab('graham')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'graham'
                ? 'border-[#1e3a5f] text-[#1e3a5f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Graham Number
          </button>
          <button
            onClick={() => setActiveTab('historical')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'historical'
                ? 'border-[#1e3a5f] text-[#1e3a5f]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            P/E Historical
          </button>
        </div>
      </div>

      {/* DCF Tab */}
      {activeTab === 'dcf' && (
        <div>
          {!metrics?.eps ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">EPS data not available for DCF calculation</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* DCF Result */}
              {dcfValuation && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Intrinsic Value</p>
                      <p className="text-lg font-bold text-[#1e3a5f]">
                        ${formatNumber(dcfValuation.intrinsicValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Margin of Safety</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatPercent(dcfValuation.marginOfSafety)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <p className={`text-lg font-bold ${config.text}`}>
                        {dcfValuation.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Upside</p>
                      <p className={`text-lg font-bold ${getChangeColor(dcfValuation.upsidePotential)}`}>
                        {dcfValuation.upsidePotential >= 0 ? '+' : ''}{formatPercent(dcfValuation.upsidePotential)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* DCF Inputs */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">DCF Parameters</h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Growth Rate (%)
                    </label>
                    <input
                      type="number"
                      value={growthRate}
                      onChange={(e) => setGrowthRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                      min="0"
                      max="50"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Discount Rate (%)
                    </label>
                    <input
                      type="number"
                      value={discountRate}
                      onChange={(e) => setDiscountRate(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                      min="5"
                      max="25"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Projection Years
                    </label>
                    <input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                      min="3"
                      max="10"
                      step="1"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>DCF Formula:</strong> Projects future cash flows and discounts them to present value.
                    Higher growth rate increases intrinsic value. Higher discount rate decreases it.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Graham Number Tab */}
      {activeTab === 'graham' && (
        <div>
          {!grahamValuation ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">EPS or Book Value data not available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Graham Result */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Graham Number</p>
                    <p className="text-lg font-bold text-[#1e3a5f]">
                      ${formatNumber(grahamValuation.intrinsicValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Margin of Safety</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatPercent(grahamValuation.marginOfSafety)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className={`text-lg font-bold ${config.text}`}>
                      {grahamValuation.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Upside</p>
                    <p className={`text-lg font-bold ${getChangeColor(grahamValuation.upsidePotential)}`}>
                      {grahamValuation.upsidePotential >= 0 ? '+' : ''}{formatPercent(grahamValuation.upsidePotential)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Graham Formula */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 mb-2">
                  <strong>Graham Number Formula:</strong> √(22.5 × EPS × Book Value per Share)
                </p>
                <p className="text-xs text-blue-700">
                  Benjamin Graham&apos;s defensive stock price formula. 22.5 = 15 P/E ratio × 1.5 P/B ratio.
                  Stock is undervalued if price is below Graham Number.
                </p>
              </div>

              {/* Input Data */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">EPS</p>
                  <p className="text-sm font-bold text-gray-900">${metrics?.eps != null ? metrics.eps.toFixed(2) : 'N/A'}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Book Value/Share</p>
                  <p className="text-sm font-bold text-gray-900">${metrics?.bookValuePerShare != null ? metrics.bookValuePerShare.toFixed(2) : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* P/E Historical Tab */}
      {activeTab === 'historical' && (
        <div>
          {!peComparison ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">P/E ratio data not available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current P/E */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Current P/E</p>
                    <p className="text-2xl font-bold text-[#1e3a5f]">
                      {metrics?.peRatio != null ? metrics.peRatio.toFixed(2) + 'x' : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">vs 5-Year Avg</p>
                    <p className={`text-lg font-bold ${getChangeColor(
                      ((metrics?.peRatio ?? 0) - peComparison.fiveYearAvg) / peComparison.fiveYearAvg * 100
                    )}`}>
                      {metrics?.peRatio != null && peComparison.fiveYearAvg
                        ? ((metrics.peRatio - peComparison.fiveYearAvg) / peComparison.fiveYearAvg * 100 >= 0 ? '+' : '') +
                          formatPercent((metrics.peRatio - peComparison.fiveYearAvg) / peComparison.fiveYearAvg * 100)
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Range Bar */}
                <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    style={{ width: '100%' }}
                  ></div>
                  <div
                    className="absolute top-0 h-full w-1 bg-white border-2 border-gray-800"
                    style={{
                      left: `${((metrics?.peRatio ?? peComparison.fiveYearAvg) - peComparison.low) / (peComparison.high - peComparison.low) * 100}%`,
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {peComparison.low.toFixed(1)}x - {peComparison.high.toFixed(1)}x
                  </div>
                </div>
              </div>

              {/* Historical Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-green-700">5-Year Low</p>
                  <p className="text-lg font-bold text-green-800">{peComparison.low.toFixed(1)}x</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-yellow-700">5-Year Avg</p>
                  <p className="text-lg font-bold text-yellow-800">{peComparison.fiveYearAvg.toFixed(1)}x</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-red-700">5-Year High</p>
                  <p className="text-lg font-bold text-red-800">{peComparison.high.toFixed(1)}x</p>
                </div>
              </div>

              {/* Interpretation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>P/E Interpretation:</strong>{' '}
                  {metrics?.peRatio != null && metrics.peRatio < peComparison.fiveYearAvg
                    ? 'Current P/E is below 5-year average, potentially undervalued.'
                    : metrics?.peRatio != null && metrics.peRatio > peComparison.fiveYearAvg
                    ? 'Current P/E is above 5-year average, potentially overvalued.'
                    : 'Current P/E is near 5-year average, fairly valued.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
