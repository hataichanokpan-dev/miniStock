'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import SidebarSearch from './SidebarSearch';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/market', label: 'Market', icon: '📈' },
  { href: '/stocks', label: 'Stocks', icon: '📋' },
  { href: '/watchlist', label: 'Watchlist', icon: '⭐' },
  { href: '/portfolio', label: 'Portfolio', icon: '💼' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close sidebar on route change or when clicking outside
  useEffect(() => {
    if (isOpen) {
      const handleResize = () => {
        if (window.innerWidth >= 1024) {
          onClose?.();
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isOpen, onClose]);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen
          w-64 bg-gray-50 border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Mobile close button */}
          <div className="flex justify-end p-4 lg:hidden">
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 pt-0 lg:pt-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Menu
            </h2>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-navy-700 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Stock Search */}
          <SidebarSearch />

          {/* Market Selector */}
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Markets
            </h2>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-md transition-colors">
                🇹🇭 Thailand (SET/MAI)
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors">
                🇺🇸 United States
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors">
                🇭🇰 Hong Kong
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-md transition-colors">
                🇨🇳 China
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
