/**
 * Market Regime Indicator Component
 * Identifies market regime (Bull/Bear/Neutral) based on:
 * 1. Market Breadth (advancing vs declining sectors)
 * 2. Money Flow (Smart Money direction)
 * 3. Volatility (participation level)
 *
 * Professional investors use this to determine:
 * - Risk-on vs Risk-off posture
 * - Position sizing strategy
 * - Sector allocation approach
 */

'use client';

import {
  formatTradingValueMn,
  formatPercent,
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

interface InvestorData {
  id: string;
  name: string;
  buyValue: number;
  sellValue: number;
  netValue: number;
  buyPct: number;
  sellPct: number;
}

interface MarketRegimeIndicatorProps {
  sectors: SectorData[];
  investors: InvestorData[];
}

function getRegimeColor(regime: string): string {
  const colors: Record<string, string> = {
    'STRONG BULL': 'text-green-600',
    'BULL': 'text-green-600',
    'NEUTRAL': 'text-yellow-600',
    'BEAR': 'text-red-600',
    'STRONG BEAR': 'text-red-600',
  };
  return colors[regime] || 'text-gray-600';
}

function getRegimeBgColor(regime: string): string {
  const colors: Record<string, string> = {
    'STRONG BULL': 'bg-green-50 border-green-300',
    'BULL': 'bg-green-50 border-green-300',
    'NEUTRAL': 'bg-yellow-50 border-yellow-300',
    'BEAR': 'bg-red-50 border-red-300',
    'STRONG BEAR': 'bg-red-50 border-red-300',
  };
  return colors[regime] || 'bg-gray-50 border-gray-300';
}

export default function MarketRegimeIndicator({
  sectors,
  investors,
}: MarketRegimeIndicatorProps) {
  // Calculate breadth metrics
  const advancingSectors = sectors.filter(s => s.chgPct > 0).length;
  const decliningSectors = sectors.filter(s => s.chgPct < 0).length;
  const breadthPct = (advancingSectors / sectors.length) * 100;
  const avgChange = sectors.reduce((sum, s) => sum + s.chgPct, 0) / sectors.length;

  // Calculate participation (total value traded)
  const totalValue = sectors.reduce((sum, s) => sum + s.valMn, 0);

  // Smart money flow
  const foreign = investors.find(i => i.id === 'FOREIGN');
  const institute = investors.find(i => i.id === 'LOCAL_INST');
  const smartMoneyNet = (foreign?.netValue || 0) + (institute?.netValue || 0);

  // Determine market regime
  const getRegime = () => {
    // Strong Bull conditions
    if (breadthPct >= 70 && avgChange >= 1 && smartMoneyNet > 0) {
      return {
        regime: 'STRONG BULL',
        icon: '🚀',
        description: 'Strong uptrend with broad participation',
        recommendation: 'Aggressive risk-on, maximize equity exposure',
        riskLevel: 'HIGH RISK / HIGH REWARD',
        positionSize: '100%+ (can use leverage)',
      };
    }
    // Bull conditions
    if (breadthPct >= 55 && avgChange >= 0.3 && smartMoneyNet >= 0) {
      return {
        regime: 'BULL',
        icon: '📈',
        description: 'Positive trend with good breadth',
        recommendation: 'Risk-on, accumulate quality positions',
        riskLevel: 'MODERATE RISK',
        positionSize: '80-100% of capital',
      };
    }
    // Strong Bear conditions
    if (breadthPct <= 30 && avgChange <= -0.5 && smartMoneyNet < 0) {
      return {
        regime: 'STRONG BEAR',
        icon: '🔻',
        description: 'Strong downtrend, panic selling',
        recommendation: 'Defensive, preserve capital, wait for bottom',
        riskLevel: 'HIGH RISK TO THE DOWNSIDE',
        positionSize: '0-20% (hold cash or shorts)',
      };
    }
    // Bear conditions
    if (breadthPct <= 45 && avgChange <= -0.2) {
      return {
        regime: 'BEAR',
        icon: '📉',
        description: 'Negative trend, weak participation',
        recommendation: 'Risk-off, reduce positions, selective only',
        riskLevel: 'ELEVATED RISK',
        positionSize: '20-40% of capital',
      };
    }
    // Neutral
    return {
      regime: 'NEUTRAL',
      icon: '➡️',
      description: 'Mixed signals, direction unclear',
      recommendation: 'Wait for clarity, maintain balanced approach',
      riskLevel: 'MODERATE RISK',
      positionSize: '40-60% of capital',
    };
  };

  const regime = getRegime();

  // Calculate regime score (-100 to +100)
  const breadthScore = (breadthPct - 50) * 2; // -100 to +100
  const flowScore = smartMoneyNet > 0 ? 30 : smartMoneyNet < 0 ? -30 : 0;
  const trendScore = avgChange * 20; // Scale change
  const regimeScore = breadthScore + flowScore + trendScore;

  // Regime meter segments
  const getMeterSegments = () => {
    const segments = [];
    const absScore = Math.abs(regimeScore);

    if (regimeScore >= 0) {
      // Bullish meter
      for (let i = 0; i < 5; i++) {
        const threshold = (i + 1) * 20;
        segments.push({
          filled: absScore >= threshold,
          color: threshold >= 80 ? 'bg-green-600' : threshold >= 60 ? 'bg-green-500' : 'bg-green-400',
        });
      }
    } else {
      // Bearish meter
      for (let i = 0; i < 5; i++) {
        const threshold = (i + 1) * 20;
        segments.push({
          filled: absScore >= threshold,
          color: threshold >= 80 ? 'bg-red-600' : threshold >= 60 ? 'bg-red-500' : 'bg-red-400',
        });
      }
    }
    return segments;
  };

  const meterSegments = getMeterSegments();

  return (
    <div className="space-y-4">
      {/* Main Regime Display */}
      <div className={`p-4 rounded-lg border-2 ${getRegimeBgColor(regime.regime)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{regime.icon}</span>
            <div>
              <p className={`text-2xl font-bold ${getRegimeColor(regime.regime)}`}>{regime.regime}</p>
              <p className="text-sm text-gray-600">{regime.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Regime Score</p>
            <p className={`text-xl font-bold ${regimeScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {regimeScore >= 0 ? '+' : ''}{regimeScore.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Regime Strength Meter */}
        <div>
          <p className="text-xs text-gray-500 mb-1">Trend Strength</p>
          <div className="flex items-center gap-1 h-4">
            {meterSegments.map((segment, i) => (
              <div
                key={i}
                className={`flex-1 h-full rounded-sm ${
                  segment.filled ? segment.color : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Breadth</p>
          <p className={`text-lg font-bold ${breadthPct >= 60 ? 'text-green-600' : breadthPct >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
            {breadthPct.toFixed(0)}%
          </p>
          <p className="text-xs text-gray-500">
            {advancingSectors}/{sectors.length} sectors up
          </p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Avg Change</p>
          <p className={`text-lg font-bold ${avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(avgChange)}
          </p>
          <p className="text-xs text-gray-500">Mean sector change</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Smart Money</p>
          <p className={`text-lg font-bold ${smartMoneyNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {smartMoneyNet >= 0 ? '+' : ''}{formatTradingValueMn(smartMoneyNet * 1e6)}
          </p>
          <p className="text-xs text-gray-500">Net flow</p>
        </div>
      </div>

      {/* Action Recommendation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900 mb-1">Recommended Action</p>
            <p className="text-sm text-blue-800">{regime.recommendation}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-blue-700">
              <span className="font-semibold">{regime.riskLevel}</span>
              <span>•</span>
              <span>Suggested Position Size: <span className="font-bold">{regime.positionSize}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Market Components Breakdown */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-[#1e3a5f] flex items-center gap-2">
          <span>View Market Components</span>
          <span className="group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-3 space-y-3">
          {/* Breadth Analysis */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Market Breadth Analysis</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${breadthPct}%` }}
                  title={`Advancing: ${advancingSectors} sectors`}
                ></div>
              </div>
              <span className="text-xs text-gray-600 w-16 text-right">
                {breadthPct.toFixed(0)}% up
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span className="text-green-600">▲ {advancingSectors} sectors advancing</span>
              <span className="text-red-600">▼ {decliningSectors} sectors declining</span>
            </div>
          </div>

          {/* Money Flow Analysis */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Money Flow Analysis</p>
            <div className="space-y-2">
              {foreign && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">🌍 Foreign</span>
                  <span className={`font-semibold ${foreign.netValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {foreign.netValue >= 0 ? '+' : ''}{formatTradingValueMn(foreign.netValue * 1e6)}
                  </span>
                </div>
              )}
              {institute && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">🏢 Institutions</span>
                  <span className={`font-semibold ${institute.netValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {institute.netValue >= 0 ? '+' : ''}{formatTradingValueMn(institute.netValue * 1e6)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Participation Level */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-1">Market Participation</p>
            <p className="text-xs text-gray-600">Total Value Traded: <span className="font-semibold">{formatTradingValueMn(totalValue * 1e6)}</span></p>
            <p className="text-xs text-gray-500 mt-1">
              {totalValue > 30000 ? 'High participation - Strong conviction' :
               totalValue > 20000 ? 'Moderate participation - Normal activity' :
               'Low participation - Weak interest or caution'}
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
