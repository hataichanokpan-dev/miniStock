'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Stock detail error:', error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <h2 className="text-xl font-semibold text-red-900 mb-2">
          Unable to Load Stock Data
        </h2>
        <p className="text-red-700 mb-6">
          We encountered an error loading the stock information. Please try again or search for a different stock.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/stocks"
            className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            Back to Stocks
          </Link>
        </div>
      </div>
    </div>
  );
}
