'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SectorPerformanceChartProps {
  data: Array<{
    sector: string;
    change: number;
    volume: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const value = data.value;
    const vol = data.payload.volume;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
        <p className={'text-sm font-semibold ' + (value >= 0 ? 'text-green-600' : 'text-red-600')}>
          {(value >= 0 ? '+' : '') + value.toFixed(2) + '%'}
        </p>
        <p className="text-xs text-gray-500">Vol: {(vol / 1000000).toFixed(1)}M</p>
      </div>
    );
  }
  return null;
};

export default function SectorPerformanceChart({ data }: SectorPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="sector"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          tick={{ fontSize: 11 }}
          stroke="#6b7280"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          stroke="#6b7280"
          domain={[-5, 5]}
          tickFormatter={(value) => value + '%'}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="change" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={'cell-' + index}
              fill={entry.change >= 0 ? '#10b981' : '#ef4444'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
