/**
 * Smart Money Indicator Component
 * Shows what "Smart Money" (Foreign + Institutions) vs "Retail" are doing
 * Professional investors use this as a contrarian indicator
 */

'use client';

import {
  formatTradingValueMn,
  formatPercent,
} from '@/lib/format';

interface InvestorData {
  id: string;
  name: string;
  buyValue: number;
  sellValue: number;
  netValue: number;
  buyPct: number;
  sellPct: number;
}

interface SmartMoneyIndicatorProps {
  investors: InvestorData[];
}

function getNetColor(num: number): string {
  if (num > 0) return 'text-green-600';
  if (num < 0) return 'text-red-600';
  return 'text-gray-600';
}

function getNetBgColor(num: number): string {
  if (num > 0) return 'bg-green-50 border-green-200';
  if (num < 0) return 'bg-red-50 border-red-200';
  return 'bg-gray-50 border-gray-200';
}

export default function SmartMoneyIndicator({ investors }: SmartMoneyIndicatorProps) {
  // Categorize investors
  const foreign = investors.find(i => i.id === 'FOREIGN');
  const institute = investors.find(i => i.id === 'LOCAL_INST');
  const individual = investors.find(i => i.id === 'LOCAL_INDIVIDUAL');
  const proprietary = investors.find(i => i.id === 'PROPRIETARY');

  // Smart Money = Foreign + Institutions
  const smartMoneyBuy = (foreign?.buyValue || 0) + (institute?.buyValue || 0);
  const smartMoneySell = (foreign?.sellValue || 0) + (institute?.sellValue || 0);
  const smartMoneyNet = (foreign?.netValue || 0) + (institute?.netValue || 0);
  const smartMoneyTotal = smartMoneyBuy + smartMoneySell;
  const smartMoneyBuyPct = smartMoneyTotal > 0 ? (smartMoneyBuy / smartMoneyTotal) * 100 : 50;

  // Retail Money = Individual + Proprietary
  const retailBuy = (individual?.buyValue || 0) + (proprietary?.buyValue || 0);
  const retailSell = (individual?.sellValue || 0) + (proprietary?.sellValue || 0);
  const retailNet = (individual?.netValue || 0) + (proprietary?.netValue || 0);
  const retailTotal = retailBuy + retailSell;
  const retailBuyPct = retailTotal > 0 ? (retailBuy / retailTotal) * 100 : 50;

  // Determine market regime and signal
  const getMarketSignal = () => {
    if (smartMoneyNet > 0 && retailNet < 0) {
      return {
        signal: 'BULLISH',
        description: 'Smart Money accumulating, Retail distributing',
        icon: '🚀',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300'
      };
    }
    if (smartMoneyNet < 0 && retailNet > 0) {
      return {
        signal: 'BEARISH',
        description: 'Smart Money distributing, Retail accumulating',
        icon: '⚠️',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300'
      };
    }
    if (smartMoneyNet > 0 && retailNet > 0) {
      return {
        signal: 'STRONG BUY',
        description: 'All players buying - Momentum phase',
        icon: '💪',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300'
      };
    }
    if (smartMoneyNet < 0 && retailNet < 0) {
      return {
        signal: 'DISTRIBUTION',
        description: 'All players selling - Panic or peak',
        icon: '🔻',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300'
      };
    }
    return {
      signal: 'NEUTRAL',
      description: 'Balanced flow - No clear direction',
      icon: '➡️',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300'
    };
  };

  const marketSignal = getMarketSignal();

  return (
    <div className="space-y-4">
      {/* Market Signal Alert */}
      <div className={`p-4 rounded-lg border ${marketSignal.bgColor} ${marketSignal.borderColor}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{marketSignal.icon}</span>
            <div>
              <p className={`text-lg font-bold ${marketSignal.color}`}>{marketSignal.signal}</p>
              <p className="text-xs text-gray-600">{marketSignal.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Money vs Retail Comparison */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Money Flow Comparison</h4>

        {/* Smart Money */}
        <div className={`p-3 rounded-lg border ${getNetBgColor(smartMoneyNet)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧠</span>
              <span className="font-semibold text-gray-900 text-sm">Smart Money</span>
              <span className="text-xs text-gray-500">(Foreign + Institute)</span>
            </div>
            <div className={`text-right`}>
              <p className={`text-lg font-bold ${getNetColor(smartMoneyNet)}`}>
                {smartMoneyNet >= 0 ? '+' : ''}{formatTradingValueMn(smartMoneyNet * 1e6)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${smartMoneyBuyPct}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-600 w-12 text-right">
              {formatPercent(smartMoneyBuyPct)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Buy: {formatTradingValueMn(smartMoneyBuy * 1e6)}</span>
            <span>Sell: {formatTradingValueMn(smartMoneySell * 1e6)}</span>
          </div>
        </div>

        {/* Retail Money */}
        <div className={`p-3 rounded-lg border ${getNetBgColor(retailNet)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>
              <span className="font-semibold text-gray-900 text-sm">Retail Money</span>
              <span className="text-xs text-gray-500">(Individual + Prop)</span>
            </div>
            <div className={`text-right`}>
              <p className={`text-lg font-bold ${getNetColor(retailNet)}`}>
                {retailNet >= 0 ? '+' : ''}{formatTradingValueMn(retailNet * 1e6)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${retailBuyPct}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-600 w-12 text-right">
              {formatPercent(retailBuyPct)}
            </span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Buy: {formatTradingValueMn(retailBuy * 1e6)}</span>
            <span>Sell: {formatTradingValueMn(retailSell * 1e6)}</span>
          </div>
        </div>
      </div>

      {/* Professional Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-xs text-blue-900">
          <span className="font-semibold">💡 Professional Insight:</span>{' '}
          {smartMoneyNet > 0 && retailNet < 0
            ? 'Smart Money accumulation while Retail distribute is typically a BULLISH signal. Consider buying opportunities.'
            : smartMoneyNet < 0 && retailNet > 0
            ? 'Smart Money distribution to Retail is often a BEARISH signal. Consider taking profits or reducing exposure.'
            : 'Flow is balanced. Wait for clearer directional signal before making large moves.'
          }
        </p>
      </div>

      {/* Individual Investor Breakdown */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Individual Investor Flows</p>
        <div className="grid grid-cols-2 gap-2">
          {foreign && (
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">🌍 Foreign</p>
              <p className={`text-sm font-bold ${getNetColor(foreign.netValue)}`}>
                {foreign.netValue >= 0 ? '+' : ''}{formatTradingValueMn(foreign.netValue * 1e6)}
              </p>
            </div>
          )}
          {institute && (
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">🏢 Institute</p>
              <p className={`text-sm font-bold ${getNetColor(institute.netValue)}`}>
                {institute.netValue >= 0 ? '+' : ''}{formatTradingValueMn(institute.netValue * 1e6)}
              </p>
            </div>
          )}
          {individual && (
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">👤 Individual</p>
              <p className={`text-sm font-bold ${getNetColor(individual.netValue)}`}>
                {individual.netValue >= 0 ? '+' : ''}{formatTradingValueMn(individual.netValue * 1e6)}
              </p>
            </div>
          )}
          {proprietary && (
            <div className="text-center p-2 bg-gray-50 rounded">
              <p className="text-xs text-gray-500">📊 Proprietary</p>
              <p className={`text-sm font-bold ${getNetColor(proprietary.netValue)}`}>
                {proprietary.netValue >= 0 ? '+' : ''}{formatTradingValueMn(proprietary.netValue * 1e6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
