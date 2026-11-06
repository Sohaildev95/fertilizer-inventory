// ============================================
// User & Auth Types
// ============================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  SHOP_MANAGER = 'shop_manager',
  SALES_STAFF = 'sales_staff',
  VENDOR = 'vendor',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  shop_name?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Product & Category Types
// ============================================

export enum ProductUnit {
  KG = 'kg',
  BAG = 'bag',
  LITRE = 'litre',
  PIECE = 'piece',
  PACKET = 'packet',
  BOTTLE = 'bottle',
}

export interface Category {
  id: string;
  name: string;
  urdu_name?: string;
  slug?: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  urdu_name?: string;
  sku?: string;
  category_id?: string;
  company_name: string;
  brand?: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  selling_price?: number;
  min_sale_price?: number;
  current_stock: number;
  min_stock_alert: number;
  min_stock_level?: number;
  rack_location?: string;
  batch_number?: string;
  expiry_date?: string;
  image_url?: string;
  barcode?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

// ============================================
// Vendor / Supplier Types
// ============================================

export interface Vendor {
  id: string;
  name: string;
  company_name?: string;
  phone: string;
  email?: string;
  address?: string;
  cnic?: string;
  balance: number; // positive = we owe them
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Customer Types
// ============================================

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  cnic?: string;
  credit_limit: number;
  balance: number; // positive = they owe us (udhar)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Purchase Types
// ============================================

export enum PurchaseStatus {
  PENDING = 'pending',
  RECEIVED = 'received',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PAID = 'paid',
  PARTIAL = 'partial',
  UNPAID = 'unpaid',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CHEQUE = 'cheque',
  ONLINE = 'online',
  EASYPAISA = 'easypaisa',
  JAZZCASH = 'jazzcash',
}

export interface Purchase {
  id: string;
  vendor_id: string;
  invoice_no: string;
  total_amount: number;
  discount: number;
  paid_amount: number;
  status: PurchaseStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  notes?: string;
  date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  batch_no?: string;
  expiry_date?: string;
}

// ============================================
// Sale Types
// ============================================

export interface Sale {
  id: string;
  customer_id?: string; // null = walk-in customer
  invoice_no: string;
  total_amount: number;
  discount: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  notes?: string;
  date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

// ============================================
// Payment / Ledger Types
// ============================================

export enum PaymentType {
  RECEIVED = 'received',   // from customer
  SENT = 'sent',           // to vendor
}

export enum ReferenceType {
  SALE = 'sale',
  PURCHASE = 'purchase',
  MANUAL = 'manual',
}

export interface Payment {
  id: string;
  type: PaymentType;
  reference_id?: string;
  reference_type: ReferenceType;
  customer_id?: string;
  vendor_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  notes?: string;
  date: string;
  created_by: string;
  created_at: string;
}

// ============================================
// Stock Movement Types
// ============================================

export enum StockMovementType {
  IN = 'in',           // purchase
  OUT = 'out',         // sale
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
  DAMAGE = 'damage',
}

export interface StockMovement {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

// ============================================
// Expense Types
// ============================================

export enum ExpenseCategory {
  TRANSPORT = 'transport',
  SALARY = 'salary',
  UTILITY = 'utility',
  RENT = 'rent',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  created_by: string;
  created_at: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Fasli Udhaar & Crop Season Types (فصلی ادھار)
// ============================================

export enum CropSeasonType {
  RABI = 'rabi',       // ربیع (Winter/Spring: Wheat/Gandum, Mustard/Sarson, Potato/Aloo)
  KHARIF = 'kharif',   // خریف (Summer/Autumn: Cotton/Kapas, Rice/Dhan, Maize/Makai, Sugarcane)
  ZAID = 'zaid',       // بہاریہ / زائد (Spring Corn, Sunflower, Seasonal Vegetables)
}

export interface CropSeasonCycle {
  id: string;
  customer_id: string;
  crop_name: string;             // e.g. "گندم (Wheat 2026)"
  crop_key: string;              // e.g. "wheat", "cotton", "rice", "maize", "sugarcane", "potato", "other"
  season_type: CropSeasonType;
  season_year: number;           // e.g. 2026
  land_acreage: number;          // e.g. 25 Acres
  sowing_date?: string;          // بجائی کی تاریخ
  expected_harvest_date: string; // متوقع کٹائی و ادائیگی تاریخ (e.g. "2026-04-30")
  expected_harvest_month: string;// e.g. "2026-04"
  expected_amount: number;       // متوقع واجب الادا رقم
  recovered_amount?: number;     // اب تک موصول شدہ
  status: 'active' | 'harvested' | 'cleared' | 'overdue';
  notes?: string;
  created_at: string;
}

export interface FasliFarmerSummary {
  customer_id: string;
  customer_name: string;
  phone: string;
  village?: string;
  cnic?: string;
  crop_cycle_id: string;
  crop_name: string;
  season_type: CropSeasonType;
  land_acreage: number;
  expected_harvest_date: string;
  expected_amount: number;
  current_balance: number;
  credit_limit: number;
  status: 'active' | 'harvested' | 'cleared' | 'overdue';
}

export interface FasliHarvestForecastMonth {
  monthKey: string;              // e.g. "2026-04"
  monthUrdu: string;             // e.g. "اپریل ۲۰۲۶ (گندم کٹائی)"
  monthEnglish: string;          // e.g. "April 2026"
  seasonType: CropSeasonType;
  totalReceivable: number;
  farmerCount: number;
  cropsSummary: Array<{ cropName: string; acres: number; amount: number }>;
  farmers: FasliFarmerSummary[];
}

// ============================================
// Per-Bag Profit & Margin Analytics Types (فی بوری منافع)
// ============================================

export interface ProductBagMargin {
  id: string;
  name: string;
  urduName: string;
  company: string;
  unit: string;
  bagsSold: number;
  avgSalePrice: number;
  avgCostPrice: number;
  profitPerBag: number;
  totalSaleAmount: number;
  totalCostAmount: number;
  totalProfit: number;
  marginPercent: number;
  cashBags: number;
  creditBags: number;
  profitRating: 'high' | 'medium' | 'low';
}

export interface CompanyMarginSummary {
  company: string;
  bagsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  avgProfitPerBag: number;
}

export interface PerBagMarginReport {
  period: {
    timeRange: string;
    startDate: string;
    endDate: string;
    labelUrdu: string;
    labelEn: string;
  };
  summary: {
    totalBagsSold: number;
    totalRevenue: number;
    totalCost: number;
    totalGrossProfit: number;
    averageProfitPerBag: number;
    overallMarginPercent: number;
    cashVsCredit: {
      cash: {
        bags: number;
        revenue: number;
        profit: number;
        avgProfitPerBag: number;
        marginPercent: number;
      };
      credit: {
        bags: number;
        revenue: number;
        profit: number;
        avgProfitPerBag: number;
        marginPercent: number;
      };
      creditMarginPremium: number;
    };
  };
  topProducts: ProductBagMargin[];
  companyWise: CompanyMarginSummary[];
  productMargins: ProductBagMargin[];
}

// ============================================
// Bulk WhatsApp & SMS Broadcast Types (پیغامات و براڈکاسٹ)
// ============================================

export type BroadcastChannel = 'whatsapp' | 'sms' | 'both';

export type BroadcastAudienceType =
  | 'all_farmers'
  | 'debtors_only'
  | 'village'
  | 'crop_farmers'
  | 'custom_selection';

export type BroadcastTemplateType =
  | 'stock_arrival'
  | 'rate_update'
  | 'recovery_reminder'
  | 'pest_alert'
  | 'custom';

export interface BroadcastMessageTemplate {
  key: BroadcastTemplateType;
  title: string;
  titleUrdu: string;
  icon: string;
  category: 'inventory' | 'rates' | 'recovery' | 'advisory' | 'general';
  defaultUrdu: string;
  defaultEn: string;
}

export interface BroadcastRecipient {
  id: string;
  name: string;
  fatherName?: string;
  phone: string;
  village: string;
  currentCrop?: string;
  balance: number;
  creditLimit: number;
  selected: boolean;
  whatsappLink?: string;
  smsUri?: string;
  status: 'pending' | 'sent' | 'failed' | 'skipped';
}

export interface BroadcastCampaign {
  id: string;
  title: string;
  channel: BroadcastChannel;
  audienceType: BroadcastAudienceType;
  filterVillage?: string;
  filterCrop?: string;
  messageText: string;
  totalRecipients: number;
  sentCount: number;
  status: 'draft' | 'completed' | 'queued';
  createdAt: string;
  recipients?: BroadcastRecipient[];
}


