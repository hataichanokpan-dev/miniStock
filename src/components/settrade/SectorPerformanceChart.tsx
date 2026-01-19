/**
 * Sector Performance Chart Component
 * Compact horizontal bar chart for sector performance
 */

'use client';

interface SectorData {
  id: string;
  name: string;
  last: number;
  chg: number;
  chgPct: number;
  volK: number;
  valMn: number;
}

interface SectorPerformanceChartProps {
  sectors: SectorData[];
  limit?: number;
}

function formatPercent(num: number): string {
  return (num >= 0 ? '+' : '') + num.toFixed(2) + '%';
}

function getBarColor(num: number): string {
  if (num > 0) return 'bg-green-500';
  if (num < 0) return 'bg-red-500';
  return 'bg-gray-400';
}

function getTextColor(num: number): string {
  if (num > 0) return 'text-green-600';
  if (num < 0) return 'text-red-600';
  return 'text-gray-600';
}

// Find max absolute percentage for bar scaling
function getMaxPct(sectors: SectorData[]): number {
  const max = Math.max(...sectors.map(s => Math.abs(s.chgPct)));
  return max > 0 ? max : 1;
}

export default function SectorPerformanceChart({ sectors, limit = 8 }: SectorPerformanceChartProps) {
  // Sort by change percentage and limit
  const sortedSectors = [...sectors]
    .sort((a, b) => b.chgPct - a.chgPct)
    .slice(0, limit);

  const maxPct = getMaxPct(sortedSectors);
  const advancing = sectors.filter(s => s.chgPct > 0).length;
  const declining = sectors.filter(s => s.chgPct < 0).length;
  const unchanged = sectors.filter(s => s.chgPct === 0).length;

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-bold text-gray-900">{sectors.length}</p>
        </div>
        <div className="bg-green-50 rounded p-2">
          <p className="text-xs text-gray-500">Up</p>
          <p className="text-lg font-bold text-green-600">{advancing}</p>
        </div>
        <div className="bg-red-50 rounded p-2">
          <p className="text-xs text-gray-500">Down</p>
          <p className="text-lg font-bold text-red-600">{declining}</p>
        </div>
        <div className="bg-gray-50 rounded p-2">
          <p className="text-xs text-gray-500">Flat</p>
          <p className="text-lg font-bold text-gray-600">{unchanged}</p>
        </div>
      </div>

      {/* Sector Bars */}
      <div className="space-y-2">
        {sortedSectors.map((sector) => {
          const barWidth = Math.abs(sector.chgPct) / maxPct * 100;
          const isPositive = sector.chgPct > 0;

          return (
            <div key={sector.id} className="flex items-center gap-3 text-sm">
              {/* Sector Name */}
              <div className="w-28 flex-shrink-0">
                <p className="font-medium text-gray-900 truncate" title={sector.name}>
                  {sector.name}
                </p>
                <p className="text-xs text-gray-400">{sector.id}</p>
              </div>

              {/* Bar Chart */}
              <div className="flex-1 flex items-center">
                <div className="w-full h-6 bg-gray-100 rounded relative overflow-hidden flex items-center">
                  {/* Zero line indicator */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300"></div>

                  {/* Colored bar */}
                  <div
                    className={`h-full ${getBarColor(sector.chgPct)} transition-all duration-300`}
                    style={{
                      width: `${Math.min(barWidth, 100)}%`,
                      marginLeft: isPositive ? '50%' : `${50 - barWidth}%`,
                    }}
                  ></div>

                  {/* Percentage label */}
                  <span className={`absolute text-xs font-bold ${getTextColor(sector.chgPct)}`} style={{
                    left: isPositive ? `${50 + barWidth / 2}%` : `${50 - barWidth / 2}%`,
                    transform: 'translateX(-50%)',
                  }}>
                    {formatPercent(sector.chgPct)}
                  </span>
                </div>
              </div>

              {/* Index Value */}
              <div className="w-16 text-right flex-shrink-0">
                <p className="font-medium text-gray-700">{sector.last.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
