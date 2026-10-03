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
