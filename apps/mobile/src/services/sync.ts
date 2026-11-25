import {
  getApiBaseUrl,
  saveProducts,
  saveCustomers,
  saveCachedFasliForecast,
  saveCachedMarginsReport,
  saveCachedBroadcastTemplates,
  setLastSyncedAt,
  getOfflineQueue,
  getOfflinePayments,
  markSaleSynced,
  markPaymentSynced,
  queueExistingSaleOffline,
  queuePaymentOffline,
  updateCustomerBalance,
  recordSale,
} from './storage';
import { MobileCustomer, MobilePaymentRecord, MobileProduct, MobileSaleRecord } from '../types';

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function testServerConnection(customUrl?: string): Promise<boolean> {
  try {
    const baseUrl = (customUrl || (await getApiBaseUrl())).replace(/\/+$/, '');
    const res = await fetchWithTimeout(`${baseUrl}/customers/stats/summary`, {}, 3500);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Pull live Products, Customers, Fasli Forecast, Per-Bag Margins, and Broadcast Templates
 * from NestJS backend and cache into AsyncStorage for full offline access.
 */
export async function syncAllFromServer(): Promise<{
  success: boolean;
  productsCount: number;
  customersCount: number;
  error?: string;
}> {
  try {
    const baseUrl = await getApiBaseUrl();

    const [prodRes, custRes, fasliRes, marginsRes, tmplRes] = await Promise.all([
      fetchWithTimeout(`${baseUrl}/products?limit=100`),
      fetchWithTimeout(`${baseUrl}/customers?limit=100`),
      fetchWithTimeout(`${baseUrl}/customers/fasli-udhaar/forecast`),
      fetchWithTimeout(`${baseUrl}/reports/per-bag-margins?timeRange=this_month`),
      fetchWithTimeout(`${baseUrl}/campaigns/templates`),
    ]);

    let productsCount = 0;
    let customersCount = 0;

    if (prodRes.ok) {
      const json = await prodRes.json();
      const rows = json?.data || [];
      if (Array.isArray(rows) && rows.length > 0) {
        const mapped: MobileProduct[] = rows.map((p: any) => ({
          id: p.id,
          name: p.name,
          nameUrdu: p.urdu_name || p.name,
          category: p.category?.name || p.unit || 'Fertilizer',
          sku: p.sku || `SKU-${String(p.id).slice(0, 6).toUpperCase()}`,
          barcode: p.barcode || p.sku || String(p.id).slice(0, 12),
          costPrice: Number(p.cost_price || 0),
          retailPrice: Number(p.sale_price || 0),
          stockBags: Number(p.current_stock || 0),
          minStockWarning: Number(p.min_stock_alert || 15),
          bagSizeKg: 50,
          company: p.company_name || 'Local Brand',
        }));
        await saveProducts(mapped);
        productsCount = mapped.length;
      }
    }

    if (custRes.ok) {
      const json = await custRes.json();
      const rows = json?.data || [];
      if (Array.isArray(rows) && rows.length > 0) {
        const mapped: MobileCustomer[] = rows.map((c: any) => ({
          id: c.id,
          name: c.name,
          nameUrdu: c.name,
          village: c.village || 'چک لوکل',
          phone: c.phone || '',
          cnic: c.cnic || '',
          totalBalance: Number(c.current_balance || 0),
          creditLimit: Number(c.credit_limit || 500000),
          guarantorName: c.notes?.match(/ضمانتی:\s*([^|•]+)/)?.[1]?.trim() || 'ذاتی ضمانت',
          currentCrop: c.notes?.match(/فصل:\s*([^|•]+)/)?.[1]?.trim(),
        }));
        await saveCustomers(mapped);
        customersCount = mapped.length;
      }
    }

    if (fasliRes.ok) {
      const fasliJson = await fasliRes.json();
      if (fasliJson?.summary) {
        await saveCachedFasliForecast(fasliJson);
      }
    }

    if (marginsRes.ok) {
      const marginsJson = await marginsRes.json();
      if (marginsJson?.summary) {
        await saveCachedMarginsReport(marginsJson);
      }
    }

    if (tmplRes.ok) {
      const tmplJson = await tmplRes.json();
      if (Array.isArray(tmplJson) && tmplJson.length > 0) {
        await saveCachedBroadcastTemplates(tmplJson);
      }
    }

    if (!prodRes.ok && !custRes.ok) {
      return {
        success: false,
        productsCount: 0,
        customersCount: 0,
        error: 'API server unreachable',
      };
    }

    await setLastSyncedAt(new Date().toISOString());
    return { success: true, productsCount, customersCount };
  } catch (err: any) {
    return {
      success: false,
      productsCount: 0,
      customersCount: 0,
      error: err?.message || 'Network request failed',
    };
  }
}

async function postSaleToServer(baseUrl: string, sale: MobileSaleRecord): Promise<boolean> {
  const isWalkIn = sale.customerId === 'cash-walkin';
  const methodMap: Record<'CASH' | 'CREDIT' | 'BANK', string> = {
    CASH: 'cash',
    CREDIT: 'cash',
    BANK: 'bank_transfer',
  };

  const payload = {
    customerId: isWalkIn ? undefined : sale.customerId,
    customerType: isWalkIn ? 'walk_in' : 'registered',
    walkInName: isWalkIn ? sale.customerName : undefined,
    items: sale.items.map((it) => ({
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
    })),
    discount: sale.discount,
    paidAmount: sale.paidAmount,
    paymentMethod: methodMap[sale.paymentMethod] || 'cash',
    notes: `Mobile POS (${sale.invoiceNumber})`,
  };

  const res = await fetchWithTimeout(`${baseUrl}/sales`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.ok;
}

async function postPaymentToServer(
  baseUrl: string,
  payment: MobilePaymentRecord
): Promise<boolean> {
  const payload = {
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    notes: payment.notes || 'Mobile Khata Recovery (Wasooli)',
  };

  const res = await fetchWithTimeout(`${baseUrl}/customers/${payment.customerId}/payments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.ok;
}

/**
 * Push all queued offline sales and offline payment recoveries to the live server,
 * then pull latest products/customers/forecasts.
 */
export async function pushOfflineQueueToServer(): Promise<{
  salesSynced: number;
  paymentsSynced: number;
  failedCount: number;
  pulledFreshData: boolean;
}> {
  const baseUrl = await getApiBaseUrl();
  const salesQueue = await getOfflineQueue();
  const paymentsQueue = await getOfflinePayments();

  let salesSynced = 0;
  let paymentsSynced = 0;
  let failedCount = 0;

  for (const sale of salesQueue) {
    try {
      const ok = await postSaleToServer(baseUrl, sale);
      if (ok) {
        await markSaleSynced(sale.id);
        salesSynced++;
      } else {
        failedCount++;
      }
    } catch {
      failedCount++;
    }
  }

  for (const pay of paymentsQueue) {
    try {
      const ok = await postPaymentToServer(baseUrl, pay);
      if (ok) {
        await markPaymentSynced(pay.id);
        paymentsSynced++;
      } else {
        failedCount++;
      }
    } catch {
      failedCount++;
    }
  }

  const pullRes = await syncAllFromServer();
  return {
    salesSynced,
    paymentsSynced,
    failedCount,
    pulledFreshData: pullRes.success,
  };
}

/**
 * Submit a POS sale locally first, then sync with server if Online.
 * If server call fails even in Online mode, gracefully fall back to offline queue!
 */
export async function submitSaleWithSync(
  sale: MobileSaleRecord,
  isOnline: boolean
): Promise<{ sale: MobileSaleRecord; queued: boolean }> {
  const result = await recordSale(sale, isOnline);

  if (isOnline) {
    try {
      const baseUrl = await getApiBaseUrl();
      const ok = await postSaleToServer(baseUrl, result.sale);
      if (!ok) {
        await queueExistingSaleOffline(result.sale);
        return { sale: { ...result.sale, isSynced: false }, queued: true };
      }
      return { sale: { ...result.sale, isSynced: true }, queued: false };
    } catch {
      await queueExistingSaleOffline(result.sale);
      return { sale: { ...result.sale, isSynced: false }, queued: true };
    }
  }

  return result;
}

/**
 * Submit farmer Wasooli (payment recovery) locally, and sync or queue cleanly.
 */
export async function submitPaymentWithSync(
  customer: MobileCustomer,
  amount: number,
  notes: string,
  isOnline: boolean
): Promise<{ updatedCustomer: MobileCustomer | null; queued: boolean }> {
  const updatedCustomer = await updateCustomerBalance(customer.id, -amount);

  const payment: MobilePaymentRecord = {
    id: `pay-mob-${Date.now()}`,
    customerId: customer.id,
    customerName: customer.nameUrdu || customer.name,
    amount,
    paymentMethod: 'cash',
    notes: notes || 'Mobile Wasooli Recovery',
    createdAt: new Date().toISOString(),
    isSynced: isOnline,
  };

  if (!isOnline) {
    await queuePaymentOffline(payment);
    return { updatedCustomer, queued: true };
  }

  try {
    const baseUrl = await getApiBaseUrl();
    const ok = await postPaymentToServer(baseUrl, payment);
    if (!ok) {
      await queuePaymentOffline({ ...payment, isSynced: false });
      return { updatedCustomer, queued: true };
    }
    return { updatedCustomer, queued: false };
  } catch {
    await queuePaymentOffline({ ...payment, isSynced: false });
    return { updatedCustomer, queued: true };
  }
}
