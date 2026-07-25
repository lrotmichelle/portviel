# PortVille — AI Memory

> **Project**: `buyercard` (PortVille Market)
> **Generated**: 2026-07-08
> **Purpose**: Full project context for AI assistants to resume work without re-analysis.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Name** | PortVille Market |
| **Repo dir** | `/Users/mukisa/Desktop/buyercard` |
| **Framework** | Next.js 16.2.9 (App Router) |
| **React** | 19.2.4 |
| **Language** | TypeScript 5.x (strict mode) |
| **Styling** | Tailwind CSS v4 (PostCSS plugin `@tailwindcss/postcss`) |
| **UI Primitives** | Radix UI (popover, dropdown-menu, navigation-menu, slot) |
| **Component Variants** | `class-variance-authority` (CVA) |
| **Class Merging** | `clsx` + `tailwind-merge` → `cn()` helper |
| **Icons** | `lucide-react` |
| **Package Manager** | npm (lockfile v3) |
| **Dev Server** | `next dev -H 0.0.0.0` (LAN accessible) |
| **Allowed Dev Origins** | `192.168.1.122` (in `next.config.ts`) |

---

## 2. Design Language & Theme

- **Dark-first**: Cards use `bg-black`, `border-zinc-800`, `text-white` palette.
- **Light mode**: Layout uses `bg-neutral-50` / `bg-white` with `dark:` variants.
- **Card Radius**: Large rounded — `rounded-[28px]` for primary cards, `rounded-2xl` for secondary.
- **Typography**: System font stack (`Arial, Helvetica, sans-serif` via `globals.css`). Tailwind font tokens `--font-geist-sans` / `--font-geist-mono` configured but body overrides to Arial.
- **Micro-typography**: Extensive use of `text-[9px]`, `text-[10px]`, `text-[11px]` with `font-black uppercase tracking-wider` for label styling.
- **Action Color System**:
  - 🟢 **Emerald** → Accept / Positive / Pay
  - 🟡 **Amber** → Counter / Warning / Highlight
  - 🔴 **Red** → Decline / Error / Destructive
  - 🟣 **Purple** → Payment method accent
- **Glassmorphism**: Navbar uses `backdrop-blur-xl`, `bg-white/70`, `dark:bg-neutral-950/70`.
- **Animations**: `animate-in`, `slide-in-from-top-4`, `fade-in`, `active:scale-[0.97]` micro-interactions.

---

## 3. Directory Structure

