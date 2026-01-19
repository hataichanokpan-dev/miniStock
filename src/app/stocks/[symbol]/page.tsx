'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Quote } from '@/types/market';
import type { FinancialMetrics } from '@/types/financials';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/ui/StatusBadge';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DATA_FRESHNESS_THRESHOLD = {
  FRESH: 5 * 60 * 1000,
  DELAYED: 60 * 60 * 1000,
};

type DataStatus = 'fresh' | 'delayed' | 'stale';

function getDataStatus(timestamp: number): DataStatus {
  const age = Date.now() - timestamp;
  if (age <= DATA_FRESHNESS_THRESHOLD.FRESH) return 'fresh';
  if (age <= DATA_FRESHNESS_THRESHOLD.DELAYED) return 'delayed';
  return 'stale';
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
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

const METRIC_EXPLANATIONS = {
  revenueGrowth: {
    title: 'Revenue Growth',
    explanation: 'Higher revenue growth indicates increasing sales. Compare to industry norms and check consistency.',
  },
  epsGrowth: {
    title: 'EPS Growth',
    explanation: 'Earnings per share growth shows profitability improvement. Look for consistent positive growth over time.',
  },
  roe: {
    title: 'Return on Equity (ROE)',
    explanation: 'Higher ROE can indicate efficient capital use. Extremely high values may warrant checking leverage levels.',
  },
  profitMargin: {
    title: 'Profit Margin',
    explanation: 'Shows how much profit is made per dollar of revenue. Higher margins suggest competitive advantages.',
  },
  deRatio: {
    title: 'Debt-to-Equity Ratio',
    explanation: 'Higher leverage amplifies both returns and risks. Compare to industry averages for context.',
  },
  peRatio: {
    title: 'P/E Ratio',
    explanation: 'Price relative to earnings. Lower P/E may indicate value, or growth concerns. Higher P/E suggests growth expectations.',
  },
  pbRatio: {
    title: 'P/B Ratio',
    explanation: 'Price relative to book value. P/B under 1 may indicate undervaluation, but check asset quality.',
  },
  dividendYield: {
    title: 'Dividend Yield',
    explanation: 'Annual dividends as percentage of stock price. High yields can be attractive but verify sustainability.',
  },
};

interface MetricCardProps {
  title: string;
  value: string | null;
  explanation: string;
  status?: 'success' | 'warning' | 'danger' | 'neutral';
}

function MetricCard({ title, value, explanation, status = 'neutral' }: MetricCardProps) {
  return (
    <div className='p-4 bg-gray-50 rounded-lg border border-gray-100'>
      <div className='flex items-start justify-between mb-2'>
        <h4 className='text-sm font-medium text-gray-700'>{title}</h4>
        {status !== 'neutral' && <StatusBadge status={status}>{status === 'success' ? 'Good' : status === 'warning' ? 'Check' : 'Caution'}</StatusBadge>}
      </div>
      <p className='text-xl font-semibold text-gray-900 mb-1'>{value ?? '—'}</p>
      <p className='text-xs text-gray-500 leading-relaxed'>{explanation}</p>
    </div>
  );
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string)?.toUpperCase();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<Array<{ date: string; close: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [quoteRes, fundamentalsRes, historicalRes] = await Promise.all([
          fetch('/api/stock/' + symbol + '/quote'),
          fetch('/api/stock/' + symbol + '/fundamentals'),
          fetch('/api/stock/' + symbol + '/historical?period=1y'),
        ]);

        if (!quoteRes.ok || !fundamentalsRes.ok || !historicalRes.ok) {
          throw new Error('Failed to fetch stock data');
        }

        const [quoteData, fundamentalsData, historicalData] = await Promise.all([
          quoteRes.json(),
          fundamentalsRes.json(),
          historicalRes.json(),
        ]);

        if (quoteData.error) throw new Error(quoteData.error);
        if (fundamentalsData.error) throw new Error(fundamentalsData.error);
        if (historicalData.error) throw new Error(historicalData.error);

        setQuote(quoteData);
        setMetrics(fundamentalsData.metrics);
        setProfile(fundamentalsData.profile);
        setHistoricalData((historicalData.data || []).map((h: any) => ({ date: h.date, close: h.close })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stock data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='animate-pulse space-y-6'>
          <div className='h-8 bg-gray-200 rounded w-1/3'></div>
          <div className='h-64 bg-gray-200 rounded'></div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='h-48 bg-gray-200 rounded'></div>
            <div className='h-48 bg-gray-200 rounded'></div>
            <div className='h-48 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Card>
          <div className='text-center py-12'>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>Error Loading Stock Data</h2>
            <p className='text-gray-600 mb-6'>{error}</p>
            <button onClick={() => router.push('/stocks')} className='btn btn-secondary'>
              Back to Stocks
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <Card>
          <div className='text-center py-12'>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>Stock Not Found</h2>
            <p className='text-gray-600 mb-6'>No data available for symbol: {symbol}</p>
            <button onClick={() => router.push('/stocks')} className='btn btn-secondary'>
              Back to Stocks
            </button>
          </div>
        </Card>
      </div>
    );
  }

  const dataStatus = getDataStatus(quote.timestamp);
  const statusConfig = {
    fresh: { label: 'Live', status: 'success' as const },
    delayed: { label: 'Delayed', status: 'warning' as const },
    stale: { label: 'Stale', status: 'danger' as const },
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <h1 className='text-3xl font-bold text-gray-900'>{symbol}</h1>
          <StatusBadge status={statusConfig[dataStatus].status}>
            {statusConfig[dataStatus].label}
          </StatusBadge>
        </div>
        {profile?.name && <p className='text-lg text-gray-600'>{profile.name}</p>}
        <p className='text-sm text-gray-500 mt-1'>
          Last updated: {formatTimestamp(quote.timestamp)}
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
        <div className='lg:col-span-2'>
          <Card title='Price Chart'>
            {historicalData.length > 0 ? (
              <ResponsiveContainer width='100%' height={300}>
                <LineChart data={historicalData.slice(-90)}>
                  <XAxis dataKey='date' tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis tickFormatter={(v) => v.toFixed(0)} />
                  <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} formatter={(value) => typeof value === 'number' ? ['$' + value.toFixed(2), 'Price'] : ['', '']} />
                  <Line type='monotone' dataKey='close' stroke='#1e3a5f' strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className='h-[300px] flex items-center justify-center text-gray-500'>
                Chart data unavailable
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card title='Key Stats'>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-gray-500'>Current Price</p>
                <p className='text-3xl font-bold text-gray-900'>${quote.price.toFixed(2)}</p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Change</p>
                <p className={'text-lg font-semibold ' + (quote.change >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({formatPercent(quote.changePercent)})
                </p>
              </div>
              <div className='pt-4 border-t border-gray-200'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p className='text-gray-500'>Day High</p>
                    <p className='font-medium'>${quote.high.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className='text-gray-500'>Day Low</p>
                    <p className='font-medium'>${quote.low.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className='text-gray-500'>Volume</p>
                    <p className='font-medium'>{formatNumber(quote.volume)}</p>
                  </div>
                  <div>
                    <p className='text-gray-500'>Market Cap</p>
                    <p className='font-medium'>{formatNumber(quote.marketCap)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card title='Financial Snapshot' subtitle='Key metrics for quick assessment'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <MetricCard
            title={METRIC_EXPLANATIONS.revenueGrowth.title}
            value={metrics?.revenueGrowth !== undefined ? formatPercent(metrics.revenueGrowth) : null}
            explanation={METRIC_EXPLANATIONS.revenueGrowth.explanation}
            status={metrics?.revenueGrowth && metrics.revenueGrowth > 0 ? 'success' : metrics?.revenueGrowth && metrics.revenueGrowth < 0 ? 'danger' : 'neutral'}
          />
          <MetricCard
            title={METRIC_EXPLANATIONS.epsGrowth.title}
            value={metrics?.epsGrowth !== undefined ? formatPercent(metrics.epsGrowth) : null}
            explanation={METRIC_EXPLANATIONS.epsGrowth.explanation}
            status={metrics?.epsGrowth && metrics.epsGrowth > 0 ? 'success' : metrics?.epsGrowth && metrics.epsGrowth < 0 ? 'danger' : 'neutral'}
          />
          <MetricCard
            title={METRIC_EXPLANATIONS.roe.title}
            value={metrics?.roe !== undefined ? metrics.roe.toFixed(2) : null}
            explanation={METRIC_EXPLANATIONS.roe.explanation}
            status={metrics?.roe && metrics.roe > 15 ? 'success' : metrics?.roe && metrics.roe < 5 ? 'danger' : 'neutral'}
          />
          <MetricCard
            title={METRIC_EXPLANATIONS.profitMargin.title}
            value={metrics?.profitMargin !== undefined ? formatPercent(metrics.profitMargin * 100) : null}
            explanation={METRIC_EXPLANATIONS.profitMargin.explanation}
            status={metrics?.profitMargin && metrics.profitMargin > 0.1 ? 'success' : metrics?.profitMargin && metrics.profitMargin < 0 ? 'danger' : 'neutral'}
          />
          <MetricCard
            title={METRIC_EXPLANATIONS.deRatio.title}
            value={metrics?.deRatio !== undefined ? metrics.deRatio.toFixed(2) : null}
            explanation={METRIC_EXPLANATIONS.deRatio.explanation}
            status={metrics?.deRatio && metrics.deRatio > 2 ? 'warning' : 'neutral'}
          />
          <MetricCard
            title={METRIC_EXPLANATIONS.peRatio.title}
            value={metrics?.peRatio !== undefined && metrics.peRatio > 0 ? metrics.peRatio.toFixed(2) : null}
            explanation={METRIC_EXPLANATIONS.peRatio.explanation}
            status='neutral'
          />
          <MetricCard
            title={METRIC_EXPLANATIONS.pbRatio.title}
            value={metrics?.pbRatio !== undefined && metrics.pbRatio > 0 ? metrics.pbRatio.toFixed(2) : null}
            explanation={METRIC_EXPLANATIONS.pbRatio.explanation}
            status='neutral'
          />
          <MetricCard
            title={METRIC_EXPLANATIONS.dividendYield.title}
            value={metrics?.dividendYield !== undefined && metrics.dividendYield > 0 ? formatPercent(metrics.dividendYield * 100) : null}
            explanation={METRIC_EXPLANATIONS.dividendYield.explanation}
            status='neutral'
          />
        </div>
      </Card>
    </div>
  );
}
