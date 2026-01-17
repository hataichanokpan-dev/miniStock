# miniStock Agent Playbook

**Purpose:** This playbook guides AI agents in understanding and working on the miniStock project effectively.

**Project Goal:** Build a professional stock analysis platform helping investors make data-driven decisions using proven methodologies like CAN SLIM and SPEA.

---

## Quick Project Overview

### What This Project Is
A **professional stock analysis tool** for retail investors that provides:
- Real-time stock quotes and market data
- Fundamental financial metrics (revenue, profit, valuation ratios)
- Investment scoring systems (CAN SLIM, SPEA, Value, Growth, Quality)
- Portfolio management and tracking
- Stock screening and comparison tools
- Data-driven insights for stock selection

### What This Project Is NOT
- A trading platform (no order execution)
- A robo-advisor (no automated recommendations)
- A social network for investors
- A cryptocurrency platform
- A high-frequency trading tool

### Target Markets
- **Primary:** Thailand (SET, MAI indices)
- **Secondary:** US markets (S&P 500, NASDAQ)
- **Future:** Hong Kong, China

---

## Tech Stack & Architecture

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS with custom design tokens
- **State:** React Query for server state, Zustand for client state
- **Charts:** Recharts or Chart.js for visualizations

### Backend
- **API Routes:** Next.js API routes (serverless functions)
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Cache:** Redis or Upstash for production
- **APIs:** Financial Modeling Prep (primary), Alpha Vantage (fallback)

### Key Patterns
```typescript
// API route pattern: src/app/api/[category]/[resource]/route.ts
// Example: src/app/api/stock/AAPL/quote/route.ts

// Component organization: src/components/[category]/[Component].tsx
// Example: src/components/analysis/CanslimScoreCard.tsx

// Library utilities: src/lib/[category]/[file].ts
// Example: src/lib/analysis/canslim.ts
```

---

## Coding Standards

### TypeScript Rules
1. **Always use strict types** - No `any`, use proper interfaces
2. **Leverage existing types** from `src/lib/types.ts`
3. **Export reusable types** to `src/types/` for shared interfaces
4. **Use generics** for reusable utilities

```typescript
// ✅ GOOD
async function fetchStockData(symbol: string): Promise<Stock> {
  // ...
}

// ❌ BAD
async function fetchStockData(symbol: any): any {
  // ...
}
```

### Component Guidelines
1. **Use Server Components by default** (Next.js 15 default)
2. **Client Components only when needed** (interactivity, hooks)
3. **Keep components focused** - Single responsibility
4. **Prefer composition** over props drilling
5. **Use proper TypeScript** for all props

```typescript
// ✅ GOOD: Server Component (default)
export default function StockCard({ stock }: { stock: Stock }) {
  return <div>{stock.symbol}</div>;
}

// ✅ GOOD: Client Component when needed
'use client';
export default function InteractiveChart({ data }: ChartProps) {
  const [zoom, setZoom] = useState(1);
  // ...
}
```

### Error Handling
1. **Always handle API failures** gracefully
2. **Show user-friendly error messages**
3. **Log errors for debugging**
4. **Implement retry logic** for transient failures

```typescript
// ✅ GOOD: Comprehensive error handling
try {
  const data = await fetchStockQuote(symbol);
  return data;
} catch (error) {
  if (error instanceof NetworkError) {
    return { error: 'Network error. Please check your connection.' };
  }
  if (error instanceof RateLimitError) {
    return { error: 'Too many requests. Please try again later.' };
  }
  logger.error('Failed to fetch stock quote', { symbol, error });
  return { error: 'Unable to fetch stock data. Please try again.' };
}
```

### Performance Guidelines
1. **Fetch data on the server** when possible
2. **Use React Query** for caching and revalidation
3. **Implement pagination** for large datasets
4. **Virtualize long lists** (react-window)
5. **Lazy load charts** and heavy components

---

## Project-Specific Conventions

### Data Formatting
```typescript
// Currency: Use formatCurrency from lib/utils
formatCurrency(1234.56, 'THB') // "฿1,234.56"
formatCurrency(1234.56, 'USD') // "$1,234.56"

// Percentages: Always use basis points internally, display as %
const changeInBps = 456; // 4.56%
display: "+4.56%"

// Numbers: Use locale-aware formatting
formatNumber(1234567) // "1,234,567" (English)
formatNumber(1234567, 'th-TH') // "1,234,567.00" (Thai)

// Dates: Always store as ISO 8601, display as relative or formatted
const stored = "2026-01-17T10:30:00Z";
display: "Jan 17, 2026" or "2 hours ago"
```