```
buyercard/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (Navbar + Footer shell)
│   │   ├── page.tsx                # Home → Profile dashboard (Sidebar + Transactions + Analytics)
│   │   ├── globals.css             # Tailwind v4 import + CSS custom properties
│   │   ├── campaign.tsx            # Legacy mobile campaign page (NOT a route, orphaned file)
│   │   ├── discover.tsx            # Empty file (unused)
│   │   ├── campaign/page.tsx       # Campaign listing page with search, filters, sorting
│   │   ├── cart/page.tsx           # Buyer's cart with BuyerCard components
│   │   ├── discover/page.tsx       # Discover page (placeholder cards)
│   │   ├── market/page.tsx         # Seller marketplace with SalesCard grid
│   │   ├── offers/page.tsx         # Buyer's received offers (from sellers)
│   │   ├── orders/page.tsx         # Seller's received orders (from buyers)
│   │   └── profile/page.tsx        # Profile page (placeholder cards)
│   │
│   ├── components/
│   │   ├── buyer-card/             # Buyer perspective card (negotiation flow)
│   │   │   ├── index.tsx           # Main orchestrator (counter form, payment panel, state machine)
│   │   │   ├── header.tsx          # Seller info, price display, counter status
│   │   │   ├── content.tsx         # Metrics grid (ER, VL ratios, followers, value)
│   │   │   ├── sentiment.tsx       # Sentiment rate bar
│   │   │   └── footer.tsx          # Decline / Counter / Accept action buttons
│   │   │
│   │   ├── sales-card/             # Seller perspective card (market listing)
│   │   │   ├── index.tsx           # Main orchestrator (counter offers, costly votes)
│   │   │   ├── header.tsx          # Seller profile, verification, offer count, timing
│   │   │   ├── content.tsx         # Product details, metrics, price display
│   │   │   ├── sentiment.tsx       # Costly vote sentiment bar
│   │   │   └── footer.tsx          # Buy / Counter / Costly action buttons
│   │   │
│   │   ├── campaign-card/          # Campaign pool card
│   │   │   ├── index.tsx           # Main orchestrator (join/exit, paused state)
│   │   │   ├── header.tsx          # Publisher info, rating, time remaining
│   │   │   ├── content.tsx         # Description, niche, community stats
│   │   │   ├── budget-sentiment.tsx # Budget usage bar
│   │   │   └── footer.tsx          # Join/Exit action buttons
│   │   │
│   │   ├── profile-card/           # Profile dashboard components
│   │   │   ├── index.tsx           # Generic card shell (title, description, children)
│   │   │   ├── sidebar.tsx         # User info, activity counts, financial stats
│   │   │   ├── transactions.tsx    # Placeholder
│   │   │   └── analytics.tsx       # Placeholder
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx          # Sticky top navbar (PortVille brand, nav links, notification/cart badges)
│   │   │   └── Footer.tsx          # Site footer (brand, social links, contact info)
│   │   │
│   │   └── ui/                     # Reusable design-system primitives
│   │       ├── button.tsx          # CVA-powered Button with variants (shadcn-style)
│   │       ├── badge.tsx           # Badge component
│   │       └── popover.tsx         # Radix Popover wrapper
│   │
│   ├── types/                      # Centralized TypeScript interfaces
│   │   ├── index.ts                # Barrel re-exports
│   │   ├── buyer-card.ts           # BuyerCardData interface
│   │   ├── sales-card.ts           # SalesCardData interface
│   │   ├── campaign-card.ts        # CampaignCardData interface
│   │   └── order.ts                # Order, Offer, OrderType, OrderStatus, OfferType, OfferStatus
│   │
│   ├── lib/
│   │   ├── utils.ts                # cn() class merging helper
│   │   ├── currency.ts             # formatToUGX() — formats raw shillings to compact "Xm" format
│   │   └── mocks/
│   │       ├── buyer-card.ts       # generateMockData() → BuyerCardData
│   │       └── sales-card.ts       # generateFiveMockCards() → SalesCardData[] (3 cards)
│   │
│   ├── hooks/                      # Custom hooks (empty — future use)
│   └── constants/                  # Constants (empty — future use)
│
├── utils/
│   └── utils.ts                    # Duplicate cn() helper (legacy, same as src/lib/utils.ts)
│
├── public/                         # Static assets
├── package.json
├── tsconfig.json                   # Path alias: @/* → ./src/*
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── AGENTS.md
├── plan.cmd
├── campaignplan.md
└── CLAUDE.md
```

---

## 4. Type System

### 4.1 BuyerCardData
```typescript
interface BuyerCardData {
  id: string;
  title: string;
  description: string;
  handle: string;
  followers: string;         // Display format: "45K"
  value: string;             // Display format: "$12.4K"
  sellerName: string;
  sellerUsername: string;
  productPrice: string;      // Display format: "$1,200"
  buyerOriginalOffer: string;// Display format: "$950"
  sellerCounterOffer: string;// Display format: "$1,100"
  isCountered: boolean;
  erCurrentRatio: number;    // Engagement Rate current (integer 2–14)
  erPreviousRatio: number;   // Engagement Rate previous (integer 2–14)
  vlCurrentRatio: number;    // Value/Likes current (integer 5–25)
  vlPreviousRatio: number;   // Value/Likes previous (integer 5–25)
  likes: string;             // Display format: "8.4K"
  sentimentRate: number;     // 0–100 percentage
}
```

