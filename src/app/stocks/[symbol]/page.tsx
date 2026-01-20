"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Quote } from "@/types/market";
import type { FinancialMetrics } from "@/types/financials";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import PriceChart from "@/components/stock/PriceChart";
import ValuationCard from "@/components/stock/ValuationCard";
import PeerComparison from "@/components/stock/PeerComparison";
import StandardBenchmarks from "@/components/stock/StandardBenchmarks";
import {
  formatPercent,
  formatTradingValueMn,
  getChangeColor,
} from "@/lib/format";

const DATA_FRESHNESS_THRESHOLD = {
  FRESH: 5 * 60 * 1000,
  DELAYED: 60 * 60 * 1000,
};

type DataStatus = "fresh" | "delayed" | "stale";

interface ApiError {
  error: string;
  details?: string;
  provider?: string;
  status?: number;
}

function getDataStatus(timestamp: number): DataStatus {
  const age = Date.now() - timestamp;
  if (age <= DATA_FRESHNESS_THRESHOLD.FRESH) return "fresh";
  if (age <= DATA_FRESHNESS_THRESHOLD.DELAYED) return "delayed";
  return "stale";
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const METRIC_EXPLANATIONS = {
  revenueGrowth: {
    title: "Revenue Growth",
    explanation:
      "Higher revenue growth indicates increasing sales. Compare to industry norms.",
  },
  epsGrowth: {
    title: "EPS Growth",
    explanation:
      "Earnings per share growth shows profitability improvement. Look for consistency.",
  },
  roe: {
    title: "Return on Equity",
    explanation:
      "Higher ROE can indicate efficient capital use. Check leverage levels.",
  },
  profitMargin: {
    title: "Profit Margin",
    explanation:
      "Shows profit per dollar of revenue. Higher margins suggest competitive advantages.",
  },
  deRatio: {
    title: "Debt-to-Equity",
    explanation:
      "Higher leverage amplifies returns and risks. Compare to industry averages.",
  },
  peRatio: {
    title: "P/E Ratio",
    explanation: "Price relative to earnings. Lower P/E may indicate value.",
  },
  pbRatio: {
    title: "P/B Ratio",
    explanation:
      "Price relative to book value. P/B under 1 may indicate undervaluation.",
  },
  dividendYield: {
    title: "Dividend Yield",
    explanation:
      "Annual dividends as percentage of stock price. Verify sustainability.",
  },
};

interface MetricCardProps {
  title: string;
  value: string | null;
  explanation: string;
  status?: "success" | "warning" | "danger" | "neutral";
}

function MetricCard({
  title,
  value,
  explanation,
  status = "neutral",
}: MetricCardProps) {
  const statusColors = {
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <div className="p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-xs font-medium text-gray-700">{title}</h4>
        {status !== "neutral" && (
          <StatusBadge status={status}>
            {status === "success"
              ? "Good"
              : status === "warning"
                ? "Check"
                : "Caution"}
          </StatusBadge>
        )}
      </div>
      <p className={`text-lg font-bold ${statusColors[status]} mb-1`}>
        {value ?? "—"}
      </p>
      <p className="text-xs text-gray-500 leading-snug">{explanation}</p>
    </div>
  );
}

function getActionableErrorMessage(error: ApiError): string {
  if (error.details?.includes("Missing NEXT_PUBLIC_STOCK_API_KEY")) {
    return "API configuration error: Stock data provider requires an API key.";
  }
  if (error.details?.includes("API key not configured")) {
    return "API key not configured. Please set environment variables.";
  }
  if (error.provider) {
    return `Stock API error using ${error.provider.toUpperCase()} provider.`;
  }
  if (error.status === 404) {
    return `Stock symbol not found or data unavailable.`;
  }
  if (error.status === 500) {
    return `Server error: Unable to fetch stock data. Please try again later.`;
  }
  return error.details || error.error || "Failed to load stock data";
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string)?.toUpperCase();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<
    Array<{
      date: string;
      close: number;
      high: number;
      low: number;
      volume: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (!symbol) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [quoteRes, fundamentalsRes, historicalRes] = await Promise.all([
          fetch("/api/stock/" + symbol + "/quote"),
          fetch("/api/stock/" + symbol + "/fundamentals"),
          fetch("/api/stock/" + symbol + "/historical?period=2y"),
        ]);

        const [quoteData, fundamentalsData, historicalData] = await Promise.all(
          [quoteRes.json(), fundamentalsRes.json(), historicalRes.json()],
        );

        if (!quoteRes.ok) {
          throw new Error(
            JSON.stringify({ ...quoteData, status: quoteRes.status }),
          );
        }
        if (!fundamentalsRes.ok) {
          throw new Error(
            JSON.stringify({
              ...fundamentalsData,
              status: fundamentalsRes.status,
            }),
          );
        }
        if (!historicalRes.ok) {
          throw new Error(
            JSON.stringify({ ...historicalData, status: historicalRes.status }),
          );
        }

        if (quoteData.error) throw new Error(JSON.stringify(quoteData));
        if (fundamentalsData.error)
          throw new Error(JSON.stringify(fundamentalsData));
        if (historicalData.error)
          throw new Error(JSON.stringify(historicalData));

        setQuote(quoteData);
        setMetrics(fundamentalsData.metrics);
        setProfile(fundamentalsData.profile);

        // Only set historical data if we have valid data points
        const historical = historicalData.data || [];
        const validHistorical = historical.filter(
          (h: any) => h.date && h.close != null,
        );
        setHistoricalData(
          validHistorical.map((h: any) => ({
            date: h.date,
            close: h.close,
            high: h.high || h.close,
            low: h.low || h.close,
            volume: h.volume || 0,
          })),
        );
      } catch (err) {
        if (err instanceof Error) {
          try {
            setError(JSON.parse(err.message));
          } catch {
            setError({ error: err.message });
          }
        } else {
          setError({ error: "Failed to load stock data" });
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol]);

  // Calculate 52-week high/low from historical data (must be before early returns)
  const week52Data = useMemo(() => {
    if (historicalData.length === 0 || !quote) return null;

    // Get last 252 trading days (approximately 1 year)
    const tradingDaysInYear = 252;
    const last52Weeks = historicalData.slice(-tradingDaysInYear);

    if (last52Weeks.length === 0) return null;

    const week52High = Math.max(...last52Weeks.map((d) => d.high));
    const week52Low = Math.min(...last52Weeks.map((d) => d.low));
    const currentPrice = quote.price;

    // Calculate distance percentages
    const pctFromHigh =
      currentPrice < week52High
        ? ((week52High - currentPrice) / week52High) * 100
        : 0;
    const pctFromLow =
      currentPrice > week52Low
        ? ((currentPrice - week52Low) / week52Low) * 100
        : 0;

    return {
      high: week52High,
      low: week52Low,
      pctFromHigh,
      pctFromLow,
    };
  }, [historicalData, quote]);

  // Calculate volume ratio (current / average) (must be before early returns)
  const volumeRatio = useMemo(() => {
    if (!quote || quote.avgVolume <= 0) return 0;
    return quote.volume / quote.avgVolume;
  }, [quote]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/stocks")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Back to stocks"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">{symbol || "Loading..."}</h1>
                <p className="text-sm text-white/70">Stock Analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = getActionableErrorMessage(error);
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/stocks")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Back to stocks"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">{symbol}</h1>
                <p className="text-sm text-white/70">Error</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Stock
            </h2>
            <p className="text-gray-600 mb-6">{symbol}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
            <button
              onClick={() => router.push("/stocks")}
              className="px-6 py-2.5 bg-[#1e3a5f] text-white font-medium rounded-lg hover:bg-[#2a4a6f] transition-colors"
            >
              Back to Stock Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#1e3a5f] text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/stocks")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Back to stocks"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">{symbol}</h1>
                <p className="text-sm text-white/70">Not Found</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Stock Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              No data available for symbol:{" "}
              <span className="font-mono font-semibold">{symbol}</span>
            </p>
            <button
              onClick={() => router.push("/stocks")}
              className="px-6 py-2.5 bg-[#1e3a5f] text-white font-medium rounded-lg hover:bg-[#2a4a6f] transition-colors"
            >
              Back to Stock Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dataStatus = getDataStatus(quote.timestamp);
  const statusConfig = {
    fresh: {
      label: "Live",
      status: "success" as const,
      color: "text-green-600",
    },
    delayed: {
      label: "Delayed",
      status: "warning" as const,
      color: "text-yellow-600",
    },
    stale: { label: "Stale", status: "danger" as const, color: "text-red-600" },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <div className="bg-[#1e3a5f] text-white py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/stocks")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Back to stock search"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{symbol}</h1>
                {profile?.name && (
                  <p className="text-sm sm:text-base text-white/80">
                    {profile.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={statusConfig[dataStatus].status}>
                {statusConfig[dataStatus].label}
              </StatusBadge>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-white/10 hover:bg-white/20 rounded border border-white/20 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Quote & Key Stats - Compact */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
              {/* Symbol & Name */}
              <div className="p-4 sm:p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Symbol
                </p>
                <p className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">
                  {symbol}
                </p>
                {profile?.sector && (
                  <p className="text-xs text-gray-500 mt-1">{profile.sector}</p>
                )}
              </div>

              {/* Current Price */}
              <div className="p-4 sm:p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Price
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    ${quote.price.toFixed(2)}
                  </p>
                  <div
                    className={`text-lg font-semibold ${getChangeColor(quote.changePercent)}`}
                  >
                    {quote.change >= 0 ? "+" : ""}
                    {quote.change.toFixed(2)} (
                    {formatPercent(quote.changePercent)})
                  </div>
                </div>
              </div>

              {/* Day Range & 52W Range */}
              <div className="p-4 sm:p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Day Range
                </p>
                <div className="flex items-center gap-3 text-sm mb-2">
                  <div>
                    <span className="text-gray-500">High:</span>
                    <span className="ml-1 font-medium">
                      {quote.high.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-200"></div>
                  <div>
                    <span className="text-gray-500">Low:</span>
                    <span className="ml-1 font-medium">
                      {quote.low.toFixed(2)}
                    </span>
                  </div>
                </div>
                {week52Data && (
                  <>
                    <div className="border-t border-gray-100 my-2"></div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                      52W Range
                    </p>
                    <div className="flex items-center gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">High:</span>
                        <span className="ml-1 font-medium text-red-600">
                          {week52Data.high.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          (-{week52Data.pctFromHigh.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-px h-4 bg-gray-200"></div>
                      <div>
                        <span className="text-gray-500">Low:</span>
                        <span className="ml-1 font-medium text-green-600">
                          {week52Data.low.toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          (+{week52Data.pctFromLow.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Market Cap & Volume */}
              <div className="p-4 sm:p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                  Market Data
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Market Cap:</span>
                    <span className="font-medium ml-2">
                      {formatTradingValueMn(quote.marketCap)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Volume:</span>
                    <span className="font-medium ml-2">
                      {formatTradingValueMn(quote.volume)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Vol/Avg:</span>
                    <span
                      className={`font-medium ml-2 ${volumeRatio > 1.5 ? "text-green-600" : volumeRatio < 0.5 ? "text-red-600" : "text-gray-700"}`}
                    >
                      {volumeRatio > 0 ? volumeRatio.toFixed(2) + "x" : "N/A"}
                      {volumeRatio > 1.5 && (
                        <span className="ml-1 text-xs">🔥</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta info */}
            <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
              <span>Data provided by Yahoo Finance</span>
              <span>{formatTimestamp(quote.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Price Chart with Moving Averages */}
          <div className="lg:col-span-2">
            <PriceChart historicalData={historicalData} symbol={symbol} />
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            {/* Analysis Status */}
            <Card title="Analysis Status" subtitle="Available analysis tools">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Valuation Analysis</span>
                  <span className="text-xs bg-green-100 px-2 py-1 rounded text-green-700">
                    ✓ Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Peer Comparison</span>
                  <span className="text-xs bg-green-100 px-2 py-1 rounded text-green-700">
                    ✓ Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">CAN SLIM</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                    Phase 2
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">SPEA</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                    Phase 2
                  </span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                >
                  📋 Add to Watchlist (Coming Soon)
                </button>
                <button
                  disabled
                  className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                >
                  💼 Add to Portfolio (Coming Soon)
                </button>
                <button
                  disabled
                  className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-left"
                >
                  🔔 Set Price Alert (Coming Soon)
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="mb-6">
          <Card title="Financial Metrics" subtitle="Key fundamental indicators">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title={METRIC_EXPLANATIONS.revenueGrowth.title}
                value={
                  metrics?.revenueGrowth != null
                    ? formatPercent(metrics.revenueGrowth)
                    : null
                }
                explanation={METRIC_EXPLANATIONS.revenueGrowth.explanation}
                status={
                  metrics?.revenueGrowth != null && metrics.revenueGrowth > 0
                    ? "success"
                    : metrics?.revenueGrowth != null &&
                        metrics.revenueGrowth < 0
                      ? "danger"
                      : "neutral"
                }
              />
              <MetricCard
                title={METRIC_EXPLANATIONS.epsGrowth.title}
                value={
                  metrics?.epsGrowth != null
                    ? formatPercent(metrics.epsGrowth)
                    : null
                }
                explanation={METRIC_EXPLANATIONS.epsGrowth.explanation}
                status={
                  metrics?.epsGrowth != null && metrics.epsGrowth > 0
                    ? "success"
                    : metrics?.epsGrowth != null && metrics.epsGrowth < 0
                      ? "danger"
                      : "neutral"
                }
              />
              <MetricCard
                title={METRIC_EXPLANATIONS.roe.title}
                value={metrics?.roe != null ? metrics.roe.toFixed(2) : null}
                explanation={METRIC_EXPLANATIONS.roe.explanation}
                status={
                  metrics?.roe != null && metrics.roe > 15
                    ? "success"
                    : metrics?.roe != null && metrics.roe < 5
                      ? "danger"
                      : "neutral"
                }
              />
              <MetricCard
                title={METRIC_EXPLANATIONS.profitMargin.title}
                value={
                  metrics?.profitMargin != null
                    ? formatPercent(metrics.profitMargin * 100)
                    : null
                }
                explanation={METRIC_EXPLANATIONS.profitMargin.explanation}
                status={
                  metrics?.profitMargin != null && metrics.profitMargin > 0.1
                    ? "success"
                    : metrics?.profitMargin != null && metrics.profitMargin < 0
                      ? "danger"
                      : "neutral"
                }
              />
              <MetricCard
                title={METRIC_EXPLANATIONS.deRatio.title}
                value={
                  metrics?.deRatio != null ? metrics.deRatio.toFixed(2) : null
                }
                explanation={METRIC_EXPLANATIONS.deRatio.explanation}
                status={
                  metrics?.deRatio != null && metrics.deRatio > 2
                    ? "warning"
                    : "neutral"
                }
              />
              <MetricCard
                title={METRIC_EXPLANATIONS.peRatio.title}
                value={
                  metrics?.peRatio != null && metrics.peRatio > 0
                    ? metrics.peRatio.toFixed(2)
                    : null
                }
                explanation={METRIC_EXPLANATIONS.peRatio.explanation}
                status="neutral"
              />
              <MetricCard
                title={METRIC_EXPLANATIONS.pbRatio.title}
                value={
                  metrics?.pbRatio != null && metrics.pbRatio > 0
                    ? metrics.pbRatio.toFixed(2)
                    : null
                }
                explanation={METRIC_EXPLANATIONS.pbRatio.explanation}
                status="neutral"
              />
              <MetricCard
                title={METRIC_EXPLANATIONS.dividendYield.title}
                value={
                  metrics?.dividendYield != null && metrics.dividendYield > 0
                    ? formatPercent(metrics.dividendYield * 100)
                    : null
                }
                explanation={METRIC_EXPLANATIONS.dividendYield.explanation}
                status="neutral"
              />
            </div>
          </Card>
        </div>

        {/* Valuation Analysis */}
        <div className="mb-6">
          <ValuationCard
            symbol={symbol}
            currentPrice={quote.price}
            metrics={metrics}
          />
        </div>

        {/* Standard Benchmarks */}
        <div className="mb-6">
          <Card title="Standard Benchmarks" subtitle="Compare with SET Index and Sector standards">
            <StandardBenchmarks symbol={symbol} metrics={metrics} />
          </Card>
        </div>

        {/* Peer Comparison */}
        <div className="mb-6">
          <PeerComparison
            symbol={symbol}
            sector={profile?.sector}
            currentMetrics={metrics}
          />
        </div>

        {/* Company Profile (if available) */}
        {profile?.description && (
          <Card title="Company Profile" subtitle="Business overview">
            <p className="text-sm text-gray-700 leading-relaxed max-w-4xl">
              {profile.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile?.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-700"
                >
                  Website →
                </a>
              )}
              {profile?.industry && (
                <span className="text-xs px-3 py-1.5 bg-gray-100 rounded-md text-gray-700">
                  {profile.industry}
                </span>
              )}
            </div>
          </Card>
        )}

        {/* Data Source Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                Data Source Information
              </p>
              <p className="text-xs text-blue-800">
                <strong>US Stocks:</strong> Full data coverage via Yahoo Finance
                <br />
                <strong>Thai Stocks (.BK):</strong> Limited fundamental data
                available on Yahoo Finance
                <br />
                <strong>Historical Charts:</strong> Only displayed when
                sufficient data points are available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
