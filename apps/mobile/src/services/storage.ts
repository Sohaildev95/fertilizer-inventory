import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import {
  DEFAULT_BROADCAST_TEMPLATES,
  PerBagMarginReport,
  BroadcastMessageTemplate,
} from '@fertilizer/shared';
import {
  MobileProduct,
  MobileCustomer,
  MobileSaleRecord,
  MobilePaymentRecord,
  MobileStockLog,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: '@fertilizer_mobile_products',
  CUSTOMERS: '@fertilizer_mobile_customers',
  SALES: '@fertilizer_mobile_sales',
  OFFLINE_QUEUE: '@fertilizer_mobile_offline_queue',
  OFFLINE_PAYMENTS: '@fertilizer_mobile_offline_payments',
  STOCK_LOGS: '@fertilizer_mobile_stock_logs',
  LANGUAGE: '@fertilizer_mobile_language',
  API_URL: '@fertilizer_mobile_api_url',
  LAST_SYNC: '@fertilizer_mobile_last_sync',
  FASLI_FORECAST: '@fertilizer_mobile_fasli_forecast',
  MARGINS_REPORT: '@fertilizer_mobile_margins_report',
  BROADCAST_TEMPLATES: '@fertilizer_mobile_broadcast_templates',
};

// Initial Seed Data for Pakistani Fertilizer Dealership
export const INITIAL_PRODUCTS: MobileProduct[] = [
  {
    id: 'prod-1',
    name: 'Sona Urea (Prilled)',
    nameUrdu: 'سونا یوریا (دانے دار)',
    category: 'Urea (یوریا)',
    sku: 'FFC-UREA-50',
    barcode: '896400010012',
    costPrice: 4200,
    retailPrice: 4450,
    stockBags: 340,
    minStockWarning: 50,
    bagSizeKg: 50,
    company: 'Fauji Fertilizer Company (FFC)',
  },
  {
    id: 'prod-2',
    name: 'Engro DAP (Di-Ammonium Phosphate)',
    nameUrdu: 'اینگرو ڈی اے پی',
    category: 'DAP (ڈی اے پی)',
    sku: 'ENGRO-DAP-50',
    barcode: '896400020025',
    costPrice: 11800,
    retailPrice: 12450,
    stockBags: 120,
    minStockWarning: 30,
    bagSizeKg: 50,
    company: 'Engro Fertilizers Ltd',
  },
  {
    id: 'prod-3',
    name: 'Sarsabz CAN (Calcium Ammonium Nitrate)',
    nameUrdu: 'سرسَبز کین گوارا',
    category: 'CAN / Gohar (کین گوارا)',
    sku: 'FAT-CAN-50',
    barcode: '896400030038',
    costPrice: 3550,
    retailPrice: 3820,
    stockBags: 85,
    minStockWarning: 25,
    bagSizeKg: 50,
    company: 'Fatima Fertilizer',
  },
  {
    id: 'prod-4',
    name: 'SOP Potash (Sulphate of Potash)',
    nameUrdu: 'ایف ایف سی پوٹاش ایس او پی',
    category: 'Potash (پوٹاش)',
    sku: 'FFC-SOP-50',
    barcode: '896400040041',
    costPrice: 13700,
    retailPrice: 14500,
    stockBags: 45,
    minStockWarning: 20,
    bagSizeKg: 50,
    company: 'Fauji Fertilizer Company (FFC)',
  },
  {
    id: 'prod-5',
    name: 'Belt Expert 100ml (Bayer)',
    nameUrdu: 'بیلٹ ایکسپرٹ (سنڈی سپرے)',
    category: 'Pesticides (کیڑے مار زہریں)',
    sku: 'BAY-BELT-100',
    barcode: '896400050054',
    costPrice: 1750,
    retailPrice: 2150,
    stockBags: 60,
    minStockWarning: 15,
    bagSizeKg: 1,
    company: 'Bayer CropScience',
  },
  {
    id: 'prod-6',
    name: 'Pioneer Hybrid Maize Seed 30Y87',
    nameUrdu: 'پائینیر مکئی ہائبرڈ بیج',
    category: 'Seeds (بیج)',
    sku: 'PIO-30Y87-20KG',
    barcode: '896400060067',
    costPrice: 8900,
    retailPrice: 9600,
    stockBags: 22,
    minStockWarning: 10,
    bagSizeKg: 20,
    company: 'Corteva Agriscience',
  },
];

