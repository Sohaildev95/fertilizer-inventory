'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../lib/language-context';
import { usePosStore, PosCartItem, SelectedCustomer } from '../../../stores/pos-store';
import { PaymentMethod } from '@fertilizer/shared';
import { apiRequest } from '../../../lib/api-client';
import {
  ShoppingCart,
  Search,
  Package,
  Trash2,
  Plus,
  Minus,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  Printer,
  RotateCcw,
  CreditCard,
  Banknote,
  FileText,
  BadgePercent,
  Sparkles,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Tag,
  AlertCircle,
  PlusCircle,
  Calendar,
  Building2,
  Check,
  Loader2,
  Share2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';

// Pakistani Fertilizer Products for POS
interface PosProduct {
  id: string;
  name: string;
  urdu_name?: string;
  sku: string;
  category?: any;
  company_name: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  min_stock_alert: number;
  rack_location?: string;
}

// Fallback Catalog if API is not yet loaded
const INITIAL_FALLBACK_CATALOG: PosProduct[] = [
  {
    id: 'prd-1',
    name: 'Sona Urea (سونا یوریا)',
    urdu_name: 'سونا یوریا کھاد ۵۰ کلو',
    sku: 'FFC-UREA-50',
    company_name: 'Fauji Fertilizer (FFC)',
    unit: 'bag_50kg',
    cost_price: 4200,
    sale_price: 4450,
    current_stock: 350,
    min_stock_alert: 30,
    rack_location: 'گودام 1 - ریک A',
  },
  {
    id: 'prd-2',
    name: 'Engro Urea (اینگرو یوریا)',
    urdu_name: 'اینگرو یوریا کھاد ۵۰ کلو',
    sku: 'ENG-UREA-50',
    company_name: 'Engro Fertilizers',
    unit: 'bag_50kg',
    cost_price: 4180,
    sale_price: 4430,
    current_stock: 180,
    min_stock_alert: 25,
    rack_location: 'گودام 1 - ریک B',
  },
  {
    id: 'prd-3',
    name: 'Sarsabz CAN (گوارا کھاد)',
    urdu_name: 'سرسبز کین گوارا کھاد ۵۰ کلو',
    sku: 'FAT-CAN-50',
    company_name: 'Fatima Fertilizer',
    unit: 'bag_50kg',
    cost_price: 3600,
    sale_price: 3850,
    current_stock: 220,
    min_stock_alert: 20,
    rack_location: 'گودام 2 - ریک C',
  },
  {
    id: 'prd-4',
    name: 'Sona DAP (سونا ڈی اے پی)',
    urdu_name: 'سونا ڈی اے پی کھاد ۵۰ کلو',
    sku: 'FFC-DAP-50',
    company_name: 'Fauji Fertilizer (FFC)',
    unit: 'bag_50kg',
    cost_price: 11800,
    sale_price: 12400,
    current_stock: 85,
    min_stock_alert: 15,
    rack_location: 'گودام 1 - ریک D',
  },
  {
    id: 'prd-5',
    name: 'Engro Zorawar DAP (زورآور ڈی اے پی)',
    urdu_name: 'اینگرو زورآور ڈی اے پی ۵۰ کلو',
    sku: 'ENG-ZOR-50',
    company_name: 'Engro Fertilizers',
    unit: 'bag_50kg',
    cost_price: 12000,
    sale_price: 12600,
    current_stock: 60,
    min_stock_alert: 15,
    rack_location: 'گودام 2 - ریک A',
  },
  {
    id: 'prd-6',
    name: 'Sarsabz Nitrophos (نائٹروفاس)',
    urdu_name: 'نائٹروفاس سرسبز کھاد ۵۰ کلو',
    sku: 'FAT-NP-50',
    company_name: 'Fatima Fertilizer',
    unit: 'bag_50kg',
    cost_price: 7800,
    sale_price: 8200,
    current_stock: 95,
    min_stock_alert: 15,
    rack_location: 'گودام 1 - ریک E',
  },
  {
    id: 'prd-7',
    name: 'FFC SOP Potash (ایس او پی پوٹاش)',
    urdu_name: 'ایس او پی پوٹاش ۵۰ کلو',
    sku: 'FFC-SOP-50',
    company_name: 'Fauji Fertilizer (FFC)',
    unit: 'bag_50kg',
    cost_price: 13800,
    sale_price: 14500,
    current_stock: 40,
    min_stock_alert: 10,
    rack_location: 'گودام 2 - ریک B',
  },
  {
    id: 'prd-8',
    name: 'Engro Power Potash (پاور پوٹاش)',
    urdu_name: 'پاور پوٹاش اینگرو ۲۵ کلو',
    sku: 'ENG-POT-25',
    company_name: 'Engro Fertilizers',
    unit: 'bag_25kg',
    cost_price: 8200,
    sale_price: 8800,
    current_stock: 30,
    min_stock_alert: 8,
    rack_location: 'گودام 2 - ریک B',
  },
  {
    id: 'prd-9',
    name: 'Belt Expert 100ml (بیلٹ ایکسپرٹ)',
    urdu_name: 'بیلٹ ایکسپرٹ کیڑے مار سپرے',
    sku: 'BYR-BLT-100',
    company_name: 'Bayer Crop Science',
    unit: 'bottle_100ml',
    cost_price: 1850,
    sale_price: 2100,
    current_stock: 50,
    min_stock_alert: 12,
    rack_location: 'دکان - ریک F',
  },
  {
    id: 'prd-10',
    name: 'Nativo Fungicide 100g (نیٹایوو پھپھوندی کش)',
    urdu_name: 'نیٹایوو پھپھوندی کش ۱۰۰ گرام',
    sku: 'BYR-NAT-100',
    company_name: 'Bayer Crop Science',
    unit: 'pack_100g',
    cost_price: 2200,
    sale_price: 2500,
    current_stock: 45,
    min_stock_alert: 10,
    rack_location: 'دکان - ریک F',
  },
  {
    id: 'prd-11',
    name: 'Pioneer Corn 30Y87 (مکئی ہائبرڈ بیج)',
    urdu_name: 'پائینیر مکئی ہائبرڈ بیج',
    sku: 'PIO-CORN-30Y',
    company_name: 'Pioneer Seeds',
    unit: 'bag_corn',
    cost_price: 8500,
    sale_price: 9400,
    current_stock: 55,
    min_stock_alert: 10,
    rack_location: 'گودام 3 - بیج ہال',
  },
  {
    id: 'prd-12',
    name: 'Akbar-19 Wheat Seed 50kg (اکبر ۱۹ تصدیق شدہ گندم)',
    urdu_name: 'اکبر ۱۹ تصدیق شدہ گندم بیج',
    sku: 'PB-WHT-AKB',
    company_name: 'Punjab Seed Corp',
    unit: 'bag_50kg',
    cost_price: 4800,
    sale_price: 5300,
    current_stock: 120,
    min_stock_alert: 25,
    rack_location: 'گودام 3 - بیج ہال',
  },
];

// Fallback Farmers
const INITIAL_FALLBACK_FARMERS: SelectedCustomer[] = [
  {
    id: 'cst-1',
    name: 'چوہدری نذیر احمد وٹو',
    phone: '0300-7654321',
    village: 'چک نمبر 45/12L (چیچہ وطنی روڈ)',
    creditLimit: 1000000,
    currentBalance: 650000,
    isWalkIn: false,
  },
  {
    id: 'cst-2',
    name: 'ملک بشیر احمد اعوان',
    phone: '0301-4455223',
    village: 'چک 88/WB، جہانیاں روڈ',
    creditLimit: 1200000,
    currentBalance: 1420000,
    isWalkIn: false,
  },
  {
    id: 'cst-3',
    name: 'میاں طارق جاوید ارائیں',
    phone: '0321-8899771',
    village: 'قبولہ شریف، تحصیل عارف والا',
    creditLimit: 600000,
    currentBalance: 185000,
    isWalkIn: false,
  },
  {
    id: 'cst-4',
    name: 'رانا خرم شہزاد',
    phone: '0345-6677889',
    village: 'ٹھٹھہ صادق آباد، تحصیل خانیوال',
    creditLimit: 800000,
    currentBalance: 0,
    isWalkIn: false,
  },
  {
    id: 'cst-5',
    name: 'سردار اللہ دتہ کھوکھر',
    phone: '0302-3344556',
    village: 'بستی ملوک، ملتان بائی پاس',
    creditLimit: 1200000,
    currentBalance: 790000,
    isWalkIn: false,
  },
];

const WALK_IN_CUSTOMER: SelectedCustomer = {
  name: 'عام نقد کسان (Walk-in Cash)',
  creditLimit: 0,
  currentBalance: 0,
  isWalkIn: true,
};

export default function POSPage() {
  const { isUrdu } = useLanguage();

  // POS Store
  const {
    items,
    customer,
    discount,
    paidAmount,
    paymentMethod,
    addItem,
    removeItem,
    updateQuantity,
    updatePrice,
    setCustomer,
    setDiscount,
    setPaidAmount,
    setPaymentMethod,
    clearCart,
    getSubtotal,
    getTotalAmount,
    getBalanceDue,
    getItemCount,
  } = usePosStore();

  // Live Catalog and Customers from API
  const [products, setProducts] = useState<PosProduct[]>(INITIAL_FALLBACK_CATALOG);
  const [farmers, setFarmers] = useState<SelectedCustomer[]>(INITIAL_FALLBACK_FARMERS);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Customer Select Dialog
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [farmerSearch, setFarmerSearch] = useState('');

  // Quick Add Farmer inside POS
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newFarmerPhone, setNewFarmerPhone] = useState('');
  const [newFarmerVillage, setNewFarmerVillage] = useState('');
  const [newFarmerCreditLimit, setNewFarmerCreditLimit] = useState(500000);
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // Thermal Receipt Dialog & Paper Size (80mm vs 58mm)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptWidth, setReceiptWidth] = useState<'80mm' | '58mm'>('80mm');
  const [lastBill, setLastBill] = useState<any>(null);

  // Computed Totals
  const subtotal = getSubtotal();
  const totalAmount = getTotalAmount();
  const balanceDue = getBalanceDue();
  const totalBagsCount = getItemCount();

  // Fetch Live Data from Backend API
  const loadData = async () => {
    setIsLoadingData(true);
    try {
      // 1. Fetch live products
      const prodRes = await apiRequest<{ data: any[] }>('/products?limit=100');
      if (prodRes?.data && prodRes.data.length > 0) {
        setProducts(
          prodRes.data.map((p) => ({
            id: p.id,
            name: p.name,
            urdu_name: p.urdu_name || p.name,
            sku: p.sku || '',
            category: p.category?.slug || 'urea',
            company_name: p.company_name || 'Fertilizer Co.',
            unit: p.unit || 'bag_50kg',
            cost_price: Number(p.cost_price || 0),
            sale_price: Number(p.sale_price || 0),
            current_stock: Number(p.current_stock || 0),
            min_stock_alert: Number(p.min_stock_alert || 10),
            rack_location: p.rack_location || '',
          })),
        );
      }

      // 2. Fetch live customers
      const custRes = await apiRequest<{ data: any[] }>('/customers?limit=100');
      if (custRes?.data && custRes.data.length > 0) {
        setFarmers(
          custRes.data.map((c) => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            village: c.village || '',
            creditLimit: Number(c.credit_limit || 500000),
            currentBalance: Number(c.current_balance || 0),
            isWalkIn: false,
          })),
        );
      }
    } catch (err) {
      console.warn('API data fetch failed, using pre-seeded catalog:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        (p.urdu_name && p.urdu_name.toLowerCase().includes(q)) ||
        p.company_name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'urea' && (p.name.toLowerCase().includes('urea') || p.sku.includes('UREA'))) ||
        (selectedCategory === 'dap' && (p.name.toLowerCase().includes('dap') || p.sku.includes('DAP') || p.name.includes('Nitrophos'))) ||
        (selectedCategory === 'can' && (p.name.toLowerCase().includes('can') || p.name.includes('گوارا'))) ||
        (selectedCategory === 'potash' && (p.name.toLowerCase().includes('potash') || p.sku.includes('POT') || p.sku.includes('SOP'))) ||
        (selectedCategory === 'pesticide' && (p.name.toLowerCase().includes('expert') || p.name.includes('fungicide') || p.sku.includes('BYR'))) ||
        (selectedCategory === 'seed' && (p.name.toLowerCase().includes('seed') || p.name.includes('corn') || p.name.includes('wheat')));

      return matchSearch && matchCategory;
    });
  }, [products, search, selectedCategory]);

  // Filtered Farmers for customer modal
  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      const q = farmerSearch.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        (f.phone && f.phone.includes(q)) ||
        (f.village && f.village.toLowerCase().includes(q))
      );
    });
  }, [farmers, farmerSearch]);

  // Quick cash buttons
  const handleQuickCash = (amt: number) => {
    setPaidAmount(amt);
    setPaymentMethod(PaymentMethod.CASH);
  };

  const handleFullCash = () => {
    setPaidAmount(totalAmount);
    setPaymentMethod(PaymentMethod.CASH);
  };

  const handleFullCredit = () => {
    setPaidAmount(0);
    setPaymentMethod(PaymentMethod.CHEQUE); // Representative for credit ledger
  };

  // Quick Add New Farmer
  const handleCreateFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmerName.trim() || !newFarmerPhone.trim()) return;

    setIsCreatingCustomer(true);
    try {
      const res = await apiRequest('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: newFarmerName.trim(),
          phone: newFarmerPhone.trim(),
          village: newFarmerVillage.trim() || undefined,
          creditLimit: newFarmerCreditLimit,
          currentBalance: 0,
        }),
      });

      const newCust: SelectedCustomer = {
        id: res.id,
        name: res.name,
        phone: res.phone,
        village: res.village || '',
        creditLimit: Number(res.credit_limit || 500000),
        currentBalance: 0,
        isWalkIn: false,
      };

      setFarmers((prev) => [newCust, ...prev]);
      setCustomer(newCust);
      setIsQuickAddOpen(false);
      setIsCustomerModalOpen(false);
      setNewFarmerName('');
      setNewFarmerPhone('');
      setNewFarmerVillage('');
    } catch (err: any) {
      alert(`کسان کا کھاتہ کھولنے میں خرابی: ${err?.message || 'Error creating farmer'}`);
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  // Complete & Print Bill (Connected to Supabase via POST /api/v1/sales)
  const handleCompleteSale = async () => {
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customerId: customer.isWalkIn ? undefined : customer.id,
        customerType: customer.isWalkIn ? 'walk_in' : 'registered',
        walkInName: customer.isWalkIn ? customer.name : undefined,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.salePrice,
        })),
        discount: discount,
        paidAmount: paidAmount,
        paymentMethod: paymentMethod,
        notes: `POS Counter Bill (${items.length} items, ${totalBagsCount} bags)`,
      };

      const res = await apiRequest('/sales', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const saleData = res.sale;
      const now = new Date();

      const billData = {
        invoiceNo: saleData?.invoice_no || `INV-${Date.now().toString().slice(-6)}`,
        date: now.toLocaleDateString('en-GB'),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        customer: saleData?.customer || customer,
        items: [...items],
        subtotal,
        discount,
        totalAmount,
        paidAmount,
        balanceDue,
        paymentMethod,
        oldBalance: customer.currentBalance,
        newBalance: customer.isWalkIn
          ? 0
          : customer.currentBalance + (totalAmount - paidAmount),
      };

      // Deduct stock in local view immediately
      setProducts((prev) =>
        prev.map((p) => {
          const cartMatch = items.find((it) => it.productId === p.id);
          if (cartMatch) {
            return {
              ...p,
              current_stock: Math.max(0, p.current_stock - cartMatch.quantity),
            };
          }
          return p;
        }),
      );

      // If registered customer, update their local balance
      if (!customer.isWalkIn && customer.id) {
        setFarmers((prev) =>
          prev.map((f) =>
            f.id === customer.id
              ? { ...f, currentBalance: f.currentBalance + (totalAmount - paidAmount) }
              : f,
          ),
        );
      }

      setLastBill(billData);
      setIsReceiptModalOpen(true);
    } catch (err: any) {
      console.error('POS Sale checkout failed:', err);
      // Fallback offline bill creation so customer is never stranded
      const fallbackBillData = {
        invoiceNo: `POS-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        customer,
        items: [...items],
        subtotal,
        discount,
        totalAmount,
        paidAmount,
        balanceDue,
        paymentMethod,
        oldBalance: customer.currentBalance,
        newBalance: customer.isWalkIn
          ? 0
          : customer.currentBalance + (totalAmount - paidAmount),
      };
      setLastBill(fallbackBillData);
      setIsReceiptModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amt: number) => `Rs. ${amt.toLocaleString()}`;

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-10">
      {/* Print Specific CSS Rules (80mm & 58mm Thermal Rolls) */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-thermal-receipt,
          #printable-thermal-receipt * {
            visibility: visible !important;
          }
          #printable-thermal-receipt {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: ${receiptWidth === '80mm' ? '76mm' : '54mm'} !important;
            margin: 0 !important;
            padding: 4px !important;
            background: white !important;
            color: black !important;
            font-size: 11px !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
        }
      `}</style>

      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-lg shadow-emerald-700/25">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-xl sm:text-2xl font-black text-slate-900 tracking-tight ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'کاؤنٹر سیل و پرچی (POS Counter)' : 'POS Sales Counter'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {isUrdu
                ? 'فوری نقد و کھاتہ فروخت، بوریوں کا انتخاب اور تھرمل پرچی پرنٹ'
                : 'Rapid counter sales, bag quantity shortcuts, farmer khata billing, and 80mm thermal receipt printing.'}
            </p>
          </div>
        </div>

        {/* Quick Info & Active Customer Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white border border-slate-300 hover:border-emerald-500 shadow-sm transition text-xs font-semibold text-slate-800 active:scale-98"
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
              customer.isWalkIn ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {customer.isWalkIn ? '💵' : customer.name.charAt(0)}
            </div>
            <div className="text-left">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                {isUrdu ? 'کھاتے دار / گاہک' : 'Customer'}
              </span>
              <span className="font-bold truncate max-w-[160px] block mt-0.5 text-slate-900">
                {customer.name}
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="p-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition active:scale-95 shadow-sm"
              title={isUrdu ? 'بل خالی کریں' : 'Clear Cart'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN (7 Cols): FERTILIZER CATALOG & SEARCH                         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search Bar & Category Pills */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isUrdu
                    ? 'کھاد، یوریا، ڈی اے پی، سپرے، کمپنی یا SKU تلاش کریں...'
                    : 'Search fertilizer, urea, dap, spray, company, or sku...'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-medium"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs whitespace-nowrap">
              {[
                { id: 'all', label: isUrdu ? 'تمام کھادیں' : 'All Items' },
                { id: 'urea', label: isUrdu ? 'یوریا (Urea)' : 'Urea' },
                { id: 'dap', label: isUrdu ? 'ڈی اے پی (DAP)' : 'DAP' },
                { id: 'can', label: isUrdu ? 'کین گوارا (CAN)' : 'CAN' },
                { id: 'potash', label: isUrdu ? 'پوٹاش (Potash)' : 'Potash' },
                { id: 'pesticide', label: isUrdu ? 'سپرے ادویات' : 'Pesticides' },
                { id: 'seed', label: isUrdu ? 'بیج (Seeds)' : 'Seeds' },
              ].map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold transition text-xs select-none ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredProducts.map((p) => {
              const inCartItem = items.find((it) => it.productId === p.id);
              const isLow = p.current_stock <= p.min_stock_alert;
              const isOut = p.current_stock <= 0;

              return (
                <div
                  key={p.id}
                  onClick={() => !isOut && addItem(p, 1)}
                  className={`bg-white rounded-3xl p-4 border transition cursor-pointer flex flex-col justify-between group hover:shadow-lg hover:border-emerald-500 relative select-none ${
                    inCartItem
                      ? 'border-emerald-500 ring-2 ring-emerald-500/15 bg-emerald-50/20'
                      : 'border-slate-200/90'
                  } ${isOut ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
                >
                  {/* Cart Quantity Badge if in cart */}
                  {inCartItem && (
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-emerald-600/30 animate-in zoom-in-50">
                      {inCartItem.quantity}
                    </span>
                  )}

                  <div>
                    {/* Top row: Company & Stock pill */}
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="text-slate-400 truncate max-w-[120px] font-semibold">
                        {p.company_name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isOut
                            ? 'bg-rose-100 text-rose-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.current_stock} {isUrdu ? 'بوریاں' : 'bags'}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition leading-snug">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-urdu mt-0.5 truncate">
                      {p.urdu_name}
                    </p>
                  </div>

                  {/* Quick Quantity Shortcut Chips (+1, +5, +10, +25 boriyan) */}
                  <div className="pt-2.5 mt-2.5 border-t border-slate-100/90">
                    <div className="flex items-center gap-1 mb-2.5">
                      {[1, 5, 10, 25].map((q) => (
                        <button
                          key={q}
                          type="button"
                          disabled={isOut}
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(p, q);
                          }}
                          className="flex-1 py-1 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-600 text-[10px] font-black transition active:scale-95"
                          title={`Add +${q} bags`}
                        >
                          +{q}
                        </button>
                      ))}
                    </div>

                    {/* Bottom: Price & Add Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block -mb-0.5 font-bold uppercase tracking-wider">
                          {isUrdu ? 'ریٹ' : 'Price'}
                        </span>
                        <span className="text-base font-black text-slate-900 font-mono">
                          {formatCurrency(p.sale_price)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={isOut}
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(p, 1);
                        }}
                        className="w-9 h-9 rounded-2xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 flex items-center justify-center transition active:scale-90 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (5 Cols): POS BILLING & CART                                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/50 p-4 sm:p-5 flex flex-col space-y-4 sticky top-4">
          {/* Active Farmer Details Card */}
          <div
            onClick={() => setIsCustomerModalOpen(true)}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/90 cursor-pointer transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base flex-shrink-0 shadow-sm ${
                  customer.isWalkIn
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {customer.isWalkIn ? '💵' : customer.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                  <span>{customer.name}</span>
                  {!customer.isWalkIn && customer.currentBalance > customer.creditLimit && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-100 text-rose-700 font-black">
                      {isUrdu ? 'لمٹ سے زیادہ' : 'OVER LIMIT'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {customer.isWalkIn
                    ? isUrdu
                      ? 'عام کاؤنٹر نقد کسٹمر'
                      : 'Walk-in Cash Customer'
                    : `${customer.village || ''} • سابقہ بقایا: ${formatCurrency(
                        customer.currentBalance,
                      )}`}
                </div>
              </div>
            </div>

            <span className="text-xs text-emerald-700 font-bold group-hover:underline flex-shrink-0">
              {isUrdu ? 'تبدیل کریں' : 'Change'}
            </span>
          </div>

          {/* Cart Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'پرچی اشیاء (Cart Items)' : 'Cart Items'}</span>
            </span>
            <span className="text-xs font-bold text-slate-500">
              {totalBagsCount} {isUrdu ? 'بوریاں' : 'Bags'} ({items.length} Items)
            </span>
          </div>

          {/* Scrollable Cart Items List */}
          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar min-h-[130px]">
            {items.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="text-xs font-bold text-slate-600">
                  {isUrdu ? 'پرچی خالی ہے' : 'Cart is empty'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isUrdu
                    ? 'بائیں طرف سے کھاد یا بیج منتخب کریں'
                    : 'Select products from catalog to add to bill.'}
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-2 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium">{item.company}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition"
                      title={isUrdu ? 'ہٹائیں' : 'Remove'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    {/* Stepper with manual input */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-1.5 py-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.productId, Number(e.target.value) || 1)
                        }
                        className="w-12 text-center text-xs font-mono font-bold text-slate-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-5 h-5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Unit Price & Line Total */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <span>@ Rs.</span>
                        <input
                          type="number"
                          value={item.salePrice}
                          onChange={(e) =>
                            updatePrice(item.productId, Number(e.target.value) || 0)
                          }
                          className="w-16 text-right font-mono text-slate-800 border-b border-dotted border-slate-300 focus:outline-none font-bold"
                        />
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Discount & Totals Section */}
          <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-slate-600 font-medium">
              <span>{isUrdu ? 'کل مال رقم (Subtotal):' : 'Subtotal:'}</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'رعایت / ڈسکاؤنٹ (روپے):' : 'Discount (PKR):'}</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-slate-400 font-bold">- Rs.</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-right font-mono font-bold text-rose-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Net Grand Total Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 text-white flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                  {isUrdu ? 'خالص بل رقم' : 'Net Total Due'}
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl font-mono font-bold border border-slate-700">
                {totalBagsCount} {isUrdu ? 'بوریاں' : 'Bags'}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {isUrdu ? 'ادائیگی کا طریقہ (Payment Method)' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                className={`p-2 rounded-2xl border font-bold flex flex-col items-center gap-1 transition ${
                  paymentMethod === PaymentMethod.CASH
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'نقد (Cash)' : 'Cash'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod(PaymentMethod.CHEQUE);
                  if (paidAmount === totalAmount) setPaidAmount(0);
                }}
                className={`p-2 rounded-2xl border font-bold flex flex-col items-center gap-1 transition ${
                  paymentMethod === PaymentMethod.CHEQUE
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>{isUrdu ? 'کھاتہ ادھار' : 'Khata Credit'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)}
                className={`p-2 rounded-2xl border font-bold flex flex-col items-center gap-1 transition ${
                  paymentMethod === PaymentMethod.BANK_TRANSFER
                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>{isUrdu ? 'بینک آن لائن' : 'Bank'}</span>
              </button>
            </div>
          </div>

          {/* Cash Tendered & Change Return */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{isUrdu ? 'وصول شدہ نقد رقم (روپے):' : 'Amount Paid (PKR):'}</span>
              <button
                type="button"
                onClick={handleFullCash}
                className="text-[11px] text-emerald-700 hover:underline font-bold"
              >
                {isUrdu ? 'مکمل نقد (Full Cash)' : 'Full Cash'}
              </button>
            </div>

            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-base font-mono font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />

            {/* Quick cash denomination chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              {[5000, 10000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickCash(amt)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition active:scale-95"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Balance Due / Change Info */}
            <div className="pt-2 text-xs flex items-center justify-between font-bold">
              <span className="text-slate-500">
                {paidAmount >= totalAmount
                  ? isUrdu
                    ? 'گاہک کو واپسی رقم (Change):'
                    : 'Change Return:'
                  : isUrdu
                  ? 'باقی واجب الادا کھاتہ (Balance Due):'
                  : 'Remaining Balance Due:'}
              </span>
              <span
                className={`font-mono text-sm font-black ${
                  paidAmount >= totalAmount ? 'text-blue-600' : 'text-rose-600'
                }`}
              >
                {paidAmount >= totalAmount
                  ? formatCurrency(paidAmount - totalAmount)
                  : formatCurrency(totalAmount - paidAmount)}
              </span>
            </div>
          </div>

          {/* Action Checkout Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              disabled={items.length === 0 || isSubmitting}
              onClick={handleCompleteSale}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-black shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isUrdu ? 'بل پروسیس ہو رہا ہے...' : 'Processing Sale...'}</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>{isUrdu ? 'پرچی پرنٹ کریں و بل مکمل کریں' : 'Print Receipt & Complete Sale'}</span>
                </>
              )}
            </button>

            {!customer.isWalkIn && (
              <button
                type="button"
                disabled={items.length === 0 || isSubmitting}
                onClick={() => {
                  handleFullCredit();
                  handleCompleteSale();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'زمیندار کھاتہ ادھار پرچی' : 'Issue on Khata (Credit)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SELECT OR ADD REGISTERED FARMER                                  */}
      {/* ========================================================================= */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'گاہک یا زمیندار منتخب کریں' : 'Select Customer / Farmer Khata'}
              </DialogTitle>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'نیا کسان شامل کریں' : '+ Quick Add Farmer'}</span>
              </button>
            </div>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu
                ? 'نقد کسان یا اپنے رجسٹرڈ زمیندار کا کھاتہ منتخب کریں'
                : 'Choose walk-in cash customer or select a registered farmer to debit balance.'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-3">
              {/* Quick Add Farmer Form */}
              {isQuickAddOpen && (
                <form
                  onSubmit={handleCreateFarmer}
                  className="p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/50 space-y-3 animate-in fade-in duration-300"
                >
                  <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                    {isUrdu ? 'نیا زمیندار کھاتہ درج کریں' : 'Register New Farmer Khata'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-300 font-bold block mb-1">
                        {isUrdu ? 'زمیندار کا نام *' : 'Farmer Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newFarmerName}
                        onChange={(e) => setNewFarmerName(e.target.value)}
                        placeholder="چوہدری نذیر احمد"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-300 font-bold block mb-1">
                        {isUrdu ? 'موبائل نمبر *' : 'Mobile Phone *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={newFarmerPhone}
                        onChange={(e) => setNewFarmerPhone(e.target.value)}
                        placeholder="0300-1234567"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-300 font-bold block mb-1">
                        {isUrdu ? 'چک / گاؤں کا نام' : 'Village / Chak'}
                      </label>
                      <input
                        type="text"
                        value={newFarmerVillage}
                        onChange={(e) => setNewFarmerVillage(e.target.value)}
                        placeholder="چک 45/12L"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-300 font-bold block mb-1">
                        {isUrdu ? 'ادھار کی حد (کریڈٹ لمٹ)' : 'Credit Limit (PKR)'}
                      </label>
                      <input
                        type="number"
                        value={newFarmerCreditLimit}
                        onChange={(e) => setNewFarmerCreditLimit(Number(e.target.value) || 0)}
                        placeholder="500000"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsQuickAddOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-600 transition"
                    >
                      {isUrdu ? 'منسوخ' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingCustomer}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      {isCreatingCustomer && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{isUrdu ? 'کھاتہ کھولیں' : 'Save & Select'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Walk-in Cash Option Card */}
              <div
                onClick={() => {
                  setCustomer(WALK_IN_CUSTOMER);
                  setIsCustomerModalOpen(false);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  customer.isWalkIn
                    ? 'bg-emerald-950/60 border-emerald-500 text-white'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-600 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
                    💵
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {isUrdu ? 'عام نقد کسان (Walk-in Cash)' : 'Walk-in Cash Customer'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isUrdu
                        ? 'فوری نقد کاؤنٹر سیل، کوئی سابقہ کھاتہ نہیں'
                        : 'Direct cash counter sale, no credit ledger tracking'}
                    </p>
                  </div>
                </div>
                {customer.isWalkIn && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>

              {/* Farmer Search input */}
              <div className="pt-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={farmerSearch}
                    onChange={(e) => setFarmerSearch(e.target.value)}
                    placeholder={
                      isUrdu
                        ? 'زمیندار کا نام، فون، یا چک سے تلاش کریں...'
                        : 'Search farmer by name, phone, or village...'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Farmer Cards List */}
              <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                {filteredFarmers.map((f) => {
                  const isSelected = customer.id === f.id;
                  const isOver = f.currentBalance > f.creditLimit;

                  return (
                    <div
                      key={f.id}
                      onClick={() => {
                        setCustomer(f);
                        setIsCustomerModalOpen(false);
                      }}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500'
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-700 text-white font-bold flex items-center justify-center text-sm">
                          {f.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-2">
                            <span>{f.name}</span>
                            {isOver && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-900/60 text-rose-300 border border-rose-700">
                                {isUrdu ? 'حد سے زیادہ' : 'OVER LIMIT'}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {f.village} • <span className="font-mono" dir="ltr">{f.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block font-medium">
                          {isUrdu ? 'موجودہ بقایا' : 'Balance'}
                        </span>
                        <span
                          className={`font-mono text-xs font-bold ${
                            isOver ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {formatCurrency(f.currentBalance)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
              className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
            >
              {isUrdu ? 'بند کریں' : 'Close'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: 80MM / 58MM PAKISTANI THERMAL RECEIPT PREVIEW & PRINT            */}
      {/* ========================================================================= */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'تھرمل پرچی (Thermal Receipt)' : 'Thermal Receipt'}
              </DialogTitle>

              {/* Receipt Width Switcher: 80mm vs 58mm */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setReceiptWidth('80mm')}
                  className={`px-2 py-0.5 rounded-lg transition ${
                    receiptWidth === '80mm' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  80mm
                </button>
                <button
                  type="button"
                  onClick={() => setReceiptWidth('58mm')}
                  className={`px-2 py-0.5 rounded-lg transition ${
                    receiptWidth === '58mm' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                  }`}
                >
                  58mm
                </button>
              </div>
            </div>
            <DialogDescription className="text-xs text-slate-400">
              {isUrdu
                ? 'پرنٹر پرنٹ کے لیے تیار ہے، خریدار کو پرچی فراہم کریں'
                : 'POS thermal printer receipt formatted with live Khata ledger balance.'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            {lastBill && (
              <div
                id="printable-thermal-receipt"
                className={`bg-white text-black p-4 rounded-xl text-xs font-mono border border-slate-200 shadow-inner mx-auto ${
                  receiptWidth === '80mm' ? 'max-w-[340px]' : 'max-w-[280px]'
                }`}
              >
                {/* Shop Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-400 space-y-1">
                  <h2 className="text-base font-black tracking-tight leading-tight">
                    پنجاب کھاد اینڈ زرعی ادویات ایجنسی
                  </h2>
                  <p className="text-[11px] text-slate-700 font-sans font-bold">
                    Punjab Fertilizer, Seeds & Pesticides
                  </p>
                  <p className="text-[10px] text-slate-600">
                    غلہ منڈی، چیچہ وطنی روڈ، نزد حبیب بینک
                  </p>
                  <p className="text-[10px] text-slate-600 font-bold" dir="ltr">
                    Ph: 0300-7654321 / 0301-4455223
                  </p>
                </div>

                {/* Receipt Metadata */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>رسید نمبر:</span>
                    <span className="font-bold font-mono">{lastBill.invoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تاریخ و وقت:</span>
                    <span>
                      {lastBill.date} {lastBill.time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>گاہک / زمیندار:</span>
                    <span className="font-bold">{lastBill.customer.name}</span>
                  </div>
                  {lastBill.customer.village && (
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>پتہ / چک:</span>
                      <span>{lastBill.customer.village}</span>
                    </div>
                  )}
                </div>

                {/* Itemized Table */}
                <div className="py-2.5 border-b border-dashed border-slate-400">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-300 text-[10px] text-slate-600">
                        <th className="text-left pb-1">آئٹم (کھاد)</th>
                        <th className="text-center pb-1">تعداد</th>
                        <th className="text-right pb-1">ریٹ</th>
                        <th className="text-right pb-1">رقم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lastBill.items.map((it: PosCartItem, idx: number) => (
                        <tr key={idx} className="py-1">
                          <td className="py-1 text-left">
                            <div className="font-bold leading-tight">{it.name}</div>
                          </td>
                          <td className="py-1 text-center font-bold font-mono">{it.quantity}</td>
                          <td className="py-1 text-right font-mono">{it.salePrice}</td>
                          <td className="py-1 text-right font-bold font-mono">{it.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Settlement Breakdown */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>کل مال رقم:</span>
                    <span className="font-bold font-mono">{formatCurrency(lastBill.subtotal)}</span>
                  </div>
                  {lastBill.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>رعایت (ڈسکاؤنٹ):</span>
                      <span className="font-mono">-{formatCurrency(lastBill.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300">
                    <span>خالص بل رقم:</span>
                    <span className="font-mono">{formatCurrency(lastBill.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>ادا شدہ نقد:</span>
                    <span className="font-bold font-mono">{formatCurrency(lastBill.paidAmount)}</span>
                  </div>
                  {lastBill.balanceDue > 0 && (
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>آج کا بقایا ادھار:</span>
                      <span className="font-mono">{formatCurrency(lastBill.balanceDue)}</span>
                    </div>
                  )}
                </div>

                {/* Khata Balance (If registered farmer) */}
                {!lastBill.customer.isWalkIn && (
                  <div className="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-1 bg-slate-50 p-2 rounded mt-1">
                    <div className="flex justify-between text-slate-600">
                      <span>سابقہ کھاتہ ادھار:</span>
                      <span className="font-mono">{formatCurrency(lastBill.oldBalance)}</span>
                    </div>
                    <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-1">
                      <span>نیا کل میزان بقایا:</span>
                      <span className="text-rose-700 font-mono">
                        {formatCurrency(lastBill.newBalance)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Urdu Note & Blessing Dua */}
                <div className="pt-3 text-center space-y-1">
                  <p className="text-[10px] text-slate-600">
                    خریدا ہوا مال گودام سے چیک کر کے وصول کریں۔ شکریہ!
                  </p>
                  <p className="text-xs font-bold font-urdu pt-0.5">
                    اللہ تعالیٰ آپ کی فصل اور رزق میں برکت عطا فرمائے
                  </p>
                  <p className="text-[9px] text-slate-400 pt-1">
                    سافٹ ویئر ڈویلپر: محمد سہیل
                  </p>
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setIsReceiptModalOpen(false);
                }}
                className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                {isUrdu ? 'نیا بل (Clear)' : 'New Bill'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>{isUrdu ? 'پرنٹ کریں (Print)' : 'Print Receipt'}</span>
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
