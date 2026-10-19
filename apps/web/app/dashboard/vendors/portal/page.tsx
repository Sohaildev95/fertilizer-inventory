'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../../lib/language-context';
import { apiRequest } from '../../../../lib/api-client';
import {
  Building2,
  Truck,
  FileText,
  DollarSign,
  Package,
  Calendar,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Printer,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  Send,
  Sparkles,
  ShieldCheck,
  Tag,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { DatePicker } from '../../../../components/ui/date-picker';

interface VendorProfile {
  id: string;
  name: string;
  companyName?: string;
  contactPerson?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  city: string;
  address?: string;
  currentBalance: number;
  status: string;
}

interface PortalShipment {
  id: string;
  biltyNumber: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'paid' | 'partial' | 'unpaid';
  paymentMethod: string;
  notes?: string;
  totalBags: number;
  items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_id?: string;
  }>;
}

interface PortalPayment {
  id: string;
  paymentNumber: string;
  amount: number;
  method: string;
  date: string;
  chequeNumber?: string;
  notes?: string;
}

interface SuppliedProduct {
  id: string;
  name: string;
  urdu_name?: string;
  sku: string;
  company_name: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  min_stock_alert: number;
  rack_location?: string;
}

interface PortalData {
  vendor: VendorProfile;
  stats: {
    totalSuppliedValue: number;
    totalPaymentsReceived: number;
    currentBalanceDue: number;
    totalDeliveries: number;
    totalBagsSupplied: number;
  };
  recentShipments: PortalShipment[];
  recentPayments: PortalPayment[];
  suppliedProducts: SuppliedProduct[];
}

