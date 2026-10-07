'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../lib/language-context';
import { usePosStore, PosCartItem, SelectedCustomer } from '../../../stores/pos-store';
import { PaymentMethod } from '@fertilizer/shared';
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
  Building2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

// Pakistani Fertilizer Products for POS
interface PosProduct {
  id: string;
  name: string;
  urdu_name: string;
  sku: string;
  category: 'urea' | 'dap' | 'can' | 'potash' | 'pesticide' | 'seed';
  company_name: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  current_stock: number;
  min_stock_alert: number;
  rack_location: string;
}

const POS_CATALOG: PosProduct[] = [
  {
    id: 'prd-1',
    name: 'Sona Urea 50kg',
    urdu_name: 'سونا یوریا کھاد ۵۰ کلو',
    sku: 'FFC-UREA-50',
    category: 'urea',
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
    name: 'Engro Urea 50kg',
    urdu_name: 'اینگرو یوریا کھاد ۵۰ کلو',
    sku: 'ENG-UREA-50',
    category: 'urea',
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
    name: 'Sarsabz CAN 50kg',
    urdu_name: 'سرسبز کین گوارا کھاد ۵۰ کلو',
    sku: 'FAT-CAN-50',
    category: 'can',
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
    name: 'Sona DAP 50kg',
    urdu_name: 'سونا ڈی اے پی کھاد ۵۰ کلو',
    sku: 'FFC-DAP-50',
    category: 'dap',
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
    name: 'Engro Zorawar DAP 50kg',
    urdu_name: 'اینگرو زورآور ڈی اے پی ۵۰ کلو',
    sku: 'ENG-ZOR-50',
    category: 'dap',
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
    name: 'Sarsabz Nitrophos 50kg',
    urdu_name: 'نائٹروفاس سرسبز کھاد ۵۰ کلو',
    sku: 'FAT-NP-50',
    category: 'dap',
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
    name: 'FFC SOP Potash 50kg',
    urdu_name: 'ایس او پی پوٹاش ۵۰ کلو',
    sku: 'FFC-SOP-50',
    category: 'potash',
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
    name: 'Engro Power Potash 25kg',
    urdu_name: 'پاور پوٹاش اینگرو ۲۵ کلو',
    sku: 'ENG-POT-25',
    category: 'potash',
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
    name: 'Belt Expert 100ml',
    urdu_name: 'بیلٹ ایکسپرٹ کیڑے مار سپرے',
    sku: 'BYR-BLT-100',
    category: 'pesticide',
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
    name: 'Nativo Fungicide 100g',
    urdu_name: 'نیٹایوو پھپھوندی کش ۱۰۰ گرام',
    sku: 'BYR-NAT-100',
    category: 'pesticide',
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
    name: 'Pioneer Corn 30Y87',
    urdu_name: 'پائینیر مکئی ہائبرڈ بیج',
    sku: 'PIO-CORN-30Y',
    category: 'seed',
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
    name: 'Akbar-19 Wheat Seed 50kg',
    urdu_name: 'اکبر ۱۹ تصدیق شدہ گندم بیج',
    sku: 'PB-WHT-AKB',
    category: 'seed',
    company_name: 'Punjab Seed Corp',
    unit: 'bag_50kg',
    cost_price: 4800,
    sale_price: 5300,
    current_stock: 120,
    min_stock_alert: 25,
    rack_location: 'گودام 3 - بیج ہال',
  },
];