### Color Semantics
```css
/* Positive/growth */
text-green-600 bg-green-50

/* Negative/decline */
text-red-600 bg-red-50

/* Neutral/information */
text-blue-600 bg-blue-50

/* Warning/caution */
text-yellow-600 bg-yellow-50

/* Professional accent (brand colors) */
bg-navy-900 text-white
```

### File Naming
```
Components:        PascalCase  (StockCard.tsx)
Utilities:         camelCase   (formatCurrency.ts)
Types:             camelCase   (financial-types.ts)
API Routes:        lowercase   (api/stock/[symbol]/route.ts)
Pages:             lowercase   (stock/[symbol]/page.tsx)
```

---

## Key Domain Concepts

### Stock Data Models
**Stock Quote (Real-time):**
- Symbol, company name
- Current price, day change, day change %
- Volume, market cap
- 52-week high/low

**Fundamental Metrics:**
- Valuation: P/E, P/B, EV/EBITDA, PEG
- Profitability: ROE, ROA, ROIC, margins
- Financial Health: D/E, current ratio, interest coverage
- Growth: revenue CAGR, EPS CAGR

**Financial Statements:**
- Income Statement (quarterly & annual)
- Balance Sheet
- Cash Flow Statement

### Analysis Systems

#### CAN SLIM (Growth Investing)
**Purpose:** Identify growth stocks before they make big price moves

| Component | What It Measures | Data Points Needed |
|-----------|------------------|-------------------|
| **C** - Current Earnings | Quarterly EPS growth | Latest quarterly EPS, year-ago EPS |
| **A** - Annual Earnings | Long-term earnings growth | 3-5 year annual EPS data |
| **N** - New | New products, management, highs | News feed, 52-week high proximity |
| **S** - Supply | Supply/demand dynamics | Market cap, float, volume |
| **L** - Leader | Relative strength | Stock performance vs sector/market |
| **I** - Institutional | Institutional ownership | Institutional holding data |
| **M** - Market | Market direction | Market index trends |

**Scoring:** 0-100 scale, each letter weighted

#### SPEA (Comprehensive Analysis)
**Purpose:** Holistic assessment across 4 dimensions

**1. Strategic Position (25%)**
- Industry ranking (top 3 in sector = high score)
- Competitive advantage (moat assessment)
- Market share trends

**2. Financial Health (30%)**
- Debt-to-equity ratio (< 2 = good, < 1 = excellent)
- Current ratio (> 1.5 = healthy)
- Altman Z-Score (> 3 = safe, < 1.8 = distress risk)

**3. Earnings Quality (25%)**
- Earnings consistency (steady growth vs volatile)
- Cash flow quality (FCF vs net income)
- Accrual ratio (lower = better)

**4. Attractive Valuation (20%)**
- P/E vs historical average
- P/B vs industry average
- DCF intrinsic value vs current price

**Scoring:** 0-100 scale, each quadrant scored independently

#### Value Scoring
**Purpose:** Identify undervalued stocks

- **Graham Number:** sqrt(22.5 × EPS × Book Value per Share)
- **Piotroski F-Score:** 0-9 scale based on 9 criteria
- **Margin of Safety:** (Intrinsic Value - Price) / Intrinsic Value

---

## Common Tasks & Patterns

### Adding a New Stock Data API
**Pattern:** Always create through `src/lib/api/` layer

```typescript
// 1. Define the API client
// src/lib/api/stock-api.ts
import { STOCK_API_KEY, STOCK_API_BASE_URL } from '@/lib/config';

export async function fetchQuote(symbol: string): Promise<StockQuote> {
  const response = await fetch(
    `${STOCK_API_BASE_URL}/quote/${symbol}?apikey=${STOCK_API_KEY}`,
    { next: { revalidate: 60 } } // Cache for 60 seconds
  );
  if (!response.ok) throw new ApiError('Failed to fetch quote');
  return response.json();
}

// 2. Create API route for client consumption
// src/app/api/stock/[symbol]/quote/route.ts
import { fetchQuote } from '@/lib/api/stock-api';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const quote = await fetchQuote(params.symbol);
    return Response.json(quote);
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

// 3. Use React Query on the client
// src/hooks/useStockQuote.ts
import { useQuery } from '@tanstack/react-query';

export function useStockQuote(symbol: string) {
  return useQuery({
    queryKey: ['stock', 'quote', symbol],
    queryFn: () => fetch(`/api/stock/${symbol}/quote`).then(r => r.json()),
    refetchInterval: 60000, // Refetch every minute
  });
}
```

### Creating Analysis Score Components
**Pattern:** Reusable score card with explanation

