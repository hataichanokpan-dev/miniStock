'use client';

import { useEffect, useState } from 'react';
import MarketIndexCard from '@/components/ui/MarketIndexCard';
import StockCard from '@/components/ui/StockCard';
import Card from '@/components/ui/Card';

interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export default function DashboardPage() {
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch market indices
        const indicesRes = await fetch('/api/market/indices');
        if (!indicesRes.ok) throw new Error('Failed to fetch market indices');
        const indicesData = await indicesRes.json();

        // Fetch top gainers and losers from scanner
        const gainersRes = await fetch('/api/market/scanner?sort=gainers');
        const losersRes = await fetch('/api/market/scanner?sort=losers');

        // For now, use placeholder data for top movers if scanner returns empty
        const gainersData = gainersRes.ok ? await gainersRes.json() : { results: [] };
        const losersData = losersRes.ok ? await losersRes.json() : { results: [] };

        setMarketIndices(indicesData);

        // If scanner returns empty results, use fallback data
        if (gainersData.results?.length > 0) {
          setTopGainers(gainersData.results.slice(0, 3));
        } else {
          setTopGainers([
            { symbol: 'CPF', name: 'Charoen Pokphand Foods', price: 28.50, change: 1.25, changePercent: 4.59, volume: 12500000 },
            { symbol: 'ADVANC', name: 'Advanced Info Service', price: 245.00, change: 8.50, changePercent: 3.59, volume: 8200000 },
            { symbol: 'KBANK', name: 'Kasikornbank', price: 168.00, change: 5.00, changePercent: 3.07, volume: 15300000 },
          ]);
        }

        if (losersData.results?.length > 0) {
          setTopLosers(losersData.results.slice(0, 3));
        } else {
          setTopLosers([
            { symbol: 'PTT', name: 'PTT Public Company', price: 358.00, change: -12.00, changePercent: -3.24, volume: 18900000 },
            { symbol: 'SCC', name: 'Siam Cement Group', price: 412.00, change: -11.50, changePercent: -2.72, volume: 6500000 },
            { symbol: 'AOT', name: 'Airports of Thailand', price: 72.50, change: -1.75, changePercent: -2.36, volume: 9100000 },
          ]);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load market data');

        // Set fallback data on error
        setMarketIndices([
          { symbol: '^SET.BK', name: 'SET Index', value: 1342.58, change: 12.45, changePercent: 0.94 },
          { symbol: '^MAI.BK', name: 'MAI Index', value: 458.23, change: -3.12, changePercent: -0.68 },
          { symbol: '^GSPC', name: 'S&P 500', value: 4783.45, change: 23.67, changePercent: 0.50 },
          { symbol: '^HSI', name: 'Hang Seng', value: 16547.82, change: -87.34, changePercent: -0.52 },
        ]);
        setTopGainers([
          { symbol: 'CPF', name: 'Charoen Pokphand Foods', price: 28.50, change: 1.25, changePercent: 4.59, volume: 12500000 },
          { symbol: 'ADVANC', name: 'Advanced Info Service', price: 245.00, change: 8.50, changePercent: 3.59, volume: 8200000 },
          { symbol: 'KBANK', name: 'Kasikornbank', price: 168.00, change: 5.00, changePercent: 3.07, volume: 15300000 },
        ]);
        setTopLosers([
          { symbol: 'PTT', name: 'PTT Public Company', price: 358.00, change: -12.00, changePercent: -3.24, volume: 18900000 },
          { symbol: 'SCC', name: 'Siam Cement Group', price: 412.00, change: -11.50, changePercent: -2.72, volume: 6500000 },
          { symbol: 'AOT', name: 'Airports of Thailand', price: 72.50, change: -1.75, changePercent: -2.36, volume: 9100000 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Market overview and top performers</p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Market overview and top performers</p>
        {error && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Market Indices */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Indices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketIndices.map((index) => (
            <MarketIndexCard
              key={index.symbol}
              name={index.name}
              value={index.value}
              change={index.change}
              changePercent={index.changePercent}
              market={index.symbol.includes('.BK') ? '🇹🇭 Thailand' :
                      index.symbol.includes('^GSPC') || index.symbol.includes('^DJI') || index.symbol.includes('^IXIC') ? '🇺🇸 US' :
                      index.symbol.includes('^HSI') ? '🇭🇰 Hong Kong' : '🌍 Global'}
            />
          ))}
        </div>
      </section>

      {/* Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Gainers */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-green-500">▲</span> Top Gainers
          </h2>
          <div className="space-y-3">
            {topGainers.map((stock) => (
              <StockCard key={stock.symbol} {...stock} />
            ))}
          </div>
        </section>

        {/* Top Losers */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-red-500">▼</span> Top Losers
          </h2>
          <div className="space-y-3">
            {topLosers.map((stock) => (
              <StockCard key={stock.symbol} {...stock} />
            ))}
          </div>
        </section>
      </div>

      {/* Quick Stats */}
      <section className="mt-8">
        <Card title="Market Summary" subtitle="Thailand Market Overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900">
                ฿{(marketIndices[0]?.volume || 89200000000 / 1000000000).toFixed(1)}B
              </p>
              <p className="text-sm text-green-600 mt-1">+12.5% from yesterday</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Advancing</p>
              <p className="text-2xl font-bold text-green-600">847</p>
              <p className="text-sm text-gray-500 mt-1">62% of total</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Declining</p>
              <p className="text-2xl font-bold text-red-600">523</p>
              <p className="text-sm text-gray-500 mt-1">38% of total</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
