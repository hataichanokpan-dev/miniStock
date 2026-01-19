/**
 * Sector Summary Card Component
 * Visual overview with simple chart for quick understanding
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

interface SectorSummaryCardProps {
  sectors: SectorData[];
  limit?: number;
}

export default function SectorSummaryCard({ sectors, limit = 6 }: SectorSummaryCardProps) {
  // Sort by value and get top sectors
  const topSectors = [...sectors].sort((a, b) => b.valMn - a.valMn).slice(0, limit);

  // Calculate stats
  const totalValue = sectors.reduce((sum, s) => sum + s.valMn, 0);
  const advancing = sectors.filter(s => s.chgPct > 0).length;
  const declining = sectors.filter(s => s.chgPct < 0).length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Total Value</p>
          <p className="text-sm font-bold text-gray-900">{formatTradingValueMn(totalValue * 1e6)}</p>
        </div>
        <div className="bg-green-50 rounded p-2">
          <p className="text-xs text-gray-500">Advancing</p>
          <p className="text-sm font-bold text-green-600">{advancing}</p>
        </div>
        <div className="bg-red-50 rounded p-2">
          <p className="text-xs text-gray-500">Declining</p>
          <p className="text-sm font-bold text-red-600">{declining}</p>
        </div>
      </div>

      {/* Simple Bar Chart - Value by Sector */}
      <div>
        <p className="text-xs font-medium text-gray-700 mb-2">Value Distribution</p>
        <div className="space-y-2">
          {topSectors.map((sector) => {
            const pct = (sector.valMn / totalValue) * 100;
            const barWidth = Math.max(pct * 2, 15); // Scale for visibility, min 15%
            const isPositive = sector.chgPct >= 0;

            return (
              <div key={sector.id} className="flex items-center gap-2">
                {/* Sector Name */}
                <div className="w-16 sm:w-20 flex-shrink-0">
                  <p className="text-xs font-medium text-gray-700 truncate" title={sector.name}>
                    {sector.name}
                  </p>
                </div>

                {/* Value Bar */}
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="w-14 sm:w-20 text-right flex-shrink-0">
                  <p className="text-xs font-bold text-gray-900">{pct.toFixed(1)}%</p>
                  <p className={`text-xs ${getChangeColor(sector.chgPct)}`}>
                    {formatPercent(sector.chgPct)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Gainer/Loser */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-3 pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs font-medium text-green-700 mb-2">Top Gainer</p>
          {(() => {
            const topGainer = sectors.find(s => s.chgPct === Math.max(...sectors.map(s => s.chgPct)));
            return topGainer ? (
              <div className="bg-green-50 rounded p-2">
                <p className="text-xs font-medium text-gray-700">
                  {topGainer.name}
                </p>
                <p className="text-sm font-bold text-green-600">
                  {formatPercent(topGainer.chgPct)}
                </p>
              </div>
            ) : null;
          })()}
        </div>
        <div>
          <p className="text-xs font-medium text-red-700 mb-2">Top Loser</p>
          {(() => {
            const topLoser = sectors.find(s => s.chgPct === Math.min(...sectors.map(s => s.chgPct)));
            return topLoser ? (
              <div className="bg-red-50 rounded p-2">
                <p className="text-xs font-medium text-gray-700">
                  {topLoser.name}
                </p>
                <p className="text-sm font-bold text-red-600">
                  {formatPercent(topLoser.chgPct)}
                </p>
              </div>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
}