export const INITIAL_CUSTOMERS: MobileCustomer[] = [
  {
    id: 'cst-1',
    name: 'Haji Muhammad Akram',
    nameUrdu: 'حاجی محمد اکرم',
    village: 'Chak 45/12-L, Chichawatni',
    phone: '03007654321',
    cnic: '36502-1234567-1',
    totalBalance: 345000,
    creditLimit: 500000,
    guarantorName: 'Chaudhry Bashir Ahmed',
    currentCrop: 'گندم (Wheat)',
  },
  {
    id: 'cst-2',
    name: 'Chaudhry Aslam Virk',
    nameUrdu: 'چوہدری اسلم ورک',
    village: 'Mauza Kotla, Sahiwal',
    phone: '03019876543',
    cnic: '36501-9876543-3',
    totalBalance: 1420000,
    creditLimit: 1200000,
    guarantorName: 'Mian Tariq Advocate',
    currentCrop: 'کپاس (Cotton)',
  },
  {
    id: 'cst-3',
    name: 'Malik Riaz Ahmad',
    nameUrdu: 'ملک ریاض احمد',
    village: 'Basti Qadirabad',
    phone: '03031234567',
    cnic: '36502-3344556-5',
    totalBalance: 185000,
    creditLimit: 600000,
    guarantorName: 'Rana Naveed',
    currentCrop: 'دھان / چاول (Rice)',
  },
  {
    id: 'cst-4',
    name: 'Rana Naveed Akhtar',
    nameUrdu: 'رانا نوید اختر',
    village: 'Chak 110/9-L',
    phone: '03058899001',
    cnic: '36502-7788990-7',
    totalBalance: 0,
    creditLimit: 200000,
    guarantorName: 'Self (حلفیہ)',
    currentCrop: 'کماد (Sugarcane)',
  },
];

export const INITIAL_FASLI_FORECAST = {
  summary: {
    totalReceivable: 1950000,
    rabiTotal: 865000,
    kharifTotal: 1085000,
    totalFarmers: 4,
  },
  forecast: [
    {
      monthKey: '2026-04',
      monthUrdu: 'اپریل 2026 (گندم کٹائی پیک)',
      monthEnglish: 'April 2026 (Wheat Harvest)',
      seasonType: 'rabi',
      totalReceivable: 865000,
      farmerCount: 2,
      cropsSummary: [{ cropName: 'گندم (Wheat)', acres: 45, amount: 865000 }],
      farmers: [
        {
          customer_id: 'cst-1',
          customer_name: 'حاجی محمد اکرم',
          phone: '03007654321',
          village: 'Chak 45/12-L',
          crop_cycle_id: 'cyc-1',
          crop_name: 'گندم (Wheat)',
          season_type: 'rabi',
          land_acreage: 25,
          expected_harvest_date: '2026-04-25',
          expected_amount: 345000,
          current_balance: 345000,
        },
        {
          customer_id: 'cst-5',
          customer_name: 'حاجی منظور حسین ڈوگر',
          phone: '03009988112',
          village: 'Chak 45/12-L',
          crop_cycle_id: 'cyc-2',
          crop_name: 'آلو و گندم',
          season_type: 'rabi',
          land_acreage: 20,
          expected_harvest_date: '2026-04-15',
          expected_amount: 520000,
          current_balance: 520000,
        },
      ],
    },
    {
      monthKey: '2026-10',
      monthUrdu: 'اکتوبر 2026 (کپاس چنائی و دھان)',
      monthEnglish: 'October 2026 (Cotton & Rice)',
      seasonType: 'kharif',
      totalReceivable: 1085000,
      farmerCount: 2,
      cropsSummary: [{ cropName: 'کپاس / دھان', acres: 58, amount: 1085000 }],
      farmers: [
        {
          customer_id: 'cst-2',
          customer_name: 'چوہدری اسلم ورک',
          phone: '03019876543',
          village: 'Mauza Kotla',
          crop_cycle_id: 'cyc-3',
          crop_name: 'کپاس (Cotton)',
          season_type: 'kharif',
          land_acreage: 40,
          expected_harvest_date: '2026-10-20',
          expected_amount: 900000,
          current_balance: 1420000,
        },
        {
          customer_id: 'cst-3',
          customer_name: 'ملک ریاض احمد',
          phone: '03031234567',
          village: 'Basti Qadirabad',
          crop_cycle_id: 'cyc-4',
          crop_name: 'دھان / چاول (Rice)',
          season_type: 'kharif',
          land_acreage: 18,
          expected_harvest_date: '2026-10-30',
          expected_amount: 185000,
          current_balance: 185000,
        },
      ],
    },
  ],
};

