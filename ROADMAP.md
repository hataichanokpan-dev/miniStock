# miniStock Project Roadmap

**Vision:** Build a professional stock analysis platform that helps investors make informed decisions using proven investment methodologies like CAN SLIM, SPEA, and fundamental analysis.

**Target Users:** Retail investors, swing traders, and value investors looking for data-driven stock selection tools.

**Tech Stack:** Next.js 15, TypeScript, Firebase, TailwindCSS, Financial APIs

---

## Current Status: Phase 1 Complete ✅ | Phase 2 In Progress 🚧

### Completed (Phase 1) ✅
- [x] Next.js 15 project with App Router
- [x] TypeScript configuration
- [x] TailwindCSS design system
- [x] Firebase configuration
- [x] Core UI components (Header, Sidebar, Cards)
- [x] Type definitions for stocks, portfolio, watchlist
- [x] Responsive dashboard layout
- [x] Real-time stock data integration (Yahoo Finance - no API key)
- [x] Financial metrics display
- [x] Data models and types
- [x] API routes
- [x] Caching layer
- [x] **SETTRADE Integration via Firebase**
  - Industry sector data (Thai market)
  - Investor type flow data
  - Mobile responsive design
- [x] **Design System**
  - DESIGN_RULES.md with Thai market conventions
  - Format utilities (@/lib/format.ts)
  - Mobile-first responsive components
- [x] **Market Page Features**
  - Sector Flow Dashboard (money in/out, value distribution, leaders/laggards)
  - Investor Flow Card (Key Driver identification, buy/sell/net analysis)
  - Mobile responsive tab navigation
- [x] **Stock Page** (basic)
  - Stock detail page: `/stocks/[symbol]`
  - Yahoo Finance data integration

### In Progress (Phase 2) 🚧
- [ ] CAN SLIM Analysis System
- [ ] SPEA Analysis System
- [ ] Additional analysis systems (value, growth, quality metrics)

---

## Phase 1: Data Layer Foundation (Weeks 1-3) ✅ **COMPLETED**

### Goal: Connect to real-time and historical stock market data

#### 1.1 API Integration ✅
**Tasks:**
- [x] Select primary data provider
  - **Selected: Yahoo Finance** (free, no API key required, comprehensive data)
  - Fallback: Financial Modeling Prep (comprehensive, affordable)
  - Fallback: Alpha Vantage (free tier, good for MVP)
- [x] Set up API key management
  - Environment variables for API keys
  - Rate limiting handler
  - Error handling & retry logic
- [x] Create unified data service layer
  - `src/lib/api/stock-api.ts` - Main API client
  - `src/lib/api/quotes.ts` - Real-time quotes
  - `src/lib/api/fundamentals.ts` - Company fundamentals
  - `src/lib/api/statements.ts` - Financial statements
  - `src/lib/api/yahoo-finance.ts` - Yahoo Finance integration
  - `src/lib/api/cache.ts` - Caching layer
- [x] Implement caching strategy
  - In-memory cache for development (implemented)
  - Cache invalidation logic (TTL-based)
  - Ready for Redis/Upstash migration in production
- [ ] Background data refresh system
  - Cron jobs for data updates
  - WebSocket for real-time updates (optional)

#### 1.2 Data Models ✅
**Files created:**
- [x] `src/types/financials.ts` - Financial statement types
- [x] `src/types/analysis.ts` - Analysis scoring types
- [x] `src/types/market.ts` - Market data types

**Key Types:**
```typescript
interface FinancialMetrics {
  revenue: number;
  revenueGrowth: number;
  netIncome: number;
  profitMargin: number;
  peRatio: number;
  pbRatio: number;
  roe: number;
  deRatio: number;
  eps: number;
  epsGrowth: number;
  freeCashFlow: number;
  dividendYield: number;
  marketCap: number;
}

interface QuarterlyData {
  fiscalYear: number;
  fiscalQuarter: number;
  earningsDate: string;
  eps: number;
  revenue: number;
  margin: number;
}

interface AnnualData {
  fiscalYear: number;
  eps: number;
  revenue: number;
  netIncome: number;
  totalAssets: number;
  totalDebt: number;
  equity: number;
}
```

