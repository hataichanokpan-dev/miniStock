/**
 * Number Format Utilities for Investors
 * Professional formatting following Thai market conventions
 */

/**
 * Format currency in Thai Baht
 * Examples: ฿1,234.56, ฿1.2M, ฿1.5B
 */
export function formatCurrency(amount: number, options: { showSymbol?: boolean; decimals?: number } = {}): string {
  const { showSymbol = true, decimals = 2 } = options;

  if (Math.abs(amount) >= 1e9) {
    const value = amount / 1e9;
    return `${showSymbol ? '฿' : ''}${value.toFixed(decimals)}B`;
  }
  if (Math.abs(amount) >= 1e6) {
    const value = amount / 1e6;
    return `${showSymbol ? '฿' : ''}${value.toFixed(decimals)}M`;
  }
  if (Math.abs(amount) >= 1e3) {
    const value = amount / 1e3;
    return `${showSymbol ? '฿' : ''}${value.toFixed(decimals)}K`;
  }

  return `${showSymbol ? '฿' : ''}${amount.toFixed(decimals)}`;
}

/**
 * Format large numbers (without currency symbol)
 * Examples: 1,234, 1.2M, 1.5B
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (Math.abs(num) >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (Math.abs(num) >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (Math.abs(num) >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

/**
 * Format percentage with sign
 * Examples: +5.23%, -2.15%, 0.00%
 */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value > 0 ? '+' : '';
  return sign + value.toFixed(decimals) + '%';
}

/**
 * Format percentage without sign (for labels)
 * Examples: 5.23%, 2.15%
 */
export function formatPercentAbs(value: number, decimals: number = 2): string {
  return Math.abs(value).toFixed(decimals) + '%';
}

/**
 * Format index points (for stock indices)
 * Examples: 1,342.58, 458.23
 */
export function formatIndex(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format volume in shares/lots
 * Examples: 1.2M shares, 500K shares
 */
export function formatVolume(volume: number, decimals: number = 1): string {
  if (Math.abs(volume) >= 1e9) {
    return (volume / 1e9).toFixed(decimals) + 'B';
  }
  if (Math.abs(volume) >= 1e6) {
    return (volume / 1e6).toFixed(decimals) + 'M';
  }
  if (Math.abs(volume) >= 1e3) {
    return (volume / 1e3).toFixed(decimals) + 'K';
  }
  return volume.toString();
}

/**
 * Format Thai Baht with full notation
 * Examples: ฿1,234.56M, ฿15,234.67M
 */
export function formatBahtFull(amount: number): string {
  if (Math.abs(amount) >= 1e9) {
    return '฿' + (amount / 1e9).toFixed(2) + 'B';
  }
  if (Math.abs(amount) >= 1e6) {
    return '฿' + (amount / 1e6).toFixed(2) + 'M';
  }
  if (Math.abs(amount) >= 1e3) {
    return '฿' + (amount / 1e3).toFixed(2) + 'K';
  }
  return '฿' + amount.toFixed(2);
}

/**
 * Format P/E ratio
 * Examples: 15.2x, -, N/A
 */
export function formatPERatio(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  if (value < 0) {
    return '-';
  }
  return value.toFixed(1) + 'x';
}

/**
 * Format yield (dividend yield, interest rate)
 * Examples: 3.5%, 5.2%
 */
export function formatYield(value: number, decimals: number = 2): string {
  return value.toFixed(decimals) + '%';
}

/**
 * Format market cap
 * Examples: ฿15.2B, ฿250.5M
 */
export function formatMarketCap(value: number): string {
  if (Math.abs(value) >= 1e12) {
    return '฿' + (value / 1e12).toFixed(1) + 'T';
  }
  if (Math.abs(value) >= 1e9) {
    return '฿' + (value / 1e9).toFixed(1) + 'B';
  }
  if (Math.abs(value) >= 1e6) {
    return '฿' + (value / 1e6).toFixed(1) + 'M';
  }
  return '฿' + value.toFixed(0);
}

/**
 * Format trading value in millions (standard Thai convention)
 * Examples: ฿5,234.67M
 */
export function formatTradingValueMn(value: number): string {
  const inMillions = value / 1e6;
  return '฿' + inMillions.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + 'M';
}

/**
 * Format trading volume in lots (1 lot = 100 shares)
 * Examples: 15,234 lots, 1.5M lots
 */
export function formatLots(shares: number): string {
  const lots = shares / 100;
  return formatVolume(lots) + ' lots';
}

/**
 * Get color class for percentage change
 * Returns: text-green-600, text-red-600, or text-gray-600
 */
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Get background color class for percentage change
 * Returns: bg-green-50, bg-red-50, or bg-gray-50
 */
export function getChangeBgColor(value: number): string {
  if (value > 0) return 'bg-green-50';
  if (value < 0) return 'bg-red-50';
  return 'bg-gray-50';
}

/**
 * Get color class for value (good/bad indicator)
 * For metrics like ROE, profit margin, etc.
 */
export function getValueColor(
  value: number,
  thresholds: { good: number; warning?: number }
): string {
  if (value >= thresholds.good) return 'text-green-600';
  if (thresholds.warning && value < thresholds.warning) return 'text-red-600';
  return 'text-yellow-600';
}

/**
 * Format number with thousand separators
 * Examples: 1,234,567
 */
export function formatWithCommas(value: number): string {
  return value.toLocaleString('en-US');
}

/**
 * Abbreviate sector name for display
 * Examples: "Energy & Utilities" → "ENERGY"
 */
export function abbreviateSector(name: string): string {
  const words = name.split(' ');
  if (words.length >= 2) {
    return words.slice(0, 2).join(' ').toUpperCase();
  }
  return name.toUpperCase();
}
