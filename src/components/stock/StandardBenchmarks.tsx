/**
 * Professional Standard Benchmarks Component
 * Displays Stock vs SET Index vs Sector comparison
 * Professional investor-friendly layout
 */

'use client';

import { formatPercent } from '@/lib/format';
import { SET_INDEX_BENCHMARK, getSectorBenchmark, getSectorName, getSectorForSymbol, SECTOR_PEER_GROUPS } from '@/lib/sectorStandards';
import type { FinancialMetrics } from '@/types/financials';

interface StandardBenchmarksProps {
  symbol: string;
  metrics: FinancialMetrics | null;
}

// Status badge for showing comparison result
function StatusBadge({ value, benchmark, lowerBetter }: { value: number | null; benchmark: number; lowerBetter: boolean }) {
  if (value === null) return null;

  const diff = ((value - benchmark) / benchmark) * 100;
  const isBetter = lowerBetter ? diff < 0 : diff > 0;
  const isNeutral = Math.abs(diff) < 5; // Within 5% is neutral

  if (isNeutral) {
    return (
      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600">
        ≈ In line
      </span>
    );
  }

  if (isBetter) {
    return (
      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-700">
        ✓ Better ({diff > 0 ? '+' : ''}{diff.toFixed(0)}%)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-red-100 text-red-700">
      ✗ Worse ({diff > 0 ? '+' : ''}{diff.toFixed(0)}%)
    </span>
  );
}

// Comparison row component
function ComparisonRow({
  label,
  stockValue,
  setValue,
  sectorValue,
  format,
  lowerBetter,
  unit = '',
}: {
  label: string;
  stockValue: number | null;
  setValue: number;
  sectorValue: number;
  format: (v: number) => string;
  lowerBetter: boolean;
  unit?: string;
}) {
  const getVsSetColor = (value: number | null, benchmark: number) => {
    if (value === null) return 'text-gray-400';
    const diff = ((value - benchmark) / benchmark) * 100;
    if (Math.abs(diff) < 5) return 'text-gray-600';
    return lowerBetter ? (value < benchmark ? 'text-green-600' : 'text-red-600')
                     : (value > benchmark ? 'text-green-600' : 'text-red-600');
  };

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 py-3 border-b border-gray-100 last:border-0 items-center min-w-[500px] sm:min-w-0">
      <div className="text-xs sm:text-sm font-medium text-gray-700">{label}</div>

      {/* Stock */}
      <div className="text-right">
        <div className={`text-sm sm:text-base font-bold ${getVsSetColor(stockValue, setValue)}`}>
          {stockValue !== null ? format(stockValue) : 'N/A'}
        </div>
        <div className="text-[10px] sm:text-xs text-gray-400">vs {setValue.toFixed(1)}{unit}</div>
      </div>

      {/* SET Index */}
      <div className="text-center">
        <div className="text-xs sm:text-sm font-semibold text-blue-700">{format(setValue)}</div>
        <div className="text-[10px] sm:text-xs text-gray-500">SET Index</div>
      </div>

      {/* Sector */}
      <div className="text-right">
        <div className="text-xs sm:text-sm font-semibold text-purple-700">{format(sectorValue)}</div>
        <div className="text-[10px] sm:text-xs text-gray-500">Sector</div>
      </div>
    </div>
  );
}