#### 1.3 API Routes ✅
**Next.js API routes created:**
- [x] `src/app/api/stock/[symbol]/route.ts` - Stock data
- [x] `src/app/api/stock/[symbol]/quote/route.ts` - Real-time quote
- [x] `src/app/api/stock/[symbol]/fundamentals/route.ts` - Fundamentals
- [x] `src/app/api/market/indices/route.ts` - Market indices
- [x] `src/app/api/market/scanner/route.ts` - Stock scanner

**Deliverables:**
- [x] Real-time stock quotes on dashboard
- [x] Historical price data loading
- [x] Basic financial metrics display
- [x] Error handling for API failures

---

## Phase 2: Analysis Systems (Weeks 4-8)

### Goal: Implement professional stock scoring systems

#### 2.1 CAN SLIM Analysis System
**File:** `src/lib/analysis/canslim.ts`

**CAN SLIM Criteria Scoring:**

| Letter | Factor | Weight | Scoring Logic |
|--------|--------|--------|---------------|
| **C** | Current Quarterly Earnings | 15% | EPS growth > 25% = full score |
| **A** | Annual Earnings Growth | 20% | 3-5 year annual EPS growth |
| **N** | New Products/Management | 10% | Recent news, 52-week high proximity |
| **S** | Supply & Demand | 10% | Market cap, float, trading volume |
| **L** | Leader vs Laggard | 15% | Relative strength vs sector/market |
| **I** | Institutional Sponsorship | 15% | Institutional ownership trends |
| **M** | Market Direction | 15% | Market trend confirmation |

**Tasks:**
- [ ] Implement CAN SLIM calculator
- [ ] Score normalization (0-100 scale)
- [ ] Industry comparison logic
- [ ] Historical score tracking
- [ ] Visual score card component
  - `src/components/analysis/CanslimScoreCard.tsx`
- [ ] Score explanation modal
- [ ] CAN SLIM screener filter

**Deliverables:**
- CAN SLIM score (0-100) for each stock
- Visual score breakdown
- CAN SLIM-based stock screening

#### 2.2 SPEA Analysis System
**File:** `src/lib/analysis/spea.ts`

**SPEA Framework:**

1. **Strategic Position (25%)**
   - [ ] Industry position ranking
   - [ ] Competitive advantage score
   - [ ] Brand strength indicator
   - [ ] Market share data

2. **Financial Health (30%)**
   - [ ] Debt-to-equity ratio scoring
   - [ ] Current ratio assessment
   - [ ] Interest coverage calculation
   - [ ] Altman Z-Score integration

3. **Earnings Quality (25%)**
   - [ ] Earnings consistency score
   - [ ] Cash flow vs net income quality
   - [ ] Accrual ratio calculation
   - [ ] Earnings predictability

4. **Attractive Valuation (20%)**
   - [ ] P/E vs historical average
   - [ ] P/B ratio scoring
   - [ ] EV/EBITDA comparison
   - [ ] DCF intrinsic value calculation

**Tasks:**
- [ ] Implement SPEA calculator
- [ ] Industry benchmarking
- [ ] DCF valuation model
- [ ] Altman Z-Score calculator
- [ ] Radar chart visualization
  - `src/components/analysis/SpeaRadarChart.tsx`
- [ ] Valuation summary component

**Deliverables:**
- SPEA score (0-100) for each stock
- 4-quadrant radar chart
- Valuation assessment (Overvalued/Fair/Undervalued)
- Bankruptcy risk indicator

#### 2.3 Additional Analysis Systems

**Value Investing Metrics:**
- [ ] Graham Number calculator
- [ ] Piotroski F-Score
- [ ] Margin of Safety calculator
- [ ] Intrinsic value (DCF)

