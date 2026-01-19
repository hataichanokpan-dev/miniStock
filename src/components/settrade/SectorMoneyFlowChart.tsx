/**
 * Sector Money Flow Chart Component
 * Shows where money is flowing by sector
 * Focus on trading VALUE to answer "Where is the money going?"
 */

'use client';

import {
  formatTradingValueMn,
  formatVolume,
  formatPercent,
  getChangeColor,
} from '@/lib/format';

interface SectorData {
  id: string;
  name: string;
  last: number;
  chg: number;
  chgPct: number;
  volK: number;
  valMn: number;
}

interface SectorMoneyFlowChartProps {
  sectors: SectorData[];
  limit?: number;
}

// Calculate money flow score (value × change direction)
function getFlowScore(sector: SectorData): number {
  const valueFactor = Math.log10(sector.valMn * 1e6 + 1); // Log scale for value
  const direction = sector.chgPct >= 0 ? 1 : -1;
  const magnitude = Math.abs(sector.chgPct);
  return valueFactor * direction * magnitude;
}

export default function SectorMoneyFlowChart({ sectors, limit = 10 }: SectorMoneyFlowChartProps) {
  // Sort by money flow (value-weighted change)
  const sortedByFlow = [...sectors].sort((a, b) => getFlowScore(b) - getFlowScore(a)).slice(0, limit);

  // Calculate totals for market overview
  const totalValue = sectors.reduce((sum, s) => sum + s.valMn, 0);
  const totalVolume = sectors.reduce((sum, s) => sum + s.volK, 0);
  const advancing = sectors.filter(s => s.chgPct > 0).length;
  const declining = sectors.filter(s => s.chgPct < 0).length;

  // Calculate max values for bar scaling
  const maxVal = Math.max(...sortedByFlow.map(s => s.valMn));

  return (
    <div className="space-y-4">
      {/* Market Overview - Compact */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-gray-500">Total Value</p>
          <p className="text-base font-bold text-gray-900">{formatTradingValueMn(totalValue * 1e6)}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-gray-500">Volume</p>
          <p className="text-base font-bold text-gray-900">{formatVolume(totalVolume * 1000)}</p>
        </div>
        <div className="bg-green-50 rounded p-2">
          <p className="text-gray-500">Up</p>
          <p className="text-base font-bold text-green-600">{advancing}</p>
        </div>
        <div className="bg-red-50 rounded p-2">
          <p className="text-gray-500">Down</p>
          <p className="text-base font-bold text-red-600">{declining}</p>
        </div>
      </div>

      {/* Money Flow Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">Money Flow by Sector</h4>
        <span className="text-xs text-gray-500">Sorted by trading value</span>
      </div>

      {/* Sector Flow List */}
      <div className="space-y-2">
        {sortedByFlow.map((sector, index) => {
          const valWidth = (sector.valMn / maxVal) * 100;
          const isPositive = sector.chgPct >= 0;
          const flowColor = isPositive ? 'bg-green-500' : 'bg-red-500';
          const textColor = getChangeColor(sector.chgPct);

          return (
            <div key={sector.id} className="flex items-center gap-3 text-sm">
              {/* Rank & Sector Info */}
              <div className="w-6 flex-shrink-0 text-center">
                <span className={`text-xs font-bold ${index < 3 ? 'text-[#1e3a5f]' : 'text-gray-400'}`}>
                  {index + 1}
                </span>
              </div>

              <div className="w-28 flex-shrink-0">
                <p className="font-medium text-gray-900 truncate" title={sector.name}>
                  {sector.name}
                </p>
                <p className="text-xs text-gray-400">{sector.id}</p>
              </div>

              {/* Value Bar - Main indicator of money flow */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {/* Value bar */}
                  <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden relative">
                    <div
                      className={`h-full ${flowColor} transition-all duration-300`}
                      style={{ width: `${valWidth}%` }}
                    ></div>
                    {/* Value label */}
                    <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-gray-700">
                      {formatTradingValueMn(sector.valMn * 1e6)}
                    </span>
                  </div>

                  {/* Change percentage */}
                  <div className={`w-14 text-right font-bold text-xs ${textColor}`}>
                    {formatPercent(sector.chgPct)}
                  </div>
                </div>

                {/* Volume row */}
                <div className="flex items-center justify-between text-xs text-gray-400 mt-0.5">
                  <span>Vol: {formatVolume(sector.volK * 1000)}</span>
                  <span>Index: {sector.last.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded"></span>
          Money In (Buying)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded"></span>
          Money Out (Selling)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-16 h-3 bg-gray-100 rounded border"></span>
          Bar = Trading Value
        </span>
      </div>
    </div>
  );
}
