interface MarketIndexCardProps {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  market: string;
}

export default function MarketIndexCard({ name, value, change, changePercent, market }: MarketIndexCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{market}</span>
        {isPositive ? (
          <span className="badge-success badge">▲</span>
        ) : (
          <span className="badge-danger badge">▼</span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className={`text-sm font-medium mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
      </p>
    </div>
  );
}
