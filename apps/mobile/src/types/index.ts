export interface MobileProduct {
  id: string;
  name: string;
  nameUrdu: string;
  category: string;
  sku: string;
  barcode: string;
  costPrice: number;
  retailPrice: number;
  stockBags: number;
  minStockWarning: number;
  bagSizeKg: number;
  company: string;
}

export interface MobileCartItem {
  product: MobileProduct;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface MobileCustomer {
  id: string;
  name: string;
  nameUrdu: string;
  village: string;
  phone: string;
  cnic: string;
  totalBalance: number;
  creditLimit: number;
  guarantorName?: string;
  currentCrop?: string;
}

export interface MobileSaleRecord {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerVillage: string;
  customerPhone: string;
  items: {
    productId: string;
    productName: string;
    productNameUrdu: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalBags: number;
  subtotal: number;
  discount: number;
  netPayable: number;
  paidAmount: number;
  balanceDue: number;
  paymentMethod: 'CASH' | 'CREDIT' | 'BANK';
  createdAt: string;
  isSynced: boolean;
}

export interface MobilePaymentRecord {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
  notes?: string;
  createdAt: string;
  isSynced: boolean;
}

export interface MobileStockLog {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  type: 'INWARD_TRUCK' | 'OUTWARD_SALE' | 'ADJUSTMENT_DAMAGE';
  bagsCount: number;
  notes: string;
  timestamp: string;
}

export interface MobileSyncStats {
  lastSyncedAt: string | null;
  serverReachable: boolean;
  apiBaseUrl: string;
}

export type MobileTab = 'pos' | 'scanner' | 'khata' | 'stock' | 'fasli';
