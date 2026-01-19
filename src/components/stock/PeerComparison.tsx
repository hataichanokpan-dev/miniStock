/**
 * Peer Comparison Component
 * Compare a stock with its peers in the same sector
 * Shows relative performance on key metrics
 */

'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { formatPercent, formatNumber, getChangeColor } from '@/lib/format';

interface PeerData {
  symbol: string;
  name: string;
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number;
  roe?: number;
  deRatio?: number;
  marketCap?: number;
  price?: number;
  changePercent?: number;
}

interface PeerComparisonProps {
  symbol: string;
  sector?: string;
  currentMetrics?: {
    peRatio?: number;
    pbRatio?: number;
    dividendYield?: number;
    roe?: number;
    deRatio?: number;
    marketCap?: number;
  } | null;
}

// Common peer groups for Thai stocks
const THAI_PEER_GROUPS: Record<string, string[]> = {
  'ENERGY': ['PTT', 'PTTEP', 'TOP', 'BCH', 'BDMS'],
  'BANKING': ['KBANK', 'SCB', 'BBL', 'KTB', 'TMB', 'CIMBT'],
  'TELECOMMUNICATION': ['AOT', 'ADVANC', 'TRUE', 'DTAC', 'INTUCH'],
  'PROPERTY': ['AP', 'LH', 'QH', 'SF', 'MEGA'],
  'AUTOMOTIVE': ['TA', 'HMPRO', 'GPSC', 'SOKE'],
  'FOOD': ['CPF', 'MFC', 'TFM', 'TUF'],
  'RETAIL': ['CPALL', 'HMPRO', 'BJC', 'OTCP'],
};

// Get peer symbols for a given stock symbol
function getPeerSymbols(symbol: string): string[] {
  const upperSymbol = symbol.toUpperCase();

  for (const [, peers] of Object.entries(THAI_PEER_GROUPS)) {
    if (peers.includes(upperSymbol)) {
      return peers.filter(p => p !== upperSymbol).slice(0, 5);
    }
  }

  // Default: return common large caps
  return ['PTT', 'KBANK', 'AOT', 'ADVANC', 'CPF'];
}

// Rank value among peers (returns 1-5, with 1 being best)
function getRank(value: number | undefined, peers: PeerData[], key: keyof PeerData): number | null {
  if (value === undefined) return null;

  const allValues = [value, ...peers.map(p => (p[key] as number) || 0)].filter(v => v > 0);

  if (allValues.length === 0) return null;

  // For most metrics, higher is better (sort descending)
  // But for P/E, P/B, D/E, lower is better (sort ascending)
  const isLowerBetter = key === 'peRatio' || key === 'pbRatio' || key === 'deRatio';

  const sorted = [...allValues].sort((a, b) => isLowerBetter ? a - b : b - a);
  const rank = sorted.indexOf(value) + 1;

  return rank;
}

