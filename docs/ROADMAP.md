# 🌾 Fertilizer Inventory Management System — Live Interactive Roadmap

> **Client:** Fertilizer, Seeds & Agricultural Pesticides Agency (Chachu's Shop)  
> **Architecture:** Turborepo Monorepo (Next.js 16 Web Admin + NestJS 12 API + Supabase PostgreSQL + React Native Mobile)  
> **State Management:** Zustand (Client POS Cart & Offline Billing)  
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
| **Phase 4** | Vendors (Suppliers) & Purchases (Stock In) | 🔴 | **10%** | DB tables ready; Purchase entry & vendor ledger pending |
| **Phase 5** | Customers (Farmers/Zamindar) & Khata Ledger | 🔴 | **10%** | DB tables ready; Farmer ledger & credit limit alerts pending |
| **Phase 6** | POS Counter Billing & Fast Thermal Receipts | 🟡 | **30%** | Zustand POS store & DB ready; Counter UI & Thermal print next |
| **Phase 7** | Daily Shop Expenses | 🔴 | **10%** | DB schema ready; Expense categories & tracking pending |
| **Phase 8** | Reports, Analytics & Roznamcha (Cash Book) | 🔴 | **10%** | Dashboard KPI cards ready; Detailed reports & export pending |
| **Phase 9** | Vendor Self-Service Web Portal | 🔴 | **0%** | Planned after web admin is complete |
| **Phase 10** | Mobile App (React Native Expo) | 🔴 | **0%** | Final phase for mobile billing & godown scanning |

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
**Overall Status:** 🔴 **10% Pending**

* 🟢 **4.1 Database Foundation:**
  * 🟢 `vendors`, `purchases`, `purchase_items` tables ready in database
  * 🟢 Shared TypeScript types in `@fertilizer/shared`
* 🔴 **4.2 Backend Vendors & Purchases API (NestJS):**
  * 🔴 `POST /api/v1/vendors` — Add new supplier/company (Engro, FFC, Fatima, Bayer, local dealer)
  * 🔴 `GET /api/v1/vendors` — List all vendors with remaining balance
  * 🔴 `PUT /api/v1/vendors/:id` — Update vendor details & contact info
  * 🔴 `GET /api/v1/vendors/:id/ledger` — Vendor ledger showing purchase bills & payments
  * 🔴 `POST /api/v1/purchases` — Record new purchase invoice (automatic stock increment)
  * 🔴 `GET /api/v1/purchases` — List purchase invoices with date & vendor filter
  * 🔴 `POST /api/v1/purchases/:id/payments` — Record payment to vendor (Cash, Bank, Cheque)
* 🔴 **4.3 Web Vendors & Purchases UI (Next.js):**
  * 🔴 Vendors List Screen (`/dashboard/vendors`) with contact numbers & payable balances
  * 🔴 Add/Edit Vendor modal
  * 🔴 Vendor Ledger Screen (سپلائر کھاتہ) showing bill history & payments sent
  * 🔴 Purchase Entry Screen (`/dashboard/purchases/new`) for recording incoming trucks
  * 🔴 Printable Purchase Invoice & receiving challan

---

### 📌 PHASE 5: Customers (Farmers/Zamindar) & Khata Ledger
**Overall Status:** 🔴 **10% Pending**

* 🟢 **5.1 Database Foundation:**
  * 🟢 `customers` & `payments` tables ready in database
  * 🟢 Shared TypeScript types in `@fertilizer/shared`
* 🔴 **5.2 Backend Customers & Khata API (NestJS):**
  * 🔴 `POST /api/v1/customers` — Register new farmer/zamindar (Name, Chak/Village, Phone, CNIC)
  * 🔴 `GET /api/v1/customers` — Search & list customers by name, phone or village
  * 🔴 `PUT /api/v1/customers/:id` — Update customer information & credit limit
  * 🔴 `GET /api/v1/customers/:id/ledger` — Full Khata Ledger statement
  * 🔴 `POST /api/v1/customers/:id/payments` — Record farmer payment received (وصولی اندراج)
* 🔴 **5.3 Web Customers & Khata UI (Next.js):**
  * 🔴 Customer Directory Screen (`/dashboard/customers`) with total outstanding balance
  * 🔴 Add/Edit Customer modal with Village/Chak and Credit Limit
  * 🔴 Farmer Khata Ledger Screen (`/dashboard/customers/:id/ledger`):
    * 🔴 Previous Balance (سابقہ بقایا)
    * 🔴 New Purchases / Debits (نئی خریداری)
    * 🔴 Cash Received / Credits (وصولی)
    * 🔴 Current Net Balance (موجودہ بقایا)
  * 🔴 Payment collection receipt form (Cash, Bank, Cheque)
  * 🔴 Credit limit safety warning (Alerts counter staff if farmer exceeds credit limit)
  * 🔴 Printable Urdu Khata Statement for Zamindar (کھاتہ پرچی)
  * 🔴 WhatsApp Payment Reminder Generator (Sends outstanding bill reminder on WhatsApp)

---

### 📌 PHASE 6: POS Counter Billing & Fast Thermal Receipts
**Overall Status:** 🟡 **30% In Progress**

* 🟢 **6.1 Database & State Management:**
  * 🟢 `sales` & `sale_items` tables ready in database
  * 🟢 Zustand POS Cart Store (`pos-store.ts`) with quantity, prices, discount & offline persistence
* 🔴 **6.2 Backend Sales API (NestJS):**
  * 🔴 `POST /api/v1/sales` — Checkout sale transaction:
    * 🔴 Atomic stock deduction from products
    * 🔴 Automatic Khata update if sold on Udhaar
    * 🔴 Cash drawer balance increment if paid by Cash
  * 🔴 `GET /api/v1/sales` — List daily sales with filters
  * 🔴 `GET /api/v1/sales/:id` — Single sale invoice breakdown
  * 🔴 `POST /api/v1/sales/:id/return` — Sale return / item exchange handling
* 🔴 **6.3 Web POS Counter UI (Next.js - `/dashboard/pos`):**
  * 🔴 Fast product search grid with bag badges, prices & instant add-to-cart
  * 🔴 Customer selector (Walk-in Cash Customer vs Registered Zamindar)
  * 🔴 Boriyan quick quantity adjuster (+1, +5, +10 boriyan)
  * 🔴 Custom price override per bag (دکاندار کے لیے ریٹ تبدیل کرنے کا آپشن)
  * 🔴 Payment methods:
    * 🔴 Full Cash (نقد)
    * 🔴 Full Khata/Credit (ادھار)
    * 🔴 Partial Cash + Partial Udhaar (جزوی نقد + جزوی ادھار)
* 🔴 **6.4 Fast Thermal Printer Receipt:**
  * 🔴 80mm & 58mm Thermal printer receipt layout
  * 🔴 Urdu/English receipt with Shop name, Customer name, Items, Amount & Khata balance
  * 🔴 Auto-print on sale confirmation

---

### 📌 PHASE 7: Daily Shop Expenses
**Overall Status:** 🔴 **10% Pending**

* 🟢 **7.1 Database Foundation:**
  * 🟢 `expenses` table ready in database
  * 🟢 Shared TypeScript types in `@fertilizer/shared`
* 🔴 **7.2 Backend Expenses API (NestJS):**
  * 🔴 `POST /api/v1/expenses` — Record daily expense
  * 🔴 `GET /api/v1/expenses` — List expenses with category & date range filters
  * 🔴 `DELETE /api/v1/expenses/:id` — Delete / void expense entry
* 🔴 **7.3 Web Expenses UI (Next.js - `/dashboard/expenses`):**
  * 🔴 Expense entry form with standard agri-shop categories:
    * 🔴 Labor / Palledari (مزدوری / پلے داری — Loading & unloading charges per bag)
    * 🔴 Freight / Transport (کرایہ مال — Truck / trolley rent)
    * 🔴 Shop & Warehouse rent (دکان / گودام کا کرایہ)
    * 🔴 Electricity & Utility bills (بجلی کا بل)
    * 🔴 Tea, Food & Daily Miscellaneous (چائے پانی و متفرق اخراجات)
  * 🔴 Daily cash drawer deduction (for exact net profit calculation)
  * 🔴 Monthly expense category comparison chart

---

### 📌 PHASE 8: Reports, Analytics & Roznamcha (Cash Book)
**Overall Status:** 🔴 **10% Pending**

* 🟢 **8.1 Dashboard Live KPI Cards:**
  * 🟢 Sales, Stock Bags, Khata Udhaar, Cash in Hand overview cards
* 🔴 **8.2 Comprehensive Financial Reports:**
  * 🔴 Daily Cash Book / Roznamcha (روزنامچہ — Total Cash In, Total Cash Out, Net Cash in Galla)
  * 🔴 Product-wise Profit & Loss Report (Profit margin per Urea, DAP bag)
  * 🔴 Godown Stock Valuation Report (Total asset value of inventory)
  * 🔴 Zamindar Udhaar Recovery Aging Report (30 days, 60 days, 90+ days overdue)
  * 🔴 Vendor Payable Summary (Outstanding amounts to companies)
* 🔴 **8.3 Export & Printing:**
  * 🔴 Export to Excel (.xlsx) for all reports
  * 🔴 Printable PDF reports with shop header

---

### 📌 PHASE 9: Vendor Self-Service Web Portal
**Overall Status:** 🔴 **0% Pending**

* 🔴 **9.1 Vendor Portal Web Application:**
  * 🔴 Vendor login interface & dedicated portal view
  * 🔴 Purchase order dispatch tracking
  * 🔴 Payment receipts & digital ledger statement
  * 🔴 Product supply catalog & rate update requests

---

### 📌 PHASE 10: Mobile App (React Native Expo)
**Overall Status:** 🔴 **0% Pending**

* 🔴 **10.1 React Native Mobile App:**
  * 🔴 Cross-platform app for Android and iOS
  * 🔴 Mobile POS billing for counter salesman
  * 🔴 Camera Barcode/QR Scanner for rapid godown bag counting
  * 🔴 Zamindar Khata quick look up on mobile phone
  * 🔴 Offline sync mode (for rural areas without active internet)

---

## 🎯 Current Sprint & Next Steps

👉 **Executing PHASE 3 (Fertilizer Products & Inventory Management):**
1. **NestJS Products Module:** `products.service.ts` & `products.controller.ts` (List, Create, Update, Delete, Stock Alert endpoints).
2. **Next.js Products Management UI ([`/dashboard/products`](file:///c:/Users/Rizwan%20Ahmad/Desktop/myproject/FetilizerInvetory/apps/web/app/dashboard/products)):** Table with category filters (Urea, DAP, Pesticides), live stock bag badges (In Stock, Low Stock, Out of Stock), and "Add New Product" modal.