export const INITIAL_MARGINS_REPORT: PerBagMarginReport = {
  period: {
    timeRange: 'this_month',
    startDate: '2026-11-01',
    endDate: '2026-11-25',
    labelUrdu: 'موجودہ ماہ',
    labelEn: 'This Month',
  },
  summary: {
    totalBagsSold: 1465,
    totalRevenue: 9850000,
    totalCost: 9245000,
    totalGrossProfit: 605000,
    averageProfitPerBag: 413,
    overallMarginPercent: 6.1,
    cashVsCredit: {
      cash: { bags: 645, revenue: 4120000, profit: 215000, avgProfitPerBag: 333, marginPercent: 5.2 },
      credit: { bags: 820, revenue: 5730000, profit: 390000, avgProfitPerBag: 475, marginPercent: 6.8 },
      creditMarginPremium: 142,
    },
  },
  topProducts: [
    {
      id: 'prd-engro-dap',
      name: 'Engro Zorawar DAP 50kg',
      urduName: 'اینگرو زورآور ڈی اے پی',
      company: 'Engro Fertilizers',
      unit: 'بوری (50kg)',
      bagsSold: 185,
      avgSalePrice: 12450,
      avgCostPrice: 11800,
      profitPerBag: 650,
      totalSaleAmount: 2303250,
      totalCostAmount: 2183000,
      totalProfit: 120250,
      marginPercent: 5.2,
      cashBags: 65,
      creditBags: 120,
      profitRating: 'medium',
    },
    {
      id: 'prd-sona-urea',
      name: 'Sona Urea Prilled 50kg',
      urduName: 'سونا یوریا (پریلڈ)',
      company: 'FFC (Fauji Fertilizer)',
      unit: 'بوری (50kg)',
      bagsSold: 420,
      avgSalePrice: 4450,
      avgCostPrice: 4200,
      profitPerBag: 250,
      totalSaleAmount: 1869000,
      totalCostAmount: 1764000,
      totalProfit: 105000,
      marginPercent: 5.6,
      cashBags: 190,
      creditBags: 230,
      profitRating: 'medium',
    },
    {
      id: 'prd-bayer-belt',
      name: 'Belt Expert 100ml Insecticide',
      urduName: 'بیلٹ ایکسپرٹ (سنڈی سپرے)',
      company: 'Bayer CropScience',
      unit: 'بوتل (100ml)',
      bagsSold: 95,
      avgSalePrice: 2150,
      avgCostPrice: 1750,
      profitPerBag: 400,
      totalSaleAmount: 204250,
      totalCostAmount: 166250,
      totalProfit: 38000,
      marginPercent: 18.6,
      cashBags: 57,
      creditBags: 38,
      profitRating: 'high',
    },
  ],
  companyWise: [],
  productMargins: [],
};

// Helper fallback memory cache
const memoryStore: Record<string, string> = {};

async function getItem(key: string): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(key)) || memoryStore[key] || null;
  } catch {
    return memoryStore[key] || null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  try {
    memoryStore[key] = value;
    await AsyncStorage.setItem(key, value);
  } catch {
    memoryStore[key] = value;
  }
}