### 4.2 SalesCardData
```typescript
interface SalesCardData {
  id: string;
  sellerName: string;
  sellerUsername: string;
  sellerAvatar?: string;
  productPriceRaw: number;   // Raw UGX shillings (e.g., 20000000 → "20m")
  description: string;
  handle: string;
  followers: string;
  valueRaw: number;          // Raw UGX shillings
  erCurrentRatio: number;
  erPreviousRatio: number;
  likes: string;
  vlCurrentRatio: number;
  vlPreviousRatio: number;
  sentimentRate: number;
  sellerBuys: number;        // Total buyer transactions count
  sellerSells: number;       // Total seller transactions count
  sellerStars: number;       // Rating (e.g., 4.9)
  isAdminVerified: boolean;  // Platform verification badge
  createdAt: string;         // ISO timestamp
  offersCount: number;       // Current number of offers (max 12)
}
```

### 4.3 CampaignCardData
```typescript
interface CampaignCardData {
  id: string;
  publisherProfileIcon: string;
  projectName: string;
  publisherUsername: string;
  publisherRating: number;
  timeRemainingDays: number;
  nicheHashtag: string;      // Comma-separated tags
  description: string;
  category: string;          // Lifestyle | Gaming | Technology | etc.
  status: string;            // "Active" | "Paused"
  communitySize: number;
  viewsGenerated: number;
  likesGenerated: number;
  totalBudget: number;
  budgetUsed: number;
  highestMcp: number;        // Highest MCP (Max Cost Per creator)
  hasJoined: boolean;
}
```

### 4.4 Order & Offer System
```typescript
type OrderType = 'buy' | 'counter';
type OrderStatus = 'pending' | 'accepted' | 'countered' | 'completed';

interface Order {
  id: string;              // "order-{timestamp}"
  type: OrderType;
  cardId: string;
  buyerId: string;
  buyerName: string;
  productPriceRaw: number;
  offeredPrice?: number;   // For counter orders only
  description: string;
  sellerName: string;
  createdAt: string;       // ISO timestamp
  status: OrderStatus;
}

type OfferType = 'accept' | 'counter';
type OfferStatus = 'sent' | 'received' | 'completed' | 'accepted' | 'countered' | 'declined';

interface Offer {
  id: string;              // "offer-{timestamp}"
  orderId: string;         // Links back to parent Order
  type: OfferType;
  responsePrice?: number;  // For counter offers only
  createdAt: string;
  status: OfferStatus;
  fromSeller: boolean;
  sellerName: string;
  buyerName: string;
}
```

---

## 5. Business Logic & Data Flow

### 5.1 Negotiation Flow (Buyer → Seller → Buyer)

```
BUYER browses /market (SalesCards)
  ├─ "Buy" → creates Order(type='buy', status='pending')
  └─ "Counter" → creates Order(type='counter', offeredPrice=X, status='pending')
          ↓
SELLER views /orders (pending Orders)
  ├─ "Accept" → creates Offer(type='accept', status='sent'), Order.status='accepted'
  ├─ "Counter" → creates Offer(type='counter', responsePrice=Y, status='sent'), Order.status='countered'
  └─ "Decline" → no-op (UI only)
          ↓
BUYER views /offers (sent Offers from sellers)
  ├─ "Accept" → Offer.status='accepted', Order.status='completed'
  ├─ "Counter" → creates new Order(type='counter'), Offer.status='countered'
  └─ "Decline" → Offer.status='declined'
```

### 5.2 State Persistence
- **All orders/offers** are persisted in `localStorage` keys: `'orders'`, `'offers'`.
- On page load, each page reads from localStorage with `JSON.parse` and updates on every state change.
- No backend/API exists — the app is fully client-side with mock data.

### 5.3 BuyerCard State Machine
The BuyerCard (in `/cart`) has an internal state machine for negotiation:
- **Statuses**: `undefined` → `'Pending'` | `'Overpayment'` | `'Processing'` | `'Processing...'` | `'Lapsed'` | `'Finalized'`
- **Counter Rules** (tiered minimum floor):
  - Counter #1: Minimum 40% of base price
  - Counter #2: Minimum 25% of seller's counter
  - Counter #3+: Minimum 10% of seller's counter
