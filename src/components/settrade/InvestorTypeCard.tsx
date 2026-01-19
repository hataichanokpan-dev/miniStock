/**
 * Investor Type Card Component
 * Displays investor buy/sell data from SETTRADE
 */

'use client';

import Card from '@/components/ui/Card';

export interface InvestorData {
  id: string;
  name: string;
  buyValue: number;
  sellValue: number;
  netValue: number;
  buyPct: number;
  sellPct: number;
}

interface InvestorTypeCardProps {
  investors: InvestorData[];
  date: string;
  capturedAt: string;
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

function formatPercent(num: number): string {
  return num.toFixed(2) + '%';
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

function getInvestorLabel(id: string): string {
  const labels: Record<string, string> = {
    'FOREIGN': '🌍 Foreign',
    'LOCAL_INDIVIDUAL': '👤 Individual',
    'LOCAL_INST': '🏢 Institute',
    'PROPRIETARY': '📊 Proprietary',
  };
  return labels[id] || id;
}

function getInvestorColor(id: string): string {
  const colors: Record<string, string> = {
    'FOREIGN': 'bg-blue-500',
    'LOCAL_INDIVIDUAL': 'bg-yellow-500',
    'LOCAL_INST': 'bg-purple-500',
    'PROPRIETARY': 'bg-green-500',
  };
  return colors[id] || 'bg-gray-500';
}

export default function InvestorTypeCard({ investors, date, capturedAt }: InvestorTypeCardProps) {
  // Calculate totals
  const totalBuy = investors.reduce((sum, i) => sum + i.buyValue, 0);
  const totalSell = investors.reduce((sum, i) => sum + i.sellValue, 0);
  const totalNet = investors.reduce((sum, i) => sum + i.netValue, 0);

  return (
    <Card title="Investor Type" subtitle={`Trading flow for ${date}`}>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-gray-500 mb-1">Total Buy</p>
          <p className="text-lg font-bold text-green-600">฿{formatNumber(totalBuy * 1e6)}</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-gray-500 mb-1">Total Sell</p>
          <p className="text-lg font-bold text-red-600">฿{formatNumber(totalSell * 1e6)}</p>
        </div>
        <div className={`text-center p-3 rounded-lg border ${getNetBgColor(totalNet)}`}>
          <p className="text-xs text-gray-500 mb-1">Net Flow</p>
          <p className={`text-lg font-bold ${getNetColor(totalNet)}`}>
            {totalNet >= 0 ? '+' : ''}฿{formatNumber(totalNet * 1e6)}
          </p>
        </div>
      </div>

      {/* Investor Breakdown */}
      <div className="space-y-3">
        {investors.map((investor) => (
          <div
            key={investor.id}
            className={`p-4 rounded-lg border ${getNetBgColor(investor.netValue)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getInvestorColor(investor.id)}`}></div>
                <p className="font-medium text-gray-900">{investor.name}</p>
                <span className="text-xs text-gray-500">({getInvestorLabel(investor.id)})</span>
              </div>
              <div className={`text-right ${getNetColor(investor.netValue)}`}>
                <p className="font-bold text-sm">
                  {investor.netValue >= 0 ? '+' : ''}฿{formatNumber(investor.netValue * 1e6)}
                </p>
              </div>
            </div>

            {/* Buy/Sell Bar */}
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="absolute left-0 top-0 h-full bg-green-500 flex items-center justify-end pr-1"
                style={{ width: `${investor.buyPct}%` }}
              >
              </div>
              <div
                className="absolute right-0 top-0 h-full bg-red-500 flex items-center justify-start pl-1"
                style={{ width: `${investor.sellPct}%` }}
              >
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Buy:</span>
                <span className="font-medium text-green-600">
                  {formatPercent(investor.buyPct)} (฿{formatNumber(investor.buyValue * 1e6)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sell:</span>
                <span className="font-medium text-red-600">
                  {formatPercent(investor.sellPct)} (฿{formatNumber(investor.sellValue * 1e6)})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600">Buy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600">Sell</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-gray-600">50/50</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-right">
        Updated: {new Date(capturedAt).toLocaleString('th-TH')}
      </p>
    </Card>
  );
}
