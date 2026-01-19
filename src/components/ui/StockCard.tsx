interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export default function StockCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  volume,
}: StockCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-900">{symbol}</h4>
          <p className="text-sm text-gray-500 mt-0.5">{name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">
            ฿{price.toFixed(2)}
          </p>
          <p
            className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {isPositive ? "+" : ""}
            {change} ({isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%)
          </p>
        </div>
      </div>
      {volume && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Vol: {volume.toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
