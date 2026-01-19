# miniStock

A professional stock analysis platform built with proven investment methodologies like CAN SLIM, SPEA, and fundamental analysis to help investors make data-driven decisions.

## Vision

miniStock empowers retail investors, swing traders, and value investors with institutional-grade analysis tools. By combining real-time market data with time-tested investment frameworks, we provide actionable insights for smarter stock selection.

### Target Users
- Retail investors seeking data-driven stock selection
- Swing traders looking for technical and fundamental analysis
- Value investors focused on fundamental metrics and intrinsic value

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS |
| **Backend** | Firebase (Authentication & Realtime Database) |
| **Animations** | Framer Motion |
| **Data APIs** | Yahoo Finance (Primary - FREE), SETTRADE (via Firebase) |

## Project Status

### Phase 1: Data Layer Foundation ✅ COMPLETE
- ✅ Yahoo Finance API v3 integration (no API key required)
- ✅ Real-time stock quotes and historical data
- ✅ Market indices data (US & Thailand)
- ✅ SETTRADE Thailand market data integration
- ✅ Firebase Realtime Database setup
- ✅ Core UI components (Header, Sidebar, Cards)
- ✅ Dashboard with live market data
- ✅ API routes for all endpoints

### Phase 2: Analysis Systems (In Progress)
- 📋 CAN SLIM scoring system
- 📋 SPEA framework implementation
- 📋 Analysis score display components

### Phase 3: User Features (Planned)
- 📋 User authentication (Firebase Auth)
- 📋 Watchlist management
- 📋 Portfolio tracking

## Project Structure

```
miniStock/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── api/                     # API routes
│   │   │   ├── market/              # Market indices & scanner
│   │   │   ├── settrade/            # ✅ SETTRADE data endpoints
│   │   │   │   ├── industry-sector/
│   │   │   │   └── investor-type/
│   │   │   └── stock/[symbol]/      # Stock data endpoints
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # ✅ Dashboard page
│   │   ├── market/                  # ✅ Market overview page
│   │   └── stocks/                  # Stock listing & detail pages
│   ├── components/
│   │   ├── layout/                  # Layout components (Header, Sidebar)
│   │   ├── ui/                      # Reusable UI components
│   │   ├── settrade/                # ✅ SETTRADE components
│   │   │   ├── IndustrySectorCard.tsx
│   │   │   └── InvestorTypeCard.tsx
│   │   ├── charts/                  # Chart components
│   │   └── analysis/                # 📋 Analysis components (Phase 2)
│   ├── lib/
│   │   ├── api/                     # Data layer
│   │   │   ├── yahoo-finance.ts     # ✅ Yahoo Finance integration
│   │   │   ├── quotes.ts            # Quote fetching
│   │   │   ├── fundamentals.ts      # Fundamental data
│   │   │   ├── statements.ts        # Financial statements
│   │   │   ├── cache.ts             # Caching layer
│   │   │   └── stock-api.ts         # API validation
│   │   ├── firebase/                # ✅ Firebase services
│   │   │   └── settrade.ts          # SETTRADE data service
│   │   ├── firebase.ts              # Firebase config
│   │   └── types.ts                 # Shared types
│   └── types/                       # TypeScript type definitions
│       ├── analysis.ts              # 📋 Analysis scoring types
│       ├── financials.ts            # Financial statement types
│       ├── market.ts                # Market data types
│       └── settrade.ts              # ✅ SETTRADE types
├── public/                          # Static assets
├── DESIGN_RULES.md                  # ✅ Design system guidelines
├── PROJECT_STATUS.md                # ✅ Current project status
├── IMPLEMENTATION_GUIDE.md          # 📋 Implementation guide
├── ROADMAP.md                       # Detailed project roadmap
└── package.json
```

## Key Features

### Thailand Market Data ✅
- **Industry Sector Performance Tracking**
  - Real-time sector performance (Energy, Banking, Technology, etc.)
  - Top gaining and losing sectors
  - Trading volume and value per sector
- **Investor Type Analysis**
  - 🌍 Foreign investors buy/sell flow
  - 👤 Local Individual investors
  - 🏢 Local Institutions
  - 📊 Proprietary Trading
  - Net flow visualization with buy/sell ratios
