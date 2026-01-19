/**
 * Investor Flow Card Component
 * Shows buy/sell/net flow by investor type
 * Following DESIGN_RULES.md
 * Answers: What is net flow? Who is the key driver affecting the market?
 */

'use client';

import {
  formatTradingValueMn,
  formatPercentAbs,
  getChangeColor,
  getChangeBgColor,
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

interface InvestorFlowCardProps {
  investors: InvestorData[];
  showTitle?: boolean;
}

function getInvestorIcon(id: string): string {
  const icons: Record<string, string> = {
    'FOREIGN': '🌍',
    'LOCAL_INDIVIDUAL': '👤',
    'LOCAL_INST': '🏢',
    'PROPRIETARY': '📊',
  };
  return icons[id] || '•';
}

function getInvestorShortLabel(id: string): string {
  const labels: Record<string, string> = {
    'FOREIGN': 'Foreign',
    'LOCAL_INDIVIDUAL': 'Individual',
    'LOCAL_INST': 'Institute',
    'PROPRIETARY': 'Proprietary',
  };
  return labels[id] || id;
}

export default function InvestorFlowCard({ investors, showTitle = true }: InvestorFlowCardProps) {
  // Calculate totals (values are in millions from Firebase)
  const totalBuy = investors.reduce((sum, i) => sum + i.buyValue, 0);
  const totalSell = investors.reduce((sum, i) => sum + i.sellValue, 0);
  const totalNet = investors.reduce((sum, i) => sum + i.netValue, 0);
  const totalVolume = totalBuy + totalSell;

  // Find key driver (largest absolute net value)
  const keyDriver = investors.reduce((max, i) =>
    Math.abs(i.netValue) > Math.abs(max.netValue) ? i : max
  , investors[0]);

  const isKeyDriverPositive = keyDriver.netValue > 0;

  // Calculate buy/sell percentages for visual bar
  const buyPct = totalVolume > 0 ? (totalBuy / totalVolume) * 100 : 50;
  const sellPct = totalVolume > 0 ? (totalSell / totalVolume) * 100 : 50;

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-700">Investor Flow</h3>
          <div className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getChangeBgColor(totalNet)} ${getChangeColor(totalNet)}`}>
            NET: {totalNet >= 0 ? '+' : ''}{formatTradingValueMn(totalNet * 1e6)}
          </div>
        </div>
      )}

      {/* Summary: BUY | SELL | NET - Responsive */}
      <div className="grid grid-cols-3 gap-2">
        {/* BUY */}
        <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200">
          <p className="text-xs text-green-700 font-medium">BUY</p>
          <p className="text-base sm:text-lg font-bold text-green-600">{formatTradingValueMn(totalBuy * 1e6)}</p>
          <p className="text-xs text-green-600">{formatPercentAbs(buyPct)}</p>
        </div>

        {/* SELL */}
        <div className="bg-red-50 rounded-lg p-2 sm:p-3 border border-red-200">
          <p className="text-xs text-red-700 font-medium">SELL</p>
          <p className="text-base sm:text-lg font-bold text-red-600">{formatTradingValueMn(totalSell * 1e6)}</p>
          <p className="text-xs text-red-600">{formatPercentAbs(sellPct)}</p>
        </div>

        {/* NET */}
        <div className={`${getChangeBgColor(totalNet)} rounded-lg p-2 sm:p-3 border`}>
          <p className={`text-xs font-medium ${getChangeColor(totalNet)}`}>NET</p>
          <p className={`text-base sm:text-lg font-bold ${getChangeColor(totalNet)}`}>
            {totalNet >= 0 ? '+' : ''}{formatTradingValueMn(totalNet * 1e6)}
          </p>
        </div>
      </div>

      {/* Key Driver - Who is affecting the market most? */}
      <div className={`rounded-lg p-3 border-2 ${isKeyDriverPositive ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
        <p className="text-xs font-semibold text-gray-700 mb-2">
          🔑 Key Driver: {isKeyDriverPositive ? 'Main Buyer' : 'Main Seller'}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getInvestorIcon(keyDriver.id)}</span>
            <div>
              <p className="text-sm font-bold text-gray-900">{getInvestorShortLabel(keyDriver.id)}</p>
              <p className="text-xs text-gray-500">
                Buy: {formatTradingValueMn(keyDriver.buyValue * 1e6)} / Sell: {formatTradingValueMn(keyDriver.sellValue * 1e6)}
              </p>
            </div>
          </div>
          <div className={`text-right ${getChangeColor(keyDriver.netValue)}`}>
            <p className="text-lg font-bold">
              {keyDriver.netValue >= 0 ? '+' : ''}{formatTradingValueMn(keyDriver.netValue * 1e6)}
            </p>
            <p className="text-xs font-medium">
              {isKeyDriverPositive ? '▲ Net Buyer' : '▼ Net Seller'}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Bar - Buy vs Sell */}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="bg-green-500 h-full transition-all duration-300"
          style={{ width: `${buyPct}%` }}
        ></div>
        <div
          className="bg-red-500 h-full transition-all duration-300"
          style={{ width: `${sellPct}%` }}
        ></div>
      </div>

      {/* All Investors List */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">All Investor Types</p>
        {investors.map((investor) => {
          const netColor = getChangeColor(investor.netValue);
          const netBg = getChangeBgColor(investor.netValue);
          const isKeyDriver = investor.id === keyDriver.id;

          // Calculate this investor's share of total volume
          const investorVolume = investor.buyValue + investor.sellValue;
          const volumeShare = totalVolume > 0 ? (investorVolume / totalVolume) * 100 : 0;

          return (
            <div
              key={investor.id}
              className={`border rounded-lg p-2 sm:p-3 ${netBg} transition-colors ${isKeyDriver ? 'ring-2 ring-offset-1 ' + (isKeyDriverPositive ? 'ring-green-400' : 'ring-red-400') : ''}`}
            >
              <div className="flex items-center justify-between">
                {/* Left: Icon + Name */}
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl">{getInvestorIcon(investor.id)}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {getInvestorShortLabel(investor.id)}
                      {isKeyDriver && <span className="ml-1 text-xs">🔑</span>}
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      B: {formatTradingValueMn(investor.buyValue * 1e6)} / S: {formatTradingValueMn(investor.sellValue * 1e6)}
                    </p>
                  </div>
                </div>

                {/* Right: NET Value */}
                <div className={`text-right ${netColor}`}>
                  <p className="text-base sm:text-lg font-bold">
                    {investor.netValue >= 0 ? '+' : ''}{formatTradingValueMn(investor.netValue * 1e6)}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {formatPercentAbs(volumeShare)} of volume
                  </p>
                </div>
              </div>

              {/* Mini Bar - Hidden on very small screens */}
              <div className="hidden sm:block h-1.5 bg-gray-200 rounded-full overflow-hidden flex mt-2">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${investor.buyPct}%` }}
                ></div>
                <div
                  className="bg-red-500 h-full"
                  style={{ width: `${investor.sellPct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500 pt-2 border-t border-gray-200">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-500 rounded"></span>
          Buy
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-red-500 rounded"></span>
          Sell
        </span>
        <span className="hidden sm:flex items-center gap-1">
          🔑 Key Driver
        </span>
      </div>
    </div>
  );
}
