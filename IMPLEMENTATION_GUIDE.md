# Implementation Guide: Next Steps

This guide provides step-by-step instructions for implementing the remaining features of miniStock.

---

## Phase 2: Analysis Systems Implementation

### Step 1: CAN SLIM Score Calculator

Create `src/lib/analysis/canslim.ts`:

```typescript
import type { FinancialMetrics, QuarterlyData, AnnualData } from '@/types/financials';
import type { CanslimScore } from '@/types/analysis';

/**
 * Calculate CAN SLIM score for a stock
 * Score range: 0-100
 */
export function calculateCanslimScore(
  quarterlyData: QuarterlyData[],
  annualData: AnnualData[],
  metrics: FinancialMetrics,
  marketTrend: 'bull' | 'bear' | 'neutral'
): CanslimScore {
  const c = calculateCurrentQuarterlyEarnings(quarterlyData);
  const a = calculateAnnualEarningsGrowth(annualData);
  const n = calculateNewHighScore(metrics);
  const s = calculateSupplyDemandScore(metrics);
  const l = calculateLeadershipScore(metrics);
  const i = calculateInstitutionalScore(metrics);
  const m = calculateMarketDirectionScore(marketTrend);

  const totalScore = (c * 0.15 + a * 0.20 + n * 0.10 + s * 0.10 + l * 0.15 + i * 0.15 + m * 0.15) * 100;

  return {
    totalScore: Math.round(totalScore),
    breakdown: {
      currentEarnings: { score: c, weight: 15, description: 'Current Quarterly Earnings' },
      annualGrowth: { score: a, weight: 20, description: 'Annual Earnings Growth' },
      newHighs: { score: n, weight: 10, description: 'New Products/Management' },
      supplyDemand: { score: s, weight: 10, description: 'Supply & Demand' },
      leadership: { score: l, weight: 15, description: 'Leader vs Laggard' },
      institutional: { score: i, weight: 15, description: 'Institutional Sponsorship' },
      marketDirection: { score: m, weight: 15, description: 'Market Direction' },
    },
    grade: getGrade(totalScore),
    recommendation: getRecommendation(totalScore),
  };
}

function calculateCurrentQuarterlyEarnings(data: QuarterlyData[]): number {
  if (!data || data.length < 2) return 0;
  
  const current = data[0];
  const previous = data[1];
  
  if (!current.eps || !previous.eps) return 0;
  
  const epsGrowth = ((current.eps - previous.eps) / Math.abs(previous.eps)) * 100;
  
  if (epsGrowth >= 25) return 1.0;
  if (epsGrowth >= 15) return 0.7;
  if (epsGrowth >= 5) return 0.5;
  if (epsGrowth >= 0) return 0.3;
  return 0;
}

function calculateAnnualEarningsGrowth(data: AnnualData[]): number {
  if (!data || data.length < 5) return 0;
  
  const years = data.slice(0, 5);
  let totalGrowth = 0;
  let validYears = 0;
  
  for (let i = 1; i < years.length; i++) {
    const growth = ((years[i-1].eps - years[i].eps) / Math.abs(years[i].eps)) * 100;
    if (!isNaN(growth)) {
      totalGrowth += growth;
      validYears++;
    }
  }
  
  const avgGrowth = validYears > 0 ? totalGrowth / validYears : 0;
  
  if (avgGrowth >= 25) return 1.0;
  if (avgGrowth >= 15) return 0.7;
  if (avgGrowth >= 10) return 0.5;
  if (avgGrowth >= 5) return 0.3;
  return 0;
}

function calculateNewHighScore(metrics: FinancialMetrics): number {
  // Placeholder - would need price data relative to 52-week high
  return 0.5;
}

function calculateSupplyDemandScore(metrics: FinancialMetrics): number {
  // Score based on market cap and liquidity
  const marketCap = metrics.marketCap;
  
  if (marketCap > 10000000000) return 1.0; // > $10B
  if (marketCap > 2000000000) return 0.8;  // > $2B
  if (marketCap > 1000000000) return 0.6;  // > $1B
  if (marketCap > 300000000) return 0.4;   // > $300M
  return 0.2;
}

function calculateLeadershipScore(metrics: FinancialMetrics): number {
  // Score based on profit margins and ROE
  const score = (Math.min(metrics.profitMargin * 100, 30) / 30) * 0.5 + 
                (Math.min(metrics.roe * 100, 30) / 30) * 0.5;
  return Math.max(0, Math.min(1, score));
}

function calculateInstitutionalScore(metrics: FinancialMetrics): number {
  // Placeholder - would need institutional ownership data
  return 0.5;
}

function calculateMarketDirectionScore(trend: 'bull' | 'bear' | 'neutral'): number {
  if (trend === 'bull') return 1.0;
  if (trend === 'neutral') return 0.5;
  return 0;
}

function getGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C+';
  if (score >= 50) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function getRecommendation(score: number): 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' {
  if (score >= 80) return 'Strong Buy';
  if (score >= 60) return 'Buy';
  if (score >= 40) return 'Hold';
  if (score >= 20) return 'Sell';
  return 'Strong Sell';
}
```

