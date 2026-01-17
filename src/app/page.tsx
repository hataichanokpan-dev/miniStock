import MarketIndexCard from '@/components/ui/MarketIndexCard';
import StockCard from '@/components/ui/StockCard';
import Card from '@/components/ui/Card';

// Placeholder data - will be replaced with real API calls
const marketIndices = [
  { name: 'SET Index', value: 1342.58, change: 12.45, changePercent: 0.94, market: '🇹🇭 Thailand' },
  { name: 'MAI Index', value: 458.23, change: -3.12, changePercent: -0.68, market: '🇹🇭 Thailand' },
  { name: 'S&P 500', value: 4783.45, change: 23.67, changePercent: 0.50, market: '🇺🇸 US' },
  { name: 'Hang Seng', value: 16547.82, change: -87.34, changePercent: -0.52, market: '🇭🇰 Hong Kong' },
];

const topGainers = [
  { symbol: 'CPF', name: 'Charoen Pokphand Foods', price: 28.50, change: 1.25, changePercent: 4.59, volume: 12500000 },
  { symbol: 'ADVANC', name: 'Advanced Info Service', price: 245.00, change: 8.50, changePercent: 3.59, volume: 8200000 },
  { symbol: 'KBANK', name: 'Kasikornbank', price: 168.00, change: 5.00, changePercent: 3.07, volume: 15300000 },
];

const topLosers = [
  { symbol: 'PTT', name: 'PTT Public Company', price: 358.00, change: -12.00, changePercent: -3.24, volume: 18900000 },
  { symbol: 'SCC', name: 'Siam Cement Group', price: 412.00, change: -11.50, changePercent: -2.72, volume: 6500000 },
  { symbol: 'AOT', name: 'Airports of Thailand', price: 72.50, change: -1.75, changePercent: -2.36, volume: 9100000 },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Market overview and top performers</p>
      </div>

      {/* Market Indices */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Indices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketIndices.map((index) => (
            <MarketIndexCard key={index.name} {...index} />
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
              <p className="text-2xl font-bold text-gray-900">฿89.2B</p>
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