// Registered Farmers for Khata Selection
const REGISTERED_FARMERS: SelectedCustomer[] = [
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

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Customer Select Dialog
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [farmerSearch, setFarmerSearch] = useState('');

  // Thermal Receipt Dialog
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastBill, setLastBill] = useState<any>(null);

  // Computed Totals
  const subtotal = getSubtotal();
  const totalAmount = getTotalAmount();
  const balanceDue = getBalanceDue();
  const totalBagsCount = getItemCount();

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return POS_CATALOG.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.urdu_name.toLowerCase().includes(q) ||
        p.company_name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === 'all' || p.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [search, selectedCategory]);

  // Filtered Farmers for customer modal
  const filteredFarmers = useMemo(() => {
    return REGISTERED_FARMERS.filter((f) => {
      const q = farmerSearch.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        (f.phone && f.phone.includes(q)) ||
        (f.village && f.village.toLowerCase().includes(q))
      );
    });
  }, [farmerSearch]);

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

  // Complete & Print Bill
  const handleCompleteSale = () => {
    if (items.length === 0) return;

    const invoiceNo = `POS-${Date.now().toString().slice(-6)}`;
    const billData = {
      invoiceNo,
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

    setLastBill(billData);
    setIsReceiptModalOpen(true);
  };

  const formatCurrency = (amt: number) => `Rs. ${amt.toLocaleString()}`;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 animate-in fade-in duration-500">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`text-xl sm:text-2xl font-black text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'کاؤنٹر سیل و پرچی (POS Counter)' : 'POS Sales Counter'}
            </h1>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'فوری نقد و کھاتہ فروخت، بوریوں کا انتخاب اور تھرمل پرچی پرنٹ'
                : 'Fast counter sales, bag selection, farmer khata billing, and 80mm thermal receipt print.'}
            </p>
          </div>
        </div>

        {/* Quick Info & Active Customer Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-500 shadow-sm transition text-xs font-semibold text-slate-800"
          >
            <User className="w-4 h-4 text-emerald-600" />
            <div className="text-left">
              <span className="block text-[10px] text-slate-400 leading-none">
                {isUrdu ? 'کھاتے دار / گاہک' : 'Customer'}
              </span>
              <span className="font-bold truncate max-w-[150px] block">
                {customer.name}
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
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
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  isUrdu
                    ? 'کھاد، یوریا، ڈی اے پی، سپرے، کمپنی یا بارکوڈ تلاش کریں...'
                    : 'Search fertilizer, urea, dap, spray, company, or sku...'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
              />
            </div>

            {/* Category Pills */}
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
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const inCartItem = items.find((it) => it.productId === p.id);
              const isLow = p.current_stock <= p.min_stock_alert;

              return (
                <div
                  key={p.id}
                  onClick={() => addItem(p, 1)}
                  className={`bg-white rounded-2xl p-3.5 border transition cursor-pointer flex flex-col justify-between group hover:shadow-md hover:border-emerald-500 relative select-none ${
                    inCartItem
                      ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Cart Quantity Badge if in cart */}
                  {inCartItem && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow-md animate-in zoom-in-50">
                      {inCartItem.quantity}
                    </span>
                  )}

                  <div>
                    {/* Top row: Company & Stock pill */}
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-slate-400 truncate max-w-[110px] font-medium">
                        {p.company_name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLow
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.current_stock} {isUrdu ? 'بوریاں' : 'bags'}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition leading-snug">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-urdu mt-0.5 truncate">
                      {p.urdu_name}
                    </p>
                  </div>

                  {/* Bottom: Price & Quick Add Button */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block -mb-0.5">
                        {isUrdu ? 'فی بوری' : 'Rate'}
                      </span>
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        {formatCurrency(p.sale_price)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(p, 1);
                      }}
                      className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 flex items-center justify-center transition active:scale-90"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (5 Cols): POS BILLING & CART                                 */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-md p-4 sm:p-5 flex flex-col space-y-4">
          {/* Active Farmer Details Card */}
          <div
            onClick={() => setIsCustomerModalOpen(true)}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 cursor-pointer transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                  customer.isWalkIn
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {customer.isWalkIn ? 'نقد' : customer.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                  <span>{customer.name}</span>
                  {!customer.isWalkIn && customer.currentBalance > customer.creditLimit && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-100 text-rose-700 font-bold">
                      {isUrdu ? 'لمٹ سے زیادہ' : 'OVER LIMIT'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {customer.isWalkIn
                    ? isUrdu
                      ? 'عام کاؤنٹر نقد کسٹمر'
                      : 'Walk-in Cash Customer'
                    : `${customer.village || ''} • بقایا: ${formatCurrency(
                        customer.currentBalance
                      )}`}
                </div>
              </div>
            </div>

            <span className="text-xs text-emerald-600 font-bold hover:underline flex-shrink-0">
              {isUrdu ? 'تبدیل کریں' : 'Change'}
            </span>
          </div>

          {/* Cart Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'پرچی اشیاء (Cart Items)' : 'Cart Items'}</span>
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {totalBagsCount} {isUrdu ? 'بوریاں' : 'Bags'} ({items.length} Items)
            </span>
          </div>

          {/* Scrollable Cart Items List */}
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar min-h-[140px]">
            {items.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="text-xs font-semibold text-slate-600">
                  {isUrdu ? 'پرچی خالی ہے' : 'Cart is empty'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isUrdu
                    ? 'بائیں طرف سے کھاد یا بیج منتخب کریں'
                    : 'Select products from the catalog to add to bill.'}
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col gap-2 hover:bg-slate-100/60 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                      <span className="text-[10px] text-slate-500">{item.company}</span>
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

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                    {/* Stepper with manual input */}
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-1.5 py-1">
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
                          className="w-16 text-right font-mono text-slate-700 border-b border-dotted border-slate-300 focus:outline-none font-semibold"
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
          <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-slate-600">
              <span>{isUrdu ? 'کل مال رقم (Subtotal):' : 'Subtotal:'}</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1 text-slate-700">
                <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isUrdu ? 'رعایت / ڈسکاؤنٹ (روپے):' : 'Discount (PKR):'}</span>
              </span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-slate-400">- Rs.</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-mono font-bold text-rose-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Net Grand Total */}
            <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">
                  {isUrdu ? 'خالص بل رقم' : 'Net Total Due'}
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-mono">
                {totalBagsCount} {isUrdu ? 'بوریاں' : 'Bags'}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              {isUrdu ? 'ادائیگی کا ذریعہ (Payment Method)' : 'Payment Method'}
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 transition ${
                  paymentMethod === PaymentMethod.CASH
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>{isUrdu ? 'نقد (Cash)' : 'Cash'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod(PaymentMethod.CHEQUE);
                  if (paidAmount === totalAmount) setPaidAmount(0);
                }}
                className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 transition ${
                  paymentMethod === PaymentMethod.CHEQUE
                    ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isUrdu ? 'کھاتہ ادھار' : 'Khata Credit'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod(PaymentMethod.BANK_TRANSFER)}
                className={`p-2 rounded-xl border font-bold flex flex-col items-center gap-1 transition ${
                  paymentMethod === PaymentMethod.BANK_TRANSFER
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{isUrdu ? 'بینک آن لائن' : 'Bank'}</span>
              </button>
            </div>
          </div>

          {/* Cash Tendered & Change Return */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>{isUrdu ? 'وصول شدہ نقد رقم (روپے):' : 'Amount Paid (PKR):'}</span>
              <button
                type="button"
                onClick={handleFullCash}
                className="text-[11px] text-emerald-600 hover:underline"
              >
                {isUrdu ? 'مکمل نقد' : 'Full Cash'}
              </button>
            </div>

            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Quick cash denomination chips */}
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              {[5000, 10000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickCash(amt)}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Balance Due / Change Info */}
            <div className="pt-2 text-xs flex items-center justify-between font-semibold">
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
              disabled={items.length === 0}
              onClick={handleCompleteSale}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Printer className="w-4 h-4" />
              <span>{isUrdu ? 'پرچی پرنٹ کریں و بل مکمل کریں' : 'Print Receipt & Complete Sale'}</span>
            </button>

            {!customer.isWalkIn && (
              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => {
                  handleFullCredit();
                  handleCompleteSale();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'زمیندار کھاتہ ادھار پرچی' : 'Issue on Khata (Credit)'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SELECT REGISTERED FARMER                                         */}
      {/* ========================================================================= */}
      <Dialog open={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'گاہک یا زمیندار منتخب کریں' : 'Select Customer / Farmer Khata'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu
                ? 'نقد کسان یا اپنے رجسٹرڈ زمیندار کا کھاتہ منتخب کریں'
                : 'Choose walk-in cash customer or select a registered farmer to debit balance.'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-3">
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    💵
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {isUrdu ? 'عام نقد کسان (Walk-in Cash)' : 'Walk-in Cash Customer'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isUrdu ? 'فوری نقد کاؤنٹر سیل، کوئی سابقہ کھاتہ نہیں' : 'Direct cash sale, no credit ledger tracking'}
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Farmer Cards List */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
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
                        <span className="text-[11px] text-slate-400 block">
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
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
            >
              {isUrdu ? 'بند کریں' : 'Close'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: 80MM PAKISTANI THERMAL RECEIPT PREVIEW & PRINT                   */}
      {/* ========================================================================= */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'تھرمل پرچی (Thermal Receipt)' : 'Thermal Receipt'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {isUrdu
                ? '80mm پرنٹر پرنٹ کے لیے تیار ہے'
                : 'Ready for 80mm POS thermal receipt printer'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            {lastBill && (
              <div
                id="printable-receipt"
                className="bg-white text-black p-4 rounded-xl text-xs font-mono border border-slate-200 shadow-inner"
              >
                {/* Shop Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-400 space-y-1">
                  <h2 className="text-base font-black tracking-tight">
                    الرحمان فرٹیلائزر اینڈ پیسٹیسائیڈز
                  </h2>
                  <p className="text-[11px] text-slate-600 font-sans">
                    Al-Rehman Fertilizer & Seeds Dealers
                  </p>
                  <p className="text-[10px] text-slate-500">
                    غلہ منڈی چیچہ وطنی روڈ، نزد حبیب بینک
                  </p>
                  <p className="text-[10px] text-slate-500" dir="ltr">
                    Ph: 0300-1234567 / 0301-7654321
                  </p>
                </div>

                {/* Receipt Metadata */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>رسید نمبر:</span>
                    <span className="font-bold">{lastBill.invoiceNo}</span>
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
                        <th className="text-center pb-1">بوریاں</th>
                        <th className="text-right pb-1">ریٹ</th>
                        <th className="text-right pb-1">رقم</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lastBill.items.map((it: PosCartItem, idx: number) => (
                        <tr key={idx} className="py-1">
                          <td className="py-1 text-left">
                            <div className="font-bold">{it.name}</div>
                          </td>
                          <td className="py-1 text-center font-bold">{it.quantity}</td>
                          <td className="py-1 text-right">{it.salePrice}</td>
                          <td className="py-1 text-right font-bold">{it.totalPrice}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Settlement Breakdown */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>کل بل رقم:</span>
                    <span className="font-bold">{formatCurrency(lastBill.subtotal)}</span>
                  </div>
                  {lastBill.discount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>رعایت (ڈسکاؤنٹ):</span>
                      <span>-{formatCurrency(lastBill.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-200">
                    <span>خالص بل:</span>
                    <span>{formatCurrency(lastBill.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>ادا شدہ رقم:</span>
                    <span className="font-bold">{formatCurrency(lastBill.paidAmount)}</span>
                  </div>
                  {lastBill.balanceDue > 0 && (
                    <div className="flex justify-between text-rose-700 font-bold">
                      <span>باقی ادھار:</span>
                      <span>{formatCurrency(lastBill.balanceDue)}</span>
                    </div>
                  )}
                </div>

                {/* Khata Balance (If registered farmer) */}
                {!lastBill.customer.isWalkIn && (
                  <div className="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-1 bg-slate-50 p-2 rounded mt-1">
                    <div className="flex justify-between text-slate-600">
                      <span>سابقہ ادھار کھاتہ:</span>
                      <span>{formatCurrency(lastBill.oldBalance)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>نیا کل واجب الادا بیلنس:</span>
                      <span className="text-rose-700">
                        {formatCurrency(lastBill.newBalance)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Urdu Blessing Dua */}
                <div className="pt-3 text-center space-y-1">
                  <p className="text-xs font-bold font-urdu">
                    اللہ تعالیٰ آپ کی فصل اور رزق میں برکت عطا فرمائے
                  </p>
                  <p className="text-[9px] text-slate-500 font-sans">
                    سافٹ ویئر تیار کردہ: کھاد انوینٹری مینجمنٹ سسٹم
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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                {isUrdu ? 'نیا بل (خالی کریں)' : 'New Bill'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition active:scale-95"
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