### Step 2: SPEA Score Calculator

Create `src/lib/analysis/spea.ts`:

```typescript
import type { FinancialMetrics } from '@/types/financials';
import type { SpeaScore } from '@/types/analysis';

export function calculateSpeaScore(metrics: FinancialMetrics): SpeaScore {
  const strategic = calculateStrategicPosition(metrics);
  const financial = calculateFinancialHealth(metrics);
  const earnings = calculateEarningsQuality(metrics);
  const valuation = calculateValuation(metrics);

  const totalScore = Math.round(
    strategic * 0.25 + financial * 0.30 + earnings * 0.25 + valuation * 0.20
  ) * 100;

  return {
    totalScore,
    breakdown: {
      strategicPosition: { score: strategic, weight: 25 },
      financialHealth: { score: financial, weight: 30 },
      earningsQuality: { score: earnings, weight: 25 },
      attractiveValuation: { score: valuation, weight: 20 },
    },
    grade: getGrade(totalScore),
  };
}

function calculateStrategicPosition(metrics: FinancialMetrics): number {
  // Based on market cap and profit margins
  let score = 0;
  
  // Market cap score
  if (metrics.marketCap > 50000000000) score += 0.4;
  else if (metrics.marketCap > 10000000000) score += 0.3;
  else if (metrics.marketCap > 2000000000) score += 0.2;
  
  // Profit margin score
  if (metrics.profitMargin > 0.20) score += 0.3;
  else if (metrics.profitMargin > 0.15) score += 0.2;
  else if (metrics.profitMargin > 0.10) score += 0.1;
  
  // ROE score
  if (metrics.roe > 0.20) score += 0.3;
  else if (metrics.roe > 0.15) score += 0.2;
  else if (metrics.roe > 0.10) score += 0.1;
  
  return Math.min(1, score);
}

function calculateFinancialHealth(metrics: FinancialMetrics): number {
  let score = 0;
  
  // Debt-to-equity (lower is better)
  if (metrics.deRatio < 0.5) score += 0.5;
  else if (metrics.deRatio < 1.0) score += 0.3;
  else if (metrics.deRatio < 2.0) score += 0.1;
  
  // Free cash flow (positive is good)
  if (metrics.freeCashFlow > 0) {
    const fcfToRevenue = metrics.freeCashFlow / metrics.revenue;
    if (fcfToRevenue > 0.15) score += 0.5;
    else if (fcfToRevenue > 0.10) score += 0.3;
    else if (fcfToRevenue > 0.05) score += 0.2;
  }
  
  return Math.min(1, score);
}

function calculateEarningsQuality(metrics: FinancialMetrics): number {
  let score = 0;
  
  // EPS growth
  if (metrics.epsGrowth > 0.20) score += 0.5;
  else if (metrics.epsGrowth > 0.10) score += 0.3;
  else if (metrics.epsGrowth > 0.05) score += 0.2;
  
  // Revenue growth
  if (metrics.revenueGrowth > 0.15) score += 0.5;
  else if (metrics.revenueGrowth > 0.10) score += 0.3;
  else if (metrics.revenueGrowth > 0.05) score += 0.2;
  
  return Math.min(1, score);
}

function calculateValuation(metrics: FinancialMetrics): number {
  let score = 0;
  
  // P/E ratio (lower is better, within reason)
  if (metrics.peRatio > 0 && metrics.peRatio < 15) score += 0.5;
  else if (metrics.peRatio < 20) score += 0.3;
  else if (metrics.peRatio < 30) score += 0.1;
  
  // P/B ratio (lower is better)
  if (metrics.pbRatio < 1.5) score += 0.3;
  else if (metrics.pbRatio < 3) score += 0.2;
  else if (metrics.pbRatio < 5) score += 0.1;
  
  // Dividend yield (bonus points)
  if (metrics.dividendYield > 0.03) score += 0.2;
  else if (metrics.dividendYield > 0.02) score += 0.1;
  
  return Math.min(1, score);
}

function getGrade(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Very Poor';
}
```

### Step 3: API Route for Analysis

Create `src/app/api/stock/[symbol]/analysis/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCompanyMetrics } from '@/lib/api/fundamentals';
import { getFinancialStatements } from '@/lib/api/statements';
import { calculateCanslimScore } from '@/lib/analysis/canslim';
import { calculateSpeaScore } from '@/lib/analysis/spea';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    const [metrics, statements] = await Promise.all([
      getCompanyMetrics(upperSymbol),
      getFinancialStatements(upperSymbol),
    ]);

    const speaScore = calculateSpeaScore(metrics);
    
    // For CAN SLIM, we need more data - implement after getting quarterly/annual data
    // const canslimScore = calculateCanslimScore(quarterlyData, annualData, metrics, 'neutral');

    return NextResponse.json({
      symbol: upperSymbol,
      analysis: {
        spea: speaScore,
        // canslim: canslimScore,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate analysis', details: (error as Error).message },
      { status: 500 }
    );
  }
}
```

