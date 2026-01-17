# ministock

A professional stock analysis web application for investors, focused on Thailand (SET/MAI) markets with support for US, Hong Kong, and China markets.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Firebase Realtime Database
- **Animations**: Framer Motion (minimal)

## Features (MVP)

- Market overview dashboard with real-time indices
- Top gainers/losers for Thailand market
- Stock search and basic information
- Personal watchlist (persisted in Firebase)
- Portfolio tracker (persisted in Firebase)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd ministock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:

   a. Create a Firebase project at [firebase.google.com](https://console.firebase.google.com/)

   b. Enable Realtime Database in your Firebase console

   c. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

   d. Fill in your Firebase credentials from Project Settings:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

   e. (Optional) Add API keys for stock data sources:
   ```env
   ALPHA_VANTAGE_API_KEY=your_key
   FINNHUB_API_KEY=your_key
   ```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

1. Push your code to GitHub

2. Import your project in [Vercel](https://vercel.com)

3. Add environment variables in Vercel dashboard:
   - Go to Settings → Environment Variables
   - Add all Firebase config variables from `.env.local`

4. Deploy!
   - Vercel will automatically deploy on push to main branch
   - Or click "Deploy" manually

### Firebase Database Rules

For development, set your Firebase Realtime Database rules to:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

For production, implement proper user-based security rules.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── globals.css     # Global styles + Tailwind
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Dashboard page
├── components/
│   ├── layout/         # Header, Sidebar, etc.
│   └── ui/             # Reusable UI components
├── lib/
│   ├── firebase.ts     # Firebase initialization
│   └── types.ts        # TypeScript type definitions
└── styles/             # Additional styles if needed
```

## Design System

### Color Palette

- **Primary**: Gray, Black, Navy Blue, Red
- **Status**: Yellow (warning), Red (danger), Green (success)
- **Clean typography** with clear hierarchy

### Principles

- Professional and minimal
- High contrast for readability
- Subtle animations only (Framer Motion)
- Server Components by default

## Build Commands

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
