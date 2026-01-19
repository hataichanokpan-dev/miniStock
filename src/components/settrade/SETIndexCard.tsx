/**
 * SET Index Summary Card
 * Shows Thailand market overview at a glance
 */

'use client';

interface SETIndexCardProps {
  totalValue?: number;
  totalVolume?: number;
  advancing?: number;
  declining?: number;
  unchanged?: number;
}

function formatBillions(num: number): string {
  return (num / 1e9).toFixed(1) + 'B';
}

function formatMillions(num: number): string {
  return (num / 1e6).toFixed(0) + 'M';
}

export default function SETIndexCard({
  totalValue = 0,
  totalVolume = 0,
  advancing = 0,
  declining = 0,
  unchanged = 0,
}: SETIndexCardProps) {
  const total = advancing + declining + unchanged;
  const advPct = total > 0 ? ((advancing / total) * 100).toFixed(0) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Total Value */}
      <div className="bg-[#1e3a5f] rounded-lg p-3 text-white">
        <p className="text-xs text-white/70 mb-1">Total Value</p>
        <p className="text-lg font-bold">฿{formatBillions(totalValue)}</p>
      </div>

      {/* Total Volume */}
      <div className="bg-gray-900 rounded-lg p-3 text-white">
        <p className="text-xs text-white/70 mb-1">Total Volume</p>
        <p className="text-lg font-bold">{formatMillions(totalVolume)}</p>
      </div>

      {/* Market Breadth */}
      <div className="bg-green-600 rounded-lg p-3 text-white">
        <p className="text-xs text-white/70 mb-1">Advancing</p>
        <p className="text-lg font-bold">{advancing}</p>
        <p className="text-xs text-white/70">{advPct}%</p>
      </div>

      {/* Declining */}
      <div className="bg-red-600 rounded-lg p-3 text-white">
        <p className="text-xs text-white/70 mb-1">Declining</p>
        <p className="text-lg font-bold">{declining}</p>
        <p className="text-xs text-white/70">{total > 0 ? ((declining / total) * 100).toFixed(0) : '0'}%</p>
      </div>
    </div>
  );
}
