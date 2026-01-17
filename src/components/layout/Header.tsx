import Link from 'next/link';
import MinistockIcon from './MinistockIcon';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <MinistockIcon />
            <span className="text-xl font-semibold text-gray-900">ministock</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="text-gray-900 hover:text-navy-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/market"
              className="text-gray-600 hover:text-navy-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              Market
            </Link>
            <Link
              href="/watchlist"
              className="text-gray-600 hover:text-navy-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              Watchlist
            </Link>
            <Link
              href="/portfolio"
              className="text-gray-600 hover:text-navy-700 px-3 py-2 text-sm font-medium transition-colors"
            >
              Portfolio
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
