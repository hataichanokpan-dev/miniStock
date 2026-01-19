/**
 * Price Chart Component with Moving Averages
 * Displays price chart with MA50 and MA200
 */

'use client';

import { useMemo } from 'react';
import Card from '@/components/ui/Card';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface PriceDataPoint {
  date: string;
  close: number;
}

interface PriceChartProps {
  historicalData: PriceDataPoint[];
  symbol: string;
}

// Calculate Simple Moving Average
function calculateSMA(data: PriceDataPoint[], period: number): Array<{ date: string; ma: number }> {
  const sma: Array<{ date: string; ma: number }> = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    sma.push({
      date: data[i].date,
      ma: sum / period,
    });
  }

  return sma;
}

export default function PriceChart({ historicalData, symbol }: PriceChartProps) {
  // Calculate moving averages
  const ma50Data = useMemo(() => calculateSMA(historicalData, 50), [historicalData]);
  const ma200Data = useMemo(() => calculateSMA(historicalData, 200), [historicalData]);

  // Combine data for chart (need to align dates)
  const chartData = useMemo(() => {
    // Start from where MA200 data begins
    const startIndex = 200 - 1;

    return historicalData.slice(startIndex).map((point) => {
      const ma50 = ma50Data.find(m => m.date === point.date);
      const ma200 = ma200Data.find(m => m.date === point.date);

      return {
        date: point.date,
        price: point.close,
        ma50: ma50?.ma || null,
        ma200: ma200?.ma || null,
      };
    });
  }, [historicalData, ma50Data, ma200Data]);

  const hasValidChartData = chartData.length >= 2;

  // Determine trend based on price vs moving averages
  const getTrend = () => {
    if (chartData.length === 0) return null;
    const latest = chartData[chartData.length - 1];

    if (!latest.ma50 || !latest.ma200) return null;

    if (latest.price > latest.ma50 && latest.ma50 > latest.ma200) {
      return { status: 'bullish', text: 'Uptrend (Price > MA50 > MA200)', color: 'text-green-600' };
    } else if (latest.price < latest.ma50 && latest.ma50 < latest.ma200) {
      return { status: 'bearish', text: 'Downtrend (Price < MA50 < MA200)', color: 'text-red-600' };
    } else {
      return { status: 'neutral', text: 'Consolidating', color: 'text-yellow-600' };
    }
  };

  const trend = getTrend();

  return (
    <Card
      title="Price Chart with Moving Averages"
      subtitle={hasValidChartData ? `Showing MA50 and MA200` : 'Insufficient data for moving averages'}
    >
      {hasValidChartData ? (
        <div>
          {/* Trend Indicator */}
          {trend && (
            <div className={`mb-4 p-3 rounded-lg border ${
              trend.status === 'bullish' ? 'bg-green-50 border-green-200' :
              trend.status === 'bearish' ? 'bg-red-50 border-red-200' :
              'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {trend.status === 'bullish' ? '📈' : trend.status === 'bearish' ? '📉' : '➡️'}
                </span>
                <div>
                  <p className="text-xs text-gray-600">Trend Status</p>
                  <p className={`text-sm font-bold ${trend.color}`}>{trend.text}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => v.toFixed(2)}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(30, 58, 95, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                  }}
                  labelFormatter={(v) => new Date(v).toLocaleDateString()}
                  formatter={(value: any, name?: string) => {
                    if (name === 'price') return [`$${value.toFixed(2)}`, 'Price'];
                    if (name === 'ma50') return [`$${value.toFixed(2)}`, 'MA50'];
                    if (name === 'ma200') return [`$${value.toFixed(2)}`, 'MA200'];
                    return [value, name || ''];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="line"
                />
                {/* Price Line */}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#1e3a5f"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                  name="Price"
                />
                {/* MA50 Line */}
                <Line
                  type="monotone"
                  dataKey="ma50"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA50"
                  strokeDasharray="5 5"
                />
                {/* MA200 Line */}
                <Line
                  type="monotone"
                  dataKey="ma200"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA200"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Moving Average Explanation */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Moving Averages:</strong>{' '}
              MA50 (50-day) shows short-term trend. MA200 (200-day) shows long-term trend.
              When price crosses above MA50 = Bullish signal. Below MA200 = Bearish signal.
            </p>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <span className="text-3xl mb-2">📈</span>
            <p className="text-sm text-gray-500">Insufficient data for moving averages</p>
            <p className="text-xs text-gray-400 mt-1">Need at least 200 trading days of historical data</p>
          </div>
        </div>
      )}
    </Card>
  );
}