export default function StandardBenchmarks({ symbol, metrics }: StandardBenchmarksProps) {
  const sectorKey = getSectorForSymbol(symbol);
  const sectorBenchmark = sectorKey ? SECTOR_PEER_GROUPS[sectorKey].benchmark : null;
  const sectorName = sectorKey ? SECTOR_PEER_GROUPS[sectorKey].name : null;

  if (!sectorBenchmark) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <span className="text-4xl mb-3">📊</span>
        <p className="text-sm font-semibold text-gray-700 mb-1">Sector benchmarks not available</p>
        <p className="text-xs text-gray-500">Standard comparisons are available for Thai SET stocks</p>
      </div>
    );
  }

  // Calculate overall scores
  const getScore = () => {
    if (!metrics) return null;

    let better = 0;
    let worse = 0;
    let total = 0;

    if (metrics.peRatio !== null && metrics.peRatio > 0) {
      total++;
      if (metrics.peRatio < SET_INDEX_BENCHMARK.peRatio) better++; else worse++;
    }
    if (metrics.pbRatio !== null && metrics.pbRatio > 0) {
      total++;
      if (metrics.pbRatio < SET_INDEX_BENCHMARK.pbRatio) better++; else worse++;
    }
    if (metrics.dividendYield !== null && metrics.dividendYield > 0) {
      total++;
      if (metrics.dividendYield * 100 > SET_INDEX_BENCHMARK.dividendYield) better++; else worse++;
    }

    return { better, worse, total };
  };

  const score = getScore();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with overall assessment */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-1">Valuation Summary</h3>
            <p className="text-[10px] sm:text-xs text-gray-600">
              Comparing <span className="font-semibold text-gray-900">{symbol}</span> against
              <span className="font-semibold text-blue-700"> SET Index</span> and
              <span className="font-semibold text-purple-700"> {sectorName}</span> benchmarks
            </p>
          </div>
          {score && score.total > 0 && (
            <div className={`flex sm:block items-center justify-between sm:text-right gap-2`}>
              <div className={`text-xl sm:text-2xl font-bold ${score.better > score.worse ? 'text-green-600' : score.worse > score.better ? 'text-red-600' : 'text-gray-600'}`}>
                {score.better > score.worse ? '✓' : score.worse > score.better ? '✗' : '='}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500">
                {score.better} better, {score.worse} worse
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Horizontal scroll container for mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[500px] sm:min-w-0">
            {/* Header */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-4 py-3 bg-slate-50 border-b border-gray-200">
              <div className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">Metric</div>
              <div className="text-right text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wide">Stock</div>
              <div className="text-center text-[10px] sm:text-xs font-semibold text-blue-700 uppercase tracking-wide">SET Index</div>
              <div className="text-right text-[10px] sm:text-xs font-semibold text-purple-700 uppercase tracking-wide">Sector</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
          {/* P/E Ratio */}
          <ComparisonRow
            label="P/E Ratio"
            stockValue={metrics?.peRatio ?? null}
            setValue={SET_INDEX_BENCHMARK.peRatio}
            sectorValue={sectorBenchmark.peRatio!}
            format={(v) => v.toFixed(1) + 'x'}
            lowerBetter={true}
          />

          {/* P/BV Ratio */}
          <ComparisonRow
            label="P/BV Ratio"
            stockValue={metrics?.pbRatio ?? null}
            setValue={SET_INDEX_BENCHMARK.pbRatio}
            sectorValue={sectorBenchmark.pbRatio!}
            format={(v) => v.toFixed(2) + 'x'}
            lowerBetter={true}
          />

          {/* Dividend Yield */}
          <ComparisonRow
            label="Dividend Yield"
            stockValue={metrics?.dividendYield != null && metrics.dividendYield > 0 ? metrics.dividendYield * 100 : null}
            setValue={SET_INDEX_BENCHMARK.dividendYield}
            sectorValue={sectorBenchmark.dividendYield ?? SET_INDEX_BENCHMARK.dividendYield}
            format={(v) => v.toFixed(1) + '%'}
            lowerBetter={false}
          />

          {/* ROE */}
          <ComparisonRow
            label="ROE"
            stockValue={metrics?.roe ?? null}
            setValue={sectorBenchmark.roe || 15}
            sectorValue={sectorBenchmark.roe || 15}
            format={(v) => v.toFixed(1) + '%'}
            lowerBetter={false}
          />
        </div>
      </div>
      </div>
      </div>

      {/* Quick Analysis Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Valuation */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base sm:text-lg">💰</span>
            <h4 className="text-xs font-semibold text-gray-700">Valuation</h4>
          </div>
          {metrics?.peRatio ? (
            <>
              <StatusBadge value={metrics.peRatio} benchmark={SET_INDEX_BENCHMARK.peRatio} lowerBetter={true} />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                {metrics.peRatio < SET_INDEX_BENCHMARK.peRatio
                  ? 'Stock trades below SET average - may be undervalued'
                  : metrics.peRatio > SET_INDEX_BENCHMARK.peRatio * 1.2
                    ? 'Stock trades at premium to SET average'
                    : 'Stock valuation in line with market'}
              </p>
            </>
          ) : (
            <p className="text-[10px] sm:text-xs text-gray-400">No data available</p>
          )}
        </div>

        {/* Yield */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base sm:text-lg">📊</span>
            <h4 className="text-xs font-semibold text-gray-700">Yield</h4>
          </div>
          {metrics?.dividendYield && metrics.dividendYield > 0 ? (
            <>
              <StatusBadge value={metrics.dividendYield * 100} benchmark={SET_INDEX_BENCHMARK.dividendYield} lowerBetter={false} />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                {metrics.dividendYield * 100 > SET_INDEX_BENCHMARK.dividendYield
                  ? 'Above average dividend yield'
                  : 'Below average dividend yield'}
              </p>
            </>
          ) : (
            <p className="text-[10px] sm:text-xs text-gray-400">No data available</p>
          )}
        </div>

        {/* Sector Position */}
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base sm:text-lg">🏢</span>
            <h4 className="text-xs font-semibold text-gray-700">Sector Position</h4>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-purple-700">{sectorName}</div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              Sector P/E: {(sectorBenchmark.peRatio ?? SET_INDEX_BENCHMARK.peRatio).toFixed(1)}x vs SET {SET_INDEX_BENCHMARK.peRatio.toFixed(1)}x
            </p>
            {(sectorBenchmark.peRatio ?? SET_INDEX_BENCHMARK.peRatio) < SET_INDEX_BENCHMARK.peRatio ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 mt-1">
                Value sector
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 mt-1">
                Growth sector
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-gray-500 py-2 flex-wrap">
        <span className="flex items-center gap-1 sm:gap-1.5">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-100 rounded-full"></span>
          <span>Green = Better than standard</span>
        </span>
        <span className="flex items-center gap-1 sm:gap-1.5">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-100 rounded-full"></span>
          <span>Red = Below standard</span>
        </span>
        <span className="flex items-center gap-1 sm:gap-1.5">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-100 rounded-full"></span>
          <span>Gray = In line (±5%)</span>
        </span>
      </div>
    </div>
  );
}
