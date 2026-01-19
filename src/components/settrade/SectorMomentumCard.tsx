/**
 * Sector Momentum Card Component
 * Shows which sectors have strong momentum based on:
 * 1. Price Change (Strength)
 * 2. Trading Volume (Participation)
 * 3. Value (Money flow)
 *
 * Professional traders use this to identify:
 * - Leading sectors (strong momentum)
 * - Lagging sectors (weak momentum)
 * - Rotation opportunities
 */

'use client';

import {
  formatPercent,
  formatTradingValueMn,
  formatVolume,
  getChangeColor,
  getChangeBgColor,
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

interface SectorMomentumCardProps {
  sectors: SectorData[];
  limit?: number;
}

// Calculate momentum score (0-100)
function calculateMomentumScore(sector: SectorData): number {
  // Price change component (40%)
  const priceScore = Math.min(Math.abs(sector.chgPct) * 10, 40);

  // Volume relative to average (30%) - assuming higher vol = stronger interest
  const volScore = Math.min((sector.volK / 10000) * 5, 30);

  // Value/money flow (30%)
  const valueScore = Math.min((sector.valMn / 5000) * 5, 30);

  return priceScore + volScore + valueScore;
}

// Get momentum label
function getMomentumLabel(score: number): { label: string; color: string; bgColor: string } {
  if (score >= 70) return { label: 'STRONG', color: 'text-green-600', bgColor: 'bg-green-50' };
  if (score >= 50) return { label: 'BULLISH', color: 'text-green-600', bgColor: 'bg-green-50' };
  if (score >= 30) return { label: 'MODERATE', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  if (score >= 10) return { label: 'WEAK', color: 'text-red-600', bgColor: 'bg-red-50' };
  return { label: 'BEARISH', color: 'text-red-600', bgColor: 'bg-red-50' };
}

export default function SectorMomentumCard({ sectors, limit = 12 }: SectorMomentumCardProps) {
  // Calculate momentum scores and sort
  const sectorsWithMomentum = sectors.map(sector => ({
    ...sector,
    momentumScore: calculateMomentumScore(sector),
  })).sort((a, b) => b.momentumScore - a.momentumScore).slice(0, limit);

  // Find leading and lagging sectors
  const leaders = sectorsWithMomentum.slice(0, 3);
  const laggards = sectorsWithMomentum.slice(-3).reverse();

  // Calculate market health
  const avgMomentum = sectorsWithMomentum.reduce((sum, s) => sum + s.momentumScore, 0) / sectorsWithMomentum.length;
  const positiveSectors = sectors.filter(s => s.chgPct > 0).length;
  const breadthPct = (positiveSectors / sectors.length) * 100;

  const getMarketHealth = () => {
    if (avgMomentum >= 60 && breadthPct >= 60) {
      return { label: 'HEALTHY BULL', color: 'text-green-600', icon: '🚀' };
    }
    if (avgMomentum >= 40 && breadthPct >= 50) {
      return { label: 'MODERATE', color: 'text-yellow-600', icon: '📈' };
    }
    if (avgMomentum >= 20 || breadthPct >= 40) {
      return { label: 'MIXED', color: 'text-gray-600', icon: '➡️' };
    }
    return { label: 'WEAK', color: 'text-red-600', icon: '📉' };
  };

  const marketHealth = getMarketHealth();

  return (
    <div className="space-y-4">
      {/* Market Health Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xl">{marketHealth.icon}</span>
          <div>
            <p className="text-xs text-gray-500">Market Health</p>
            <p className={`text-sm font-bold ${marketHealth.color}`}>{marketHealth.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Breadth</p>
          <p className={`text-sm font-bold ${breadthPct >= 60 ? 'text-green-600' : breadthPct >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
            {positiveSectors}/{sectors.length} ({breadthPct.toFixed(0)}%)
          </p>
        </div>
      </div>

      {/* Leading Sectors (Strong Momentum) */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span className="text-green-500">▲</span> Leading Sectors
        </h4>
        <div className="space-y-2">
          {leaders.map((sector, index) => {
            const momentum = getMomentumLabel(sector.momentumScore);
            return (
              <div
                key={sector.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${getChangeBgColor(sector.chgPct)} ${getChangeBgColor(sector.chgPct)}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-[#1e3a5f] text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{sector.name}</p>
                      <p className="text-xs text-gray-500">{sector.id}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getChangeColor(sector.chgPct)}`}>
                        {formatPercent(sector.chgPct)}
                      </p>
                      <p className={`text-xs font-medium ${momentum.color} ${momentum.bgColor} px-2 py-0.5 rounded`}>
                        {momentum.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Vol: {formatVolume(sector.volK * 1000)}</span>
                    <span>Value: {formatTradingValueMn(sector.valMn * 1e6)}</span>
                    <span>Momentum: <span className="font-semibold">{sector.momentumScore.toFixed(0)}</span></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lagging Sectors (Weak Momentum) */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span className="text-red-500">▼</span> Lagging Sectors
        </h4>
        <div className="space-y-2">
          {laggards.map((sector) => {
            const momentum = getMomentumLabel(sector.momentumScore);
            return (
              <div
                key={sector.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${getChangeBgColor(sector.chgPct)}`}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{sector.name}</p>
                      <p className="text-xs text-gray-500">{sector.id}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${getChangeColor(sector.chgPct)}`}>
                        {formatPercent(sector.chgPct)}
                      </p>
                      <p className={`text-xs ${momentum.color} px-2 py-0.5 rounded ${momentum.bgColor}`}>
                        {momentum.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>Vol: {formatVolume(sector.volK * 1000)}</span>
                    <span>Value: {formatTradingValueMn(sector.valMn * 1e6)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Sectors Momentum View */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-[#1e3a5f] flex items-center gap-2">
          <span>View All Sectors</span>
          <span className="group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-3 space-y-2">
          {sectorsWithMomentum.map((sector) => {
            const momentum = getMomentumLabel(sector.momentumScore);
            const barWidth = (sector.momentumScore / 100) * 100;
            const barColor = sector.momentumScore >= 50 ? 'bg-green-500' : sector.momentumScore >= 30 ? 'bg-yellow-500' : 'bg-red-500';

            return (
              <div key={sector.id} className="flex items-center gap-3 text-sm">
                <div className="w-24 flex-shrink-0">
                  <p className="font-medium text-gray-900 truncate" title={sector.name}>
                    {sector.name}
                  </p>
                </div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} transition-all duration-300`}
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold ${getChangeColor(sector.chgPct)} w-12 text-right`}>
                    {formatPercent(sector.chgPct)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${momentum.bgColor} ${momentum.color}`}>
                    {momentum.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </details>

      {/* Professional Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-xs text-blue-900">
          <span className="font-semibold">💡 Trading Tips:</span>
        </p>
        <ul className="text-xs text-blue-800 mt-1 space-y-1 ml-3 list-disc">
          <li><strong>Leading sectors:</strong> Look for pullback opportunities to join the trend</li>
          <li><strong>Lagging sectors:</strong> Wait for momentum reversal before entering</li>
          <li><strong>Strong breadth (60%+):</strong> Confirmed uptrend, risk-on is favorable</li>
          <li><strong>Weak breadth (&lt;40%):</strong> Defensive positioning, reduce exposure</li>
        </ul>
      </div>
    </div>
  );
}
