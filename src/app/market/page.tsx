'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import MarketDistributionChart from '@/components/charts/MarketDistributionChart';
import SectorPerformanceChart from '@/components/charts/SectorPerformanceChart';

interface SectorData {
  name: string;
  change: number;
  volume: number;
  stocks: number;
  marketCap: number;
}

interface MarketBreadth {
  advancing: number;
  declining: number;
  unchanged: number;
  totalVolume: number;
}

export default function MarketPage() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [breadth, setBreadth] = useState<MarketBreadth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        setLoading(true);

        const sectorData: SectorData[] = [
          { name: 'Energy', change: 2.45, volume: 12500000000, stocks: 42, marketCap: 3400000000000 },
          { name: 'Banking', change: 1.82, volume: 18900000000, stocks: 15, marketCap: 5800000000000 },
          { name: 'Technology', change: -0.65, volume: 8900000000, stocks: 38, marketCap: 4200000000000 },
          { name: 'Consumer', change: 0.98, volume: 7600000000, stocks: 55, marketCap: 3100000000000 },
          { name: 'Healthcare', change: -1.23, volume: 5400000000, stocks: 28, marketCap: 2800000000000 },
          { name: 'Industrial', change: 0.34, volume: 9200000000, stocks: 47, marketCap: 2500000000000 },
          { name: 'Property', change: -0.87, volume: 4100000000, stocks: 33, marketCap: 1900000000000 },
          { name: 'Agro', change: 1.56, volume: 6700000000, stocks: 21, marketCap: 1500000000000 },
        ];

        setSectors(sectorData);

        setBreadth({
          advancing: 847,
          declining: 523,
          unchanged: 42,
          totalVolume: 89200000000,
        });
      } catch (error) {
        console.error('Error fetching market data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();
  }, []);

  const marketDistData = breadth ? [
    { name: 'Advancing', value: Math.round((breadth.advancing / (breadth.advancing + breadth.declining + breadth.unchanged)) * 100), color: '#10b981' },
    { name: 'Declining', value: Math.round((breadth.declining / (breadth.advancing + breadth.declining + breadth.unchanged)) * 100), color: '#ef4444' },
    { name: 'Unchanged', value: Math.round((breadth.unchanged / (breadth.advancing + breadth.declining + breadth.unchanged)) * 100), color: '#9ca3af' },
  ] : [];

  const sectorChartData = sectors.map(s => ({
    sector: s.name,
    change: s.change,
    volume: s.volume,
  }));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Market Overview</h1>
          <p className="text-gray-500 mt-1">Sector performance and market breadth</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Market Overview</h1>
        <p className="text-gray-500 mt-1">Sector performance and market breadth</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card title="Market Breadth" subtitle="Stock movement distribution">
          <div className="flex items-center justify-center h-48">
            <MarketDistributionChart data={marketDistData} />
          </div>
        </Card>

        <Card title="Trading Volume" subtitle="Total market activity">
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {breadth ? (breadth.totalVolume / 1000000000).toFixed(1) : '0'}B
              </p>
              <p className="text-sm text-gray-500 mt-1">THB</p>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Advancing</p>
                <p className="text-lg font-semibold text-green-600">{breadth?.advancing || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Declining</p>
                <p className="text-lg font-semibold text-red-600">{breadth?.declining || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Unchanged</p>
                <p className="text-lg font-semibold text-gray-600">{breadth?.unchanged || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Market Sentiment" subtitle="Overall trend indicator">
          <div className="space-y-4">
            <div className="text-center">
              <StatusBadge status="neutral">Moderate</StatusBadge>
              <p className="text-sm text-gray-600 mt-2">Neutral to Positive</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Strength</span>
                <span className="font-medium text-gray-900">Moderate</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '58%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Sector Performance" subtitle="Percentage change by sector">
        <div className="h-80">
          <SectorPerformanceChart data={sectorChartData} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {sectors.slice(0, 8).map((sector) => (
          <div
            key={sector.name}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">{sector.name}</h3>
              <span className={'text-sm font-semibold ' + (sector.change >= 0 ? 'text-green-600' : 'text-red-600')}>
                {(sector.change >= 0 ? '+' : '') + sector.change.toFixed(2)}%
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">
                Stocks: <span className="font-medium text-gray-700">{sector.stocks}</span>
              </p>
              <p className="text-xs text-gray-500">
                M-Cap: <span className="font-medium text-gray-700">{(sector.marketCap / 1000000000000).toFixed(1)}T</span>
              </p>
              <p className="text-xs text-gray-500">
                Vol: <span className="font-medium text-gray-700">{(sector.volume / 1000000000).toFixed(1)}B</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
