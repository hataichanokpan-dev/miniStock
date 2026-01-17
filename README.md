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
| **Data APIs** | Alpha Vantage, Financial Modeling Prep, Finnhub |

## Project Status

### MVP Foundation (Complete)
- Next.js 15 project with App Router
- TypeScript configuration
- TailwindCSS design system
- Firebase configuration
- Core UI components (Header, Sidebar, Cards)
- Type definitions for stocks, portfolio, watchlist
- Responsive dashboard layout
- API routes for stock data and market information

### In Progress
- Real-time stock data integration
- User authentication
- Financial metrics display

## Project Structure

```
miniStock/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── market/        # Market indices & scanner
│   │   │   └── stock/[symbol]/# Stock data endpoints
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard page
│   ├── components/
│   │   ├── layout/            # Layout components (Header, Sidebar)
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── api/               # Data layer (quotes, fundamentals, cache)
│   │   ├── firebase.ts        # Firebase config
│   │   └── types.ts           # Shared types
│   └── types/                 # TypeScript type definitions
│       ├── analysis.ts        # Analysis scoring types
│       ├── financials.ts      # Financial statement types
│       └── market.ts          # Market data types
├── public/                    # Static assets
├── ROADMAP.md                 # Detailed project roadmap
└── package.json
```

## Key Features

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
- Real-time stock quotes and price charts
- Financial statements (Income Statement, Balance Sheet, Cash Flow)
- Watchlist with custom notes and price alerts
- Portfolio management with performance analytics
- Stock screener with advanced filters
- Multi-stock comparison tool (up to 4 stocks)
- Market dashboard with sector analysis

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

| Provider | Free Tier | Paid Tier | Recommendation |
|----------|-----------|-----------|----------------|
| Alpha Vantage | 25 requests/day | $50-150/month | Good for MVP |
| Financial Modeling Prep | 250 requests/day | $12-79/month | Best value |
| Finnhub | 60 requests/min | $60-200/month | Good for real-time |

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
- Data providers: Alpha Vantage, Financial Modeling Prep, Finnhub

---

**Version:** 0.1.0
**Status:** Foundation Complete - Ready for Phase 1