```typescript
// src/components/analysis/CanslimScoreCard.tsx
interface ScoreCardProps {
  symbol: string;
  scores: CanslimScores;
  overallScore: number;
}

export function CanslimScoreCard({ symbol, scores, overallScore }: ScoreCardProps) {
  const scoreColor = overallScore >= 70 ? 'text-green-600' :
                     overallScore >= 40 ? 'text-yellow-600' :
                     'text-red-600';

  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">CAN SLIM Score</h3>
          <p className="text-sm text-gray-500">Growth investing analysis</p>
        </div>
        <div className={`text-3xl font-bold ${scoreColor}`}>
          {overallScore}
        </div>
      </div>

      {/* Score breakdown */}
      <div className="mt-4 space-y-2">
        {Object.entries(scores).map(([letter, data]) => (
          <ScoreBar
            key={letter}
            label={`${letter}: ${data.label}`}
            score={data.score}
            explanation={data.explanation}
          />
        ))}
      </div>

      {/* Learn more link */}
      <Link href="/help/canslim" className="text-sm text-blue-600">
        Learn about CAN SLIM →
      </Link>
    </Card>
  );
}
```

### Implementing Stock Screener Filters
**Pattern:** Composable filter system

```typescript
// src/lib/screener/filters.ts
export type FilterOperator = 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';

interface ScreenerFilter {
  field: string;
  operator: FilterOperator;
  value: number | number[] | string;
}

export function applyFilters(
  stocks: Stock[],
  filters: ScreenerFilter[]
): Stock[] {
  return stocks.filter(stock => {
    return filters.every(filter => {
      const stockValue = getNestedValue(stock, filter.field);
      return compare(stockValue, filter.operator, filter.value);
    });
  });
}

// Example usage:
const filters: ScreenerFilter[] = [
  { field: 'metrics.peRatio', operator: 'lt', value: 20 },
  { field: 'metrics.roe', operator: 'gte', value: 15 },
  { field: 'analysis.canslimScore', operator: 'gte', value: 70 },
];
const results = applyFilters(allStocks, filters);
```

---

## Testing Strategy

### Unit Tests (Vitest)
```typescript
// src/lib/analysis/__tests__/canslim.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCanslimScore } from '../canslim';

describe('CAN SLIM Calculator', () => {
  it('should score high for strong growth stock', () => {
    const stock = {
      quarterlyEpsGrowth: 35,
      annualEpsGrowth: 28,
      // ... other metrics
    };
    const result = calculateCanslimScore(stock);
    expect(result.overall).toBeGreaterThan(70);
  });

  it('should score low for declining stock', () => {
    const stock = {
      quarterlyEpsGrowth: -10,
      annualEpsGrowth: -5,
      // ...
    };
    const result = calculateCanslimScore(stock);
    expect(result.overall).toBeLessThan(30);
  });
});
```

### Integration Tests
```typescript
// API route integration test
import { GET } from '@/app/api/stock/[symbol]/quote/route';

describe('Stock Quote API', () => {
  it('should return quote data', async () => {
    const request = new Request('http://localhost:3000');
    const response = await GET(request, { params: { symbol: 'AAPL' } });
    const data = await response.json();
    expect(data).toHaveProperty('symbol');
    expect(data).toHaveProperty('price');
  });
});
```

---

## Common Pitfalls to Avoid

### 1. Hardcoding Values
❌ **DON'T:**
```typescript
const price = stock.price * 33.5; // Hardcoded THB rate
```

✅ **DO:**
```typescript
const THB_TO_USD = 33.5;
const price = stock.price * exchangeRate;
```

### 2. Ignoring Loading States
❌ **DON'T:**
```typescript
const { data } = useStockQuote(symbol);
return <div>{data.price}</div>; // Crashes if loading
```

✅ **DO:**
```typescript
const { data, isLoading, error } = useStockQuote(symbol);
if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
return <div>{data.price}</div>;
```

### 3. Not Handling Missing Data
❌ **DON'T:**
```typescript
const peRatio = stock.metrics.peRatio;
const margin = peRatio * 0.1; // Crashes if peRatio is undefined
```

✅ **DO:**
```typescript
const peRatio = stock.metrics.peRatio;
const margin = peRatio ? peRatio * 0.1 : null;
if (!margin) return <div>N/A</div>;
```

### 4. Making Too Many API Calls
❌ **DON'T:**
```typescript
// Fetches 100 stocks individually
const stocks = symbols.map(s => fetchStock(s));
```

✅ **DO:**
```typescript
// Batch fetch when possible
const stocks = await fetchStocksBatch(symbols);
```

### 5. Inconsistent Date Handling
❌ **DON'T:**
```typescript
const date = new Date(timestamp); // Depends on server timezone
```

✅ **DO:**
```typescript
const date = new Date(timestamp);
const formatted = format(date, 'MMM dd, yyyy', { timeZone: 'Asia/Bangkok' });
```