export default function PeerComparison({ symbol, sector, currentMetrics }: PeerComparisonProps) {
  const [peers, setPeers] = useState<PeerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPeerData() {
      try {
        setLoading(true);
        setError(null);

        const peerSymbols = getPeerSymbols(symbol);

        // Fetch data for each peer
        const peerData = await Promise.all(
          peerSymbols.map(async (peerSymbol) => {
            try {
              const res = await fetch(`/api/stock/${peerSymbol}/fundamentals`);
              if (!res.ok) return null;

              const data = await res.json();
              return {
                symbol: peerSymbol,
                name: data.profile?.name || peerSymbol,
                peRatio: data.metrics?.peRatio,
                pbRatio: data.metrics?.pbRatio,
                dividendYield: data.metrics?.dividendYield,
                roe: data.metrics?.roe,
                deRatio: data.metrics?.deRatio,
                marketCap: data.profile?.marketCap,
              } as PeerData;
            } catch {
              return null;
            }
          })
        );

        // Filter out failed fetches
        setPeers(peerData.filter((p): p is PeerData => p !== null));
      } catch (err) {
        console.error('Error fetching peer data:', err);
        setError('Failed to load peer comparison data');
      } finally {
        setLoading(false);
      }
    }

    fetchPeerData();
  }, [symbol]);

  if (loading) {
    return (
      <Card title="Peer Comparison" subtitle="Compare with sector peers">
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (error || peers.length === 0) {
    return (
      <Card title="Peer Comparison" subtitle="Compare with sector peers">
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">{error || 'No peer data available'}</p>
          <p className="text-xs mt-1">Peer comparison is available for Thai stocks</p>
        </div>
      </Card>
    );
  }

  const metrics = [
    { key: 'peRatio' as const, label: 'P/E Ratio', format: (v: number) => v.toFixed(1) + 'x', lowerBetter: true },
    { key: 'pbRatio' as const, label: 'P/B Ratio', format: (v: number) => v.toFixed(1) + 'x', lowerBetter: true },
    { key: 'dividendYield' as const, label: 'Dividend Yield', format: (v: number) => formatPercent(v * 100), lowerBetter: false },
    { key: 'roe' as const, label: 'ROE', format: (v: number) => v.toFixed(1) + '%', lowerBetter: false },
    { key: 'deRatio' as const, label: 'Debt/Equity', format: (v: number) => v.toFixed(2), lowerBetter: true },
    { key: 'marketCap' as const, label: 'Market Cap', format: (v: number) => formatNumber(v) + 'M', lowerBetter: false },
  ];

  // Calculate summary stats
  const getMetricSummary = (key: keyof PeerData) => {
    const values = peers.map(p => p[key] as number).filter((v): v is number => v !== undefined && v > 0);
    if (values.length === 0) return { min: 0, max: 0, avg: 0 };

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
    };
  };

  return (
    <Card title="Peer Comparison" subtitle={`Compare ${symbol} with sector peers`}>
      <div className="space-y-4">
        {/* Peer List with Rankings */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Metric</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">{symbol}</th>
                {peers.map((peer) => (
                  <th key={peer.symbol} className="text-center py-2 px-3 font-semibold text-gray-700">
                    {peer.symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => {
                const currentValue = currentMetrics?.[metric.key];
                const currentRank = currentValue !== undefined ? getRank(currentValue, peers, metric.key) : null;
                const summary = getMetricSummary(metric.key);

                return (
                  <tr key={metric.key} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-600">{metric.label}</td>
                    {/* Current Stock */}
                    <td className="py-2 px-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        {currentRank !== null && currentRank <= 3 && (
                          <span className={`text-xs font-bold ${
                            currentRank === 1 ? 'text-green-600' : currentRank === 2 ? 'text-yellow-600' : 'text-orange-600'
                          }`}>
                            #{currentRank}
                          </span>
                        )}
                        <span className="font-bold text-[#1e3a5f]">
                          {currentValue !== undefined ? metric.format(currentValue) : 'N/A'}
                        </span>
                      </div>
                    </td>
                    {/* Peers */}
                    {peers.map((peer) => {
                      const peerValue = peer[metric.key] as number;
                      const peerRank = getRank(peerValue, peers, metric.key);

                      return (
                        <td key={peer.symbol} className="py-2 px-3 text-center text-gray-700">
                          <div className="inline-flex items-center gap-1">
                            {peerRank !== null && peerRank <= 3 && (
                              <span className={`text-xs font-bold ${
                                peerRank === 1 ? 'text-green-600' : peerRank === 2 ? 'text-yellow-600' : 'text-orange-600'
                              }`}>
                                #{peerRank}
                              </span>
                            )}
                            <span>{peerValue !== undefined ? metric.format(peerValue) : 'N/A'}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Sector Averages</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {metrics.map((metric) => {
              const summary = getMetricSummary(metric.key);
              return (
                <div key={metric.key} className="bg-white rounded p-2 border border-gray-200">
                  <p className="text-xs text-gray-500">{metric.label}</p>
                  <p className="text-sm font-bold text-gray-900">
                    {summary.avg > 0 ? metric.format(summary.avg) : 'N/A'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 bg-green-100 rounded"></span>
            #1 = Best
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 bg-yellow-100 rounded"></span>
            #2 = Good
          </span>
          <span className="flex items-center gap-1">
            <span className="w-4 h-4 bg-orange-100 rounded"></span>
            #3 = Average
          </span>
        </div>
      </div>
    </Card>
  );
}