export default function VendorPortalPage() {
  const { isUrdu } = useLanguage();
  const [portalData, setPortalData] = useState<PortalData | null>(null);
  const [allVendorsList, setAllVendorsList] = useState<Array<{ id: string; name: string; company_name?: string }>>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shipments' | 'ledger' | 'products' | 'dispatch'>('shipments');
  const [searchShipment, setSearchShipment] = useState('');

  // Modals State
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedProductForPrice, setSelectedProductForPrice] = useState<SuppliedProduct | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Forms State
  const [priceForm, setPriceForm] = useState({
    newCostPrice: '',
    suggestedSalePrice: '',
    effectiveDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const [dispatchForm, setDispatchForm] = useState({
    truckNumber: '',
    biltyNumber: '',
    driverContact: '',
    productName: 'سونا یوریا کھاد ۵۰ کلو',
    bagsQuantity: '500',
    expectedArrival: 'کل صبح (۸ بجے)',
    notes: '',
  });

  // Load all vendors for switcher
  const loadVendorsList = async () => {
    try {
      const res = await apiRequest<{ data: any[] }>('/vendors?limit=20');
      if (res?.data && res.data.length > 0) {
        setAllVendorsList(
          res.data.map((v) => ({
            id: v.id,
            name: v.name,
            company_name: v.company_name,
          })),
        );
        if (!selectedVendorId) {
          setSelectedVendorId(res.data[0].id);
        }
      }
    } catch (err) {
      console.warn('Failed to load vendors list:', err);
    }
  };

  // Load portal dashboard data
  const loadPortalData = useCallback(async (vendorId?: string) => {
    setIsLoading(true);
    try {
      const url = vendorId
        ? `/vendors/portal/dashboard?vendorId=${vendorId}`
        : '/vendors/portal/dashboard';
      const data = await apiRequest<PortalData>(url);
      if (data) {
        setPortalData(data);
        if (!selectedVendorId && data.vendor?.id) {
          setSelectedVendorId(data.vendor.id);
        }
      }
    } catch (err) {
      console.error('Failed to load vendor portal dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedVendorId]);

  useEffect(() => {
    loadVendorsList();
  }, []);

  useEffect(() => {
    if (selectedVendorId) {
      loadPortalData(selectedVendorId);
    } else {
      loadPortalData();
    }
  }, [selectedVendorId, loadPortalData]);

  // Handle Price Revision Submit
  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForPrice || !portalData?.vendor.id) return;

    setIsSubmitting(true);
    try {
      await apiRequest(`/vendors/portal/${portalData.vendor.id}/price-update`, {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedProductForPrice.id,
          newCostPrice: Number(priceForm.newCostPrice),
          suggestedSalePrice: Number(priceForm.suggestedSalePrice) || undefined,
          effectiveDate: priceForm.effectiveDate,
          notes: priceForm.notes.trim() || undefined,
        }),
      });

      setSubmitSuccessMsg('نئے ریٹ کی اطلاع کامیابی کے ساتھ دکان انتظامیہ کو موصول ہو گئی ہے۔');
      setIsPriceModalOpen(false);
      setPriceForm({
        newCostPrice: '',
        suggestedSalePrice: '',
        effectiveDate: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setTimeout(() => setSubmitSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(`ریٹ اپڈیٹ بھیجنے میں خرابی: ${err?.message || 'Error sending price update'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Advance Dispatch Submit
  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalData?.vendor.id) return;

    setIsSubmitting(true);
    try {
      await apiRequest(`/vendors/portal/${portalData.vendor.id}/dispatch-notice`, {
        method: 'POST',
        body: JSON.stringify({
          truckNumber: dispatchForm.truckNumber.trim(),
          biltyNumber: dispatchForm.biltyNumber.trim() || undefined,
          driverContact: dispatchForm.driverContact.trim() || undefined,
          productName: dispatchForm.productName,
          bagsQuantity: Number(dispatchForm.bagsQuantity) || 100,
          expectedArrival: dispatchForm.expectedArrival,
          notes: dispatchForm.notes.trim() || undefined,
        }),
      });

      setSubmitSuccessMsg('ٹرک روانگی کی پیشگی اطلاع محفوظ ہو گئی ہے، دکان منشی کو میسج پہنچ گیا ہے۔');
      setIsDispatchModalOpen(false);
      setDispatchForm({
        truckNumber: '',
        biltyNumber: '',
        driverContact: '',
        productName: 'سونا یوریا کھاد ۵۰ کلو',
        bagsQuantity: '500',
        expectedArrival: 'کل صبح (۸ بجے)',
        notes: '',
      });
      setTimeout(() => setSubmitSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(`ڈسپیچ اطلاع محفوظ کرنے میں خرابی: ${err?.message || 'Error recording dispatch notice'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    if (!portalData?.recentShipments) return [];
    if (!searchShipment.trim()) return portalData.recentShipments;

    const q = searchShipment.toLowerCase().trim();
    return portalData.recentShipments.filter(
      (s) =>
        s.biltyNumber.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q)),
    );
  }, [portalData?.recentShipments, searchShipment]);

  // Unified Chronological Ledger for Vendor
  const unifiedLedger = useMemo(() => {
    if (!portalData) return [];

    interface LedgerEntry {
      id: string;
      date: string;
      description: string;
      refNumber: string;
      debit: number; // Consignment supplied (adds to shop debt)
      credit: number; // Payment made by shop (reduces debt)
      balance: number;
    }

    const list: LedgerEntry[] = [];

    // 1. Add shipments (Debits)
    (portalData.recentShipments || []).forEach((s) => {
      list.push({
        id: `ship-${s.id}`,
        date: s.date,
        description: s.notes ? `کھاد سپلائی بلٹی: ${s.notes}` : `ٹرک سپلائی بلٹی (#${s.biltyNumber})`,
        refNumber: s.biltyNumber,
        debit: s.totalAmount,
        credit: 0,
        balance: 0,
      });
    });

    // 2. Add payments received (Credits)
    (portalData.recentPayments || []).forEach((p) => {
      const method =
        p.method === 'bank_transfer'
          ? 'بینک آن لائن'
          : p.method === 'cheque'
          ? `بینک چیک #${p.chequeNumber || ''}`
          : 'کاؤنٹر نقد';

      list.push({
        id: `pay-${p.id}`,
        date: p.date,
        description: `دکان سے ادائیگی موصول بذریعہ ${method}`,
        refNumber: p.paymentNumber,
        debit: 0,
        credit: p.amount,
        balance: 0,
      });
    });

    // Sort chronologically
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate running balance
    let running = 0;
    return list.map((item) => {
      running += item.debit - item.credit;
      return {
        ...item,
        balance: running,
      };
    });
  }, [portalData]);

  const formatCurrency = (amt: number) => `Rs. ${(amt || 0).toLocaleString()}`;

  if (isLoading && !portalData) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="font-semibold text-sm">سپلائر پورٹل ڈیٹا لوڈ ہو رہا ہے...</span>
        </div>
      </div>
    );
  }

  const vendor = portalData?.vendor;
  const stats = portalData?.stats;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* ========================================================================= */}
      {/* 1. Portal Header & Company Switcher Banner                                */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-purple-950/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'آفیشل کھاد سپلائر سیلف سروس پورٹل' : 'Official Vendor Self-Service Portal'}</span>
              <span className="bg-purple-400 text-purple-950 text-[10px] px-1.5 py-0.5 rounded font-extrabold">PHASE 9</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isUrdu ? 'font-urdu' : ''}`}>
                {vendor?.name || 'کھاد کمپنی سپلائر'}
              </h1>
              {vendor?.city && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-purple-200">
                  📍 {vendor.city}
                </span>
              )}
            </div>

            <p className="text-sm text-purple-200/90 leading-relaxed">
              {isUrdu
                ? 'کمپنی ٹرک سپلائی بلٹی ٹریکنگ، موصولہ بینک ادائیگیاں، جامع کھاتہ لیجر اور نئی روانگی کی پیشگی اطلاع۔'
                : 'Vendor dispatch tracking, live khata ledger dues, product rates, and advance truck notifications.'}
            </p>

            <div className="flex items-center gap-4 text-xs text-purple-300 pt-1 flex-wrap">
              {vendor?.contactPerson && (
                <div>
                  <span className="text-purple-400 font-medium">رابطہ کار: </span>
                  <span className="text-white font-semibold">{vendor.contactPerson}</span>
                </div>
              )}
              {vendor?.phone && (
                <div>
                  <span className="text-purple-400 font-medium">فون: </span>
                  <span className="text-white font-semibold font-mono">{vendor.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Company Switcher & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
            {/* Vendor Switcher Dropdown */}
            {allVendorsList.length > 1 && (
              <div className="min-w-[190px]">
                <Select value={selectedVendorId} onValueChange={(val) => setSelectedVendorId(val)}>
                  <SelectTrigger className="w-full bg-white/10 border-white/20 text-white text-xs font-semibold focus:ring-purple-400">
                    <SelectValue placeholder="کمپنی منتخب کریں" />
                  </SelectTrigger>
                  <SelectContent>
                    {allVendorsList.map((v) => (
                      <SelectItem key={v.id} value={v.id} className="text-xs">
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-purple-950 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/30 transition active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>{isUrdu ? 'نئی روانگی اطلاع' : 'Dispatch Notice'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
              title="پرنٹ اسٹیٹمنٹ"
            >
              <Printer className="w-4 h-4 text-purple-300" />
              <span>{isUrdu ? 'پرنٹ اسٹیٹمنٹ' : 'Print Statement'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {submitSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{submitSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. Live Financial KPI Cards                                               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Balance Due from Shop (واجب الادا بقایا) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'دکان کی طرف واجب الادا رقم' : 'Net Balance Payable'}
            </span>
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatCurrency(stats?.currentBalanceDue || 0)}
            </div>
            <p className="text-xs text-amber-700 font-medium mt-1">
              {isUrdu ? 'دکان سے وصول طلب بقایا' : 'Receivable from dealership'}
            </p>
          </div>
        </div>

        {/* Card 2: Total Supplied Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل ترسیل شدہ مال کی مالیت' : 'Total Supplied Value'}
            </span>
            <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatCurrency(stats?.totalSuppliedValue || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isUrdu ? `${stats?.totalDeliveries || 0} ٹرک کنسائنمنٹس` : `${stats?.totalDeliveries || 0} Consignments`}
            </p>
          </div>
        </div>

        {/* Card 3: Payments Received from Dealership */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'دکان سے موصولہ ادائیگیاں' : 'Payments Cleared'}
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatCurrency(stats?.totalPaymentsReceived || 0)}
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              {isUrdu ? 'بینک و نقد کلیئر شدہ' : 'Bank & Cash Cleared'}
            </p>
          </div>
        </div>

        {/* Card 4: Total Fertilizer Bags Delivered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل سپلائی کردہ بوریاں' : 'Total Bags Supplied'}
            </span>
            <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {(stats?.totalBagsSupplied || 0).toLocaleString()} <span className="text-sm font-bold text-slate-600">بوریاں</span>
            </div>
            <p className="text-xs text-purple-700 font-medium mt-1">
              {isUrdu ? 'گودام میں وصول شدہ' : 'Received in Godown'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Navigation Tabs                                                        */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('shipments')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'shipments'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{isUrdu ? 'ٹرک سپلائی و بلٹی ٹریکنگ' : 'Shipments & Bilty'}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
            {portalData?.recentShipments?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isUrdu ? 'جامع ڈیجیٹل کھاتہ لیجر' : 'Unified Khata Ledger'}</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'products'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{isUrdu ? 'کمپنی پروڈکٹس و ریٹ لسٹ' : 'Products & Rates'}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">
            {portalData?.suppliedProducts?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dispatch')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dispatch'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{isUrdu ? 'نئی روانگی اطلاع فارم' : 'Dispatch Pre-Notice'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 4. Tab 1: Shipments & Bilty Tracking                                      */}
      {/* ========================================================================= */}
      {activeTab === 'shipments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className={`text-base sm:text-lg font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'ٹرک سپلائی کنسائنمنٹس (بلٹی ریکارڈ)' : 'Truck Shipments & Bilty Records'}
              </h2>
              <p className="text-xs text-slate-500">
                {isUrdu ? 'دکان گودام میں پہنچنے والے ٹرک، بلٹی نمبر، بوریوں کی تعداد اور ادائیگی کی تفصیل' : 'Inward stock arrivals with bilty references and payment clearance'}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchShipment}
                onChange={(e) => setSearchShipment(e.target.value)}
                placeholder={isUrdu ? 'بلٹی نمبر یا گاڑی تلاش کریں...' : 'Search Bilty / Truck #...'}
                className="w-full ps-9 pe-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200/80 text-slate-600 font-bold">
                  <th className="py-3 px-3 text-start">بلٹی / انوائس نمبر</th>
                  <th className="py-3 px-3 text-start">تاریخ ترسیل</th>
                  <th className="py-3 px-3 text-center">بوریاں</th>
                  <th className="py-3 px-3 text-end">کل بل مالیت</th>
                  <th className="py-3 px-3 text-end">ادا شدہ رقم</th>
                  <th className="py-3 px-3 text-end">بقایا واجب الادا</th>
                  <th className="py-3 px-3 text-center">ادائیگی کیفیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      کوئی بلٹی ریکارڈ موجود نہیں ہے
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 font-mono font-bold text-purple-900">
                        {s.biltyNumber}
                        {s.notes && (
                          <div className="text-[11px] font-sans font-normal text-slate-500 truncate max-w-xs mt-0.5">
                            {s.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {s.date}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 font-bold font-mono">
                          {s.totalBags}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-end font-bold text-slate-900 font-mono">
                        {formatCurrency(s.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-end font-semibold text-emerald-700 font-mono">
                        {formatCurrency(s.paidAmount)}
                      </td>
                      <td className="py-3 px-3 text-end font-bold font-mono text-amber-700">
                        {formatCurrency(s.balanceDue)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            s.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : s.status === 'partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {s.status === 'paid'
                            ? 'مکمل ادا شدہ'
                            : s.status === 'partial'
                            ? 'جزوی ادا شدہ'
                            : 'غیر ادا شدہ'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. Tab 2: Unified Khata Ledger                                            */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div id="vendor-printable-ledger" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className={`text-base sm:text-lg font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'جامع ڈیجیٹل کھاتہ لیجر اسٹیٹمنٹ' : 'Unified Khata Ledger Statement'}
              </h2>
              <p className="text-xs text-slate-500">
                {isUrdu
                  ? 'کمپنی سپلائی ڈیبٹ، موصولہ ادائیگیاں اور لائیو میزان (Running Balance)'
                  : 'Chronological statement with running balance'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">
                موجودہ واجب الادا میزان:{' '}
                <strong className="text-purple-900 font-mono text-sm">
                  {formatCurrency(stats?.currentBalanceDue || 0)}
                </strong>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200/80 text-slate-600 font-bold">
                  <th className="py-2.5 px-3 text-start">تاریخ</th>
                  <th className="py-2.5 px-3 text-start">تفصیل انٹری</th>
                  <th className="py-2.5 px-3 text-start">رسید / بلٹی #</th>
                  <th className="py-2.5 px-3 text-end text-red-700">نام / ڈیبٹ (مال سپلائی)</th>
                  <th className="py-2.5 px-3 text-end text-emerald-700">جمع / کریڈٹ (ادائیگی ملی)</th>
                  <th className="py-2.5 px-3 text-end">میزان / بقایا (Balance)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {unifiedLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      کوئی کھاتہ ٹرانزیکشن موجود نہیں ہے
                    </td>
                  </tr>
                ) : (
                  unifiedLedger.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-3 font-mono text-slate-600">{row.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{row.description}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{row.refNumber}</td>
                      <td className="py-2.5 px-3 text-end font-bold text-red-700 font-mono">
                        {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-end font-bold text-emerald-700 font-mono">
                        {row.credit > 0 ? formatCurrency(row.credit) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-end font-black font-mono text-slate-900">
                        {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. Tab 3: Products & Rate Revision Notices                                */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className={`text-base sm:text-lg font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'کمپنی سپلائی کردہ کھادیں اور ریٹ لسٹ' : 'Supplied Products & Catalog'}
              </h2>
              <p className="text-xs text-slate-500">
                {isUrdu
                  ? 'کمپنی کے موجودہ ریٹس، گودام اسٹاک اور نئے سرکاری/کمپنی ریٹ کا پیشگی نوٹس'
                  : 'View official supplied catalog, wholesale rates, and notify shop of price updates.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(portalData?.suppliedProducts || []).map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800">
                      {prod.company_name}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 font-urdu leading-snug">
                      {prod.urdu_name || prod.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">{prod.sku}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-500 block">تھوک ریٹ (Cost)</span>
                    <strong className="text-slate-900 font-mono font-bold">
                      {formatCurrency(prod.cost_price)}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <span className="text-[10px] text-emerald-700 block">ریٹیل ریٹ (Sale)</span>
                    <strong className="text-emerald-950 font-mono font-bold">
                      {formatCurrency(prod.sale_price)}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-slate-500 text-[11px]">
                    دکان پر گودام اسٹاک: <strong className="text-slate-800 font-mono">{prod.current_stock}</strong> بوری
                  </span>

                  <button
                    onClick={() => {
                      setSelectedProductForPrice(prod);
                      setPriceForm({
                        newCostPrice: String(prod.cost_price),
                        suggestedSalePrice: String(prod.sale_price),
                        effectiveDate: new Date().toISOString().slice(0, 10),
                        notes: '',
                      });
                      setIsPriceModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition flex items-center gap-1 active:scale-95"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>نیا ریٹ بھیجیں</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. Tab 4: Advance Dispatch Notice Form                                     */}
      {/* ========================================================================= */}
      {activeTab === 'dispatch' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 max-w-2xl mx-auto space-y-5">
          <div className="text-center space-y-1">
            <div className="inline-flex p-3 rounded-2xl bg-purple-100 text-purple-800 mb-1">
              <Truck className="w-6 h-6" />
            </div>
            <h2 className={`text-lg sm:text-xl font-extrabold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'ٹرک روانگی کی پیشگی اطلاع (Advance Dispatch Notice)' : 'Submit Advance Truck Dispatch'}
            </h2>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'فیکٹری یا ڈسٹری بیوشن پوائنٹ سے ٹرک نکلتے ہی اطلاع درج کریں تاکہ دکان پر گودام اور پلے دار تیار رکھے جا سکیں۔'
                : 'Notify dealership in advance of incoming consignments for efficient godown preparation.'}
            </p>
          </div>

          <form onSubmit={handleDispatchSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">گاڑی / ٹرک نمبر *</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً TK-7842 / FSD-512"
                  value={dispatchForm.truckNumber}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, truckNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">بلٹی نمبر (اختیاری)</label>
                <input
                  type="text"
                  placeholder="مثلاً BLT-9921"
                  value={dispatchForm.biltyNumber}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, biltyNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">کھاد کی قسم / پراڈکٹ *</label>
                <input
                  type="text"
                  required
                  placeholder="سونا یوریا کھاد ۵۰ کلو"
                  value={dispatchForm.productName}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, productName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">بوریوں کی تعداد *</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="مثلاً 500"
                  value={dispatchForm.bagsQuantity}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, bagsQuantity: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">ڈرائیور کا فون نمبر</label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={dispatchForm.driverContact}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, driverContact: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">متوقع آمد کا وقت</label>
                <input
                  type="text"
                  placeholder="مثلاً کل صبح ۸ بجے"
                  value={dispatchForm.expectedArrival}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, expectedArrival: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">اضافی ہدایات یا نوٹس</label>
              <textarea
                rows={2}
                placeholder="ٹرانسپورٹ کمپنی کا نام یا اتروائی کے متعلق ہدایات..."
                value={dispatchForm.notes}
                onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-700/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>اطلاع ارسال کریں (Submit Dispatch Notice)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal: Notify Price Revision                                              */}
      {/* ========================================================================= */}
      <Dialog open={isPriceModalOpen} onOpenChange={setIsPriceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold font-urdu">
              <Tag className="w-5 h-5 text-purple-600" />
              <span>نئے سرکاری / کمپنی ریٹ کا نوٹس بھیجیں</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {selectedProductForPrice?.urdu_name || selectedProductForPrice?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePriceSubmit} className="space-y-4 pt-1">
            <DialogBody className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  نیا تھوک لاگت ریٹ (New Cost Price per Bag) *
                </label>
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    Rs.
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={priceForm.newCostPrice}
                    onChange={(e) => setPriceForm({ ...priceForm, newCostPrice: e.target.value })}
                    className="w-full ps-10 pe-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  تجویز کردہ ریٹیل ریٹ (Suggested Sale Price)
                </label>
                <div className="relative">
                  <span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                    Rs.
                  </span>
                  <input
                    type="number"
                    min="1"
                    placeholder="اختیاری"
                    value={priceForm.suggestedSalePrice}
                    onChange={(e) => setPriceForm({ ...priceForm, suggestedSalePrice: e.target.value })}
                    className="w-full ps-10 pe-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  لاگو ہونے کی تاریخ (Effective Date)
                </label>
                <DatePicker
                  value={priceForm.effectiveDate}
                  onChange={(date) => setPriceForm({ ...priceForm, effectiveDate: date })}
                  placeholder="تاریخ منتخب کریں"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  کمپنی نوٹیفکیشن / سرکلر نمبر
                </label>
                <textarea
                  rows={2}
                  placeholder="کمپنی سرکلر نمبر یا قیمت اضافے کی وجہ..."
                  value={priceForm.notes}
                  onChange={(e) => setPriceForm({ ...priceForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </DialogBody>

            <DialogFooter className="gap-2">
              <button
                type="button"
                onClick={() => setIsPriceModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                منسوخ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>ریٹ نوٹس ارسال کریں</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
