/**
 * Industry Sector Card Component
 * Displays sector performance data from SETTRADE
 */

'use client';

import Card from '@/components/ui/Card';

export interface SectorData {
  id: string;
  name: string;
  last: number;
  chg: number;
  chgPct: number;
  volK: number;
  valMn: number;
}

interface IndustrySectorCardProps {
  sectors: SectorData[];
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
  return (num >= 0 ? '+' : '') + num.toFixed(2) + '%';
}

function getChangeColor(num: number): string {
  if (num > 0) return 'text-green-600';
  if (num < 0) return 'text-red-600';
  return 'text-gray-600';
}

function getChangeBgColor(num: number): string {
  if (num > 0) return 'bg-green-50 border-green-200';
  if (num < 0) return 'bg-red-50 border-red-200';
  return 'bg-gray-50 border-gray-200';
}

export default function IndustrySectorCard({ sectors, date, capturedAt }: IndustrySectorCardProps) {
  // Calculate totals
  const totalVolume = sectors.reduce((sum, s) => sum + s.volK, 0);
  const totalValue = sectors.reduce((sum, s) => sum + s.valMn, 0);

  // Get top performers
  const topGainers = [...sectors].sort((a, b) => b.chgPct - a.chgPct).slice(0, 5);
  const topLosers = [...sectors].sort((a, b) => a.chgPct - b.chgPct).slice(0, 5);

  return (
    <Card title="Industry Sector Performance" subtitle={`Data as of ${date}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Total Sectors</p>
          <p className="text-xl font-bold text-gray-900">{sectors.length}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Total Volume</p>
          <p className="text-lg font-bold text-gray-900">{formatNumber(totalVolume * 1000)}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Total Value</p>
          <p className="text-lg font-bold text-gray-900">฿{formatNumber(totalValue * 1e6)}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Advancing</p>
          <p className="text-lg font-bold text-green-600">
            {sectors.filter(s => s.chgPct > 0).length}
          </p>
        </div>
      </div>

      {/* Top Gainers */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-green-500">▲</span> Top Performing Sectors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {topGainers.map((sector) => (
            <div
              key={sector.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${getChangeBgColor(sector.chgPct)}`}
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">{sector.name}</p>
                <p className="text-xs text-gray-500">{sector.id}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${getChangeColor(sector.chgPct)}`}>
                  {formatPercent(sector.chgPct)}
                </p>
                <p className="text-xs text-gray-500">฿{formatNumber(sector.last)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-red-500">▼</span> Underperforming Sectors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {topLosers.map((sector) => (
            <div
              key={sector.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${getChangeBgColor(sector.chgPct)}`}
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">{sector.name}</p>
                <p className="text-xs text-gray-500">{sector.id}</p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${getChangeColor(sector.chgPct)}`}>
                  {formatPercent(sector.chgPct)}
                </p>
                <p className="text-xs text-gray-500">฿{formatNumber(sector.last)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-right">
        Updated: {new Date(capturedAt).toLocaleString('th-TH')}
      </p>
    </Card>
  );
}
