# miniStock Design Rules & Guidelines

> **Professional Stock Analysis Platform**
> Version: 1.0.0 | Last Updated: January 2026

---

## Table of Contents

1. [Project Identity](#project-identity)
2. [Design Principles](#design-principives)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Components & UI Patterns](#components--ui-patterns)
6. [Layout & Spacing](#layout--spacing)
7. [Data Visualization](#data-visualization)
8. [Animations & Interactions](#animations--interactions)
9. [Accessibility](#accessibility)
10. [Code Style](#code-style)

---

## Project Identity

### Core Vision
`miniStock` is a **professional, institutional-grade** stock analysis platform that empowers investors with data-driven insights through proven methodologies like CAN SLIM and SPEA.

### Brand Personality
| Attribute | Description |
|-----------|-------------|
| **Tone** | Professional, authoritative, trustworthy |
| **Style** | Clean, minimal, data-focused |
| **Feeling** | Confidence, clarity, sophistication |
| **Differentiation** | Institutional tools at retail accessibility |

### Target Users
- **Retail Investors** — Data-driven stock selection
- **Swing Traders** — Technical + fundamental analysis
- **Value Investors** — Fundamental metrics, intrinsic value

---

## Design Principles

### 1. Professional & Minimal Interface
```
Avoid:    Decorative elements, excessive colors, cartoonish styles
Prefer:   Clean lines, purposeful design, white space
```

### 2. High Contrast for Readability
```
Minimum:  WCAG AA (4.5:1 for normal text)
Target:   WCAG AAA (7:1 for important data)
```

### 3. Data-First Design
```
Priority:  Data clarity > decoration
Focus:     Numbers, charts, trends stand out
```

### 4. Subtle, Purposeful Animations
```
Use Framer Motion for:
- Page transitions (fade, slide)
- Card hover effects (scale, shadow)
- Loading states (pulse, skeleton)
```

### 5. Server Components by Default
```
Use Server Components unless:
- User interaction required
- Real-time updates needed
- Browser APIs required
```

---

## Color System

### Primary Colors

| Color | Tailwind Class | Hex | Usage |
|-------|----------------|-----|-------|
| **Navy Blue** | `bg-[#1e3a5f]` | `#1e3a5f` | Primary brand, headers, accents |
| **Black** | `bg-gray-900` | `#111827` | Text, primary actions |
| **Gray** | `bg-gray-500` | `#6b7280` | Secondary text, borders |
| **White** | `bg-white` | `#ffffff` | Backgrounds, cards |

### Status Colors

| Status | Tailwind Class | Hex | Usage |
|--------|----------------|-----|-------|
| **Success** | `text-green-600` | `#16a34a` | Positive changes, gains, buy |
| **Danger** | `text-red-600` | `#dc2626` | Negative changes, losses, sell |
| **Warning** | `text-yellow-500` | `#eab308` | Alerts, caution, watch |
| **Neutral** | `text-gray-600` | `#4b5563` | Informational, pending |

### Background Colors

| Purpose | Tailwind Class | Hex |
|---------|----------------|-----|
| **Page Background** | `bg-gray-50` | `#f9fafb` |
| **Card Background** | `bg-white` | `#ffffff` |
| **Hover State** | `bg-gray-100` | `#f3f4f6` |
| **Border** | `border-gray-200` | `#e5e7eb` |

### Semantic Color Mapping

```typescript
// Market Sentiment
positive → green-600  // Price up, gains
negative → red-600    // Price down, losses
neutral  → gray-600   // No change

// Data Quality
high     → green-600  // Strong metrics
medium   → yellow-500 // Moderate metrics
low      → red-600    // Weak metrics

// User Actions
primary  → [1e3a5f]   // Main CTA
secondary → gray-600  // Secondary actions
danger   → red-600    // Destructive actions
```

---

## Typography

### Font Family
```css
/* System font stack for performance */
font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
             "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### Type Scale

| Size | Tailwind Class | Usage |
|------|----------------|-------|
| **XL** | `text-2xl` | Page titles |
| **LG** | `text-xl` | Section headers |
| **MD** | `text-lg` | Card titles |
| **Base** | `text-base` | Body text |
| **SM** | `text-sm` | Secondary text, labels |
| **XS** | `text-xs` | Captions, metadata |

### Font Weights

| Weight | Tailwind Class | Usage |
|--------|----------------|-------|
| **Bold** | `font-bold` | Numbers, emphasis, titles |
| **Semibold** | `font-semibold` | Headers, labels |
| **Medium** | `font-medium` | Key data points |
| **Normal** | `font-normal` | Body text |

### Typography Rules

```typescript
// DO
<h1 className="text-2xl font-bold text-gray-900">
<p className="text-base text-gray-600">
<span className="text-sm text-gray-500">

// DON'T
<h1 className="text-purple-600 font-extrabold italic">
<p className="text-xs text-gray-400 leading-none">
```

---

## Components & UI Patterns

### Card Component

```typescript
// Standard Card Structure
<Card title="Title" subtitle="Optional subtitle">
  {/* Content */}
</Card>

// Visual Rules:
// - White background
// - Rounded-lg (8px)
// - Subtle border (gray-200)
// - Optional shadow on hover
```

### Buttons

| Type | Tailwind Classes | Usage |
|------|------------------|-------|
| **Primary** | `bg-[#1e3a5f] text-white px-4 py-2 rounded` | Main actions |
| **Secondary** | `bg-gray-100 text-gray-700 px-4 py-2 rounded` | Secondary actions |
| **Danger** | `bg-red-600 text-white px-4 py-2 rounded` | Destructive |
| **Ghost** | `text-gray-600 hover:bg-gray-100 px-4 py-2 rounded` | Minimal |

### Status Badge

```typescript
// Status Badge Pattern
<StatusBadge status="success">Label</StatusBadge>

// Status Types:
// - success → green bg, green text
// - warning → yellow bg, yellow text
// - danger  → red bg, red text
// - neutral → gray bg, gray text
```

### Data Tables

```typescript
// Table Rules:
// - Minimal borders (bottom only)
// - Zebra striping optional
// - Right-align numbers
// - Left-align text
// - Sort indicators for sortable columns
// - Hover row highlight
```

---

## Layout & Spacing

### Container Widths

```typescript
// Page Container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

// Card Container (default)
<div className="p-6">

// Compact Card
<div className="p-4">
```

### Grid Systems

```typescript
// Responsive Grid
// 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// Dashboard Split
// 1 column → 2 columns (lg breakpoint)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
```

### Spacing Scale

| Size | Tailwind | Usage |
|------|----------|-------|
| **XS** | `gap-2` | Tight spacing, related items |
| **SM** | `gap-4` | Default spacing, card grid |
| **MD** | `gap-6` | Section separation |
| **LG** | `gap-8` | Major sections |
| **XL** | `py-8` | Page padding |

---

## Data Visualization

### Number Formatting Standards (Thai Market Convention)

> **Always use format utilities from `@/lib/format.ts`**

#### Currency Formatting

```typescript
import { formatCurrency, formatTradingValueMn, formatBahtFull } from '@/lib/format';

// Trading Value (most common)
formatTradingValueMn(5234567890)  → "฿5,234.67Mn"  // Thai convention

// Currency (short)
formatCurrency(1234.56)      → "฿1,234.56"
formatCurrency(1.23e9)      → "฿1.23B"
formatCurrency(1.23e6)      → "฿1.23M"

// Currency (full notation)
formatBahtFull(5234567890)  → "฿5.23Bn"
formatBahtFull(123456789)   → "฿123.46Mn"
```

#### Volume & Quantity

```typescript
import { formatVolume, formatLots } from '@/lib/format';

// Volume (shares/lots)
formatVolume(1500000)       → "1.5M"
formatVolume(1500000000)    → "1.5B"

// Lots (1 lot = 100 shares)
formatLots(150000)          → "1.5K lots"

// Large numbers
formatNumber(1500000)       → "1.5M"
formatNumber(1500000000)    → "1.5B"
```

#### Percentage Formatting

```typescript
import { formatPercent, formatPercentAbs, formatYield } from '@/lib/format';

// Change (with sign)
formatPercent(5.23)         → "+5.23%"
formatPercent(-2.15)        → "-2.15%"

// Absolute percentage (for labels)
formatPercentAbs(5.23)      → "5.23%"

// Yield (dividend yield, interest rate)
formatYield(3.5)            → "3.50%"
```

#### Index & Market Metrics

```typescript
import { formatIndex, formatMarketCap, formatPERatio } from '@/lib/format';

// Index points
formatIndex(1342.58)        → "1,342.58"
formatIndex(458.23, 0)      → "458"

// Market Cap
formatMarketCap(1.5e12)     → "฿1,500.0B"  (or "฿1.5T" for very large)
formatMarketCap(1.5e9)      → "฿1.5B"
formatMarketCap(250e6)      → "฿250.0M"

// P/E Ratio
formatPERatio(15.23)        → "15.2x"
formatPERatio(-5)           → "-"
formatPERatio(null)         → "N/A"
```

#### Color Coding

```typescript
import { getChangeColor, getChangeBgColor, getValueColor } from '@/lib/format';

// Change color
getChangeColor(5.23)        → "text-green-600"
getChangeColor(-2.15)       → "text-red-600"
getChangeColor(0)           → "text-gray-600"

// Change background
getChangeBgColor(5.23)      → "bg-green-50"
getChangeBgColor(-2.15)     → "bg-red-50"

// Value color (for ROE, margin, etc.)
getValueColor(18, { good: 15 })              → "text-green-600"
getValueColor(10, { good: 15, warning: 5 })  → "text-yellow-600"
getValueColor(3, { good: 15, warning: 5 })   → "text-red-600"
```

#### Formatting Rules Summary

| Data Type | Function | Example | When to Use |
|-----------|----------|---------|-------------|
| **Trading Value** | `formatTradingValueMn()` | `฿5,234.67Mn` | SETTRADE, turnover |
| **Currency (short)** | `formatCurrency()` | `฿1.23B` | Market cap, large amounts |
| **Volume** | `formatVolume()` | `1.5M` | Trading volume |
| **Percentage** | `formatPercent()` | `+5.23%` | Price changes |
| **Index** | `formatIndex()` | `1,342.58` | SET, S&P 500 |
| **P/E Ratio** | `formatPERatio()` | `15.2x` | Valuation metrics |

### Color Coding Numbers

```typescript
// Change Indicators
value > 0  → green-600 (+%)
value < 0  → red-600 (-%)
value = 0  → gray-600

// Threshold-based
score >= 80    → green (Excellent)
score >= 65    → lime (Good)
score >= 50    → yellow (Fair)
score >= 35    → orange (Weak)
score < 35     → red (Poor)
```

### Charts

```typescript
// Chart Guidelines:
// - Line charts for trends
// - Bar charts for comparisons
// - Pie charts for distribution (avoid if >5 categories)
// - Radar charts for multi-dimensional analysis (SPEA)
// - Always include legends
// - Use brand colors
// - Minimal grid lines
```

---

## Animations & Interactions

### Animation Principles

```typescript
// DO — Subtle, smooth animations
<FramerMotion initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>

// DON'T — Jarring, excessive animations
<FramerMotion initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 1 }}>
```

### Standard Transitions

| Scenario | Duration | Easing |
|----------|----------|--------|
| **Page load** | 200ms | ease-out |
| **Hover** | 150ms | ease-in-out |
| **Modal** | 200ms | ease-out |
| **Loading** | 1000ms | linear (pulse) |

### Loading States

```typescript
// Skeleton Pattern
<div className="animate-pulse space-y-4">
  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
  <div className="h-64 bg-gray-200 rounded"></div>
</div>
```

---

## Accessibility

### WCAG Compliance

```typescript
// Color Contrast
// Minimum 4.5:1 for normal text
// Minimum 3:1 for large text (18pt+)
// Minimum 3:1 for UI components

// Focus States
<button className="focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]">
```

### Screen Reader Support

```typescript
// Use semantic HTML
<nav>, <main>, <section>, <article>, <aside>

// ARIA labels where needed
<button aria-label="Add to watchlist">
<div role="status" aria-live="polite">
```

### Keyboard Navigation

```typescript
// All interactive elements must be:
// - Reachable via Tab
// - Activatable via Enter/Space
// - Have visible focus indicator
```

---

## Code Style

### File Naming

```
Components:    PascalCase  →  MarketIndexCard.tsx
Utilities:     camelCase   →  formatNumber.ts
Types:         camelCase   →  marketTypes.ts
Hooks:         camelCase   →  useStockData.ts
```

### Component Structure

```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Helper functions (formatting, calculations)
// 4. Component definition
// 5. Export

'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';

interface Props { /* ... */ }

function formatNumber(num: number): string { /* ... */ }

export default function Component({ props }: Props) {
  return <div>...</div>;
}
```

### TypeScript Rules

```typescript
// ALWAYS define types for props
interface CardProps {
  title: string;
  value: number;
  onChange?: (value: number) => void;
}

// Use shared types from /types
import type { Quote } from '@/types/market';

// Avoid 'any' — use 'unknown' if type is truly unknown
```

### Import Order

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { NextRequest } from 'next/server';

// 2. Third-party libraries
import { motion } from 'framer-motion';

// 3. Local imports (aliased)
import Card from '@/components/ui/Card';
import type { Quote } from '@/types/market';

// 4. Relative imports (avoid — use @/ alias)
// import { utils } from '../../../lib/utils';  // DON'T
```

---

## Quick Reference

### Common Patterns

```typescript
// Page Header
<div className="mb-8">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <p className="text-gray-500 mt-1">Subtitle</p>
</div>

// Metric Display
<div>
  <p className="text-sm text-gray-500">Label</p>
  <p className="text-xl font-bold text-gray-900">Value</p>
  <p className="text-sm text-green-600 mt-1">+5.23%</p>
</div>

// Loading Skeleton
<div className="animate-pulse h-64 bg-gray-200 rounded"></div>

// Error Message
<div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
  Error message here
</div>
```

---

## Enforcement

### Linting
```bash
npm run lint  # ESLint for code quality
```

### Pre-commit Checklist
- [ ] Colors match design system
- [ ] Typography follows scale
- [ ] Components are reusable
- [ ] Accessibility requirements met
- [ ] TypeScript types defined
- [ ] No console.log statements

---

**Remember:** Every design decision should serve clarity and professionalism. When in doubt, keep it simple and data-focused.

---

*This document is a living guide. Update as the design system evolves.*