- **Overpayment Detection**: Warns when buyer's offer exceeds the current target price.
- **Payment Flow**: Accept → "Processing" → 4s verification timer → "Finalized"
- **Inactive States**: `'Lapsed'` (declined) and `'Finalized'` (completed) dim the card with `opacity-70 grayscale-[0.25]`.

### 5.4 SalesCard Rules
- Max 12 offers per card (`offersCount >= 12` → "maxed" / hidden from market)
- Max 2 counter attempts per buyer
- Counter price bounded: `minPrice = productPriceRaw * 0.6`, `maxPrice = productPriceRaw * 1.5`
- "Costly" vote: Each user gets one vote, capped at 100 total
- Currency: Displayed via `formatToUGX()` — e.g., `20000000` → `"20m"`, `205000` → `"0.205m"`

### 5.5 Campaign Rules
- Campaigns have `'Active'` or `'Paused'` status
- Paused campaigns: `opacity-40 grayscale pointer-events-none` (visually disabled)
- Users can Join/Exit campaigns
- Filtering: by Sort (newest, highest budget, etc.), Status, Category, Niche
- Search: by publisher username or project name
- "Suggested Alternatives" appear when search yields no results (scored relevance matching)

---

## 6. Routing Map

| Route | File | Renders | Client? |
|---|---|---|---|
| `/` | `app/page.tsx` | ProfilePage (Sidebar + Transactions + Analytics) | No (RSC) |
| `/discover` | `app/discover/page.tsx` | Static discover placeholder | No (RSC) |
| `/campaign` | `app/campaign/page.tsx` | CampaignCard grid with filters | Yes (`'use client'`) |
| `/market` | `app/market/page.tsx` | SalesCard grid with buy/counter | Yes (`'use client'`) |
| `/cart` | `app/cart/page.tsx` | BuyerCard grid (buyer's items) | Yes (`'use client'`) |
| `/orders` | `app/orders/page.tsx` | Seller's incoming orders | Yes (`'use client'`) |
| `/offers` | `app/offers/page.tsx` | Buyer's received seller offers | Yes (`'use client'`) |
| `/profile` | `app/profile/page.tsx` | Static profile placeholder | No (RSC) |

**Note**: `app/campaign.tsx` and `app/discover.tsx` are orphaned files (not routes). The actual routes are at `app/campaign/page.tsx` and `app/discover/page.tsx`.

---

## 7. Component Patterns

### 7.1 Card Architecture
All major cards follow a consistent decomposition pattern:
```
CardComponent/
├── index.tsx      # State orchestrator (props, state machine, event handlers)
├── header.tsx     # Top section (identity, status, badges)
├── content.tsx    # Middle section (metrics, details, description)
├── sentiment.tsx  # Sentiment/budget bar visualization
└── footer.tsx     # Bottom action buttons (decline/counter/accept)
```

### 7.2 Button Pattern
Action buttons use a consistent 3-column grid with color-coded themes:
```tsx
<div className="grid grid-cols-3 gap-2">
  <button className="...red...">   <X /> Decline  </button>
  <button className="...amber..."> <RefreshCw /> Counter </button>
  <button className="...emerald..."><Check /> Accept </button>
</div>
```

### 7.3 UI Primitives
- `Button` — CVA-powered with variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`
- `Badge` — CVA-powered status badges
- `Popover` — Radix `@radix-ui/react-popover` wrapper

### 7.4 Dynamic Imports
SalesCard in `/market` uses `next/dynamic` with SSR disabled:
```tsx
const SalesCard = dynamic(() => import('@/components/sales-card'), { ssr: false });
```

---

## 8. Navbar & Navigation

### Links Structure
- **Desktop nav**: Discover, Campaign, Market (horizontal links)
- **Icon bar**: Orders (Bell icon + badge), Offers (ShoppingCart icon + badge), Profile (User icon)
- **Mobile**: Hamburger menu with slide-down panel
- Badge counts: Notifications = 24, Cart = 7 (hardcoded, dismiss on click)

---

## 9. Utility Functions

### `cn()` — Class Name Merger
```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### `formatToUGX()` — Currency Formatter
```typescript
// src/lib/currency.ts
// Converts raw UGX shillings to compact millions format
// 20,000,000 → "20m" | 205,000 → "0.205m" | 200,000 → "0.2m"
export function formatToUGX(valueInShillings: number): string { ... }
```

---

## 10. Known Issues & Technical Debt

1. **Duplicate utils**: `utils/utils.ts` and `src/lib/utils.ts` contain identical `cn()` functions. Only `src/lib/utils.ts` is imported. The root `utils/` directory is likely legacy.
2. **Orphaned files**: `src/app/campaign.tsx` and `src/app/discover.tsx` are not valid Next.js routes — they sit alongside the route directories and are unused.
3. **No backend**: All data is mock/localStorage. No API routes, no database.
4. **No auth**: No user authentication system. Buyer/Seller roles are simulated via hardcoded IDs (`'buyer-001'`, `'You'`).
5. **Hardcoded badge counts**: Navbar notification (24) and cart (7) counts are hardcoded state values.
6. **CampaignCardData not in barrel export**: `campaign-card.ts` types are imported directly (`@/types/campaign-card`) instead of through the `@/types` barrel.
7. **Mock data only generates 3 cards**: `generateFiveMockCards()` function name suggests 5 but returns 3 `SalesCardData` objects.
8. **Empty directories**: `src/hooks/` and `src/constants/` are empty — reserved for future use.
9. **Button Slot shim**: The `button.tsx` has a simplified `Slot` implementation that just renders children, losing the `asChild` polymorphism of the real Radix Slot.

---

## 11. Configuration Files

### `tsconfig.json`
- Target: ES2017
- Module: ESNext (bundler resolution)
- Strict: true
- Path alias: `@/*` → `./src/*`
- JSX: `react-jsx`

### `postcss.config.mjs`
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

### `globals.css`
```css
@import "tailwindcss";
/* CSS custom properties for light/dark themes */
:root { --background: #ffffff; --foreground: #171717; }
@media (prefers-color-scheme: dark) { :root { --background: #0a0a0a; --foreground: #ededed; } }
/* Tailwind v4 inline theme tokens */
@theme inline { --color-background: var(--background); --color-foreground: var(--foreground); }
```

---

## 12. Development Commands

```bash
npm run dev      # Start dev server (LAN accessible on 0.0.0.0)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

---

## 13. Dependencies Summary

### Production
| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.9 | App framework (App Router) |
| `react` / `react-dom` | 19.2.4 | UI runtime |
| `@radix-ui/react-dropdown-menu` | ^2.1.19 | Dropdown menus |
| `@radix-ui/react-navigation-menu` | ^1.2.17 | Navigation menu |
| `@radix-ui/react-popover` | ^1.1.18 | Popovers |
| `@radix-ui/react-slot` | ^1.3.0 | Polymorphic component slot |
| `class-variance-authority` | ^0.7.1 | Component variant system |
| `clsx` | ^2.1.1 | Conditional class names |
| `lucide-react` | ^1.21.0 | Icon library |
| `tailwind-merge` | ^3.6.0 | Tailwind class deduplication |

### Dev
| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | ^4 | CSS framework |
| `@tailwindcss/postcss` | ^4 | PostCSS plugin |
| `typescript` | ^5 | Type system |
| `eslint` + `eslint-config-next` | ^9 / 16.2.9 | Linting |

---

## 14. Footer Data (PortVille Brand)

```
Company: PortVille
Tagline: "Your modern market platform to discover, run campaigns, and trade seamlessly on any device."
Email: support@portville.com
Phone: +1 (555) 123-4567
Address: San Francisco, CA
Social: Facebook, Instagram, Twitter, GitHub
```

---

*This memory file captures the full state of the PortVille project as of July 2026. Use it to resume work without re-reading the codebase.*
