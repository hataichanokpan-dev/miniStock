/**
 * Market Index Card Component
 * Professional market index display following design rules
 */

import {
  formatIndex,
  formatPercent,
  getChangeColor,
} from '@/lib/format';

interface MarketIndexCardProps {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  market: string;
}

export default function MarketIndexCard({
  name,
  value,
  change,
  changePercent,
  market,
}: MarketIndexCardProps) {
  const isPositive = changePercent >= 0;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-shadow">
      {/* Market & Status */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">{market}</span>
        <span className={`text-lg font-bold ${getChangeColor(changePercent)}`}>
          {isPositive ? '▲' : '▼'}
        </span>
      </div>

      {/* Index Value */}
      <p className="text-xl font-bold text-gray-900">{formatIndex(value)}</p>

      {/* Change */}
      <p className={`text-sm font-medium mt-1 ${getChangeColor(changePercent)}`}>
        {formatPercent(changePercent)}
      </p>

      {/* Name */}
      <p className="text-xs text-gray-500 mt-1">{name}</p>
    </div>
  );
}
