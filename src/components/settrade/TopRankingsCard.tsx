/**
 * Top Rankings Card Component
 * Displays top stocks by trading value and volume
 * Answers: Which stocks are most active today?
 */

'use client';

import { formatPercent, getChangeColor } from '@/lib/format';

interface TopStock {
  symbol: string;
  name: string;
  last: number;
  change: number;
  chgPct: number;
  valMillion: number;
  volMillion: number;
}

interface TopRankingsCardProps {
  topByValue: TopStock[];
  topByVolume: TopStock[];
}

export default function TopRankingsCard({ topByValue, topByVolume }: TopRankingsCardProps) {
  return (
    <div className="space-y-4">
      {/* Top by Value */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">
            🔥 Top by Trading Value
          </h4>
        </div>

        <div className="space-y-1.5">
          {topByValue.slice(0, 10).map((stock, i) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between py-2 px-3 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span
                  className={`text-xs font-bold flex-shrink-0 w-5 h-5 flex items-center justify-center rounded ${
                    i === 0 ? 'bg-yellow-100 text-yellow-700' :
                    i === 1 ? 'bg-orange-100 text-orange-700' :
                    i === 2 ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{stock.symbol}</p>
                  <p className="text-xs text-gray-500">฿{stock.valMillion.toFixed(0)}M</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm font-bold text-gray-900">{stock.last.toFixed(2)}</p>
                <p className={`text-xs font-medium ${getChangeColor(stock.chgPct)}`}>
                  {stock.chgPct >= 0 ? '+' : ''}{formatPercent(stock.chgPct)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top by Volume */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">
            📊 Top by Volume
          </h4>
        </div>

        <div className="space-y-1.5">
          {topByVolume.slice(0, 10).map((stock, i) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between py-2 px-3 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span
                  className={`text-xs font-bold flex-shrink-0 w-5 h-5 flex items-center justify-center rounded ${
                    i === 0 ? 'bg-blue-100 text-blue-700' :
                    i === 1 ? 'bg-indigo-100 text-indigo-700' :
                    i === 2 ? 'bg-sky-100 text-sky-700' :
                    'bg-gray-100 text-gray-600'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{stock.symbol}</p>
                  <p className="text-xs text-gray-500">{(stock.volMillion / 1000).toFixed(0)}B shares</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm font-bold text-gray-900">{stock.last.toFixed(2)}</p>
                <p className={`text-xs font-medium ${getChangeColor(stock.chgPct)}`}>
                  {stock.chgPct >= 0 ? '+' : ''}{formatPercent(stock.chgPct)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