---

## Security Considerations

### API Key Management
1. **Never commit API keys** to git
2. Use `.env.local` for local development
3. Use environment variables in production (Vercel/AWS)
4. Rotate keys regularly
5. Monitor usage for anomalies

### Data Validation
1. **Validate all user input**
2. **Sanitize data from external APIs**
3. **Use Zod** for runtime type checking
4. **Implement rate limiting** on API routes

```typescript
// Example: Zod validation schema
import { z } from 'zod';

const StockQuerySchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  timeframe: z.enum(['1D', '1W', '1M', '3M', '1Y', 'ALL']),
});

export async function GET(request: Request) {
  const query = StockQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
  // query is now type-safe and validated
}
```

---

## When to Ask for Clarification

Before implementing, ask the user if:

1. **Data Source:** Which API provider to use? (FMP, Alpha Vantage, etc.)
2. **Markets:** Which markets to prioritize? (SET only, or also US?)
3. **Features:** Is this for MVP or full feature set?
4. **Design:** Should you match existing UI exactly or suggest improvements?
5. **Testing:** Should tests be included for new features?

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Common patterns
npx shadcn-ui add [component]  # Add UI component
npx next-codemod [pattern]     # Next.js codemods
```

---

## File Structure Reference

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth route group
│   ├── (dashboard)/             # Protected routes
│   ├── api/                     # API routes
│   │   └── stock/
│   │       └── [symbol]/
│   │           ├── quote/
│   │           ├── fundamentals/
│   │           └── analysis/
│   ├── stock/[symbol]/          # Stock detail pages
│   ├── screener/                # Stock screener
│   ├── watchlist/               # Watchlist management
│   ├── portfolio/               # Portfolio tracking
│   └── layout.tsx               # Root layout
├── components/
│   ├── analysis/                # Analysis components
│   ├── portfolio/               # Portfolio components
│   ├── screener/                # Screener components
│   ├── stock/                   # Stock-related components
│   └── ui/                      # Reusable UI components
├── lib/
│   ├── analysis/                # Analysis algorithms
│   │   ├── canslim.ts
│   │   ├── spea.ts
│   │   ├── value-scoring.ts
│   │   └── growth-scoring.ts
│   ├── api/                     # API clients
│   │   ├── stock-api.ts
│   │   ├── quotes.ts
│   │   └── fundamentals.ts
│   ├── db/                      # Database operations
│   │   ├── watchlist.ts
│   │   ├── portfolio.ts
│   │   └── user.ts
│   ├── utils/                   # Utility functions
│   └── firebase.ts              # Firebase config
├── types/                       # Shared type definitions
│   ├── stock.ts
│   ├── analysis.ts
│   └── financials.ts
└── hooks/                       # Custom React hooks
```

---

## Decision Log

### Why Next.js 15?
- Server components for better performance
- Built-in API routes (no separate backend needed)
- Excellent TypeScript support
- Great SEO capabilities
- Strong community and ecosystem

### Why Firebase?
- Easy authentication setup
- Real-time database capabilities
- Generous free tier
- Good documentation
- Scales well

### Why CAN SLIM + SPEA?
- **CAN SLIM:** Proven growth investing strategy (William O'Neil)
- **SPEA:** Comprehensive fundamental analysis
- **Combination:** Covers both growth and value investing styles

### Why TypeScript Strict Mode?
- Catches bugs at compile time
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring
- Industry standard for professional projects

---

## Current Status (January 2026)

**Phase:** Foundation Complete

**What Works:**
- ✅ Next.js 15 + TypeScript setup
- ✅ Professional UI with TailwindCSS
- ✅ Firebase configuration
- ✅ Type definitions
- ✅ Layout components

**What Needs Work:**
- 🔲 Real stock data integration
- 🔲 Analysis algorithms
- 🔲 User authentication
- 🔲 Database operations
- 🔲 Testing

**Next Priority:** Phase 1 - Data Layer Integration

---

## Helpful Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)

### Financial Data APIs
- [Financial Modeling Prep](https://site.financialmodelingprep.com/)
- [Alpha Vantage](https://www.alphavantage.co/)
- [Finnhub](https://finnhub.io/)

### Investment Methodologies
- [CAN SLIM Explained](https://www.investors.com/what-is-canslim/)
- [Value Investing Principles](https://www.investopedia.com/terms/v/valueinvesting.asp)

---

**Remember:** The goal is to build a **professional-grade tool** that helps investors make informed decisions. Focus on **data accuracy**, **clear insights**, and **excellent UX**. When in doubt, prioritize clarity over complexity.

**Last Updated:** January 2026
**Version:** 1.0
