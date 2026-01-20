/**
 * Peer Comparison Component
 * Compare a stock with its sector peers and custom-selected stocks
 * Uses sector standards from sectorStandards.ts
 * Allows manual input of stock symbols for comparison
 * Professional investor-friendly design
 */

'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Card from '@/components/ui/Card';
import { formatPercent, formatNumber, getChangeColor } from '@/lib/format';
import { getPeerStocks, getSectorForSymbol, getSectorName } from '@/lib/sectorStandards';

/**
 * Normalize a stock symbol to a consistent format
 * - Trims whitespace
 * - Converts to uppercase
 * - Appends .BK suffix for Thai stocks if not already present
 */
function normalizeSymbol(symbol: string): string {
  const trimmed = symbol.trim();
  const upperSymbol = trimmed.toUpperCase();

  // If symbol already contains a dot, assume it has a market suffix
  if (upperSymbol.includes('.')) {
    return upperSymbol;
  }

  // For Thai stocks, append .BK suffix (typical Thai stock symbols are 2-6 letters)
  const thaiStockPattern = /^[A-Z]{2,6}$/;
  if (thaiStockPattern.test(upperSymbol)) {
    return `${upperSymbol}.BK`;
  }

  return upperSymbol;
}

/**
 * Extract base symbol without market suffix (for duplicate checking)
 */
function getBaseSymbol(symbol: string): string {
  const normalized = normalizeSymbol(symbol);
  const parts = normalized.split('.');
  return parts[0].toUpperCase();
}

/**
 * Compare two symbols, normalizing both for comparison
 */
function symbolsEqual(symbol1: string, symbol2: string): boolean {
  return getBaseSymbol(symbol1) === getBaseSymbol(symbol2);
}

interface PeerData {
  symbol: string;
  name: string;
  peRatio?: number | null;
  pbRatio?: number | null;
  dividendYield?: number | null;
  roe?: number | null;
  deRatio?: number | null;
  marketCap?: number | null;
  price?: number | null;
  changePercent?: number | null;
}

interface PeerComparisonProps {
  symbol: string;
  sector?: string;
  currentMetrics?: {
    peRatio?: number | null;
    pbRatio?: number | null;
    dividendYield?: number | null;
    roe?: number | null;
    deRatio?: number | null;
    marketCap?: number | null;
  } | null;
}

// Rank value among peers (returns rank position, with 1 being best)
function getRank(value: number | null, allData: PeerData[], key: keyof PeerData): number | null {
  if (value == null) return null;

  const allValues = allData.map(p => (p[key] as number | null) || 0).filter(v => v != null && v > 0) as number[];

  if (allValues.length === 0) return null;

  // For most metrics, higher is better (sort descending)
  // But for P/E, P/B, D/E, lower is better (sort ascending)
  const isLowerBetter = key === 'peRatio' || key === 'pbRatio' || key === 'deRatio';

  const sorted = [...allValues].sort((a, b) => isLowerBetter ? a - b : b - a);
  const rank = sorted.indexOf(value) + 1;

  return rank;
}

