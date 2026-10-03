# 🌾 Fertilizer Inventory Management System

A comprehensive inventory, sales & purchase management system built for fertilizer shops.

## Tech Stack

- **Frontend:** Next.js 16 (App Router)
- **Backend:** Nest.js
- **Database:** Supabase (PostgreSQL)
- **Mobile:** React Native (Expo) — *coming soon*
- **Monorepo:** Turborepo + pnpm

## Project Structure

```
fertilizer-inventory/
├── apps/
│   ├── web/              → Next.js Admin + Vendor Portal
│   └── api/              → Nest.js REST API
├── packages/
│   ├── shared/           → Shared types, utils, constants
│   ├── ui/               → Shared UI components
│   ├── eslint-config/    → ESLint configuration
│   └── typescript-config/ → TypeScript configuration
├── docs/
│   ├── ROADMAP.md        → Development roadmap
│   └── COST_ESTIMATION.md → Cost estimation
├── turbo.json            → Turborepo config
└── package.json          → Root package.json
```

## Getting Started

### Prerequisites

- Node.js >= 24
- pnpm >= 11

### Installation

```bash
pnpm install
```

### Development

```bash
# Run all apps
pnpm dev

# Run only web
pnpm dev:web

# Run only API
pnpm dev:api
```

### Build

```bash
pnpm build
```

## Features

- 📦 Inventory Management (Products, Categories, Stock)
- 🛒 Purchase Management (Vendors, POs, Invoices)
- 💰 Sales / POS (Customers, Billing, Receipts)
- 📒 Khata / Ledger System (Credit tracking)
- 📊 Reports & Analytics Dashboard
- 👥 Multi-role Access (Admin, Vendor, Salesman)

## License

Private — All rights reserved.