---

## Phase 3: User Authentication

### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Enable Authentication > Email/Password and Google
4. Enable Realtime Database
5. Update `.env` with your Firebase credentials

### Step 2: Authentication Helper

Create `src/lib/auth.ts`:

```typescript
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

export async function signUp(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: (error as Error).message };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: (error as Error).message };
  }
}

export async function logOut() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
```

### Step 3: Login Page

Create `src/app/auth/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { user, error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In to miniStock</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="/auth/register" className="text-blue-600 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

## Phase 4: Watchlist Feature

### Database Structure

```typescript
// Firebase Realtime Database structure
{
  "users": {
    "{userId}": {
      "watchlists": {
        "default": {
          "name": "My Watchlist",
          "stocks": {
            "AAPL": {
              "addedAt": 1234567890,
              "notes": "Strong growth stock",
              "targetPrice": 200,
              "alertPrice": 180
            },
            "MSFT": { ... }
          }
        }
      }
    }
  }
}
```

### Watchlist Service

Create `src/lib/db/watchlist.ts`:

```typescript
import { database } from '../firebase';
import { ref, set, get, remove, update } from 'firebase/database';

export async function addToWatchlist(
  userId: string,
  symbol: string,
  data: {
    notes?: string;
    targetPrice?: number;
    alertPrice?: number;
  }
) {
  const watchlistRef = ref(database, `users/${userId}/watchlists/default/stocks/${symbol}`);
  await set(watchlistRef, {
    ...data,
    addedAt: Date.now(),
  });
}

export async function removeFromWatchlist(userId: string, symbol: string) {
  const watchlistRef = ref(database, `users/${userId}/watchlists/default/stocks/${symbol}`);
  await remove(watchlistRef);
}

export async function getWatchlist(userId: string) {
  const watchlistRef = ref(database, `users/${userId}/watchlists/default/stocks`);
  const snapshot = await get(watchlistRef);
  return snapshot.val() || {};
}

export async function updateWatchlistItem(
  userId: string,
  symbol: string,
  data: Partial<{
    notes: string;
    targetPrice: number;
    alertPrice: number;
  }>
) {
  const watchlistRef = ref(database, `users/${userId}/watchlists/default/stocks/${symbol}`);
  await update(watchlistRef, data);
}
```

---

## Testing Checklist

### API Endpoints
- [ ] Test /api/health
- [ ] Test /api/stock/AAPL (US stock)
- [ ] Test /api/stock/AAPL/quote
- [ ] Test /api/stock/AAPL/fundamentals
- [ ] Test /api/stock/AAPL/historical
- [ ] Test /api/market/indices
- [ ] Test /api/market/scanner

### Analysis System
- [ ] CAN SLIM calculation works
- [ ] SPEA calculation works
- [ ] Scores are in 0-100 range
- [ ] Grades are correctly assigned

### Authentication
- [ ] Sign up works
- [ ] Sign in works
- [ ] Sign out works
- [ ] Protected routes redirect to login
- [ ] User profile persists across sessions

### Watchlist
- [ ] Add stock to watchlist
- [ ] Remove stock from watchlist
- [ ] Update notes/prices
- [ ] View watchlist
- [ ] Real-time updates work

---

## Deployment Checklist

Before deploying to production:

1. **Environment Variables**
   - [ ] All API keys configured
   - [ ] Firebase credentials set
   - [ ] Production URLs updated

2. **Security**
   - [ ] Firebase security rules configured
   - [ ] API rate limiting implemented
   - [ ] Input validation on all endpoints

3. **Performance**
   - [ ] Caching working properly
   - [ ] Images optimized
   - [ ] Bundle size optimized

4. **Monitoring**
   - [ ] Error tracking (Sentry)
   - [ ] Analytics (Google Analytics)
   - [ ] Performance monitoring

---

## Common Issues & Solutions

### Yahoo Finance API Issues
**Problem:** Rate limiting
**Solution:** Implement caching, use multiple API keys, add delays

**Problem:** Data not available for symbol
**Solution:** Add fallback to other providers (FMP, Alpha Vantage)

### Firebase Issues
**Problem:** Authentication not persisting
**Solution:** Check Firebase config, ensure cookies are enabled

**Problem:** Database permissions denied
**Solution:** Update Firebase security rules

---

For more details, see:
- [ROADMAP.md](./ROADMAP.md) - Full project roadmap
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Current status
- [README.md](./README.md) - Setup instructions
