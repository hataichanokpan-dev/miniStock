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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {/* Top by Value */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
          Top Value
        </h4>

        <div className="space-y-1">
          {topByValue.slice(0, 8).map((stock, i) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between py-1.5 px-2 bg-white border border-gray-100 rounded hover:border-gray-200 transition-colors cursor-pointer group"
              onClick={() => window.location.href = `/stocks/${stock.symbol}.BK`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`text-[10px] sm:text-xs font-bold flex-shrink-0 w-4 h-4 flex items-center justify-center rounded ${
                    i === 0 ? 'bg-orange-500 text-white' :
                    i === 1 ? 'bg-amber-500 text-white' :
                    i === 2 ? 'bg-yellow-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">{stock.symbol}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className={`text-xs sm:text-sm font-bold ${getChangeColor(stock.chgPct)}`}>
                  {formatPercent(stock.chgPct)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top by Volume */}
      <div>
        <h4 className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Top Volume
        </h4>

        <div className="space-y-1">
          {topByVolume.slice(0, 8).map((stock, i) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between py-1.5 px-2 bg-white border border-gray-100 rounded hover:border-gray-200 transition-colors cursor-pointer group"
              onClick={() => window.location.href = `/stocks/${stock.symbol}.BK`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className={`text-[10px] sm:text-xs font-bold flex-shrink-0 w-4 h-4 flex items-center justify-center rounded ${
                    i === 0 ? 'bg-blue-500 text-white' :
                    i === 1 ? 'bg-indigo-500 text-white' :
                    i === 2 ? 'bg-sky-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-900 truncate">{stock.symbol}</span>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className={`text-xs sm:text-sm font-bold ${getChangeColor(stock.chgPct)}`}>
                   {formatPercent(stock.chgPct)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