**Growth Metrics:**
- [ ] Revenue CAGR (3, 5, 10 year)
- [ ] EPS CAGR (3, 5, 10 year)
- [ ] ROE trend analysis
- [ ] Consistency scoring

**Quality Metrics:**
- [ ] Gross margin trend
- [ ] Operating margin trend
- [ ] FCF conversion ratio
- [ ] Capital allocation efficiency

**Deliverables:**
- `src/lib/analysis/value-scoring.ts`
- `src/lib/analysis/growth-scoring.ts`
- `src/lib/analysis/quality-scoring.ts`
- Comprehensive analysis dashboard

---

## Phase 3: Core User Features (Weeks 9-12)

### Goal: Build essential investor tools

#### 3.1 User Authentication
**Tasks:**
- [ ] Firebase Authentication setup
  - Email/password
  - Google OAuth
  - Session management
- [ ] Protected routes middleware
- [ ] User profile management
- [ ] Password reset flow

**Files:**
- `src/lib/auth.ts` - Auth utilities
- `src/middleware.ts` - Route protection
- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/app/auth/reset/page.tsx`

#### 3.2 Enhanced Watchlist
**Features:**
- [ ] Add/remove stocks
- [ ] Custom notes per stock
- [ ] Tags & categories
- [ ] Price alerts (email/push)
- [ ] Analysis score tracking
- [ ] Watchlist performance metrics
- [ ] Multiple watchlists

**Files:**
- `src/app/watchlist/page.tsx`
- `src/components/watchlist/WatchlistTable.tsx`
- `src/components/watchlist/AddStockModal.tsx`
- `src/lib/db/watchlist.ts` - Firestore operations

#### 3.3 Portfolio Management
**Features:**
- [ ] Holdings CRUD
- [ ] Real-time P&L calculation
- [ ] Cost basis tracking (FIFO/Average)
- [ ] Dividend tracking
- [ ] Transaction history
- [ ] Portfolio analytics
  - Total return
  - Sector allocation
  - Risk metrics (Beta, Volatility)
  - Performance vs benchmark

**Files:**
- `src/app/portfolio/page.tsx`
- `src/components/portfolio/PortfolioSummary.tsx`
- `src/components/portfolio/HoldingsTable.tsx`
- `src/components/portfolio/PerformanceChart.tsx`
- `src/lib/db/portfolio.ts` - Firestore operations

#### 3.4 Stock Detail Page
**Sections:**
- [ ] Price chart with technical indicators
- [ ] Key statistics
- [ ] Financial statements (Income Statement, Balance Sheet, Cash Flow)
- [ ] Analysis scores (CAN SLIM, SPEA)
- [ ] Peer comparison
- [ ] News & events
- [ ] Analyst ratings
- [ ] Quick actions (Add to watchlist, Add to portfolio)

**Files:**
- `src/app/stock/[symbol]/page.tsx`
- `src/components/stock/PriceChart.tsx`
- `src/components/stock/FinancialStatements.tsx`
- `src/components/stock/AnalysisScores.tsx`
- `src/components/stock/PeerComparison.tsx`

**Deliverables:**
- Fully functional stock detail page
- Interactive price charts
- Complete financial data
- Actionable insights

---

## Phase 4: Advanced Features (Weeks 13-16)

### Goal: Power-user features for serious investors

#### 4.1 Stock Screener
**Filter Categories:**

**Basic:**
- [ ] Market cap (Micro, Small, Mid, Large, Mega)
- [ ] Sector/Industry
- [ ] Exchange (SET, MAI, US, HK, CN)
- [ ] Price range

**Fundamental:**
- [ ] P/E ratio range
- [ ] P/B ratio range
- [ ] Dividend yield
- [ ] ROE range
- [ ] Debt-to-equity
- [ ] Current ratio

**Growth:**
- [ ] Revenue growth rate
- [ ] EPS growth rate
- [ ] Consistency filter

**Analysis Scores:**
- [ ] CAN SLIM score minimum
- [ ] SPEA score minimum
- [ ] Overall score

**Technical:**
- [ ] 52-week high/low proximity
- [ ] Moving average crossover
- [ ] Volume surge
- [ ] RSI range

**Features:**
- [ ] Save custom screeners
- [ ] Preset screeners (CAN SLIM stocks, Value stocks, Growth stocks)
- [ ] Export results (CSV, Excel)
- [ ] Quick compare selected stocks

**Files:**
- `src/app/screener/page.tsx`
- `src/components/screener/ScreenerFilters.tsx`
- `src/components/screener/ScreenerResults.tsx`
- `src/lib/screener/presets.ts`

#### 4.2 Stock Comparison Tool
**Features:**
- [ ] Side-by-side comparison (up to 4 stocks)
- [ ] Metrics comparison table
- [ ] Visual comparison charts
- [ ] Analysis score comparison
- [ ] Generate comparison report

**Files:**
- `src/app/compare/page.tsx`
- `src/components/compare/ComparisonTable.tsx`
- `src/components/compare/ComparisonCharts.tsx`

#### 4.3 Market Dashboard
**Sections:**
- [ ] Market overview by sector
- [ ] Top gainers/losers by sector
- [ ] Market breadth indicators
- [ ] Sector rotation analysis
- [ ] Market momentum indicators
- [ ] Economic calendar

**Files:**
- `src/app/market/page.tsx`
- `src/components/market/SectorPerformance.tsx`
- `src/components/market/MarketBreadth.tsx`

---

## Phase 5: Professional Features (Weeks 17-20)

### Goal: Institutional-grade analytics

#### 5.1 Advanced Portfolio Analytics
**Metrics:**
- [ ] Total return (1M, 3M, 6M, 1Y, 3Y, 5Y, All)
- [ ] Risk metrics
  - Beta
  - Alpha
  - Sharpe ratio
  - Sortino ratio
  - Maximum drawdown
  - Volatility
- [ ] Portfolio diversification analysis
- [ ] Correlation matrix
- [ ] VaR (Value at Risk)
- [ ] Performance attribution

**Files:**
- `src/lib/analytics/portfolio-analytics.ts`
- `src/components/portfolio/RiskMetrics.tsx`
- `src/components/portfolio/CorrelationMatrix.tsx`

#### 5.2 Backtesting Engine
**Features:**
- [ ] Strategy builder
  - CAN SLIM strategy
  - Value investing strategy
  - Growth investing strategy
  - Custom strategy builder
- [ ] Backtest execution
- [ ] Performance metrics
  - Total return
  - Win rate
  - Profit factor
  - Max drawdown
  - Sharpe ratio
- [ ] Strategy comparison
- [ ] Trade log analysis

**Files:**
- `src/lib/backtesting/engine.ts`
- `src/lib/backtesting/strategies.ts`
- `src/app/backtesting/page.tsx`

#### 5.3 Reporting System
**Reports:**
- [ ] Weekly portfolio summary (email)
- [ ] Stock analysis report (PDF)
- [ ] Watchlist changes report
- [ ] Performance attribution report
- [ ] Custom report builder

**Files:**
- `src/lib/reports/generator.ts`
- `src/app/reports/page.tsx`

#### 5.4 Alert System
**Alert Types:**
- [ ] Price alerts
- [ ] Analysis score alerts
- [ ] Earnings announcements
- [ ] News alerts
- [ ] Technical indicator alerts
- [ ] Portfolio rebalancing alerts

**Delivery:**
- [ ] In-app notifications
- [ ] Email alerts
- [ ] Push notifications (optional)

**Files:**
- `src/lib/alerts/manager.ts`
- `src/components/alerts/AlertCenter.tsx`

---

## Phase 6: Polish & Optimization (Weeks 21-24)

### Goal: Production-ready application

#### 6.1 Performance Optimization
- [ ] Image optimization
- [ ] Code splitting
- [ ] Memoization
- [ ] Virtual scrolling for large lists
- [ ] API response caching
- [ ] Database query optimization
- [ ] Bundle size optimization

#### 6.2 Testing
- [ ] Unit tests (Vitest)
- [ ] Component tests (Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Load testing
- [ ] Security audit

#### 6.3 Deployment
- [ ] CI/CD pipeline setup
- [ ] Staging environment
- [ ] Production deployment (Vercel/AWS)
- [ ] Monitoring setup (Sentry, LogRocket)
- [ ] Error tracking
- [ ] Analytics integration (Google Analytics, Mixpanel)

#### 6.4 Documentation
- [ ] User documentation
- [ ] API documentation
- [ ] Deployment guide
- [ ] Contribution guide

---

## Future Enhancements (Post-MVP)

### AI-Powered Features
- [ ] Sentiment analysis from news/social media
- [ ] ML-based price prediction
- [ ] Pattern recognition
- [ ] Intelligent stock recommendations
- [ ] Chatbot for stock queries

### Advanced Charting
- [ ] Advanced technical indicators
- [ ] Drawing tools
- [ ] Multi-chart layouts
- [ ] Chart pattern recognition

### Social Features
- [ ] Share watchlists
- [ ] Community discussions
- [ ] Follow top investors
- [ ] Copy trading (paper trading)

### Mobile App
- [ ] React Native app
- [ ] Offline mode
- [ ] Push notifications
- [ ] Biometric authentication

### Broker Integration
- [ ] Connect to brokerage accounts
- [ ] Execute trades from app
- [ ] Real-time portfolio sync
- [ ] Order management

---

## Success Metrics

### Technical Metrics
- API response time < 500ms
- Page load time < 2s
- 99.9% uptime
- < 5% error rate

### User Metrics
- User registration conversion > 20%
- Daily active users > 30% of registered
- Average session duration > 10 minutes
- Feature usage distribution balanced

### Business Metrics
- Free tier → Premium conversion > 5%
- Customer retention > 80% after 3 months
- NPS score > 50

---

## Dependencies & Risks

### External Dependencies
- **Financial Data API:** Must have reliable uptime and accurate data
- **Firebase:** Authentication and database reliability
- **Data Providers:** Alpha Vantage, Finnhub, FMP

### Technical Risks
- API rate limiting
- Data accuracy issues
- Scaling challenges
- Security vulnerabilities

### Mitigation Strategies
- Multiple API provider fallbacks
- Comprehensive error handling
- Data validation layer
- Regular security audits
- Monitoring & alerting

---

## Resource Requirements

### Development Team
- 2 Full-stack developers
- 1 Frontend specialist
- 1 Backend specialist
- 1 DevOps engineer (part-time)

### Infrastructure Costs (Monthly)
- Hosting: $50-200
- Database: $50-100 (Firebase Blaze/Pro)
- API subscriptions: $100-500
- CDN & caching: $20-50
- Monitoring: $20-50
- **Total: ~$240-900/month**

### API Cost Comparison
| Provider | Free Tier | Paid Tier | Recommendation |
|----------|-----------|-----------|----------------|
| Alpha Vantage | 25 requests/day | $50-150/month | Good for MVP |
| Financial Modeling Prep | 250 requests/day | $12-79/month | **Best value** |
| Finnhub | 60 requests/min | $60-200/month | Good for real-time |
| Polygon.io | Limited | $99-199/month | Good for US stocks |

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | 3 weeks | Real-time stock data |
| Phase 2 | 5 weeks | CAN SLIM + SPEA scoring |
| Phase 3 | 4 weeks | Auth, Watchlist, Portfolio |
| Phase 4 | 4 weeks | Screener, Comparison |
| Phase 5 | 4 weeks | Analytics, Backtesting |
| Phase 6 | 4 weeks | Optimization, Launch |
| **Total** | **24 weeks** | **Production-ready app** |

### MVP (First 8 weeks)
- Data integration
- CAN SLIM analysis
- Stock detail pages
- Basic watchlist

### Full Product (24 weeks)
- All analysis systems
- Complete portfolio management
- Advanced tools
- Production-ready

---

## Next Steps

1. **Choose data provider** and obtain API key
2. **Set up caching layer** (Redis/Upstash)
3. **Create API integration layer**
4. **Build first analysis system** (CAN SLIM recommended to start)
5. **Deploy MVP** to small group of beta users
6. **Iterate based on feedback**

---

## Investor Wishlist: What I Want to See Next 🎯

_As a retail investor focused on Thai stocks (SET), here's what I need most:_

### 1. Individual Stock Analysis Page 📊
**Priority: HIGHEST**
```
For any stock (e.g., PTT, AOT, KBANK):
- Price chart with moving averages (MA50, MA200)
- Key fundamentals at a glance (P/E, P/BV, ROE, Dividend Yield)
- Valuation: Is it cheap or expensive? (vs historical average, vs sector)
- Financial health check (debt ratio, current ratio)
- Recent news & events
- Compare to peers in same sector
```

### 2. Valuation Tools 💰
**Priority: HIGH**
```
Quick question: "Is this stock fairly priced?"
- Intrinsic value calculator (DCF, Graham Number)
- P/E vs historical (5-year range)
- P/BV vs historical
- Overvalued/Fair/Undervalued indicator
```

### 3. Price Alerts 🔔
**Priority: HIGH**
```
Don't miss opportunities:
- Set target price: "Alert me when PTT < ฿30"
- Set % change: "Alert me when my watchlist drops 5%"
- Email or LINE notifications
```

### 4. Market Sentiment Indicators 📈
**Priority: MEDIUM**
```
- Are investors bullish or bearish today?
- Foreign investor flow trend (7-day, 30-day)
- Sector rotation analysis (money moving where?)
- Top 10 most active stocks
```

### 5. Simple Scoring System ⭐
**Priority: MEDIUM**
```
Quick stock assessment (0-100 score):
- Fundamental score (based on earnings, growth, financial health)
- Valuation score (cheap vs expensive)
- Technical score (trend, momentum)
- Overall: "Buy/Hold/Sell" recommendation
```

### 6. Watchlist & Portfolio 👀
**Priority: MEDIUM**
```
- Save stocks I'm interested in
- Track my holdings
- See daily P&L
- Add notes: "Why I bought this"
```

### 7. Sector Overview 🏭
**Priority: LOW**
```
- Which sectors are hot today?
- Compare sectors: Which is best value?
- Sector rotation: Where is money moving?
```

---

## Recommended Implementation Order (Investor Priority)

### Sprint 1 (Week 1-2): Stock Detail Page ✅
- [ ] Price chart with MA50/MA200
- [ ] Key fundamentals display
- [ ] Peer comparison (same sector)
- [ ] Historical P/E, P/BV chart

### Sprint 2 (Week 3-4): Valuation Tools
- [ ] Intrinsic value calculator
- [ ] Overvalued/Fair/Undervalued indicator
- [ ] DCF model (simplified)

### Sprint 3 (Week 5-6): Alerts & Notifications
- [ ] Price alert system
- [ ] Email notifications
- [ ] Alert center UI

### Sprint 4 (Week 7-8): Scoring System
- [ ] Simplified CAN SLIM (Thai market adapted)
- [ ] Fundamental score calculator
- [ ] Overall rating (Buy/Hold/Sell)

### Sprint 5 (Week 9+): Portfolio & Watchlist
- [ ] Watchlist CRUD
- [ ] Portfolio tracking
- [ ] Performance charts

---

**Last Updated:** January 2026
**Version:** 1.2
**Status:** Phase 1 Complete ✅ | Phase 2 In Progress 🚧
