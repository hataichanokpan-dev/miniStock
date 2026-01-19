'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Area, AreaChart } from 'recharts';

/**
 * Format date to short month and day format (e.g., "Jan 16")
 */
function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Determine trend direction based on values
 */
function getTrendDirection(values: number[]): 'bullish' | 'bearish' | 'neutral' {
  if (values.length < 2) return 'neutral';
  const first = values[0];
  const last = values[values.length - 1];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  if (last > first && last > avg) return 'bullish';
  if (last < first && last < avg) return 'bearish';
  return 'neutral';
}

interface TrendDataPoint {
  date: string;
  value: number;
}

interface TrendChartProps {
  title: string;
  subtitle?: string;
  data: TrendDataPoint[];
  dataKey: string;
  color?: string;
  unit?: string;
  formatValue?: (value: number) => string;
  height?: number;
}

export default function TrendChart({
  title,
  subtitle,
  data,
  dataKey,
  color = '#1e3a5f',
  unit = '',
  formatValue,
  height = 300,
}: TrendChartProps) {
  const [chartData, setChartData] = useState<Array<{ date: string; displayDate: string; value: number }>>([]);

  useEffect(() => {
    const formatted = data.map((d) => ({
      date: d.date,
      displayDate: formatShortDate(d.date),
      value: d.value,
    }));
    setChartData(formatted);
  }, [data]);

  const formatTooltipValue = (value: number | undefined) => {
    if (value === undefined) return '-';
    if (formatValue) {
      return formatValue(value);
    }
    return `${value.toLocaleString()}${unit}`;
  };

  return (
    <Card title={title} subtitle={subtitle}>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>No trend data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayDate"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#9ca3af"
              tickFormatter={(value) => `${value.toLocaleString()}${unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number | undefined) => [formatTooltipValue(value), dataKey]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="value"
              name={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

/**
 * Multi-line trend chart for comparing multiple data series
 */
export interface MultiTrendDataPoint {
  date: string;
  [key: string]: string | number;
}

interface MultiTrendChartProps {
  title: string;
  subtitle?: string;
  data: MultiTrendDataPoint[];
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
    unit?: string;
  }>;
  height?: number;
}

export function MultiTrendChart({
  title,
  subtitle,
  data,
  lines,
  height = 300,
}: MultiTrendChartProps) {
  const [chartData, setChartData] = useState<Array<{ date: string; displayDate: string; [key: string]: string | number }>>([]);

  useEffect(() => {
    const formatted = data.map((d) => ({
      ...d,
      displayDate: formatShortDate(d.date),
    }));
    setChartData(formatted);
  }, [data]);

  return (
    <Card title={title} subtitle={subtitle}>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>No trend data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayDate"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#9ca3af"
              tickFormatter={(value) => `${value.toLocaleString()}  Mn`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: number | undefined, name: string | undefined) => [
                value === undefined ? '-' : `${value.toLocaleString()} Mn`,
                name || '-',
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type="monotone"
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.color}
                strokeWidth={2}
                dot={{ fill: line.color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

/**
 * Professional Investor Flow Trend Chart with Buy/Sell Volume
 */
export interface InvestorFlowDataPoint {
  date: string;
  FOREIGN: { buy: number; sell: number; net: number };
  LOCAL_INST: { buy: number; sell: number; net: number };
  PROPRIETARY: { buy: number; sell: number; net: number };
  LOCAL_INDIVIDUAL: { buy: number; sell: number; net: number };
}

interface InvestorFlowTrendChartProps {
  title: string;
  subtitle?: string;
  data: InvestorFlowDataPoint[];
  primaryInvestor?: 'FOREIGN' | 'LOCAL_INST' | 'PROPRIETARY' | 'LOCAL_INDIVIDUAL';
  height?: number;
}

export function InvestorFlowTrendChart({
  title,
  subtitle,
  data,
  primaryInvestor = 'FOREIGN',
  height = 400,
}: InvestorFlowTrendChartProps) {
  const [chartData, setChartData] = useState<Array<{
    date: string;
    displayDate: string;
    buy: number;
    sell: number;
    net: number;
  }>>([]);

  const [trendSummary, setTrendSummary] = useState<{
    direction: 'bullish' | 'bearish' | 'neutral';
    avgNetFlow: number;
    totalBuyVolume: number;
    totalSellVolume: number;
    buyDays: number;
    sellDays: number;
  }>({ direction: 'neutral', avgNetFlow: 0, totalBuyVolume: 0, totalSellVolume: 0, buyDays: 0, sellDays: 0 });

  useEffect(() => {
    if (data.length === 0) return;

    const processed = data.map((d) => {
      const investorData = d[primaryInvestor];
      return {
        date: d.date,
        displayDate: formatShortDate(d.date),
        buy: investorData.buy / 1e6, // Convert to Mn
        sell: investorData.sell / 1e6,
        net: investorData.net / 1e6,
      };
    });

    setChartData(processed);

    // Calculate trend summary
    const netFlows = processed.map((d) => d.net);
    const totalBuy = processed.reduce((sum, d) => sum + d.buy, 0);
    const totalSell = processed.reduce((sum, d) => sum + d.sell, 0);
    const buyDays = processed.filter((d) => d.net > 0).length;
    const sellDays = processed.filter((d) => d.net < 0).length;

    setTrendSummary({
      direction: getTrendDirection(netFlows),
      avgNetFlow: netFlows.reduce((a, b) => a + b, 0) / netFlows.length,
      totalBuyVolume: totalBuy,
      totalSellVolume: totalSell,
      buyDays,
      sellDays,
    });
  }, [data, primaryInvestor]);

  const formatValue = (value: number | undefined) => {
    if (value === undefined) return '-';
    return `${value.toFixed(2)} Mn`;
  };

  const investorNames = {
    FOREIGN: 'Foreign Investors',
    LOCAL_INST: 'Local Institutes',
    PROPRIETARY: 'Proprietary Trading',
    LOCAL_INDIVIDUAL: 'Local Individuals',
  };

  return (
    <Card title={title} subtitle={subtitle}>
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <p>No trend data available</p>
        </div>
      ) : (
        <>
          {/* Trend Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Trend</p>
              <p className={`text-sm font-bold ${
                trendSummary.direction === 'bullish' ? 'text-green-600' :
                trendSummary.direction === 'bearish' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {trendSummary.direction === 'bullish' ? '📈 Bullish' :
                 trendSummary.direction === 'bearish' ? '📉 Bearish' :
                 '➡️ Neutral'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Avg Net Flow</p>
              <p className={`text-sm font-bold ${
                trendSummary.avgNetFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendSummary.avgNetFlow >= 0 ? '+' : ''}{trendSummary.avgNetFlow.toFixed(2)} Mn
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Buy/Sell Days</p>
              <p className="text-sm font-bold text-gray-900">
                🟢 {trendSummary.buyDays} / 🔴 {trendSummary.sellDays}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Total Volume</p>
              <p className="text-sm font-bold text-gray-900">
                {((trendSummary.totalBuyVolume + trendSummary.totalSellVolume) / 1000).toFixed(1)} Bn
              </p>
            </div>
          </div>

          {/* Composed Chart with Bars and Line */}
          <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="displayDate"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                stroke="#9ca3af"
              />
              <YAxis
                yAxisId="volume"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                stroke="#9ca3af"
                tickFormatter={(value) => `${value.toFixed(0)} Mn`}
              />
              <YAxis
                yAxisId="net"
                orientation="right"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                stroke="#9ca3af"
                tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(0)} Mn`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: number | undefined, name: string | undefined) => {
                  if (name === 'Buy Volume') return [formatValue(value), 'Buy'];
                  if (name === 'Sell Volume') return [formatValue(value), 'Sell'];
                  if (name === 'Net Flow') return [formatValue(value), 'Net'];
                  return [value, name || '-'];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="circle"
              />

              {/* Buy Volume Bar - Green */}
              <Bar
                yAxisId="volume"
                dataKey="buy"
                name="Buy Volume"
                fill="#10b981"
                radius={[0, 0, 0, 0]}
                opacity={0.7}
              />

              {/* Sell Volume Bar - Red */}
              <Bar
                yAxisId="volume"
                dataKey="sell"
                name="Sell Volume"
                fill="#ef4444"
                radius={[0, 0, 0, 0]}
                opacity={0.7}
              />

              {/* Net Flow Line */}
              <Line
                yAxisId="net"
                type="monotone"
                dataKey="net"
                name="Net Flow"
                stroke="#1e3a5f"
                strokeWidth={3}
                dot={{ fill: '#1e3a5f', r: 3 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* Key Insights */}
          <div className="mt-6 p-4 bg-[#1e3a5f] rounded-lg">
            <p className="text-xs text-white/70 mb-2">Key Insights - {investorNames[primaryInvestor]}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-white">
              <div>
                <p className="text-xs text-white/60">Net Position</p>
                <p className={`text-lg font-bold ${
                  trendSummary.avgNetFlow >= 0 ? 'text-green-300' : 'text-red-300'
                }`}>
                  {trendSummary.avgNetFlow >= 0 ? 'Net Buyer' : 'Net Seller'}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60">Buy Ratio</p>
                <p className="text-lg font-bold text-white">
                  {((trendSummary.totalBuyVolume / (trendSummary.totalBuyVolume + trendSummary.totalSellVolume)) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-white/60">Signal</p>
                <p className="text-lg font-bold text-white">
                  {trendSummary.buyDays > trendSummary.sellDays * 1.5 ? 'Strong Buy' :
                   trendSummary.buyDays > trendSummary.sellDays ? 'Accumulation' :
                   trendSummary.sellDays > trendSummary.buyDays * 1.5 ? 'Strong Sell' :
                   'Distribution'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
