"use client";

import { useEffect, useState } from "react";
import MarketIndexCard from "@/components/ui/MarketIndexCard";
import StockCard from "@/components/ui/StockCard";
import Card from "@/components/ui/Card";
import SectorFlowDashboard from "@/components/settrade/SectorFlowDashboard";
import InvestorFlowCard from "@/components/settrade/InvestorFlowCard";
import SETIndexCard from "@/components/settrade/SETIndexCard";

interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
}

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export default function DashboardPage() {
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [topGainers, setTopGainers] = useState<Stock[]>([]);
  const [topLosers, setTopLosers] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SETTRADE data states
  const [sectorData, setSectorData] = useState<{
    sectors: any[];
    date: string;
    capturedAt: string;
  } | null>(null);
  const [investorData, setInvestorData] = useState<{
    investors: any[];
    date: string;
    capturedAt: string;
  } | null>(null);
  const [settradeLoading, setSettradeLoading] = useState(true);
  const [settradeError, setSettradeError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch market indices
        const indicesRes = await fetch("/api/market/indices");
        if (!indicesRes.ok) throw new Error("Failed to fetch market indices");
        const indicesData = await indicesRes.json();

        // Fetch top gainers and losers from scanner
        const gainersRes = await fetch("/api/market/scanner?sort=gainers");
        const losersRes = await fetch("/api/market/scanner?sort=losers");

        const gainersData = gainersRes.ok
          ? await gainersRes.json()
          : { results: [] };
        const losersData = losersRes.ok
          ? await losersRes.json()
          : { results: [] };

        setMarketIndices(indicesData);

        // Use fallback data if scanner returns empty
        if (gainersData.results?.length > 0) {
          setTopGainers(gainersData.results.slice(0, 5));
        } else {
          setTopGainers([
            {
              symbol: "CPF",
              name: "Charoen Pokphand Foods",
              price: 28.5,
              change: 1.25,
              changePercent: 4.59,
              volume: 12500000,
            },
            {
              symbol: "ADVANC",
              name: "Advanced Info Service",
              price: 245.0,
              change: 8.5,
              changePercent: 3.59,
              volume: 8200000,
            },
            {
              symbol: "KBANK",
              name: "Kasikornbank",
              price: 168.0,
              change: 5.0,
              changePercent: 3.07,
              volume: 15300000,
            },
            {
              symbol: "AOT",
              name: "Airports of Thailand",
              price: 72.5,
              change: 1.75,
              changePercent: 2.48,
              volume: 9100000,
            },
            {
              symbol: "BDMS",
              name: "Bangkok Dusit Medical",
              price: 30.0,
              change: 0.7,
              changePercent: 2.39,
              volume: 5600000,
            },
          ]);
        }

        if (losersData.results?.length > 0) {
          setTopLosers(losersData.results.slice(0, 5));
        } else {
          setTopLosers([
            {
              symbol: "PTT",
              name: "PTT Public Company",
              price: 358.0,
              change: -12.0,
              changePercent: -3.24,
              volume: 18900000,
            },
            {
              symbol: "SCC",
              name: "Siam Cement Group",
              price: 412.0,
              change: -11.5,
              changePercent: -2.72,
              volume: 6500000,
            },
            {
              symbol: "TRUE",
              name: "True Corporation",
              price: 5.2,
              change: -0.14,
              changePercent: -2.62,
              volume: 45200000,
            },
            {
              symbol: "IRPC",
              name: "IRPC Public Company",
              price: 4.5,
              change: -0.11,
              changePercent: -2.39,
              volume: 28900000,
            },
            {
              symbol: "TASCO",
              name: "Thai Oil Public Company",
              price: 52.5,
              change: -1.25,
              changePercent: -2.33,
              volume: 3200000,
            },
          ]);
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load market data");

        // Set fallback data on error
        setMarketIndices([
          {
            symbol: "^SET.BK",
            name: "SET Index",
            value: 1342.58,
            change: 12.45,
            changePercent: 0.94,
          },
          {
            symbol: "^MAI.BK",
            name: "MAI Index",
            value: 458.23,
            change: -3.12,
            changePercent: -0.68,
          },
          {
            symbol: "^GSPC",
            name: "S&P 500",
            value: 4783.45,
            change: 23.67,
            changePercent: 0.5,
          },
          {
            symbol: "^HSI",
            name: "Hang Seng",
            value: 16547.82,
            change: -87.34,
            changePercent: -0.52,
          },
        ]);
        setTopGainers([
          {
            symbol: "CPF",
            name: "Charoen Pokphand Foods",
            price: 28.5,
            change: 1.25,
            changePercent: 4.59,
            volume: 12500000,
          },
          {
            symbol: "ADVANC",
            name: "Advanced Info Service",
            price: 245.0,
            change: 8.5,
            changePercent: 3.59,
            volume: 8200000,
          },
          {
            symbol: "KBANK",
            name: "Kasikornbank",
            price: 168.0,
            change: 5.0,
            changePercent: 3.07,
            volume: 15300000,
          },
          {
            symbol: "AOT",
            name: "Airports of Thailand",
            price: 72.5,
            change: 1.75,
            changePercent: 2.48,
            volume: 9100000,
          },
          {
            symbol: "BDMS",
            name: "Bangkok Dusit Medical",
            price: 30.0,
            change: 0.7,
            changePercent: 2.39,
            volume: 5600000,
          },
        ]);
        setTopLosers([
          {
            symbol: "PTT",
            name: "PTT Public Company",
            price: 358.0,
            change: -12.0,
            changePercent: -3.24,
            volume: 18900000,
          },
          {
            symbol: "SCC",
            name: "Siam Cement Group",
            price: 412.0,
            change: -11.5,
            changePercent: -2.72,
            volume: 6500000,
          },
          {
            symbol: "TRUE",
            name: "True Corporation",
            price: 5.2,
            change: -0.14,
            changePercent: -2.62,
            volume: 45200000,
          },
          {
            symbol: "IRPC",
            name: "IRPC Public Company",
            price: 4.5,
            change: -0.11,
            changePercent: -2.39,
            volume: 28900000,
          },
          {
            symbol: "TASCO",
            name: "Thai Oil Public Company",
            price: 52.5,
            change: -1.25,
            changePercent: -2.33,
            volume: 3200000,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchSettradeData() {
      try {
        setSettradeLoading(true);

        // Fetch industry sector and investor type data in parallel
        const [sectorRes, investorRes] = await Promise.all([
          fetch("/api/settrade/industry-sector"),
          fetch("/api/settrade/investor-type"),
        ]);

        const sectorResult = sectorRes.ok ? await sectorRes.json() : null;
        const investorResult = investorRes.ok ? await investorRes.json() : null;

        if (sectorResult) {
          setSectorData(sectorResult);
        } else {
          setSettradeError("Failed to load SETTRADE data");
        }

        if (investorResult) {
          setInvestorData(investorResult);
        } else if (!sectorResult) {
          setSettradeError("Failed to load SETTRADE data");
        }

        setSettradeError(null);
      } catch (err) {
        console.error("Error fetching SETTRADE data:", err);
        setSettradeError("Failed to load SETTRADE data from Firebase");
      } finally {
        setSettradeLoading(false);
      }
    }

    fetchSettradeData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate SET Index summary from sector data
  const setSummary = sectorData
    ? {
        totalValue: sectorData.sectors.reduce(
          (sum: number, s: any) => sum + (s.valMn || 0) * 1e6,
          0,
        ),
        totalVolume: sectorData.sectors.reduce(
          (sum: number, s: any) => sum + (s.volK || 0) * 1000,
          0,
        ),
        advancing: sectorData.sectors.filter((s: any) => s.chgPct > 0).length,
        declining: sectorData.sectors.filter((s: any) => s.chgPct < 0).length,
        unchanged: sectorData.sectors.filter((s: any) => s.chgPct === 0).length,
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Thailand Stock Market Overview
            </p>
            {error && (
              <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-700 text-xs">
                {error}
              </div>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* SET Index Summary - Hero Section */}
      {settradeLoading ? (
        <div className="animate-pulse h-24 bg-gray-200 rounded-lg mb-6"></div>
      ) : setSummary ? (
        <SETIndexCard {...setSummary} />
      ) : null}

      {/* Sector Flow Dashboard - Full Width */}
      <div className="mt-6">
        <Card>
          {settradeLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ) : sectorData ? (
            <SectorFlowDashboard
              sectors={sectorData.sectors}
              totalValue={setSummary?.totalValue}
              totalVolume={setSummary?.totalVolume}
              setIndex={
                marketIndices.find((i) => i.symbol.includes("SET"))?.value ||
                1342
              }
              setChange={
                marketIndices.find((i) => i.symbol.includes("SET"))
                  ?.changePercent || 0
              }
            />
          ) : (
            <div className="text-center py-8 text-sm text-gray-500">
              No sector data available
            </div>
          )}
          {sectorData && (
            <p className="text-xs text-gray-400 mt-3 text-right">
              Data: {sectorData.date}
            </p>
          )}
        </Card>
      </div>

      {/* Investor Flow - Compact Below */}
      <div className="mt-4">
        <Card title="Investor Flow" subtitle={investorData?.date || ""}>
          {settradeLoading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : investorData ? (
            <InvestorFlowCard
              investors={investorData.investors}
              showTitle={false}
            />
          ) : (
            <div className="text-center py-8 text-sm text-gray-500">
              No investor data available
            </div>
          )}
        </Card>
      </div>

      {/* Market Indices - Compact */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Global Indices
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {marketIndices.map((index) => (
            <MarketIndexCard
              key={index.symbol}
              name={index.name}
              value={index.value}
              change={index.change}
              changePercent={index.changePercent}
              market={
                index.symbol.includes(".BK")
                  ? "🇹🇭"
                  : index.symbol.includes("^GSPC") ||
                      index.symbol.includes("^DJI") ||
                      index.symbol.includes("^IXIC")
                    ? "🇺🇸"
                    : index.symbol.includes("^HSI")
                      ? "🇭🇰"
                      : "🌍"
              }
            />
          ))}
        </div>
      </div>

      {/* Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Top Gainers */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-green-500">▲</span> Top Gainers
          </h2>
          <div className="space-y-2">
            {topGainers.map((stock) => (
              <StockCard key={stock.symbol} {...stock} />
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-red-500">▼</span> Top Losers
          </h2>
          <div className="space-y-2">
            {topLosers.map((stock) => (
              <StockCard key={stock.symbol} {...stock} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        {sectorData && (
          <p>
            Data updated:{" "}
            {new Date(sectorData.capturedAt).toLocaleString("th-TH")}
          </p>
        )}
      </div>
    </div>
  );
}