- **Market Breadth Indicators**
  - Advancing vs declining stocks
  - Total trading volume and value

### Analysis Systems
- **CAN SLIM Analysis:** Growth stock evaluation based on William O'Neil's methodology
  - Current Quarterly Earnings, Annual Earnings Growth
  - New Products/Management, Supply & Demand
  - Leader vs Laggard, Institutional Sponsorship, Market Direction

- **SPEA Framework:** Comprehensive 4-quadrant analysis
  - Strategic Position (25%): Industry position, competitive advantage
  - Financial Health (30%): Debt ratios, Altman Z-Score
  - Earnings Quality (25%): Consistency, cash flow quality
  - Attractive Valuation (20%): P/E, P/B, DCF intrinsic value

- **Value Investing Metrics:** Graham Number, Piotroski F-Score, Margin of Safety
- **Growth Metrics:** Revenue/EPS CAGR, ROE trends, Consistency scoring
- **Quality Metrics:** Margin trends, FCF conversion, Capital allocation

### Core Features
- ✅ Real-time stock quotes (US & Thailand markets)
- ✅ Market indices tracking (S&P 500, SET, NASDAQ, etc.)
- ✅ Top gainers and losers
- ✅ Historical price data with charts
- ✅ Company profiles and fundamentals
- 📋 Watchlist with custom notes and price alerts
- 📋 Portfolio management with performance analytics
- 📋 Stock screener with advanced filters
- 📋 Multi-stock comparison tool (up to 4 stocks)

### Advanced Features (Planned)
- Portfolio risk metrics (Alpha, Beta, Sharpe ratio, Sortino ratio)
- Backtesting engine for investment strategies
- Custom report generation (PDF export)
- Price and analysis score alerts (email/push)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/miniStock.git
cd miniStock
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Financial Data APIs (choose one or more)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
FINANCIAL_MODELING_PREP_API_KEY=your_fmp_key
FINNHUB_API_KEY=your_finnhub_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password, Google OAuth)
3. Enable Realtime Database
4. Set up database rules for development:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

For production, implement proper user-based security rules.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard (Settings → Environment Variables)
4. Deploy - Vercel will automatically deploy on push to main branch

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Development Roadmap

See [ROADMAP.md](./ROADMAP.md) for detailed planning.

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1 | 3 weeks | Real-time stock data, API integration |
| Phase 2 | 5 weeks | CAN SLIM + SPEA scoring systems |
| Phase 3 | 4 weeks | Auth, Watchlist, Portfolio management |
| Phase 4 | 4 weeks | Stock screener, Comparison tools |
| Phase 5 | 4 weeks | Portfolio analytics, Backtesting |
| Phase 6 | 4 weeks | Optimization, Production launch |
| **Total** | **24 weeks** | **Production-ready application** |

## Design System

### Color Palette
- **Primary:** Gray, Black, Navy Blue, Red
- **Status:** Yellow (warning), Red (danger), Green (success)
- Clean typography with clear hierarchy

### Design Principles
- Professional and minimal interface
- High contrast for readability
- Subtle animations (Framer Motion)
- Server Components by default (Next.js App Router)

## API Cost Comparison

| Provider | Free Tier | Status |
|----------|-----------|--------|
| **Yahoo Finance** | **Unlimited (No API key)** | ✅ **Active (Primary)** |
| SETTRADE | Via Firebase | ✅ Active (Thai market) |
| Alpha Vantage | 25 requests/day | Backup option |
| Financial Modeling Prep | 250 requests/day | Backup option |
| Finnhub | 60 requests/min | Backup option |

> **Note:** Yahoo Finance requires no API key and works excellently for US stocks. Thai stocks have limited data on Yahoo Finance, so SETTRADE via Firebase is used for Thailand market data.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- CAN SLIM methodology inspired by William O'Neil's Investor's Business Daily
- Built with [Next.js](https://nextjs.org/)
- Data providers: Yahoo Finance, SETTRADE

---

**Version:** 0.2.0
**Status:** Phase 1 Complete ✅ - Yahoo Finance + SETTRADE Integration Working
**Last Updated:** January 19, 2026
