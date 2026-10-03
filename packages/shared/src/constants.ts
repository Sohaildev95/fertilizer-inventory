// ============================================
// Application Constants
// ============================================

export const APP_NAME = 'Fertilizer Inventory';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Fertilizer Inventory Management System';

// ============================================
// Pagination Defaults
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ============================================
// Stock Alert Thresholds
// ============================================

export const LOW_STOCK_THRESHOLD = 10;
export const CRITICAL_STOCK_THRESHOLD = 5;

// ============================================
// Invoice Prefix
// ============================================

export const SALE_INVOICE_PREFIX = 'SI';
export const PURCHASE_INVOICE_PREFIX = 'PI';

// ============================================
// Date Formats
// ============================================

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// ============================================
// Currency
// ============================================

export const CURRENCY = {
  code: 'PKR',
  symbol: 'Rs.',
  name: 'Pakistani Rupee',
};

// ============================================
// Default Categories (Fertilizer Shop)
// ============================================

export const DEFAULT_CATEGORIES = [
  'Urea',
  'DAP (Diammonium Phosphate)',
  'NPK Fertilizers',
  'SOP (Sulphate of Potash)',
  'SSP (Single Super Phosphate)',
  'Pesticides',
  'Herbicides',
  'Fungicides',
  'Seeds',
  'Micronutrients',
  'Growth Regulators',
  'Organic Fertilizers',
] as const;

// ============================================
// User Role Labels
// ============================================

export const ROLE_LABELS = {
  super_admin: 'Super Admin (Malik)',
  shop_manager: 'Shop Manager (Munshi/Manager)',
  sales_staff: 'Sales Staff (Counter Sales)',
  vendor: 'Vendor (Company/Supplier)',
} as const;