// Detect Metro bundler host IP automatically on real Expo Go devices
export function detectDefaultApiUrl(): string {
  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?/i);
      const host = match?.[1];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:4000/api/v1`;
      }
    }
  } catch {
    // ignore
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }
  return 'http://localhost:4000/api/v1';
}

export async function getApiBaseUrl(): Promise<string> {
  const saved = await getItem(STORAGE_KEYS.API_URL);
  return saved || detectDefaultApiUrl();
}

export async function setApiBaseUrl(url: string): Promise<string> {
  const cleaned = url.trim().replace(/\/+$/, '');
  await setItem(STORAGE_KEYS.API_URL, cleaned);
  return cleaned;
}

export async function getLastSyncedAt(): Promise<string | null> {
  return await getItem(STORAGE_KEYS.LAST_SYNC);
}

export async function setLastSyncedAt(iso: string): Promise<void> {
  await setItem(STORAGE_KEYS.LAST_SYNC, iso);
}

// 1. Products Management
export async function getProducts(): Promise<MobileProduct[]> {
  const data = await getItem(STORAGE_KEYS.PRODUCTS);
  if (!data) {
    await setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export async function saveProducts(products: MobileProduct[]): Promise<void> {
  await setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

// 2. Customers Management
export async function getCustomers(): Promise<MobileCustomer[]> {
  const data = await getItem(STORAGE_KEYS.CUSTOMERS);
  if (!data) {
    await setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

export async function saveCustomers(customers: MobileCustomer[]): Promise<void> {
  await setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
}

// 3. Update Customer Khata
export async function updateCustomerBalance(
  customerId: string,
  amountDelta: number
): Promise<MobileCustomer | null> {
  const customers = await getCustomers();
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return null;

  customer.totalBalance = Math.max(0, customer.totalBalance + amountDelta);
  await saveCustomers(customers);
  return customer;
}

// 4. Sales and Offline Queue
export async function getSales(): Promise<MobileSaleRecord[]> {
  const data = await getItem(STORAGE_KEYS.SALES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getOfflineQueue(): Promise<MobileSaleRecord[]> {
  const data = await getItem(STORAGE_KEYS.OFFLINE_QUEUE);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveOfflineQueue(queue: MobileSaleRecord[]): Promise<void> {
  await setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
}

export async function recordSale(
  sale: MobileSaleRecord,
  isOnline: boolean
): Promise<{ sale: MobileSaleRecord; queued: boolean }> {
  const sales = await getSales();
  sale.isSynced = isOnline;
  sales.unshift(sale);
  await setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

  let queued = false;
  if (!isOnline) {
    const queue = await getOfflineQueue();
    queue.push(sale);
    await saveOfflineQueue(queue);
    queued = true;
  }

  // Atomic local stock deduction
  const products = await getProducts();
  for (const item of sale.items) {
    const p = products.find((prod) => prod.id === item.productId);
    if (p) {
      p.stockBags = Math.max(0, p.stockBags - item.quantity);
    }
  }
  await saveProducts(products);

  // If credit, add balance locally
  if (sale.balanceDue > 0 && sale.customerId !== 'cash-walkin') {
    await updateCustomerBalance(sale.customerId, sale.balanceDue);
  }

  return { sale, queued };
}

export async function queueExistingSaleOffline(sale: MobileSaleRecord): Promise<void> {
  sale.isSynced = false;
  const queue = await getOfflineQueue();
  if (!queue.some((q) => q.id === sale.id)) {
    queue.push(sale);
    await saveOfflineQueue(queue);
  }
  const sales = await getSales();
  const updatedSales = sales.map((s) => (s.id === sale.id ? { ...s, isSynced: false } : s));
  await setItem(STORAGE_KEYS.SALES, JSON.stringify(updatedSales));
}

export async function markSaleSynced(saleId: string): Promise<void> {
  const queue = await getOfflineQueue();
  const remaining = queue.filter((s) => s.id !== saleId);
  await saveOfflineQueue(remaining);

  const sales = await getSales();
  const updatedSales = sales.map((s) => (s.id === saleId ? { ...s, isSynced: true } : s));
  await setItem(STORAGE_KEYS.SALES, JSON.stringify(updatedSales));
}

export async function clearOfflineQueue(): Promise<number> {
  const queue = await getOfflineQueue();
  const count = queue.length;
  await saveOfflineQueue([]);

  const sales = await getSales();
  for (const s of sales) {
    s.isSynced = true;
  }
  await setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  return count;
}

// 4b. Offline Payments (Wasooli) Queue
export async function getOfflinePayments(): Promise<MobilePaymentRecord[]> {
  const data = await getItem(STORAGE_KEYS.OFFLINE_PAYMENTS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function queuePaymentOffline(payment: MobilePaymentRecord): Promise<void> {
  const list = await getOfflinePayments();
  list.push(payment);
  await setItem(STORAGE_KEYS.OFFLINE_PAYMENTS, JSON.stringify(list));
}

export async function markPaymentSynced(paymentId: string): Promise<void> {
  const list = await getOfflinePayments();
  const remaining = list.filter((p) => p.id !== paymentId);
  await setItem(STORAGE_KEYS.OFFLINE_PAYMENTS, JSON.stringify(remaining));
}

// 5. Stock Movement Logs
export async function getStockLogs(): Promise<MobileStockLog[]> {
  const data = await getItem(STORAGE_KEYS.STOCK_LOGS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function recordStockMovement(
  productId: string,
  type: 'INWARD_TRUCK' | 'OUTWARD_SALE' | 'ADJUSTMENT_DAMAGE',
  bagsCount: number,
  notes: string
): Promise<void> {
  const products = await getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  if (type === 'INWARD_TRUCK') {
    product.stockBags += bagsCount;
  } else if (type === 'OUTWARD_SALE' || type === 'ADJUSTMENT_DAMAGE') {
    product.stockBags = Math.max(0, product.stockBags - bagsCount);
  }
  await saveProducts(products);

  const logs = await getStockLogs();
  logs.unshift({
    id: `log-${Date.now()}`,
    productId,
    productName: product.name,
    barcode: product.barcode,
    type,
    bagsCount,
    notes,
    timestamp: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    }),
  });
  await setItem(STORAGE_KEYS.STOCK_LOGS, JSON.stringify(logs));
}

// 6. Cached Web Insights (Fasli Udhaar, Per-Bag Margins, Broadcast Templates)
export async function getCachedFasliForecast(): Promise<any> {
  const data = await getItem(STORAGE_KEYS.FASLI_FORECAST);
  if (!data) return INITIAL_FASLI_FORECAST;
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_FASLI_FORECAST;
  }
}

export async function saveCachedFasliForecast(data: any): Promise<void> {
  await setItem(STORAGE_KEYS.FASLI_FORECAST, JSON.stringify(data));
}

export async function getCachedMarginsReport(): Promise<PerBagMarginReport> {
  const data = await getItem(STORAGE_KEYS.MARGINS_REPORT);
  if (!data) return INITIAL_MARGINS_REPORT;
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_MARGINS_REPORT;
  }
}

export async function saveCachedMarginsReport(data: PerBagMarginReport): Promise<void> {
  await setItem(STORAGE_KEYS.MARGINS_REPORT, JSON.stringify(data));
}

export async function getCachedBroadcastTemplates(): Promise<BroadcastMessageTemplate[]> {
  const data = await getItem(STORAGE_KEYS.BROADCAST_TEMPLATES);
  if (!data) return DEFAULT_BROADCAST_TEMPLATES as BroadcastMessageTemplate[];
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_BROADCAST_TEMPLATES as BroadcastMessageTemplate[];
  }
}

export async function saveCachedBroadcastTemplates(
  templates: BroadcastMessageTemplate[]
): Promise<void> {
  await setItem(STORAGE_KEYS.BROADCAST_TEMPLATES, JSON.stringify(templates));
}
