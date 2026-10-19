# 🌾 Fertilizer Inventory Management System — Live Interactive Roadmap

> **Client:** Fertilizer, Seeds & Agricultural Pesticides Agency (Chachu's Shop)  
> **Architecture:** Turborepo Monorepo (Next.js 16 Web Admin + NestJS 12 API + Supabase PostgreSQL + React Native Mobile)  
> **State Management:** Zustand (Client POS Cart & Offline Billing)  
> **📖 User Operating Manual:** [User Manual & Operating Guide](file:///c:/Users/Rizwan%20Ahmad/Desktop/myproject/FetilizerInvetory/docs/USER_MANUAL_GUIDE.md)  
> **Last Updated:** October 2026

---

## 🚦 Status Legend

| Icon | Status | Meaning |
|:---:|:---|:---|
| 🟢 | **Completed (100%)** | Fully implemented, database-backed, unit tested, and operational in code. |
| 🟡 | **In Progress / Partial** | Architecture or initial sub-features completed; remaining implementation actively underway. |
| 🔴 | **Pending (Not Started)** | Scheduled for upcoming sprint/phase. |

---

## 📊 Live Progress Summary

| Phase | Module Name | Status | Completion | Notes & Key Highlights |
|:---|:---|:---:|:---:|:---|
| **Phase 1** | Foundation, Monorepo & Database Setup | 🟢 | **100%** | Turborepo, pnpm, Supabase live connect, 12 tables, indexes & RLS |
| **Phase 2** | Authentication, Roles & Shop Profiles | 🟢 | **100%** | NestJS Auth JWT, RBAC guards, Login/Register UI, Dashboard shell |
| **Special** | Bilingual Urdu & English Localization (RTL) | 🟢 | **100%** | 1-Click Toggle, Noto Nastaliq Urdu, full RTL & desi dukandari terms |
| **Phase 3** | Fertilizer Products & Inventory Management | 🟢 | **100%** | Full CRUD API, categories, stock adjustments, low stock alerts, /dashboard/products UI |
| **Phase 4** | Vendors (Suppliers) & Purchases (Stock In) | 🟢 | **100%** | Full CRUD API, atomic stock-in, vendor Khata ledger, bill payments & receiving challan |
| **Phase 5** | Customers (Farmers/Zamindar) & Khata Ledger | 🟢 | **100%** | Full CRUD, unified Khata Ledger, Wasooli (recovery), 80mm Wasooli slip, 1-Click WhatsApp, Over-limit warnings |
| **Phase 6** | POS Counter Billing & Fast Thermal Receipts | 🟢 | **100%** | Live API sales, atomic stock deduction, farmer Khata link, 80/58mm thermal receipts |
| **Phase 7** | Daily Shop Expenses | 🟢 | **100%** | Full CRUD API, Palledari/freight tracking, KPI summary, category distribution & cash voucher print |
| **Phase 8** | Reports, Analytics & Roznamcha (Cash Book) | 🟢 | **100%** | Live P&L, Daily Munshi Roznamcha Cash Book, Godown stock valuation & print audit |
| **Phase 9** | Vendor Self-Service Web Portal | 🟢 | **100%** | Live Portal, Bilty tracking, digital ledger statement, rate revisions & advance dispatch notices |
| **Phase 10** | Mobile App (React Native Expo) | 🟢 | **100%** | Cross-platform Expo mobile app, fast POS billing, barcode scanner, farmer Khata, offline sync & Bluetooth slip |

---

## 🗺️ Detailed Phase-by-Phase Functions Breakdown

---

### 📌 PHASE 1: Foundation, Monorepo & Database Setup
**Overall Status:** 🟢 **100% Complete**

* 🟢 **1.1 Turborepo & pnpm Monorepo Setup**
  * 🟢 Monorepo structure configured (`apps/web`, `apps/api`, `packages/shared`, `packages/ui`)
  * 🟢 Shared TypeScript configuration (`tsconfig.json`) across all workspaces
  * 🟢 Unified ESLint & Prettier code quality rules
  * 🟢 Build pipeline (`pnpm build`) passing 100% across all packages and apps
* 🟢 **1.2 Supabase Database Architecture**
  * 🟢 Live Supabase cloud database connected (`https://zpjqeryfpbiyvdtqdckx.supabase.co`)
  * 🟢 12 Relational Tables created with foreign keys and cascading rules:
    * `profiles`, `categories`, `products`, `vendors`, `customers`, `purchases`, `purchase_items`, `sales`, `sale_items`, `payments`, `stock_movements`, `expenses`
  * 🟢 Custom PostgreSQL Enum types (`user_role`, `payment_status`, `payment_method`, `stock_movement_type`, `ledger_entity_type`)
  * 🟢 B-Tree indexes created on all foreign keys for high-speed queries
  * 🟢 Row Level Security (RLS) policies configured
  * 🟢 Automated `updated_at` timestamp triggers on all tables
  * 🟢 Pre-seeded 10 essential Pakistani fertilizer categories (Urea, DAP, Potash, NPK, Micronutrients, Bio, Pesticides, Seeds)
* 🟢 **1.3 Backend Foundation (NestJS)**
  * 🟢 NestJS modular architecture with NodeNext ESM support
  * 🟢 Global Supabase Module (Anon client + Service Role client)
  * 🟢 Swagger OpenAPI Interactive Documentation at `/api/docs`
  * 🟢 CORS security configuration & Global ValidationPipe with DTO validation
  * 🟢 Health-check endpoint (`/api/v1/health`) with passing unit tests

---

### 🌐 SPECIAL FEATURE: Bilingual Urdu & English Localization (RTL)
**Overall Status:** 🟢 **100% Complete**

* 🟢 **S.1 Desi Dukandari Dictionary (`translations.ts`)**
  * 🟢 Comprehensive bilingual dictionary inside `@fertilizer/shared`
  * 🟢 Traditional Pakistani terms: کھاتہ (Khata), میزان (Meezan), بقایا (Baqaya), نقد (Naqd), ادھار (Udhaar), بوری (Bori), پرچی (Parchi), چالان (Challan)
* 🟢 **S.2 Language Context Engine (`language-context.tsx`)**
  * 🟢 React `LanguageProvider` with `useLanguage()` hook
  * 🟢 Automatic `dir="rtl"` for Urdu and `dir="ltr"` for English on `<html>`
  * 🟢 Google Font `Noto Nastaliq Urdu` font styling & responsive line-heights
  * 🟢 Persistent user preference saved in browser `localStorage` (Default: Urdu)
* 🟢 **S.3 Interactive Language Toggle (`language-toggle.tsx`)**
  * 🟢 1-Click `اردو | ENG` pill button in Topbar and Login card
  * 🟢 Instant UI re-render without reloading the page

---

### 📌 PHASE 2: Authentication, Roles & Shop Profiles
**Overall Status:** 🟢 **100% Complete**

* 🟢 **2.1 Backend Auth API (NestJS)**
  * 🟢 `POST /api/v1/auth/register` — New shop & admin account creation
  * 🟢 `POST /api/v1/auth/login` — Email & password login returning JWT access token
  * 🟢 `GET /api/v1/auth/me` — Retrieve current logged-in user profile & shop data
  * 🟢 `PUT /api/v1/auth/profile` — Update shop name, owner name, phone & address
  * 🟢 `POST /api/v1/auth/refresh` — Refresh expired JWT tokens seamlessly
  * 🟢 `JwtAuthGuard` — Supabase token verification guard protecting API endpoints
  * 🟢 `RolesGuard` — Role-based access control protecting administrative actions
* 🟢 **2.2 User Roles & Permissions (RBAC)**
  * 🟢 Super Admin (Dukan Malik / Chachu) — Full system access & financial controls
  * 🟢 Shop Manager (Munshi) — Stock management, purchases, customer ledger
  * 🟢 Sales Staff (Counter Salesman) — POS billing, cash collection
  * 🟢 Vendor (Supplier) — Product supply and purchase order view
* 🟢 **2.3 Web Authentication & Dashboard Shell (Next.js)**
  * 🟢 React `AuthProvider` with automatic token refresh & secure session management
  * 🟢 Protected route guards (auto redirect unauthenticated users to `/login`)
  * 🟢 Premium Login Screen (`/login`) with Pakistani agricultural theme
  * 🟢 1-Click "Auto Fill Demo Admin" button for fast testing
  * 🟢 Shop Registration Screen (`/register`)
  * 🟢 Collapsible Navigation Sidebar with bilingual labels & icons
  * 🟢 Header topbar with live search, notifications & user profile dropdown
  * 🟢 Main Dashboard (`/dashboard`) with 4 live KPI overview cards:
    * 🟢 Total Sales Today (آج کی کل فروخت)
    * 🟢 Fertilizer Stock Bags (گودام میں کل بوریاں)
    * 🟢 Zamindar Khata Udhaar (زمینداروں کے ذمے بقایا ادھار)
    * 🟢 Cash in Hand / Galla (دکان کے گلے میں موجود نقد رقم)

---

### 📌 PHASE 3: Fertilizer Products & Inventory Management
**Overall Status:** 🟢 **100% Complete**

* 🟢 **3.1 Database Foundation:**
  * 🟢 `products` table schema with Urdu/English names, SKU, company, bag weight, cost, sale price
  * 🟢 `categories` table schema with pre-seeded Pakistani fertilizer categories
  * 🟢 Shared TypeScript models & interfaces in `@fertilizer/shared`
* 🟢 **3.2 Backend Products API (NestJS):**
  * 🟢 `ProductsModule` structure (`apps/api/src/products/`)
  * 🟢 `POST /api/v1/products` — Create new product (Urea, DAP, seeds, spray)
  * 🟢 `GET /api/v1/products` — List products with search, category filters & pagination
  * 🟢 `GET /api/v1/products/:id` — Get single product details with current stock & audit history
  * 🟢 `PUT /api/v1/products/:id` — Update product details, prices, alert threshold
  * 🟢 `DELETE /api/v1/products/:id` — Soft-delete / deactivate product
  * 🟢 `POST /api/v1/products/:id/adjust-stock` — Stock manual adjustment (damage, leakage, audit)
  * 🟢 `GET /api/v1/products/:id/movements` — Stock audit trail (in/out history log)
  * 🟢 `GET /api/v1/products/categories` — List active categories
  * 🟢 `GET /api/v1/products/stats` — Inventory KPI stats (total bags, low stock alerts, valuation)
* 🟢 **3.3 Web Products UI (Next.js - `/dashboard/products`):**
  * 🟢 Products listing table with Urdu/English names & company tags (FFC, Engro, Fatima, Bayer)
  * 🟢 Stock bag badges: In Stock (🟢 Green), Low Stock (🟡 Yellow), Out of Stock (🔴 Red)
  * 🟢 4 KPI Summary Cards (Total Items, Total Units/Bags, Low Stock Alerts, Inventory Valuation)
  * 🟢 Add Product Modal (Urdu/English names, Company, Unit weight, Cost, Sale price, Rack location)
  * 🟢 Stock adjustment & damage modal for recording damaged or torn bags (پھٹی ہوئی بوری کا اندراج)
  * 🟢 Low Stock filter pill & real-time search across SKU, company, and Urdu names

---

### 📌 PHASE 4: Vendors (Suppliers) & Purchases (Stock In)
**Overall Status:** 🟢 **100% Complete**

* 🟢 **4.1 Database Foundation:**
  * 🟢 `vendors`, `purchases`, `purchase_items` tables ready in database
  * 🟢 Shared TypeScript types in `@fertilizer/shared`
* 🟢 **4.2 Backend Vendors & Purchases API (NestJS):**
  * 🟢 `POST /api/v1/vendors` — Add new supplier/company (Engro, FFC, Fatima, Bayer, Haji Sons, local dealer)
  * 🟢 `GET /api/v1/vendors` — List all vendors with remaining balance & filters
  * 🟢 `PUT /api/v1/vendors/:id` — Update vendor details & contact info
  * 🟢 `GET /api/v1/vendors/:id/ledger` — Vendor ledger showing purchase bills & payments with running balance (میزان)
  * 🟢 `POST /api/v1/vendors/:id/payments` — Record payment to vendor (Cash, Bank, Cheque) with `PAY-XXXXXX` receipts
  * 🟢 `GET /api/v1/vendors/stats/summary` — Real-time supplier payable balances & stats
  * 🟢 `POST /api/v1/purchases` — Record new purchase invoice (automatic atomic stock increment & stock movement audit log)
  * 🟢 `GET /api/v1/purchases` — List purchase invoices with date & vendor filter
  * 🟢 `GET /api/v1/purchases/:id` — Detailed purchase invoice with line items
  * 🟢 `GET /api/v1/purchases/stats/summary` — Total purchases, monthly volume & pending dues
* 🟢 **4.3 Web Vendors & Purchases UI (Next.js):**
  * 🟢 Vendors Directory (`/dashboard/vendors`) with contact numbers, payable balances & search
  * 🟢 Add Supplier modal with Opening Balance & Contact info
  * 🟢 Vendor Ledger Screen (سپلائر کھاتہ) showing bill history, payments sent, & printable A4 statement
  * 🟢 Vendor Payment modal (ادائیگی اندراج) supporting Cash & Bank Transfer
  * 🟢 Purchase Entry Screen (`/dashboard/purchases`) with KPI summary & filter controls
  * 🟢 Stock-In Modal (مال خریداری اندراج) for incoming trucks with Bilty & Vehicle number
  * 🟢 Printable Receiving Challan (وصولی چالان) with `@media print` CSS for clean printouts

---

### 📌 PHASE 5: Customers (Farmers/Zamindar) & Khata Ledger
**Overall Status:** 🟢 **100% Complete**

* 🟢 **5.1 Database Foundation:**
  * 🟢 `customers` & `payments` tables ready in database
  * 🟢 Shared TypeScript types in `@fertilizer/shared`
* 🟢 **5.2 Backend Customers & Khata API (NestJS):**
  * 🟢 `POST /api/v1/customers` — Register new farmer/zamindar (Name, Chak/Village, Phone, CNIC)
  * 🟢 `GET /api/v1/customers` — Search & list customers by name, phone or village
  * 🟢 `PUT /api/v1/customers/:id` — Update customer information & credit limit
  * 🟢 `GET /api/v1/customers/:id/ledger` — Full Khata Ledger statement with unified sales & payments
  * 🟢 `POST /api/v1/customers/:id/payments` — Record farmer payment received (وصولی اندراج) with serial receipt generation
  * 🟢 `GET /api/v1/customers/stats/summary` — Real-time market udhar, over-limit count, and today's recovery
* 🟢 **5.3 Web Customers & Khata UI (Next.js - `/dashboard/customers`):**
  * 🟢 Customer Directory Screen with real-time KPI overview (Total Market Udhar, Recovery, Over-Limit alerts, Registered Farmers)
  * 🟢 Add Farmer modal with Village/Chak, Land acreage, Crop season, Guarantor (ضمانتی) and Credit Limit
  * 🟢 Quick Khata Debit Modal (ادھار اندراج) to add fertilizer bags directly to customer account
  * 🟢 Payment Collection Modal (وصولی اندراج) supporting Cash Counter, Bank Transfer, Cheque & Crop Barter
  * 🟢 Farmer Khata Ledger Modal with complete transaction history, running balance, debit/credit breakdown
  * 🟢 80mm Thermal Wasooli Receipt Modal (وصولی پرچی) with print button for instant POS slip printing
  * 🟢 Dedicated `@media print` CSS for 80mm receipt rolls & clean Khata statement printing
  * 🟢 1-Click WhatsApp Payment Reminder & Wasooli slip delivery link
  * 🟢 Credit limit safety warning badges (Alerts counter staff if farmer exceeds assigned credit limit)

---

### 📌 PHASE 6: POS Counter Billing & Fast Thermal Receipts
**Overall Status:** 🟢 **100% Complete**

* 🟢 **6.1 Database & State Management:**
  * 🟢 `sales` & `sale_items` tables operational in live Supabase cloud database
  * 🟢 Zustand POS Cart Store (`pos-store.ts`) with quantity, prices, discount & offline persistence
* 🟢 **6.2 Backend Sales API (NestJS):**
  * 🟢 `POST /api/v1/sales` — Checkout sale transaction:
    * 🟢 Atomic stock deduction from `products` table
    * 🟢 Automatic Khata update if sold on Udhaar (`customers.current_balance`)
    * 🟢 Automatic payment receipt record in `payments` table
    * 🟢 Stock movement audit trail in `stock_movements` table
  * 🟢 `GET /api/v1/sales` — List daily sales with date, customer & status filters
  * 🟢 `GET /api/v1/sales/:id` — Single sale invoice breakdown
  * 🟢 `GET /api/v1/sales/stats/today` — Real-time today's sales KPI stats
* 🟢 **6.3 Web POS Counter UI (Next.js - `/dashboard/pos`):**
  * 🟢 Live API product grid with stock badges, rates & instant add-to-cart
  * 🟢 Customer selector (Walk-in Cash Customer vs Registered Zamindar)
  * 🟢 Quick "+ Naya Kisan Add Karein" modal directly inside POS
  * 🟢 Boriyan quick quantity adjuster (+1, +5, +10, +25 boriyan)
  * 🟢 Custom rate negotiation override per bag
  * 🟢 Payment methods: Full Cash (نقد), Full Khata/Credit (ادھار), Partial Cash
  * 🟢 Quick cash denomination chips (+5,000, +10,000, +50,000, +100,000)
* 🟢 **6.4 Fast Thermal Printer Receipt:**
  * 🟢 80mm & 58mm Thermal printer receipt layout
  * 🟢 Dedicated `@media print` CSS for authentic thermal receipt rolls
  * 🟢 Urdu/English receipt with Shop name, Customer name, Items, Subtotal, Discount, Paid & Khata balance
  * 🟢 Urdu blessing dua & software developer attribution

---

### 📌 PHASE 7: Daily Shop Expenses
**Overall Status:** 🟢 **100% Complete**

* 🟢 **7.1 Database Foundation:**
  * 🟢 `expenses` table operational in Supabase cloud database
  * 🟢 Shared TypeScript types in `@fertilizer/shared`
* 🟢 **7.2 Backend Expenses API (NestJS):**
  * 🟢 `POST /api/v1/expenses` — Record daily shop expense with auto-generated `VCH-YYYY-XXXX` voucher numbers
  * 🟢 `GET /api/v1/expenses` — List expenses with category, payment method, date range & search filters
  * 🟢 `GET /api/v1/expenses/:id` — Single expense voucher lookup
  * 🟢 `PUT /api/v1/expenses/:id` — Update expense entry details
  * 🟢 `DELETE /api/v1/expenses/:id` — Delete / void expense entry
  * 🟢 `GET /api/v1/expenses/stats/summary` — Real-time today total, month total, Palledari sum, Cash/Bank outflows, and category percentage breakdown
* 🟢 **7.3 Web Expenses UI (Next.js - `/dashboard/expenses`):**
  * 🟢 Live API integration with Supabase cloud database
  * 🟢 Real-time KPI Cards (Today's Total, This Month's Total, Palledari / Labour charges, Cash Drawer Outflow)
  * 🟢 Expense Category Distribution Bar showing percentage allocation across Rent, Salaries, Labour, Transport, Bills, Fuel
  * 🟢 Expense Entry Modal with standard agri-shop categories (Palledari, Freight, Tea/Food, Rent, Utilities, Salary, Fuel, Misc)
  * 🟢 Printable Official Expense Cash Voucher Modal (`#printable-expense-voucher`) with dual signatures (Cashier & Manager)
  * 🟢 Filter pills, real-time search, and single-row responsive table layout

---

### 📌 PHASE 8: Reports, Analytics & Roznamcha (Cash Book)
**Overall Status:** 🟢 **100% Complete**

* 🟢 **8.1 Dashboard Live KPI Cards:**
  * 🟢 Sales, Stock Bags, Khata Udhaar, Cash in Hand overview cards
* 🟢 **8.2 Comprehensive Financial Reports:**
  * 🟢 Daily Cash Book / Roznamcha (روزنامچہ — Total Cash In, Total Cash Out, Net Cash in Hand / Closing Galla)
  * 🟢 Product-wise Profit & Loss Report (Volume, Cost, Revenue, Gross Margin & Net Profit per Urea, DAP bag)
  * 🟢 Godown Stock Valuation Report (Total bags, Cost value, Retail value, Potential clearance profit)
  * 🟢 Zamindar Udhaar Recovery Aging & Top Debtors overview
  * 🟢 Chronological daily cash transactions audit log
* 🟢 **8.3 Export & Printing:**
  * 🟢 Printable Official Financial Audit & Roznamcha statement (`#printable-audit-report`) with shop stamp & signature lines

---

### 📌 PHASE 9: Vendor Self-Service Web Portal
**Overall Status:** 🟢 **100% Complete**

* 🟢 **9.1 Vendor Portal Web Application (`/dashboard/vendors/portal`):**
  * 🟢 Dedicated portal view & Vendor authentication/role check (`role === 'vendor'`)
  * 🟢 Multi-vendor switcher dropdown (FFC, Engro, Fatima, Swat Agro)
  * 🟢 Live Financial KPIs (Balance due from shop, total deliveries value, payments cleared, bags delivered)
  * 🟢 Purchase order / Bilty dispatch tracking with bag quantities and status
  * 🟢 Unified digital running Khata ledger statement with one-click print support
  * 🟢 Product supply catalog & wholesale/retail rates with price revision notification modal
  * 🟢 Advance truck dispatch notice form (Truck #, driver mobile, bilty, bags count) for godown preparation

---

### 📌 PHASE 10: Mobile App (React Native Expo)
**Overall Status:** 🟢 **100% Complete**

* 🟢 **10.1 React Native & Expo Monorepo Architecture (`apps/mobile`):**
  * 🟢 Cross-platform app for Android and iOS using Expo SDK 58 & React Native 0.88
  * 🟢 Turborepo workspace integration with shared types and constants (`@fertilizer/shared`)
  * 🟢 Bilingual Urdu (اردو) and English language context engine
  * 🟢 Offline sync storage engine (`AsyncStorage`) with local queue for zero-internet rural areas
* 🟢 **10.2 Counter POS Billing Tab (`PosBillingTab.tsx`):**
  * 🟢 Instant fertilizer search & category filters (Urea, DAP, CAN, Potash, Pesticide, Seed)
  * 🟢 1-Tap Bag Multiplier buttons (+1, +5, +10, +50 بوری) for high-speed counter sales
  * 🟢 Walk-in Cash or Farmer Khata account picker with live running balance & credit limit alert
  * 🟢 Live Subtotal, Discount, Net Payable & Credit split calculation
* 🟢 **10.3 Camera Barcode & QR Scanner Tab (`BarcodeScannerTab.tsx`):**
  * 🟢 Laser targeting viewfinder simulation for rapid godown bag counting
  * 🟢 Direct modes: Truck Inward (+Bags), Trolley Loading Outward (-Bags), and Product Lookup
  * 🟢 Scanned bag history with timestamps and automatic stock increment/deduction
* 🟢 **10.4 Zamindar Khata (Farmer Ledger) Tab (`FarmerKhataTab.tsx`):**
  * 🟢 Fast farmer lookup by Name, Village/Chak, Phone, or CNIC
  * 🟢 Live balance indicator with Credit Limit progress bar and Over-limit warning
  * 🟢 1-Tap Wasooli Modal: Counter cash collection with instant balance reduction
  * 🟢 1-Tap WhatsApp Reminder: Opens WhatsApp with pre-drafted polite Urdu Khata reminder
* 🟢 **10.5 Godown Stock Tab (`GodownStockTab.tsx`):**
  * 🟢 Live bag inventory breakdown with wholesale valuation (لاکھ)
  * 🟢 Low-stock alert badge (< 25 bags)
  * 🟢 Damaged / Torn bag adjustment tool with reason notes
* 🟢 **10.6 Thermal Slip & Offline Sync Modals:**
  * 🟢 80mm Desi Thermal Cash Slip Modal (`ThermalReceiptModal.tsx`) with Bluetooth print simulation
  * 🟢 Offline Sync Queue Modal (`OfflineSyncModal.tsx`) showing un-synced bills with 1-click cloud sync

---

## 🎯 Current Sprint & Next Steps

👉 **All Core Phases (1 to 10) are now 100% COMPLETE & PASSING ALL TYPECHECKS!**

* **Next Advanced Features to Execute:**
  1. 📱 **Option 2: Real SMS Gateway & Meta WhatsApp Cloud API** (Automated SMS to farmer on fertilizer purchase/recovery).
  2. 🏬 **Option 3: Multi-Godown / Multiple Warehouses & Railway Rake Management** (Track transfers between Main Shop, Mandi Godown, Adda Godown, and Railway Rakes).
  3. ☁️ **Option 4: Production Cloud Deployment & Automated Daily Backups** (Vercel + Railway/Render + Supabase scheduled daily dumps).

