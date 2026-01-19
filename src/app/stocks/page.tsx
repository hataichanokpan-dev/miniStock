'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Market configuration with symbol suffixes
const MARKETS = [
  { code: 'US', name: 'United States', suffix: '', flag: '🇺🇸', placeholder: 'AAPL, GOOGL, MSFT' },
  { code: 'TH', name: 'Thailand', suffix: '.BK', flag: '🇹🇭', placeholder: 'PTT, KBANK, CPF' },
  { code: 'HK', name: 'Hong Kong', suffix: '.HK', flag: '🇭🇰', placeholder: '0700, 9988, 0941' },
  { code: 'JP', name: 'Japan', suffix: '.T', flag: '🇯🇵', placeholder: '7203, 6758, 4755' },
  { code: 'CN', name: 'China', suffix: '.SS', flag: '🇨🇳', placeholder: '600519, 601318, 600036' },
];

// Popular symbols by market
const POPULAR_SYMBOLS: Record<string, string[]> = {
  US: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'BRK.B'],
  TH: ['PTT', 'KBANK', 'CPF', 'ADVANC', 'AOT', 'BDMS', 'SCC', 'TRUE'],
  HK: ['0700', '9988', '0941', '1299', '0968', '0883', '0005', '0017'],
  JP: ['7203', '6758', '4755', '6702', '8604', '6954', '6954', '4519'],
  CN: ['600519', '601318', '600036', '000858', '601012', '600276', '601888', '000002'],
};

type MarketCode = keyof typeof POPULAR_SYMBOLS;

interface Market {
  code: string;
  name: string;
  suffix: string;
  flag: string;
  placeholder: string;
}

export default function StocksPage() {
  const router = useRouter();
  const [selectedMarket, setSelectedMarket] = useState<Market>(MARKETS[0]);
  const [symbolInput, setSymbolInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Format symbol based on selected market
  const formatSymbol = (input: string): string => {
    const cleaned = input.trim().toUpperCase();
    if (!cleaned) return '';

    // If already has suffix, return as is
    if (cleaned.endsWith('.BK') || cleaned.endsWith('.HK') ||
        cleaned.endsWith('.T') || cleaned.endsWith('.SS')) {
      return cleaned;
    }

    // Add market suffix
    return cleaned + selectedMarket.suffix;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = formatSymbol(symbolInput);
    if (formatted) {
      setIsSearching(true);
      router.push(`/stocks/${formatted}`);
    }
  };

  const handleQuickSearch = (symbol: string) => {
    const formatted = symbol + selectedMarket.suffix;
    setIsSearching(true);
    router.push(`/stocks/${formatted}`);
  };

  const currentPopular = POPULAR_SYMBOLS[selectedMarket.code as MarketCode] || POPULAR_SYMBOLS.US;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#1e3a5f] text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Stock Analysis</h1>
          <p className="text-base sm:text-lg text-white/80">
            Professional-grade analysis powered by CAN SLIM and SPEA frameworks
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {/* Market Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Market
            </label>
            <div className="flex flex-wrap gap-2">
              {MARKETS.map((market) => (
                <button
                  key={market.code}
                  onClick={() => setSelectedMarket(market)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMarket.code === market.code
                      ? 'bg-[#1e3a5f] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{market.flag}</span>
                  {market.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Symbol
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={symbolInput}
                    onChange={(e) => setSymbolInput(e.target.value)}
                    placeholder={selectedMarket.placeholder}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent text-sm"
                    disabled={isSearching}
                    autoFocus
                  />
                  {/* Symbol Preview */}
                  {symbolInput && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      → {formatSymbol(symbolInput)}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!symbolInput.trim() || isSearching}
                  className="px-6 py-3 bg-[#1e3a5f] text-white font-medium rounded-lg hover:bg-[#2a4a6f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
                >
                  {isSearching ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12a8 8 0 11-16 0 8 8 0 0116 0z"></path>
                      </svg>
                      Searching...
                    </span>
                  ) : (
                    'Analyze'
                  )}
                </button>
              </div>
            </div>

            {/* Search Tip */}
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <span className="text-lg">💡</span>
              <p>
                Symbol will be auto-formatted: <span className="font-mono font-semibold">
                  PTT → PTT{selectedMarket.suffix}
                </span>
                {selectedMarket.suffix && ` for ${selectedMarket.name}`}
              </p>
            </div>
          </form>

          {/* Popular Symbols */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Popular {selectedMarket.name} Stocks
            </p>
            <div className="flex flex-wrap gap-2">
              {currentPopular.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleQuickSearch(symbol)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-[#1e3a5f] hover:text-white text-gray-700 text-sm font-medium rounded-lg transition-all duration-200"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Analysis Features */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">CAN SLIM Analysis</h3>
            <p className="text-xs text-gray-600">
              Growth stock evaluation with 7-factor scoring system
            </p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">SPEA Framework</h3>
            <p className="text-xs text-gray-600">
              4-quadrant analysis: Strategy, Finance, Earnings, Valuation
            </p>
          </div>

          <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Value Metrics</h3>
            <p className="text-xs text-gray-600">
              Graham Number, Piotroski F-Score, Margin of Safety
            </p>
          </div>
        </div>

        {/* Market Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start gap-3">
            <span className="text-xl">🌍</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Multi-Market Support
              </p>
              <p className="text-xs text-blue-800">
                <strong>US Stocks:</strong> Full analysis with Yahoo Finance data<br />
                <strong>Thai Stocks:</strong> Use Thai format (PTT, KBANK) - auto-converts to PTT.BK<br />
                <strong>Other Markets:</strong> Hong Kong, Japan, China supported
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
