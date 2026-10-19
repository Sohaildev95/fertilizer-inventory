import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileProduct, MobileCustomer, MobileSaleRecord, MobileStockLog } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: '@fertilizer_mobile_products',
  CUSTOMERS: '@fertilizer_mobile_customers',
  SALES: '@fertilizer_mobile_sales',
  OFFLINE_QUEUE: '@fertilizer_mobile_offline_queue',
  STOCK_LOGS: '@fertilizer_mobile_stock_logs',
  LANGUAGE: '@fertilizer_mobile_language',
};

// Initial Seed Data for Pakistani Fertilizer Dealership
export const INITIAL_PRODUCTS: MobileProduct[] = [
  {
    id: 'prod-1',
    name: 'Sona Urea (Prilled)',
    nameUrdu: 'سونا یوریا (دانے دار)',
    category: 'Urea (یوریا)',
    sku: 'FFC-UREA-50KG',
    barcode: '896400010012',
    costPrice: 4200,
    retailPrice: 4500,
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
    sku: 'ENGRO-DAP-50KG',
    barcode: '896400020025',
    costPrice: 11800,
    retailPrice: 12500,
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
    sku: 'FATIMA-CAN-50KG',
    barcode: '896400030038',
    costPrice: 3600,
    retailPrice: 3850,
    stockBags: 85,
    minStockWarning: 25,
    bagSizeKg: 50,
    company: 'Fatima Fertilizer',
  },
  {
    id: 'prod-4',
    name: 'SOP Potash (Sulphate of Potash)',
    nameUrdu: 'اینگرو پوٹاش ایس او پی',
    category: 'Potash (پوٹاش)',
    sku: 'ENGRO-SOP-50KG',
    barcode: '896400040041',
    costPrice: 13500,
    retailPrice: 14200,
    stockBags: 45,
    minStockWarning: 20,
    bagSizeKg: 50,
    company: 'Engro Fertilizers Ltd',
  },
  {
    id: 'prod-5',
    name: 'FMC Furadan 3G (Carbofuran Granules)',
    nameUrdu: 'ایف ایم سی فیوراڈان کیڑے مار',
    category: 'Pesticides (کیڑے مار زہریں)',
    sku: 'FMC-FUR-8KG',
    barcode: '896400050054',
    costPrice: 2100,
    retailPrice: 2400,
    stockBags: 60,
    minStockWarning: 15,
    bagSizeKg: 8,
    company: 'FMC Pakistan',
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
    id: 'cust-1',
    name: 'Haji Muhammad Akram',
    nameUrdu: 'حاجی محمد اکرم',
    village: 'Chak 45/12-L, Chichawatni',
    phone: '03007654321',
    cnic: '36502-1234567-1',
    totalBalance: 145000,
    creditLimit: 250000,
    guarantorName: 'Chaudhry Bashir Ahmed',
  },
  {
    id: 'cust-2',
    name: 'Chaudhry Aslam Virk',
    nameUrdu: 'چوہدری اسلم ورک',
    village: 'Mauza Kotla, Sahiwal',
    phone: '03019876543',
    cnic: '36501-9876543-3',
    totalBalance: 320000,
    creditLimit: 300000,
    guarantorName: 'Mian Tariq Advocate',
  },
  {
    id: 'cust-3',
    name: 'Malik Riaz Ahmad',
    nameUrdu: 'ملک ریاض احمد',
    village: 'Basti Qadirabad',
    phone: '03031234567',
    cnic: '36502-3344556-5',
    totalBalance: 48000,
    creditLimit: 150000,
    guarantorName: 'Rana Naveed',
  },
  {
    id: 'cust-4',
    name: 'Rana Naveed Akhtar',
    nameUrdu: 'رانا نوید اختر',
    village: 'Chak 110/9-L',
    phone: '03058899001',
    cnic: '36502-7788990-7',
    totalBalance: 0,
    creditLimit: 200000,
    guarantorName: 'Self (حلفیہ)',
  },
];

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

export async function recordSale(
  sale: MobileSaleRecord,
  isOnline: boolean
): Promise<{ sale: MobileSaleRecord; queued: boolean }> {
  const sales = await getSales();
  sale.isSynced = isOnline;
  sales.unshift(sale);
  await setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

  // If offline, add to offline queue
  let queued = false;
  if (!isOnline) {
    const queue = await getOfflineQueue();
    queue.push(sale);
    await setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    queued = true;
  }

  // Atomic stock deduction
  const products = await getProducts();
  for (const item of sale.items) {
    const p = products.find((prod) => prod.id === item.productId);
    if (p) {
      p.stockBags = Math.max(0, p.stockBags - item.quantity);
    }
  }
  await saveProducts(products);

  // If credit, add balance to customer
  if (sale.balanceDue > 0 && sale.customerId !== 'cash-walkin') {
    await updateCustomerBalance(sale.customerId, sale.balanceDue);
  }

  return { sale, queued };
}

export async function clearOfflineQueue(): Promise<number> {
  const queue = await getOfflineQueue();
  const count = queue.length;
  await setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));

  // Mark all sales in sales list as synced
  const sales = await getSales();
  for (const s of sales) {
    s.isSynced = true;
  }
  await setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  return count;
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
