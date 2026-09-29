# 🌾 Fertilizer Inventory Management System — Roadmap

## 📋 Project Overview

**Client:** Chachu (Uncle's) Fertilizer Shop  
**Purpose:** Complete inventory, sales & purchase management system  
**Platforms:** Web (Admin + Vendor) → Mobile App (React Native)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend (Web)** | Next.js 14+ (App Router) | Admin Panel & Vendor Portal |
| **Backend (API)** | Nest.js | REST/GraphQL API Server |
| **Database** | Supabase (PostgreSQL) | DB + Auth + Storage + Realtime |
| **Mobile App** | React Native (Expo) | Vendor/Salesman Mobile App |
| **State Mgmt** | Zustand / TanStack Query | Client-side state & caching |
| **UI Library** | Shadcn/UI + Tailwind CSS | Premium UI components |
| **Auth** | Supabase Auth + JWT | Role-based authentication |
| **Deployment** | Vercel (Web) + Railway (API) | Hosting |

---

## 👥 User Roles

| Role | Access | Description |
|------|--------|-------------|
| **Super Admin** | Full System | Shop owner (Chachu) — complete control |
| **Admin** | Management | Manage inventory, users, reports |
| **Vendor/Supplier** | Vendor Portal | View orders, manage supply, invoices |
| **Salesman** | POS + Limited | Sales, billing, basic inventory view |

---

## 🗺️ Development Phases

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 📌 PHASE 1: Foundation & Setup (Week 1-2)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 1.1 Project Architecture Setup
- [ ] Monorepo setup (Turborepo/Nx)
  ```
  fertilizer-inventory/
  ├── apps/
  │   ├── web/          → Next.js (Admin + Vendor)
  │   ├── api/          → Nest.js Backend
  │   └── mobile/       → React Native App
  ├── packages/
  │   ├── shared/       → Shared types, utils, constants
  │   ├── ui/           → Shared UI components
  │   └── config/       → Shared configs (ESLint, TS)
  ├── supabase/         → Migrations, seeds, edge functions
  ├── docs/             → Documentation
  └── package.json
  ```

#### 1.2 Supabase Database Schema Design
- [ ] Database tables design (see schema below)
- [ ] Row Level Security (RLS) policies
- [ ] Supabase Auth configuration
- [ ] Storage buckets (product images, invoices)
- [ ] Database migrations setup

#### 1.3 Backend Foundation (Nest.js)
- [ ] Nest.js project with modular architecture
- [ ] Supabase client integration
- [ ] JWT Auth Guard & Role-based access
- [ ] Global exception filters & validation pipes
- [ ] Swagger API documentation setup
- [ ] Logger & error handling middleware

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 📌 PHASE 2: Authentication & User Management (Week 2-3)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 2.1 Authentication System
- [ ] Login / Register pages (Next.js)
- [ ] Supabase Auth integration (Email/Password)
- [ ] Phone OTP login (optional)
- [ ] Forgot password flow
- [ ] Session management & token refresh
- [ ] Protected routes middleware

#### 2.2 User Management (Admin)
- [ ] Create/Edit/Delete users
- [ ] Role assignment (Admin, Vendor, Salesman)
- [ ] User profile management
- [ ] Activity log per user
- [ ] Enable/Disable user accounts

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 📌 PHASE 3: Inventory Management — Core (Week 3-5)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 3.1 Product/Fertilizer Management
- [ ] **Categories:** Urea, DAP, NPK, Pesticides, Seeds, etc.
- [ ] **Product CRUD:** Name, SKU, brand, category, unit (kg/bag/litre)
- [ ] Product images upload (Supabase Storage)
- [ ] Barcode/QR code generation
- [ ] Minimum stock level alerts
- [ ] Product variants (sizes/weights)

#### 3.2 Stock Management
- [ ] Current stock dashboard
- [ ] Stock in (Purchase entry)
- [ ] Stock out (Sales entry)
- [ ] Stock adjustment (damage, expiry, return)
- [ ] Stock transfer between locations (if multiple)
- [ ] Batch/Lot tracking with expiry dates
- [ ] **Low stock alerts** (email/notification)

#### 3.3 Warehouse/Godown Management
- [ ] Multiple storage locations
- [ ] Location-wise stock view
- [ ] Stock movement history

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 📌 PHASE 4: Purchase Management (Week 5-7)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 4.1 Vendor/Supplier Management
- [ ] Vendor CRUD (Name, company, phone, address, CNIC)
- [ ] Vendor-wise product listing
- [ ] Vendor payment history
- [ ] Vendor ledger (Khata)
- [ ] Outstanding balance tracking

#### 4.2 Purchase Orders
- [ ] Create purchase order
- [ ] Purchase order approval workflow
- [ ] Receive goods against PO
- [ ] Partial receiving support
- [ ] Purchase return management

#### 4.3 Purchase Invoices
- [ ] Invoice entry with line items
- [ ] Tax calculation (if applicable)
- [ ] Payment tracking (paid/partial/unpaid)
- [ ] Invoice PDF generation
- [ ] Payment methods (Cash, Bank, Cheque)

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 📌 PHASE 5: Sales Management (Week 7-9)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 5.1 Customer Management
- [ ] Customer CRUD (Name, phone, address, CNIC)
- [ ] Customer ledger (Khata)
- [ ] Credit limit management
- [ ] Customer payment history
- [ ] Outstanding balance tracking

#### 5.2 Sales / POS (Point of Sale)
- [ ] Quick sale entry (POS style)
- [ ] Product search (by name, SKU, barcode)
- [ ] Cart system with quantity adjustment
- [ ] Discount management (per item / overall)
- [ ] Multiple payment methods
- [ ] Invoice generation & print
- [ ] Sale return / refund management

#### 5.3 Sales Invoices
- [ ] Professional invoice template
- [ ] Thermal printer support (80mm)
- [ ] A4 invoice print
- [ ] Invoice email/WhatsApp share
- [ ] Sales history with filters

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 📌 PHASE 6: Financial Management (Week 9-11)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 6.1 Khata (Ledger) System 📒
- [ ] Customer Khata (Udhar/Credit tracking)
- [ ] Vendor Khata (Payable tracking)
- [ ] Payment receive from customers
- [ ] Payment send to vendors
- [ ] Daily cash register
- [ ] Cheque management & tracking

#### 6.2 Expense Management
- [ ] Daily expenses entry
- [ ] Expense categories (Transport, Salary, Utility, etc.)
- [ ] Monthly expense summary

#### 6.3 Profit & Loss
- [ ] Per-product profit tracking
- [ ] Daily/Monthly/Yearly P&L
- [ ] Cost price vs selling price analysis
- [ ] Margin calculator

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 📌 PHASE 7: Reports & Analytics Dashboard (Week 11-12)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 7.1 Dashboard (Admin)
- [ ] Today's sales summary
- [ ] Revenue charts (daily/weekly/monthly)
- [ ] Top selling products
- [ ] Low stock alerts widget
- [ ] Pending payments (receivable + payable)
- [ ] Recent activity feed

#### 7.2 Reports
- [ ] **Sales Report** — Date-wise, product-wise, customer-wise
- [ ] **Purchase Report** — Date-wise, vendor-wise
- [ ] **Inventory Report** — Current stock, movement, valuation
- [ ] **Customer Ledger Report** — Udhar/Credit details
- [ ] **Vendor Ledger Report** — Payable details
- [ ] **Profit/Loss Report** — Per product, overall
- [ ] **Expense Report** — Category-wise, monthly
- [ ] **Cash Flow Report** — Daily/Monthly
- [ ] Export to **PDF / Excel / CSV**

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 📌 PHASE 8: Vendor Portal (Week 12-13)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 8.1 Vendor Web Portal
- [ ] Vendor login & dashboard
- [ ] View purchase orders received
- [ ] Update order status (Accepted/Shipped/Delivered)
- [ ] View payment status & history
- [ ] Upload invoices & delivery challans
- [ ] Product catalog management
- [ ] Communication with admin

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 📌 PHASE 9: Mobile App — React Native (Week 14-18)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#### 9.1 Mobile App Features
- [ ] Login with biometric support
- [ ] Dashboard (Sales summary)
- [ ] Quick POS / Sale entry
- [ ] Product scanner (Barcode/QR)
- [ ] Customer Khata view
- [ ] Stock check
- [ ] Notifications (low stock, payments due)
- [ ] Offline mode (sync when online)

---

### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
### 📌 PHASE 10: Advanced Features (Week 18+)
### ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- [ ] **Multi-branch support** (multiple shops)
- [ ] **SMS/WhatsApp notifications** (payment reminders)
- [ ] **AI-powered insights** (demand prediction, seasonal trends)
- [ ] **Government scheme integration** (subsidy tracking)
- [ ] **Bulk import/export** (Excel product upload)
- [ ] **Audit trail** (who did what, when)
- [ ] **Backup & restore** system
- [ ] **Dark mode** support
- [ ] **Multi-language** (Urdu/English)

---

## 🗄️ Database Schema (Core Tables)

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE SCHEMA                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  users                    profiles                          │
│  ├── id (uuid, PK)        ├── id (uuid, PK, FK→users)     │
│  ├── email                ├── full_name                     │
│  ├── phone                ├── role (enum)                   │
│  └── created_at           ├── avatar_url                    │
│                           ├── cnic                          │
│                           └── is_active                     │
│                                                             │
│  categories               products                          │
│  ├── id (uuid, PK)        ├── id (uuid, PK)               │
│  ├── name                 ├── name                          │
│  ├── description          ├── sku                           │
│  └── parent_id (self FK)  ├── category_id (FK)             │
│                           ├── brand                         │
│                           ├── unit (kg/bag/litre)           │
│                           ├── cost_price                    │
│                           ├── selling_price                 │
│                           ├── min_stock_level               │
│                           ├── image_url                     │
│                           ├── barcode                       │
│                           └── is_active                     │
│                                                             │
│  vendors                  customers                         │
│  ├── id (uuid, PK)        ├── id (uuid, PK)               │
│  ├── name                 ├── name                          │
│  ├── company_name         ├── phone                         │
│  ├── phone                ├── address                       │
│  ├── address              ├── cnic                          │
│  ├── cnic                 ├── credit_limit                  │
│  └── balance              └── balance                       │
│                                                             │
│  purchases                purchase_items                    │
│  ├── id (uuid, PK)        ├── id (uuid, PK)               │
│  ├── vendor_id (FK)       ├── purchase_id (FK)             │
│  ├── invoice_no           ├── product_id (FK)              │
│  ├── total_amount         ├── quantity                      │
│  ├── paid_amount          ├── unit_price                    │
│  ├── status               ├── total_price                   │
│  ├── payment_method       └── batch_no                      │
│  └── date                                                   │
│                                                             │
│  sales                    sale_items                         │
│  ├── id (uuid, PK)        ├── id (uuid, PK)               │
│  ├── customer_id (FK)     ├── sale_id (FK)                 │
│  ├── invoice_no           ├── product_id (FK)              │
│  ├── total_amount         ├── quantity                      │
│  ├── discount             ├── unit_price                    │
│  ├── paid_amount          ├── discount                      │
│  ├── payment_method       └── total_price                   │
│  └── date                                                   │
│                                                             │
│  payments                 stock_movements                   │
│  ├── id (uuid, PK)        ├── id (uuid, PK)               │
│  ├── type (in/out)        ├── product_id (FK)              │
│  ├── reference_id         ├── type (in/out/adjust)         │
│  ├── reference_type       ├── quantity                      │
│  ├── amount               ├── reference_id                  │
│  ├── payment_method       ├── reference_type                │
│  └── date                 ├── notes                         │
│                           └── date                          │
│                                                             │
│  expenses                 notifications                     │
│  ├── id (uuid, PK)        ├── id (uuid, PK)               │
│  ├── category             ├── user_id (FK)                 │
│  ├── amount               ├── title                         │
│  ├── description          ├── message                       │
│  ├── date                 ├── is_read                       │
│  └── created_by (FK)      └── created_at                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 Timeline Summary

| Phase | Description | Duration | Priority |
|-------|------------|----------|----------|
| Phase 1 | Foundation & Setup | Week 1-2 | 🔴 Critical |
| Phase 2 | Auth & User Management | Week 2-3 | 🔴 Critical |
| Phase 3 | Inventory Management | Week 3-5 | 🔴 Critical |
| Phase 4 | Purchase Management | Week 5-7 | 🔴 Critical |
| Phase 5 | Sales / POS | Week 7-9 | 🔴 Critical |
| Phase 6 | Financial / Khata | Week 9-11 | 🟡 High |
| Phase 7 | Reports & Dashboard | Week 11-12 | 🟡 High |
| Phase 8 | Vendor Portal | Week 12-13 | 🟡 High |
| Phase 9 | Mobile App (React Native) | Week 14-18 | 🟢 Medium |
| Phase 10 | Advanced Features | Week 18+ | 🔵 Low |

> [!IMPORTANT]
> **Total Estimated Time:** ~18-20 weeks for full system  
> **MVP (Minimum Viable Product):** Phase 1-5 = ~9 weeks  
> **Web Complete:** Phase 1-8 = ~13 weeks  

---

## 🚀 Immediate Next Steps

1. **Setup monorepo** with Turborepo
2. **Create Supabase project** & design database schema
3. **Initialize Next.js** app (Admin panel)
4. **Initialize Nest.js** API server
5. **Connect Supabase** to backend
6. **Build Auth system** (Login/Register)

---

> [!TIP]
> **Suggestion:** Hum Phase 1 se start karein? Main monorepo setup, Supabase schema, aur Next.js + Nest.js ka initial setup kar deta hoon. Bas aap "Start" bolo! 🚀