// Get rank badge color
function getRankBadgeColor(rank: number | null, total: number): string {
  if (rank === null || total === 0) return 'bg-gray-100 text-gray-600';
  if (rank === 1) return 'bg-green-500 text-white';
  if (rank === 2) return 'bg-emerald-400 text-white';
  if (rank === 3) return 'bg-teal-300 text-white';
  if (rank <= Math.ceil(total / 2)) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

// Get performance indicator (better/worse than average)
function getPerformanceIndicator(value: number, allData: PeerData[], key: keyof PeerData): 'better' | 'worse' | 'neutral' {
  const values = allData.map(p => (p[key] as number | null) || 0).filter((v): v is number => v != null && v > 0);
  if (values.length === 0) return 'neutral';

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const isLowerBetter = key === 'peRatio' || key === 'pbRatio' || key === 'deRatio';

  if (Math.abs(value - avg) / avg < 0.05) return 'neutral';
  return isLowerBetter ? (value < avg ? 'better' : 'worse') : (value > avg ? 'better' : 'worse');
}

export default function PeerComparison({ symbol, sector, currentMetrics }: PeerComparisonProps) {
  const [peers, setPeers] = useState<PeerData[]>([]);
  const [customSymbols, setCustomSymbols] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingStock, setAddingStock] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get standard sector peers from sectorStandards.ts
  const sectorKey = getSectorForSymbol(symbol);
  const sectorName = sectorKey ? getSectorName(symbol) : sector || 'Unknown';
  const standardPeers = useMemo(() => {
    return sectorKey ? getPeerStocks(symbol) : [];
  }, [symbol, sectorKey]);

  // Fetch peer data for a list of symbols with partial success support
  const fetchPeerDataForSymbols = async (symbols: string[]): Promise<{ successful: PeerData[], failed: string[] }> => {
    const results = await Promise.allSettled(
      symbols.map(async (peerSymbol) => {
        try {
          const res = await fetch(`/api/stock/${peerSymbol}/fundamentals`);
          if (!res.ok) {
            throw new Error(`Failed to fetch ${peerSymbol}: ${res.status}`);
          }

          const data = await res.json();
          return {
            symbol: peerSymbol,
            name: data.profile?.name || peerSymbol,
            peRatio: data.metrics?.peRatio ?? null,
            pbRatio: data.metrics?.pbRatio ?? null,
            dividendYield: data.metrics?.dividendYield ?? null,
            roe: data.metrics?.roe ?? null,
            deRatio: data.metrics?.deRatio ?? null,
            marketCap: data.profile?.marketCap ?? null,
          } as PeerData;
        } catch (err) {
          console.error(`Error fetching ${peerSymbol}:`, err);
          throw err;
        }
      })
    );

    const successful: PeerData[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        successful.push(result.value);
      } else {
        failed.push(symbols[index]);
      }
    });

    return { successful, failed };
  };

  useEffect(() => {
    async function fetchPeerData() {
      try {
        setLoading(true);
        setError(null);

        // Use standard sector peers
        const peerSymbols = standardPeers.slice(0, 5); // Limit to 5 standard peers for cleaner display

        // Fetch data for standard peers
        const { successful: standardPeerData } = await fetchPeerDataForSymbols(peerSymbols);
        setPeers(standardPeerData);
      } catch (err) {
        console.error('Error fetching peer data:', err);
        setError('Failed to load peer comparison data');
      } finally {
        setLoading(false);
      }
    }

    fetchPeerData();
  }, [symbol, standardPeers]);

  // Add a custom stock symbol to comparison (with stale closure fix)
  const addCustomStock = useCallback(async () => {
    const inputSymbol = customInput.trim();
    if (!inputSymbol) return;

    const normalizedSymbol = normalizeSymbol(inputSymbol);

    // Check if already in comparison (either in peers or custom) using normalized comparison
    const allSymbols = [symbol, ...peers.map(p => p.symbol), ...customSymbols];
    const isDuplicate = allSymbols.some(s => symbolsEqual(s, normalizedSymbol));

    if (isDuplicate) {
      setAddError('Already in comparison');
      setTimeout(() => setAddError(null), 2000);
      setCustomInput('');
      return;
    }

    setAddingStock(true);
    setAddError(null);

    try {
      const { successful, failed } = await fetchPeerDataForSymbols([normalizedSymbol]);

      if (successful.length > 0) {
        // Use functional updates to avoid stale closure
        setCustomSymbols(prev => [...prev, normalizedSymbol]);
        setPeers(prev => [...prev, ...successful]);
        setCustomInput('');
      } else {
        setAddError(failed.length > 0 ? 'Could not fetch data' : 'Unknown symbol');
        setTimeout(() => setAddError(null), 3000);
      }
    } catch (err) {
      console.error('Error adding custom stock:', err);
      setAddError('Could not fetch data');
      setTimeout(() => setAddError(null), 3000);
    } finally {
      setAddingStock(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [customInput, symbol, peers, customSymbols]);

  // Remove a stock from comparison (works for both custom and standard peers)
  const removeStock = useCallback((stockSymbol: string) => {
    // If it's a custom stock, also remove from custom symbols
    setCustomSymbols(prev => prev.filter(s => symbolsEqual(s, stockSymbol)));
    // Remove from peers
    setPeers(prev => prev.filter(p => !symbolsEqual(p.symbol, stockSymbol)));
  }, []);

  // Check if a stock is custom (not from standard peers)
  const isCustomStock = useCallback((stockSymbol: string) => {
    return customSymbols.some(s => symbolsEqual(s, stockSymbol));
  }, [customSymbols]);

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

  if (error && peers.length === 0) {
    return (
      <Card title="Peer Comparison" subtitle="Compare with sector peers">
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-1">Peer comparison is available for Thai SET stocks</p>
        </div>
      </Card>
    );
  }

  const metrics = [
    { key: 'peRatio' as const, label: 'P/E Ratio', format: (v: number) => v.toFixed(1) + 'x', lowerBetter: true, description: 'Price to Earnings' },
    { key: 'pbRatio' as const, label: 'P/B Ratio', format: (v: number) => v.toFixed(2) + 'x', lowerBetter: true, description: 'Price to Book' },
    { key: 'dividendYield' as const, label: 'Dividend Yield', format: (v: number) => formatPercent(v * 100), lowerBetter: false, description: 'Annual dividend return' },
    { key: 'roe' as const, label: 'ROE', format: (v: number) => v.toFixed(1) + '%', lowerBetter: false, description: 'Return on Equity' },
  ];

  // Create data array with current stock and all peers for ranking
  const currentStockData: PeerData = {
    symbol,
    name: symbol,
    peRatio: currentMetrics?.peRatio,
    pbRatio: currentMetrics?.pbRatio,
    dividendYield: currentMetrics?.dividendYield,
    roe: currentMetrics?.roe,
    deRatio: currentMetrics?.deRatio,
    marketCap: currentMetrics?.marketCap,
  };

  const allData = [currentStockData, ...peers];
  const totalStocks = allData.length;

  // Calculate overall performance summary
  const getOverallScore = (stockData: PeerData) => {
    let betterCount = 0;
    let worseCount = 0;
    let totalMetrics = 0;

    metrics.forEach(metric => {
      const value = stockData[metric.key] as number | null;
      if (value != null) {
        totalMetrics++;
        const performance = getPerformanceIndicator(value, allData, metric.key);
        if (performance === 'better') betterCount++;
        else if (performance === 'worse') worseCount++;
      }
    });

    return { betterCount, worseCount, totalMetrics };
  };

  const currentScore = getOverallScore(currentStockData);

  return (
    <Card
      title="Peer Comparison"
      subtitle={`${symbolName(symbol, sectorName)} - Comparing with ${peers.length} peer${peers.length !== 1 ? 's' : ''}`}
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 mb-1">Overall Performance vs Peers</h3>
              <p className="text-[10px] sm:text-xs text-gray-600">
                Comparing {symbol} against {peers.length} peer{peers.length !== 1 ? 's' : ''} in {sectorName}
              </p>
            </div>
            {currentScore.totalMetrics > 0 && (
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className={`text-xl sm:text-2xl font-bold ${currentScore.betterCount > currentScore.worseCount ? 'text-green-600' : currentScore.worseCount > currentScore.betterCount ? 'text-red-600' : 'text-gray-600'}`}>
                    {currentScore.betterCount > currentScore.worseCount ? '▲' : currentScore.worseCount > currentScore.betterCount ? '▼' : '→'}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    {currentScore.betterCount} Better / {currentScore.worseCount} Worse
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Custom Stock Input */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                ref={inputRef}
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && addCustomStock()}
                placeholder="Add stock symbol (e.g., PTT, KBANK)..."
                disabled={addingStock}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={addCustomStock}
                disabled={addingStock || !customInput.trim()}
                className="px-4 py-2 bg-[#1e3a5f] text-white text-sm font-medium rounded-lg hover:bg-[#2a4a6f] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {addingStock ? 'Adding...' : 'Add Stock'}
              </button>
            </div>
            {addError && (
              <div className="text-xs text-red-600">
                {addError}
              </div>
            )}
            {customSymbols.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Custom:</span>
                {customSymbols.map((cs) => (
                  <span
                    key={cs}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    {cs}
                    <button
                      onClick={() => removeStock(cs)}
                      className="hover:text-purple-900 ml-1"
                      aria-label={`Remove ${cs}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Compact Peer Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-200">
                  <th className="text-left py-2 px-2 sm:px-3 font-semibold text-gray-700 sticky left-0 bg-slate-50 z-10">Metric</th>
                  <th className="text-center py-2 px-2 sm:px-3 font-semibold text-blue-700 min-w-[100px]">
                    <div className="flex items-center justify-center gap-1">
                      <span>{symbol}</span>
                      <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">YOU</span>
                    </div>
                  </th>
                  {peers.map((peer) => (
                    <th key={peer.symbol} className="text-center py-2 px-2 sm:px-3 font-semibold text-gray-700 min-w-[90px]">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{peer.symbol}</span>
                          <button
                            onClick={() => removeStock(peer.symbol)}
                            className="text-gray-300 hover:text-red-500 transition-colors text-base leading-none"
                            aria-label={`Remove ${peer.symbol}`}
                            title={`Remove ${peer.symbol} from comparison`}
                          >
                            ×
                          </button>
                        </div>
                        {isCustomStock(peer.symbol) && (
                          <span className="text-[8px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">CUSTOM</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, metricIndex) => {
                  const currentValue = currentMetrics?.[metric.key];
                  const currentRank = currentValue != null ? getRank(currentValue, allData, metric.key) : null;
                  const currentPerformance = currentValue != null ? getPerformanceIndicator(currentValue, allData, metric.key) : 'neutral';

                  return (
                    <tr key={metric.key} className={`border-b border-gray-100 ${metricIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                      <td className="py-2.5 px-2 sm:px-3 sticky left-0 z-10 text-xs sm:text-sm">
                        <div>
                          <div className="font-medium text-gray-700">{metric.label}</div>
                          <div className="text-[10px] text-gray-400 hidden sm:block">{metric.description}</div>
                        </div>
                      </td>
                      {/* Current Stock */}
                      <td className="py-2.5 px-2 sm:px-3 text-center bg-blue-50/30">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1">
                            {currentRank !== null && currentRank <= totalStocks && totalStocks > 1 && (
                              <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded ${getRankBadgeColor(currentRank, totalStocks)}`}>
                                #{currentRank}
                              </span>
                            )}
                            <span className="font-bold text-[#1e3a5f] text-xs sm:text-sm">
                              {currentValue != null ? metric.format(currentValue) : '—'}
                            </span>
                            {currentPerformance !== 'neutral' && currentValue != null && (
                              <span className={`text-[10px] ${currentPerformance === 'better' ? 'text-green-500' : 'text-red-500'}`}>
                                {currentPerformance === 'better' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Peers */}
                      {peers.map((peer) => {
                        const peerValue = peer[metric.key] as number | undefined;
                        const peerRank = peerValue != null ? getRank(peerValue, allData, metric.key) : null;
                        const peerPerformance = peerValue != null ? getPerformanceIndicator(peerValue, allData, metric.key) : 'neutral';

                        return (
                          <td key={peer.symbol} className="py-2.5 px-2 sm:px-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1">
                                {peerRank !== null && peerRank <= totalStocks && totalStocks > 1 && (
                                  <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded ${getRankBadgeColor(peerRank, totalStocks)}`}>
                                    #{peerRank}
                                  </span>
                                )}
                                <span className="text-xs sm:text-sm">{peerValue != null ? metric.format(peerValue) : '—'}</span>
                                {peerPerformance !== 'neutral' && peerValue != null && (
                                  <span className={`text-[10px] ${peerPerformance === 'better' ? 'text-green-500' : 'text-red-500'}`}>
                                    {peerPerformance === 'better' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
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
        </div>

        {/* Legend */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Legend</h4>
          <div className="flex flex-wrap gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                <span className="w-3 h-3 bg-green-500 rounded"></span>
                <span className="w-3 h-3 bg-emerald-400 rounded"></span>
                <span className="w-3 h-3 bg-teal-300 rounded"></span>
              </div>
              <span>#1-3 Best</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-yellow-100 rounded"></span>
              <span>Above Avg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-100 rounded"></span>
              <span>Below Avg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-green-500 font-bold">↑</span>
              <span>↑ Better than avg</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-red-500 font-bold">↓</span>
              <span>↓ Worse than avg</span>
            </div>
          </div>
        </div>

        {/* Info message */}
        {sectorKey && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Tip:</strong> Click × next to any stock to remove it from comparison. Add custom stocks to compare across sectors.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// Helper to format symbol and sector name
function symbolName(symbol: string, sector: string | null): string {
  if (sector) {
    return `${symbol} (${sector})`;
  }
  return symbol;
}
