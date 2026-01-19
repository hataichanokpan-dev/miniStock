'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StocksPage() {
  const router = useRouter();
  const [symbol, setSymbol] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbol.trim()) {
      setIsSearching(true);
      router.push('/stocks/' + symbol.trim().toUpperCase());
    }
  };

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='card max-w-2xl mx-auto mt-12'>
        <div className='p-8 text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Stock Analysis</h1>
          <p className='text-gray-600 mb-8'>
            Enter a stock symbol to view detailed financial analysis, metrics, and explanations.
          </p>

          <form onSubmit={handleSubmit} className='flex gap-3 max-w-md mx-auto'>
            <input
              type='text'
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder='e.g., AAPL, GOOGL, MSFT'
              className='flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-700 focus:border-transparent'
              disabled={isSearching}
            />
            <button
              type='submit'
              disabled={!symbol.trim() || isSearching}
              className='btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSearching ? 'Loading...' : 'Analyze'}
            </button>
          </form>

          <div className='mt-8 text-sm text-gray-500'>
            <p className='mb-2 font-medium text-gray-700'>Popular examples:</p>
            <div className='flex flex-wrap justify-center gap-2'>
              {['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSymbol(s);
                    router.push('/stocks/' + s);
                  }}
                  className='px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors'
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
