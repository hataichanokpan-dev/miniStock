'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import MarketIndexCard from '@/components/ui/MarketIndexCard';
import SectorFlowDashboard from '@/components/settrade/SectorFlowDashboard';
import SectorSummaryCard from '@/components/settrade/SectorSummaryCard';
import InvestorFlowCard from '@/components/settrade/InvestorFlowCard';
import TopRankingsCard from '@/components/settrade/TopRankingsCard';
import { MultiTrendChart, InvestorFlowTrendChart, InvestorFlowDataPoint } from '@/components/settrade/TrendChart';
import { formatPercent, getChangeColor } from '@/lib/format';

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

type TabKey = 'overview' | 'sectors' | 'investors' | 'indices';

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [loadingIndices, setLoadingIndices] = useState(true);
  const [indicesError, setIndicesError] = useState<string | null>(null);

  // SETTRADE data states
  const [sectorData, setSectorData] = useState<{
    sectors: Array<{
      id: string;
      name: string;
      last: number;
      chg: number;
      chgPct: number;
      volK: number;
      valMn: number;
    }>;
    date: string;
    capturedAt: string;
  } | null>(null);
  const [investorData, setInvestorData] = useState<{
    investors: Array<{
      id: string;
      name: string;
      buyValue: number;
      sellValue: number;
      netValue: number;
      buyPct: number;
      sellPct: number;
    }>;
    date: string;
    capturedAt: string;
  } | null>(null);
  const [topRankingsData, setTopRankingsData] = useState<{
    topByValue: Array<{
      symbol: string;
      name: string;
      last: number;
      change: number;
      chgPct: number;
      valMillion: number;
      volMillion: number;
    }>;
    topByVolume: Array<{
      symbol: string;
      name: string;
      last: number;
      change: number;
      chgPct: number;
      valMillion: number;
      volMillion: number;
    }>;
    date: string;
    capturedAt: string;
  } | null>(null);
  const [settradeLoading, setSettradeLoading] = useState(true);
  const [settradeError, setSettradeError] = useState<string | null>(null);

  // Historical data states
  const [sectorHistory, setSectorHistory] = useState<Array<{
    date: string;
    capturedAt: string;
    sectors: Array<{
      id: string;
      name: string;
      last: number;
      chg: number;
      chgPct: number;
      volK: number;
      valMn: number;
    }>;
  }>>([]);
  const [investorHistory, setInvestorHistory] = useState<Array<{
    date: string;
    capturedAt: string;
    investors: Array<{
      id: string;
      name: string;
      buyValue: number;
      sellValue: number;
      netValue: number;
      buyPct: number;
      sellPct: number;
    }>;
  }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch market indices
  useEffect(() => {
    async function fetchMarketIndices() {
      try {
        setLoadingIndices(true);
        const response = await fetch('/api/market/indices');

        if (!response.ok) {
          throw new Error('Failed to fetch market indices');
        }

        const data = await response.json();
        setMarketIndices(data);
        setIndicesError(null);
      } catch (err) {
        console.error('Error fetching market indices:', err);
        setIndicesError('Failed to load market indices');

        // Set fallback data
        setMarketIndices([
          { symbol: '^SET.BK', name: 'SET Index', value: 1342.58, change: 12.45, changePercent: 0.94 },
          { symbol: '^MAI.BK', name: 'MAI Index', value: 458.23, change: -3.12, changePercent: -0.68 },
          { symbol: '^GSPC', name: 'S&P 500', value: 4783.45, change: 23.67, changePercent: 0.50 },
          { symbol: '^HSI', name: 'Hang Seng', value: 16547.82, change: -87.34, changePercent: -0.52 },
        ]);
      } finally {
        setLoadingIndices(false);
      }
    }

    fetchMarketIndices();
  }, []);

  // Fetch SETTRADE data
  useEffect(() => {
    async function fetchSettradeData() {
      try {
        setSettradeLoading(true);

        const [sectorRes, investorRes, topRankingsRes] = await Promise.all([
          fetch('/api/settrade/industry-sector'),
          fetch('/api/settrade/investor-type'),
          fetch('/api/settrade/top-rankings'),
        ]);

        const sectorResult = sectorRes.ok ? await sectorRes.json() : null;
        const investorResult = investorRes.ok ? await investorRes.json() : null;
        const topRankingsResult = topRankingsRes.ok ? await topRankingsRes.json() : null;

        if (sectorResult) {
          setSectorData(sectorResult);
        }

        if (investorResult) {
          setInvestorData(investorResult);
        }

        if (topRankingsResult) {
          setTopRankingsData(topRankingsResult);
        }

        if (!sectorResult && !investorResult && !topRankingsResult) {
          setSettradeError('Failed to load Thailand market data');
        } else {
          setSettradeError(null);
        }
      } catch (err) {
        console.error('Error fetching SETTRADE data:', err);
        setSettradeError('Failed to load Thailand market data from Firebase');
      } finally {
        setSettradeLoading(false);
      }
    }

    fetchSettradeData();
  }, []);

  // Fetch historical data when switching to sectors or investors tab
  useEffect(() => {
    async function fetchHistoricalData() {
      if (activeTab !== 'sectors' && activeTab !== 'investors') return;
      if (sectorHistory.length > 0 && investorHistory.length > 0) return; // Already loaded

      try {
        setHistoryLoading(true);

        const [sectorRes, investorRes] = await Promise.all([
          fetch('/api/settrade/sector-history?days=28'),
          fetch('/api/settrade/investor-history?days=28'),
        ]);

        const sectorResult = sectorRes.ok ? await sectorRes.json() : null;
        const investorResult = investorRes.ok ? await investorRes.json() : null;

        if (sectorResult?.data) {
          setSectorHistory(sectorResult.data);
        }

        if (investorResult?.data) {
          setInvestorHistory(investorResult.data);
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
      } finally {
        setHistoryLoading(false);
      }
    }

    fetchHistoricalData();
  }, [activeTab]);

  const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'sectors', label: 'Sectors', icon: '🏭' },
    { key: 'investors', label: 'Investors', icon: '👥' },
    { key: 'indices', label: 'Indices', icon: '📈' },
  ];

  // Calculate SET Index summary
  const setIndex = marketIndices.find(i => i.symbol.includes('SET'));
  const setSummary = sectorData ? {
    totalValue: sectorData.sectors.reduce((sum: number, s: any) => sum + (s.valMn || 0) * 1e6, 0),
    totalVolume: sectorData.sectors.reduce((sum: number, s: any) => sum + (s.volK || 0) * 1000, 0),
    advancing: sectorData.sectors.filter((s: any) => s.chgPct > 0).length,
    declining: sectorData.sectors.filter((s: any) => s.chgPct < 0).length,
  } : null;

  // Process sector history for chart
  const processSectorHistoryForChart = (history: typeof sectorHistory) => {
    const topSectors = ['ENERG', 'BANK', 'ICT', 'FOOD', 'FINCIAL', 'HELTH', 'TRANS', 'INDUS'];
    const chartData: Array<{ date: string; [key: string]: string | number }> = [];

    history.forEach((dayData) => {
      const dataPoint: { date: string; [key: string]: string | number } = { date: dayData.date };
      const sectorMap = new Map(dayData.sectors.map(s => [s.id, s.valMn]));

      topSectors.forEach((sectorId) => {
        dataPoint[sectorId] = sectorMap.get(sectorId) || 0;
      });

      chartData.push(dataPoint);
    });

    return chartData;
  };

  // Process investor history for chart
  const processInvestorHistoryForChart = (history: typeof investorHistory) => {
    const investorTypes = ['FOREIGN', 'LOCAL_INDIVIDUAL', 'LOCAL_INST', 'PROPRIETARY'];
    const chartData: Array<{ date: string; [key: string]: string | number }> = [];

    history.forEach((dayData) => {
      const dataPoint: { date: string; [key: string]: string | number } = { date: dayData.date };
      const investorMap = new Map(dayData.investors.map(i => [i.id, i.netValue]));

      investorTypes.forEach((typeId) => {
        dataPoint[typeId] = investorMap.get(typeId) || 0;
      });

      chartData.push(dataPoint);
    });

    return chartData;
  };

  // Process investor history for flow chart (with buy/sell data)
  const processInvestorHistoryForFlowChart = (history: typeof investorHistory): InvestorFlowDataPoint[] => {
    return history.map((dayData) => {
      const dataPoint: InvestorFlowDataPoint = {
        date: dayData.date,
        FOREIGN: { buy: 0, sell: 0, net: 0 },
        LOCAL_INST: { buy: 0, sell: 0, net: 0 },
        PROPRIETARY: { buy: 0, sell: 0, net: 0 },
        LOCAL_INDIVIDUAL: { buy: 0, sell: 0, net: 0 },
      };

      dayData.investors.forEach((investor) => {
        if (investor.id === 'FOREIGN') {
          dataPoint.FOREIGN = { buy: investor.buyValue, sell: investor.sellValue, net: investor.netValue };
        } else if (investor.id === 'LOCAL_INST') {
          dataPoint.LOCAL_INST = { buy: investor.buyValue, sell: investor.sellValue, net: investor.netValue };
        } else if (investor.id === 'PROPRIETARY') {
          dataPoint.PROPRIETARY = { buy: investor.buyValue, sell: investor.sellValue, net: investor.netValue };
        } else if (investor.id === 'LOCAL_INDIVIDUAL') {
          dataPoint.LOCAL_INDIVIDUAL = { buy: investor.buyValue, sell: investor.sellValue, net: investor.netValue };
        }
      });

      return dataPoint;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Real-time market data and analysis</p>
            {indicesError && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-700 text-xs">
                ⚠️ {indicesError}
              </div>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] self-start"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Mobile-First Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <nav
          className="flex gap-6 min-w-max scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-[#1e3a5f] text-[#1e3a5f]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Market Indices - Responsive */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Global Indices</h2>
            {loadingIndices ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse h-28 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {marketIndices.map((index) => (
                  <MarketIndexCard
                    key={index.symbol}
                    name={index.name}
                    value={index.value}
                    change={index.change}
                    changePercent={index.changePercent}
                    market={
                      index.symbol.includes('.BK')
                        ? '🇹🇭'
                        : index.symbol.includes('^GSPC') || index.symbol.includes('^DJI') || index.symbol.includes('^IXIC')
                        ? '🇺🇸'
                        : index.symbol.includes('^HSI')
                        ? '🇭🇰'
                        : '🌍'
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Thailand Market - Mobile First */}
          <section>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">🇹🇭 Thailand Market</h2>
            {settradeLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>
                <div className="animate-pulse h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ) : settradeError ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                ⚠️ {settradeError} — Check Firebase configuration and database permissions
              </div>
            ) : (
              <div className="space-y-4">
                {/* Top row: Sector Summary + Investor Flow */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Sector Summary Chart Card */}
                  {sectorData && (
                    <Card title="Sector Overview" subtitle={sectorData.date}>
                      <SectorSummaryCard sectors={sectorData.sectors} limit={6} />
                    </Card>
                  )}

                  {/* Investor Flow Card */}
                  {investorData && (
                    <Card title="Investor Flow" subtitle={investorData.date}>
                      <InvestorFlowCard investors={investorData.investors} showTitle={false} />
                    </Card>
                  )}
                </div>

                {/* Top Rankings Card */}
                {topRankingsData && (
                  <Card title="Top Rankings" subtitle={topRankingsData.date}>
                    <TopRankingsCard
                      topByValue={topRankingsData.topByValue}
                      topByVolume={topRankingsData.topByVolume}
                    />
                  </Card>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Sectors Tab */}
      {activeTab === 'sectors' && (
        <div className="space-y-6">
          {/* Today's Sector Flow */}
          {settradeLoading ? (
            <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>
          ) : settradeError ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              ⚠️ {settradeError}
            </div>
          ) : sectorData ? (
            <Card title="Sector Flow Analysis" subtitle="Where is the money moving today?">
              <SectorFlowDashboard
                sectors={sectorData.sectors}
                totalValue={setSummary?.totalValue}
                totalVolume={setSummary?.totalVolume}
                setIndex={setIndex?.value || 1342}
                setChange={setIndex?.changePercent || 0}
              />
            </Card>
          ) : (
            <Card title="Industry Sector Performance" subtitle="No data available">
              <p className="text-gray-500">No sector data available at this time.</p>
            </Card>
          )}

          {/* Sector Trend (4 weeks) */}
          {historyLoading ? (
            <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
          ) : sectorHistory.length > 0 ? (
            <MultiTrendChart
              title="Sector Value Trend (4 Weeks)"
              subtitle="Market value by sector over the last 28 days"
              data={processSectorHistoryForChart(sectorHistory)}
              lines={[
                { dataKey: 'ENERG', name: 'Energy', color: '#1e3a5f' },
                { dataKey: 'BANK', name: 'Banks', color: '#10b981' },
                { dataKey: 'ICT', name: 'Technology', color: '#8b5cf6' },
                { dataKey: 'FOOD', name: 'Food', color: '#f59e0b' },
              ]}
              height={350}
            />
          ) : null}
        </div>
      )}

      {/* Investors Tab */}
      {activeTab === 'investors' && (
        <div className="space-y-6">
          {/* Today's Investor Flow */}
          {settradeLoading ? (
            <div className="animate-pulse h-96 bg-gray-200 rounded-lg"></div>
          ) : settradeError ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              ⚠️ {settradeError}
            </div>
          ) : investorData ? (
            <Card title="Investor Flow Analysis" subtitle={investorData.date}>
              <InvestorFlowCard investors={investorData.investors} showTitle={true} />
            </Card>
          ) : (
            <Card title="Investor Type Analysis" subtitle="No data available">
              <p className="text-gray-500">No investor data available at this time.</p>
            </Card>
          )}

          {/* Investor Flow Trend (4 weeks) */}
          {historyLoading ? (
            <div className="animate-pulse h-64 bg-gray-200 rounded-lg"></div>
          ) : investorHistory.length > 0 ? (
            <InvestorFlowTrendChart
              title="Investor Flow Trend (4 Weeks)"
              subtitle="Buy/Sell volume and net flow by Foreign Investors over the last 28 days"
              data={processInvestorHistoryForFlowChart(investorHistory)}
              primaryInvestor="FOREIGN"
              height={400}
            />
          ) : null}
        </div>
      )}

      {/* Indices Tab */}
      {activeTab === 'indices' && (
        <div className="space-y-4">
          {/* Main Indices */}
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Market Indices</h2>
          {loadingIndices ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-28 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : indicesError ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              ⚠️ {indicesError}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {marketIndices.map((index) => (
                <MarketIndexCard
                  key={index.symbol}
                  name={index.name}
                  value={index.value}
                  change={index.change}
                  changePercent={index.changePercent}
                  market={
                    index.symbol.includes('.BK')
                      ? '🇹🇭'
                      : index.symbol.includes('^GSPC') || index.symbol.includes('^DJI') || index.symbol.includes('^IXIC')
                      ? '🇺🇸'
                      : index.symbol.includes('^HSI')
                      ? '🇭🇰'
                      : '🌍'
                  }
                />
              ))}
            </div>
          )}

          {/* Market Summary */}
          {setIndex && (
            <Card title="Market Summary" subtitle="Key market overview" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1e3a5f] rounded-lg p-4 text-white">
                  <p className="text-xs text-white/70 mb-1">Thai Market</p>
                  <p className="text-lg font-bold">SET Index</p>
                  <p className={`text-sm mt-1 ${getChangeColor(setIndex?.changePercent || 0)}`}>
                    {setIndex ? formatPercent(setIndex.changePercent) : '-'}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-white">
                  <p className="text-xs text-white/70 mb-1">US Market</p>
                  <p className="text-lg font-bold">S&P 500</p>
                  <p className={`text-sm mt-1 ${getChangeColor(marketIndices.find(i => i.symbol.includes('GSPC'))?.changePercent || 0)}`}>
                    {marketIndices.find(i => i.symbol.includes('GSPC')) ? formatPercent(marketIndices.find(i => i.symbol.includes('GSPC'))!.changePercent) : '-'}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-white">
                  <p className="text-xs text-white/70 mb-1">Asia Market</p>
                  <p className="text-lg font-bold">Hang Seng</p>
                  <p className={`text-sm mt-1 ${getChangeColor(marketIndices.find(i => i.symbol.includes('HSI'))?.changePercent || 0)}`}>
                    {marketIndices.find(i => i.symbol.includes('HSI')) ? formatPercent(marketIndices.find(i => i.symbol.includes('HSI'))!.changePercent) : '-'}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
