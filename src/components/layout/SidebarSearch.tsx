'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SidebarSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const symbol = searchQuery.trim().toUpperCase();
      router.push(`/stocks/${symbol}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="px-6 pb-6">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stocks (e.g. AAPL)"
          className="w-full px-3 py-2 pl-9 text-sm bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-700 focus:border-transparent"
          aria-label="Search stocks"
        />
        <svg
          className="absolute left-9 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </form>
      <p className="text-xs text-gray-500 mt-2">
        Press Enter to search
      </p>
    </div>
  );
}
