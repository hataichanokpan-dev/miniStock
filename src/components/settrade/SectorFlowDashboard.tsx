/**
 * Sector Flow Dashboard Component
 * Comprehensive view answering:
 * 1. Which sectors have the most money flowing in/out?
 * 2. How is today's value distributed across sectors?
 * 3. Which sectors are leading/lagging the market?
 */

"use client";

import {
  formatTradingValueMn,
  formatVolume,
  formatPercent,
  formatNumber,
  getChangeColor,
  getChangeBgColor,
} from "@/lib/format";

interface SectorData {
  id: string;
  name: string;
  last: number;
  chg: number;
  chgPct: number;
  volK: number;
  valMn: number;
}

interface SectorFlowDashboardProps {
  sectors: SectorData[];
  totalValue?: number;
  totalVolume?: number;
  setIndex?: number;
  setChange?: number;
}

// Calculate money flow score
function getFlowScore(sector: SectorData): number {
  return sector.valMn * (sector.chgPct >= 0 ? 1 : -1) * Math.abs(sector.chgPct);
}

export default function SectorFlowDashboard({
  sectors,
  totalValue,
  totalVolume,
  setIndex,
  setChange,
}: SectorFlowDashboardProps) {
  // 1. Money In/Out Analysis
  const moneyIn = [...sectors]
    .filter((s) => s.chgPct > 0)
    .sort((a, b) => b.valMn - a.valMn)
    .slice(0, 5);

  const moneyOut = [...sectors]
    .filter((s) => s.chgPct < 0)
    .sort((a, b) => b.valMn - a.valMn)
    .slice(0, 5);

  const totalIn = moneyIn.reduce((sum, s) => sum + s.valMn, 0);
  const totalOut = moneyOut.reduce((sum, s) => sum + s.valMn, 0);

  // 2. Value Distribution (Top sectors by value)
  const topByValue = [...sectors].sort((a, b) => b.valMn - a.valMn).slice(0, 8);
  const totalMarketValue = sectors.reduce((sum, s) => sum + s.valMn, 0);

  // 3. Leader vs Laggard (relative to SET)
  const marketChange = setChange || 0;
  const leaders = [...sectors]
    .filter((s) => s.chgPct > marketChange)
    .sort((a, b) => b.chgPct - a.chgPct)
    .slice(0, 3);
  const laggards = [...sectors]
    .filter((s) => s.chgPct < marketChange)
    .sort((a, b) => a.chgPct - b.chgPct)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* HEADER: Market Summary */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Sector Flow Analysis
          </h3>
          <p className="text-sm text-gray-500">Where is the money moving?</p>
        </div>
        {setIndex && (
          <div className="text-right">
            <p className="text-xs text-gray-500">SET Index</p>
            <p className="text-xl font-bold text-gray-900">
              {setIndex.toFixed(2)}
            </p>
            <p className={`text-sm font-bold ${getChangeColor(setChange ?? 0)}`}>
              {formatPercent(setChange ?? 0)}
            </p>
          </div>
        )}
      </div>

      {/* SECTION 1: Money In / Out */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Money Flow (Trading Value)
          </h4>
          <div className="flex items-center gap-2 sm:gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
              <span className="hidden sm:inline">Money In:</span> ฿
              {formatNumber(totalIn)}Mn
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
              <span className="hidden sm:inline">Money Out:</span> ฿
              {formatNumber(totalOut)}Mn
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Money In */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs font-semibold text-green-700 mb-3">
              ▲ Top Money In (Buying)
            </p>
            <div className="space-y-2">
              {moneyIn.map((sector, i) => (
                <div
                  key={sector.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${i === 0 ? "text-green-600" : "text-green-500"}`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sector.name}
                      </p>
                      <p className="text-xs text-gray-500">{sector.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      ฿{formatNumber(sector.valMn)}Mn
                    </p>
                    <p className="text-xs text-green-600">
                      {formatPercent(sector.chgPct)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Money Out */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <p className="text-xs font-semibold text-red-700 mb-3">
              ▼ Top Money Out (Selling)
            </p>
            <div className="space-y-2">
              {moneyOut.map((sector, i) => (
                <div
                  key={sector.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${i === 0 ? "text-red-600" : "text-red-500"}`}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sector.name}
                      </p>
                      <p className="text-xs text-gray-500">{sector.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      ฿{formatNumber(sector.valMn)}Mn
                    </p>
                    <p className="text-xs text-red-600">
                      {formatPercent(sector.chgPct)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Value Distribution */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Today&apos;s Value by Sector
          </h4>
          <span className="text-xs text-gray-500">
            Total: ฿{formatNumber(totalMarketValue)}Mn
          </span>
        </div>

        {/* Horizontal Bar Chart with Percentages */}
        <div className="space-y-2 sm:space-y-3">
          {topByValue.map((sector) => {
            const pct = (sector.valMn / totalMarketValue) * 100;
            const barWidth = Math.max(pct, 5); // Minimum 5% for visibility
            const isPositive = sector.chgPct >= 0;

            return (
              <div key={sector.id} className="flex items-center gap-2 sm:gap-3">
                {/* Sector Name */}
                <div className="w-16 sm:w-24 flex-shrink-0">
                  <p
                    className="text-xs sm:text-sm font-medium text-gray-900 truncate"
                    title={sector.name}
                  >
                    {sector.name}
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    {sector.id}
                  </p>
                </div>

                {/* Value Bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <div className="flex-1 h-5 sm:h-6 bg-gray-100 rounded overflow-hidden relative min-w-0">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isPositive ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center px-1 sm:px-2 text-xs font-medium text-gray-700 truncate">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-16 sm:w-24 text-right flex-shrink-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        ฿{formatNumber(sector.valMn)}Mn
                      </p>
                      <p
                        className={`text-xs font-medium ${getChangeColor(sector.chgPct)}`}
                      >
                        {formatPercent(sector.chgPct)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Leader vs Laggard */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700">
            Market Leaders & Laggards
          </h4>
          <span className="text-xs text-gray-500">
            Vs SET: {formatPercent(marketChange)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Leaders (Outperforming SET) */}
          <div className="bg-[#1e3a5f] rounded-lg p-4">
            <p className="text-xs font-semibold text-white/80 mb-3">
              ⭐ Market Leaders (Beat SET)
            </p>
            <div className="space-y-2">
              {leaders.map((sector, i) => (
                <div
                  key={sector.id}
                  className="flex items-center justify-between text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-yellow-400">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium">{sector.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">
                      {formatPercent(sector.chgPct)}
                    </p>
                    <p className="text-xs text-white/60">
                      vs {formatPercent(marketChange)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Laggards (Underperforming SET) */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs font-semibold text-white/80 mb-3">
              📉 Market Laggards (Trail SET)
            </p>
            <div className="space-y-2">
              {laggards.map((sector, i) => (
                <div
                  key={sector.id}
                  className="flex items-center justify-between text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-400">
                      {i + 1}
                    </span>
                    <p className="text-sm font-medium">{sector.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">
                      {formatPercent(sector.chgPct)}
                    </p>
                    <p className="text-xs text-white/60">
                      vs {formatPercent(marketChange)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY: Quick Insights */}
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Quick Insights
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center text-xs">
          <div>
            <p className="text-gray-500">Hot Money Flow</p>
            <p className="text-sm font-bold text-green-600">
              {moneyIn[0]?.name || "-"}
            </p>
            <p className="text-gray-400">
              ฿{moneyIn[0] ? formatNumber(moneyIn[0].valMn) : 0}Mn
            </p>
          </div>
          <div>
            <p className="text-gray-500">Heaviest Selling</p>
            <p className="text-sm font-bold text-red-600">
              {moneyOut[0]?.name || "-"}
            </p>
            <p className="text-gray-400">
              ฿{moneyOut[0] ? formatNumber(moneyOut[0].valMn) : 0}Mn
            </p>
          </div>
          <div>
            <p className="text-gray-500">Top Value Sector</p>
            <p className="text-sm font-bold text-gray-900">
              {topByValue[0]?.name || "-"}
            </p>
            <p className="text-gray-400">
              {topByValue[0]
                ? ((topByValue[0].valMn / totalMarketValue) * 100).toFixed(1)
                : 0}
              % of market
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
