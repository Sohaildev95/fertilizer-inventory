'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../../lib/language-context';
import { apiRequest } from '../../../lib/api-client';
import {
  Truck,
  Package,
  Search,
  PlusCircle,
  FileText,
  Calendar,
  Wallet,
  Building2,
  Trash2,
  Printer,
  CheckCircle2,
  Loader2,
  Receipt,
  Plus,
  Clock,
  Send,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import { DatePicker } from '../../../components/ui/date-picker';

interface PurchaseRecord {
  id: string;
  invoice_no: string;
  vendor_id: string;
  purchase_date: string;
  subtotal: number;
  discount: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
  payment_method: string;
  notes?: string;
  created_at: string;
  vendors?: {
    id: string;
    name: string;
    company_name?: string;
    city?: string;
    phone?: string;
  };
  purchase_items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products?: {
      name: string;
      urdu_name?: string;
      unit?: string;
    };
  }>;
}

interface ProductItem {
  id: string;
  name: string;
  urdu_name?: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  company_name: string;
}

interface VendorItem {
  id: string;
  name: string;
  company_name?: string;
  city?: string;
  phone?: string;
  current_balance: number;
}

export default function PurchasesPage() {
  const { isUrdu } = useLanguage();
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);
  const [availableVendors, setAvailableVendors] = useState<VendorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filterVendor, setFilterVendor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Stats
  const [apiStats, setApiStats] = useState<{
    totalCount: number;
    totalPurchased: number;
    totalPaid: number;
    totalBalanceDue: number;
    todayPurchasedAmount: number;
  } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<PurchaseRecord | null>(null);

  // Form State for New Stock-In Purchase
  const [formData, setFormData] = useState({
    vendorId: '',
    invoiceNo: '',
    purchaseDate: new Date().toISOString().slice(0, 10),
    vehicleNo: '',
    biltyNo: '',
    destination: 'گودام 1 - مین ہال',
    paymentMethod: 'bank_transfer' as 'cash' | 'bank_transfer' | 'cheque',
    discount: '0',
    paidAmount: '0',
    notes: '',
  });

  const [formItems, setFormItems] = useState<
    Array<{ productId: string; quantity: number; unitPrice: number }>
  >([
    { productId: '', quantity: 100, unitPrice: 4200 },
  ]);

  // Load live data from API
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [purchasesRes, statsRes, vendorsRes, productsRes] = await Promise.all([
        apiRequest<{ data: PurchaseRecord[] }>('/purchases?limit=100'),
        apiRequest<{
          totalCount: number;
          totalPurchased: number;
          totalPaid: number;
          totalBalanceDue: number;
          todayPurchasedAmount: number;
        }>('/purchases/stats/summary'),
        apiRequest<{ data: VendorItem[] }>('/vendors?limit=100'),
        apiRequest<{ data: ProductItem[] }>('/products?limit=100'),
      ]);

      if (purchasesRes?.data) setPurchases(purchasesRes.data);
      if (statsRes) setApiStats(statsRes);
      if (vendorsRes?.data) {
        setAvailableVendors(vendorsRes.data);
        if (vendorsRes.data.length > 0 && !formData.vendorId) {
          setFormData((prev) => ({ ...prev, vendorId: vendorsRes.data[0]!.id }));
        }
      }
      if (productsRes?.data) {
        setAvailableProducts(productsRes.data);
        if (productsRes.data.length > 0) {
          setFormItems([
            {
              productId: productsRes.data[0]!.id,
              quantity: 100,
              unitPrice: Number(productsRes.data[0]!.cost_price) || 4200,
            },
          ]);
        }
      }
    } catch (err) {
      console.warn('Failed to load purchases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calculations for KPI Cards
  const totalPurchasesAmount = useMemo(() => {
    if (apiStats) return apiStats.totalPurchased;
    return purchases.reduce((acc, p) => acc + Number(p.total_amount || 0), 0);
  }, [apiStats, purchases]);

  const totalBagsReceived = useMemo(() => {
    return purchases.reduce((acc, p) => {
      const itemsQty = p.purchase_items?.reduce((s, it) => s + Number(it.quantity || 0), 0) || 0;
      return acc + itemsQty;
    }, 0);
  }, [purchases]);

  const totalUnpaidPayables = useMemo(() => {
    if (apiStats) return apiStats.totalBalanceDue;
    return purchases.reduce((acc, p) => acc + Number(p.balance_due || 0), 0);
  }, [apiStats, purchases]);

  const todayPurchasedAmount = useMemo(() => {
    return apiStats?.todayPurchasedAmount || 0;
  }, [apiStats]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      const q = search.toLowerCase();
      const vendorName = item.vendors?.name || item.vendors?.company_name || '';
      const notes = item.notes || '';
      const matchSearch =
        item.invoice_no.toLowerCase().includes(q) ||
        vendorName.toLowerCase().includes(q) ||
        notes.toLowerCase().includes(q) ||
        (item.purchase_items &&
          item.purchase_items.some(
            (it) =>
              it.products?.name?.toLowerCase().includes(q) ||
              it.products?.urdu_name?.toLowerCase().includes(q),
          ));

      const matchVendor = filterVendor === 'all' || item.vendor_id === filterVendor;
      const matchStatus = filterStatus === 'all' || item.payment_status === filterStatus;

      return matchSearch && matchVendor && matchStatus;
    });
  }, [purchases, search, filterVendor, filterStatus]);

  // Form dynamic item handlers
  const handleAddItem = () => {
    const defaultProd = availableProducts[0];
    setFormItems([
      ...formItems,
      {
        productId: defaultProd?.id || '',
        quantity: 50,
        unitPrice: Number(defaultProd?.cost_price) || 4200,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: 'productId' | 'quantity' | 'unitPrice',
    value: string | number,
  ) => {
    const updated = [...formItems];
    const current = updated[index];
    if (!current) return;

    if (field === 'productId') {
      const selected = availableProducts.find((p) => p.id === value);
      updated[index] = {
        ...current,
        productId: String(value),
        unitPrice: selected ? Number(selected.cost_price) || 4200 : current.unitPrice,
      };
    } else if (field === 'quantity') {
      updated[index] = {
        ...current,
        quantity: Math.max(1, Number(value) || 1),
      };
    } else if (field === 'unitPrice') {
      updated[index] = {
        ...current,
        unitPrice: Math.max(0, Number(value) || 0),
      };
    }
    setFormItems(updated);
  };

  const calculatedSubtotal = useMemo(() => {
    return formItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [formItems]);

  const calculatedDiscount = Number(formData.discount) || 0;
  const calculatedGrandTotal = Math.max(0, calculatedSubtotal - calculatedDiscount);
  const calculatedPaid = Number(formData.paidAmount) || 0;
  const calculatedBalanceDue = Math.max(0, calculatedGrandTotal - calculatedPaid);

  // Submit Handler: Save Purchase (Stock-In)
  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorId) {
      alert('سپلائر یا کمپنی منتخب کرنا لازمی ہے');
      return;
    }

    if (formItems.some((i) => !i.productId || i.quantity <= 0)) {
      alert('براہ کرم تمام آئٹمز اور ان کی درست تعداد منتخب کریں');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest<{ success: boolean; purchase: PurchaseRecord }>('/purchases', {
        method: 'POST',
        body: JSON.stringify({
          vendorId: formData.vendorId,
          invoiceNo: formData.invoiceNo.trim() || undefined,
          purchaseDate: formData.purchaseDate,
          items: formItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          discount: calculatedDiscount,
          paidAmount: calculatedPaid,
          paymentMethod: formData.paymentMethod,
          vehicleNo: formData.vehicleNo.trim() || undefined,
          biltyNo: formData.biltyNo.trim() || undefined,
          notes: formData.destination.trim() || undefined,
        }),
      });

      setIsAddModalOpen(false);

      // Reset form
      setFormData({
        vendorId: availableVendors[0]?.id || '',
        invoiceNo: '',
        purchaseDate: new Date().toISOString().slice(0, 10),
        vehicleNo: '',
        biltyNo: '',
        destination: 'گودام 1 - مین ہال',
        paymentMethod: 'bank_transfer',
        discount: '0',
        paidAmount: '0',
        notes: '',
      });

      // Reload list and stats
      await loadData();

      // Open newly created purchase in preview modal
      if (res?.purchase) {
        setViewingPurchase(res.purchase);
      }
    } catch (err: any) {
      alert(`خریداری محفوظ کرنے میں خرابی: ${err?.message || 'Error saving purchase'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper formatting currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Banner & Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f3443 0%, #34e89e 100%)',
          color: '#ffffff',
        }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl shadow-xl border border-white/10"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-emerald-100 border border-white/20">
              {isUrdu ? 'خریداری و مال آمد' : 'Procurement & Stock In'}
            </span>
            <span className="text-xs text-emerald-100/80">
              {isUrdu ? 'کھاد کمپنیوں سے آمد' : 'Fertilizer Mill Deliveries'}
            </span>
          </div>
          <h1 className={`text-2xl md:text-3xl font-extrabold text-white tracking-tight ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? 'مال کی خریداری و اسٹاک آمد' : 'Purchases & Stock-In'}
          </h1>
          <p className="text-sm text-emerald-100/90 mt-1">
            {isUrdu
              ? 'کھاد کمپنیوں سے مال کی آمد، ٹرک و بلٹی ریکارڈ، بوریوں کی تعداد اور گودام میں خودکار اسٹاک کا اضافہ'
              : 'Record incoming fertilizer trailers, bilty details, supplier invoices, and inventory increments.'}
          </p>
        </div>

        <button
          onClick={() => {
            setFormData((prev) => ({
              ...prev,
              invoiceNo: `PUR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
                1000 + Math.random() * 9000,
              )}`,
            }));
            setIsAddModalOpen(true);
          }}
          className="bg-white text-emerald-950 hover:bg-emerald-50 px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition active:scale-95 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span className={isUrdu ? 'font-urdu' : ''}>
            {isUrdu ? 'نیا مال داخل کریں (Stock In)' : 'New Stock-In Purchase'}
          </span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Purchases */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل خریداری مال' : 'Total Purchases'}
            </h3>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatCurrency(totalPurchasesAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'کمپنیوں سے خریدا گیا مال' : 'Total invoice value from suppliers'}
          </div>
        </div>

        {/* Bags Received */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'موصولہ بوریاں' : 'Total Bags Received'}
            </h3>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
            {totalBagsReceived.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-500">{isUrdu ? 'بوریاں' : 'Bags'}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'گودام میں شامل شدہ کھاد' : 'Added to current warehouse stock'}
          </div>
        </div>

        {/* Unpaid Payables */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'سپلائر کے بقایا جات' : 'Pending Payables'}
            </h3>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
            {formatCurrency(totalUnpaidPayables)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'کمپنیوں کو دینے والی رقم' : 'Outstanding dues on purchase bills'}
          </div>
        </div>

        {/* Today Purchases */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'آج کی مال آمد' : "Today's Delivery"}
            </h3>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {formatCurrency(todayPurchasedAmount)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'آج کی تاریخ میں اتارا گیا مال' : 'Billed stock received today'}
          </div>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isUrdu
                ? 'بل نمبر، کمپنی، گاڑی نمبر یا پراڈکٹ تلاش کریں...'
                : 'Search bill #, company, vehicle, or product...'
            }
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-2.5">
          {/* Vendor Filter */}
          <Select value={filterVendor} onValueChange={setFilterVendor}>
            <SelectTrigger className="w-full sm:w-[200px] bg-slate-50 border-slate-200 text-xs sm:text-sm h-[40px] rounded-xl">
              <SelectValue placeholder={isUrdu ? 'تمام کمپنیاں' : 'All Vendors'} />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 z-[120]">
              <SelectItem value="all">{isUrdu ? 'تمام کمپنیاں (All Vendors)' : 'All Vendors'}</SelectItem>
              {availableVendors.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.company_name || v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[170px] bg-slate-50 border-slate-200 text-xs sm:text-sm h-[40px] rounded-xl">
              <SelectValue placeholder={isUrdu ? 'تمام بل اسٹیٹس' : 'All Status'} />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 z-[120]">
              <SelectItem value="all">{isUrdu ? 'تمام بل (All Status)' : 'All Status'}</SelectItem>
              <SelectItem value="paid">{isUrdu ? 'مکمل ادا شدہ (Paid)' : 'Paid'}</SelectItem>
              <SelectItem value="partial">{isUrdu ? 'جزوی ادا (Partial)' : 'Partial'}</SelectItem>
              <SelectItem value="unpaid">{isUrdu ? 'غیر ادا شدہ (Unpaid)' : 'Unpaid'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Purchases List Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'بل نمبر و تاریخ' : 'Invoice & Date'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'سپلائر کمپنی' : 'Supplier Company'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'آمد مال (تفصیل)' : 'Items Received'}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'کل رقم' : 'Total Bill'}</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">{isUrdu ? 'ادائیگی اسٹیٹس' : 'Payment'}</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">{isUrdu ? 'اقدامات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <p>{isUrdu ? 'خریداری کا ریکارڈ لوڈ ہو رہا ہے...' : 'Loading purchases data...'}</p>
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 whitespace-nowrap">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-slate-600">
                      {isUrdu ? 'کوئی بل نہیں ملا' : 'No purchase records found matching criteria.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => {
                  const remaining = Number(purchase.balance_due || 0);
                  const totalBags =
                    purchase.purchase_items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
                  const vendorName = purchase.vendors?.company_name || purchase.vendors?.name || 'کھاد کمپنی';

                  return (
                    <tr key={purchase.id} className="hover:bg-slate-50/60 transition group whitespace-nowrap">
                      {/* Bill & Date */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div
                          className="flex flex-col whitespace-nowrap cursor-pointer"
                          onClick={() => setViewingPurchase(purchase)}
                        >
                          <span className="font-bold text-slate-900 text-sm font-mono flex items-center gap-1.5 hover:text-emerald-700 transition whitespace-nowrap">
                            <FileText className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            {purchase.invoice_no}
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {purchase.purchase_date}
                          </span>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5 whitespace-nowrap">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div className="whitespace-nowrap">
                            <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{vendorName}</div>
                            <div className="text-xs text-slate-400 whitespace-nowrap">
                              {purchase.vendors?.city || 'ملتان ڈپو'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col whitespace-nowrap">
                          <span className="font-semibold text-slate-800 text-xs flex items-center gap-1.5 whitespace-nowrap">
                            <Package className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            {totalBags} {isUrdu ? 'بوریاں موصول' : 'Bags'}
                          </span>
                          <span className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[220px]">
                            {purchase.purchase_items?.map((it) => `${it.products?.urdu_name || it.products?.name} (${it.quantity})`).join(', ') || purchase.notes || 'کھاد لاٹ'}
                          </span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="text-sm font-extrabold text-slate-900 font-mono whitespace-nowrap">
                          {formatCurrency(Number(purchase.total_amount || 0))}
                        </div>
                        {remaining > 0 ? (
                          <div className="text-[11px] font-mono text-rose-500 whitespace-nowrap">
                            {isUrdu ? 'بقایا: ' : 'Due: '}
                            {formatCurrency(remaining)}
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-emerald-600 whitespace-nowrap">
                            {isUrdu ? 'مکمل ادا' : 'Fully Paid'}
                          </div>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                            purchase.payment_status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : purchase.payment_status === 'partial'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              purchase.payment_status === 'paid'
                                ? 'bg-emerald-500'
                                : purchase.payment_status === 'partial'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          ></span>
                          {purchase.payment_status === 'paid'
                            ? isUrdu ? 'ادا شدہ' : 'Paid'
                            : purchase.payment_status === 'partial'
                            ? isUrdu ? 'جزوی ادا' : 'Partial'
                            : isUrdu ? 'غیر ادا شدہ' : 'Unpaid'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setViewingPurchase(purchase)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition mx-auto"
                          title={isUrdu ? 'بل و وصولی چالان دیکھیں' : 'View Receiving Slip'}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'چالان بل' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: NEW PURCHASE STOCK-IN                                            */}
      {/* ========================================================================= */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'نیا مال خریداری کا اندراج (Stock-In)' : 'Record New Purchase Stock-In'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu
                ? 'کمپنی سے آنے والے ٹرک کی تفصیل درج کریں۔ بوریوں کی تعداد خود بخود گودام کے اسٹاک میں جمع ہو جائے گی۔'
                : 'Enter bill & trailer details. Bags will be automatically added to warehouse inventory.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePurchase} className="flex-1 flex flex-col overflow-hidden">
            <DialogBody>
              <div className="space-y-4">
                {/* Row 1: Vendor & Invoice No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'سپلائر یا کھاد کمپنی*' : 'Supplier / Fertilizer Mill*'}
                    </label>
                    <Select
                      value={formData.vendorId}
                      onValueChange={(val) => setFormData({ ...formData, vendorId: val })}
                    >
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[42px]">
                        <SelectValue placeholder={isUrdu ? 'کمپنی منتخب کریں...' : 'Select vendor...'} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                        {availableVendors.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.company_name || v.name} ({v.city || 'ملتان'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'انوائس یا بل نمبر' : 'Invoice / Bill Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNo}
                      onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                      placeholder="PUR-20261019-XXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 2: Date, Vehicle, Bilty */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'تاریخ بل*' : 'Purchase Date*'}
                    </label>
                    <DatePicker
                      value={formData.purchaseDate}
                      onChange={(d) => setFormData({ ...formData, purchaseDate: d })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'گاڑی / ٹرک نمبر' : 'Truck / Trailer Plate'}
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleNo}
                      onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                      placeholder={isUrdu ? 'مثلاً: TK-7842 ملتان گڈز' : 'TK-7842'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'بلٹی نمبر' : 'Bilty / GR Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.biltyNo}
                      onChange={(e) => setFormData({ ...formData, biltyNo: e.target.value })}
                      placeholder="BL-9921"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="rounded-2xl border border-slate-700/80 bg-slate-800/40 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-4 h-4" />
                      {isUrdu ? 'آمد مال کی تفصیل (بوریاں و ریٹ)' : 'Line Items (Bags & Unit Cost)'}
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/40 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'مزید آئٹم شامل کریں' : 'Add Item'}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {formItems.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center gap-2.5 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                        {/* Product Select */}
                        <div className="flex-1 w-full sm:w-auto">
                          <Select
                            value={item.productId}
                            onValueChange={(val) => handleItemChange(idx, 'productId', val)}
                          >
                            <SelectTrigger className="w-full bg-slate-900 border-slate-700 text-white h-[38px] text-xs">
                              <SelectValue placeholder={isUrdu ? 'کھاد پراڈکٹ منتخب کریں...' : 'Choose product...'} />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-white z-[160]">
                              {availableProducts.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.urdu_name || p.name} ({p.company_name})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quantity */}
                        <div className="w-full sm:w-28 flex items-center gap-1">
                          <span className="text-[11px] text-slate-400 sm:hidden">{isUrdu ? 'بوریاں:' : 'Qty:'}</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            placeholder="بوریاں"
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-center focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        {/* Rate */}
                        <div className="w-full sm:w-32 flex items-center gap-1">
                          <span className="text-[11px] text-slate-400 sm:hidden">{isUrdu ? 'ریٹ:' : 'Rate:'}</span>
                          <input
                            type="number"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            placeholder="ریٹ"
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono text-right focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        {/* Line Total */}
                        <div className="w-full sm:w-32 text-right font-mono font-bold text-xs text-emerald-400 px-2">
                          Rs. {(item.quantity * item.unitPrice).toLocaleString()}
                        </div>

                        {/* Delete button */}
                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary & Payment */}
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-1">{isUrdu ? 'سب ٹوٹل بل:' : 'Subtotal:'}</span>
                      <span className="text-base font-bold text-white font-mono">
                        {formatCurrency(calculatedSubtotal)}
                      </span>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">{isUrdu ? 'ڈسکاؤنٹ (روپے):' : 'Discount (PKR):'}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">{isUrdu ? 'موقع پر ادا شدہ:' : 'Paid Now (PKR):'}</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.paidAmount}
                        onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-emerald-400 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1">{isUrdu ? 'باقی واجب الادا کھاتہ:' : 'Balance Due:'}</span>
                      <span className="text-base font-black text-rose-400 font-mono">
                        {formatCurrency(calculatedBalanceDue)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isUrdu ? 'طریقہ ادائیگی' : 'Payment Mode'}
                      </label>
                      <Select
                        value={formData.paymentMethod}
                        onValueChange={(val: any) => setFormData({ ...formData, paymentMethod: val })}
                      >
                        <SelectTrigger className="w-full bg-slate-900 border-slate-700 text-white h-[38px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-700 text-white z-[160]">
                          <SelectItem value="bank_transfer">{isUrdu ? 'بینک ٹرانسفر (Bank Online)' : 'Bank Online'}</SelectItem>
                          <SelectItem value="cash">{isUrdu ? 'نقد رقم (Cash Counter)' : 'Cash Counter'}</SelectItem>
                          <SelectItem value="cheque">{isUrdu ? 'بینک چیک (Cheque)' : 'Cheque'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {isUrdu ? 'گودام / منزل' : 'Warehouse Location'}
                      </label>
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                        placeholder={isUrdu ? 'گودام 1 - مین ہال' : 'Godown 1'}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition transform active:scale-95 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isUrdu ? 'مال محفوظ کریں اور اسٹاک بڑھائیں' : 'Save & Increment Stock'}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW PURCHASE & PRINTABLE RECEIVING CHALLAN                      */}
      {/* ========================================================================= */}
      <Dialog open={!!viewingPurchase} onOpenChange={(open) => !open && setViewingPurchase(null)}>
        <DialogContent className="max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl p-6">
          {viewingPurchase && (
            <>
              <DialogHeader>
                <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? 'خریداری بل و وصولی چالان' : 'Purchase Receiving Challan'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 font-mono">
                  {viewingPurchase.invoice_no} — {viewingPurchase.purchase_date}
                </DialogDescription>
              </DialogHeader>

              <DialogBody>
                {/* Printable Challan Box */}
                <div
                  id="printable-purchase-bill"
                  className="bg-white text-slate-900 rounded-2xl p-5 shadow-inner border border-slate-200 text-xs space-y-3 font-sans"
                  dir={isUrdu ? 'rtl' : 'ltr'}
                >
                  {/* Header */}
                  <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
                    <h2 className="text-lg font-black text-emerald-800">
                      {isUrdu ? 'پنجاب کھاد ایجنسی اینڈ زرعی ادویات' : 'Punjab Fertilizer Agency'}
                    </h2>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {isUrdu ? 'خریداری و گودام آمد چالان (Stock-In Receiving Challan)' : 'Stock-In Goods Receipt Note'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Main Mandi, Depalpur Road • Phone: 0300-7654321
                    </p>
                  </div>

                  {/* Meta details grid */}
                  <div className="grid grid-cols-2 gap-2 py-2 border-b border-dashed border-slate-300 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">{isUrdu ? 'سپلائر کمپنی:' : 'Supplier:'}</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {viewingPurchase.vendors?.company_name || viewingPurchase.vendors?.name || 'سپلائر'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">{isUrdu ? 'انوائس نمبر:' : 'Invoice #:'}</span>
                      <span className="font-bold font-mono text-slate-900">{viewingPurchase.invoice_no}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">{isUrdu ? 'تاریخ آمد:' : 'Date:'}</span>
                      <span className="font-mono text-slate-800">{viewingPurchase.purchase_date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">{isUrdu ? 'تفصیل / ٹرک:' : 'Remarks / Vehicle:'}</span>
                      <span className="text-slate-800 truncate block">{viewingPurchase.notes || 'ٹرک ڈلیوری'}</span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 text-[11px]">
                        <tr>
                          <th className="py-2 px-3 font-bold">{isUrdu ? 'کھاد و آئٹم نام' : 'Item Description'}</th>
                          <th className="py-2 px-3 font-bold text-center">{isUrdu ? 'تعداد (بوریاں)' : 'Qty (Bags)'}</th>
                          <th className="py-2 px-3 font-bold text-right">{isUrdu ? 'ریٹ فی بوری' : 'Rate'}</th>
                          <th className="py-2 px-3 font-bold text-right">{isUrdu ? 'کل رقم' : 'Total'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {viewingPurchase.purchase_items?.map((it, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-slate-800">
                              {it.products?.urdu_name || it.products?.name || 'کھاد'}
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                              {it.quantity}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-700">
                              {formatCurrency(Number(it.unit_price || 0))}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                              {formatCurrency(Number(it.total_price || 0))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Financial Summary */}
                  <div className="pt-2 border-t border-dashed border-slate-300 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>{isUrdu ? 'کل انوائس رقم:' : 'Total Invoice Amount:'}</span>
                      <span className="font-bold text-slate-900 font-mono text-sm">
                        {formatCurrency(Number(viewingPurchase.total_amount || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>{isUrdu ? 'ادا شدہ رقم:' : 'Amount Paid:'}</span>
                      <span className="font-mono">{formatCurrency(Number(viewingPurchase.paid_amount || 0))}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 font-bold pt-1 border-t border-slate-200">
                      <span>{isUrdu ? 'سپلائر کھاتہ میں باقی واجب الادا:' : 'Balance Due to Vendor:'}</span>
                      <span className="font-mono text-sm">
                        {formatCurrency(Number(viewingPurchase.balance_due || 0))}
                      </span>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div className="flex justify-between items-end pt-4 px-2 text-[10px] text-slate-500">
                    <div className="border-t border-slate-400 pt-1 w-24 text-center">
                      {isUrdu ? 'دستخط گودام انچارج' : 'Store Keeper'}
                    </div>
                    <div className="border-t border-slate-400 pt-1 w-24 text-center">
                      {isUrdu ? 'دستخط ڈرائیور / ٹرانسپورٹ' : 'Driver / Carrier'}
                    </div>
                  </div>
                </div>
              </DialogBody>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isUrdu ? 'پرنٹ چالان بل (Print Challan)' : 'Print Challan'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingPurchase(null)}
                  className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition"
                >
                  {isUrdu ? 'بند کریں' : 'Close'}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Specific CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-purchase-bill,
          #printable-purchase-bill * {
            visibility: visible !important;
          }
          #printable-purchase-bill {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            background: white !important;
            color: black !important;
            display: block !important;
          }
          @page {
            margin: 5mm;
            size: auto;
          }
        }
      `}</style>
    </div>
  );
}
