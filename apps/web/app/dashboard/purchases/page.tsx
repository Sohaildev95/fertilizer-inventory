'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../lib/language-context';
import {
  Truck,
  Package,
  Search,
  PlusCircle,
  FileText,
  Calendar,
  Wallet,
  ArrowDownLeft,
  Building2,
  Trash2,
  Printer,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
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

// Mock Purchases Data
const INITIAL_PURCHASES = [
  {
    id: 'pur-1',
    invoiceNo: 'PUR-2026-089',
    vendorId: '1',
    vendorName: 'Fauji Fertilizer (FFC)',
    vendorType: 'fertilizer',
    date: '2026-10-04',
    vehicleNo: 'TK-7842 (ملتان گڈز ٹرانسپورٹ)',
    biltyNo: 'BL-9921',
    items: [
      { productName: 'Sona Urea (سونا یوریا ۵۰ کلو)', quantity: 200, unitPrice: 4200, total: 840000 },
      { productName: 'Sona DAP (سونا ڈی اے پی)', quantity: 50, unitPrice: 11800, total: 590000 },
    ],
    totalAmount: 1430000,
    paidAmount: 1000000,
    paymentStatus: 'partial',
    paymentMethod: 'bank_transfer',
    destination: 'گودام 1 - ریک A',
    notes: '250 بوریاں بحفاظت گودام میں منتقل ہو گئیں۔',
  },
  {
    id: 'pur-2',
    invoiceNo: 'PUR-2026-088',
    vendorId: '2',
    vendorName: 'Engro Fertilizers',
    vendorType: 'fertilizer',
    date: '2026-10-01',
    vehicleNo: 'FSD-2219 (ٹرک ٹرالی)',
    biltyNo: 'BL-8874',
    items: [
      { productName: 'Engro Urea (اینگرو یوریا)', quantity: 150, unitPrice: 4180, total: 627000 },
      { productName: 'Engro Zorawar (زورآور)', quantity: 40, unitPrice: 12200, total: 488000 },
    ],
    totalAmount: 1115000,
    paidAmount: 1115000,
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    destination: 'گودام 1 - ریک B',
    notes: 'تمام ادائیگی نقد کاؤنٹر سے ہو گئی۔',
  },
  {
    id: 'pur-3',
    invoiceNo: 'PUR-2026-085',
    vendorId: '3',
    vendorName: 'Pioneer Seeds',
    vendorType: 'seed',
    date: '2026-09-27',
    vehicleNo: 'LHR-9011 (شہزور پک اپ)',
    biltyNo: 'BL-7612',
    items: [
      { productName: 'Pioneer Corn Hybrid 30Y87', quantity: 60, unitPrice: 8500, total: 510000 },
    ],
    totalAmount: 510000,
    paidAmount: 200000,
    paymentStatus: 'partial',
    paymentMethod: 'bank_transfer',
    destination: 'گودام 2 - بیج سیکشن',
    notes: 'بقایا رقم 15 دن کے وعدے پر ہے۔',
  },
  {
    id: 'pur-4',
    invoiceNo: 'PUR-2026-081',
    vendorId: '4',
    vendorName: 'Bayer Crop Science',
    vendorType: 'pesticide',
    date: '2026-09-20',
    vehicleNo: 'RWP-3481 (ڈلیوری وین)',
    biltyNo: 'BL-6510',
    items: [
      { productName: 'Belt Expert 100ml (سپرے)', quantity: 100, unitPrice: 1850, total: 185000 },
      { productName: 'Nativo Fungicide 100g', quantity: 80, unitPrice: 2200, total: 176000 },
    ],
    totalAmount: 361000,
    paidAmount: 0,
    paymentStatus: 'unpaid',
    paymentMethod: 'cheque',
    destination: 'دکان بیک ریک C',
    notes: '30 دن کی کریڈٹ لمیٹ پر خریدا گیا۔',
  },
];

// Available Products for quick purchase selection
const AVAILABLE_PRODUCTS = [
  { id: 'prd-1', name: 'Sona Urea 50kg (سونا یوریا)', defaultCost: 4200, company: 'Fauji Fertilizer (FFC)' },
  { id: 'prd-2', name: 'Engro Urea 50kg (اینگرو یوریا)', defaultCost: 4180, company: 'Engro Fertilizers' },
  { id: 'prd-3', name: 'Sona DAP 50kg (سونا ڈی اے پی)', defaultCost: 11800, company: 'Fauji Fertilizer (FFC)' },
  { id: 'prd-4', name: 'Engro Zorawar DAP (اینگرو ڈی اے پی)', defaultCost: 12200, company: 'Engro Fertilizers' },
  { id: 'prd-5', name: 'Sarsabz CAN (گوارا سرسبز)', defaultCost: 3600, company: 'Fatima Fertilizer' },
  { id: 'prd-6', name: 'Pioneer Corn 30Y87 (مکئی بیج)', defaultCost: 8500, company: 'Pioneer Seeds' },
  { id: 'prd-7', name: 'Belt Expert 100ml (سپرے)', defaultCost: 1850, company: 'Bayer Crop Science' },
];

export default function PurchasesPage() {
  const { isUrdu } = useLanguage();
  const [purchases, setPurchases] = useState(INITIAL_PURCHASES);
  const [search, setSearch] = useState('');
  const [filterVendor, setFilterVendor] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<any>(null);

  // Form State for New Stock-In Purchase
  const [formData, setFormData] = useState({
    vendorName: 'Fauji Fertilizer (FFC)',
    invoiceNo: `PUR-2026-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().slice(0, 10),
    vehicleNo: '',
    biltyNo: '',
    destination: 'گودام 1 - مین ہال',
    paymentMethod: 'bank_transfer',
    paidAmount: '',
    notes: '',
  });

  const [formItems, setFormItems] = useState([
    { productId: 'prd-1', productName: 'Sona Urea 50kg (سونا یوریا)', quantity: 100, unitPrice: 4200 },
  ]);

  // Calculations for KPI Cards
  const totalPurchasesAmount = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalBagsReceived = purchases.reduce(
    (acc, p) => acc + p.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
  const totalUnpaidPayables = purchases.reduce(
    (acc, p) => acc + (p.totalAmount - p.paidAmount),
    0
  );

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((item) => {
      const matchSearch =
        item.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        item.vendorName.toLowerCase().includes(search.toLowerCase()) ||
        item.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
        item.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));

      const matchVendor = filterVendor === 'all' || item.vendorName === filterVendor;
      const matchStatus = filterStatus === 'all' || item.paymentStatus === filterStatus;

      return matchSearch && matchVendor && matchStatus;
    });
  }, [purchases, search, filterVendor, filterStatus]);

  // Form dynamic item handlers
  const handleAddItem = () => {
    setFormItems([
      ...formItems,
      { productId: 'prd-1', productName: 'Sona Urea 50kg (سونا یوریا)', quantity: 50, unitPrice: 4200 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity' | 'unitPrice', value: string | number) => {
    const updated = [...formItems];
    const current = updated[index];
    if (!current) return;

    if (field === 'productId') {
      const selected = AVAILABLE_PRODUCTS.find((p) => p.id === value);
      if (selected) {
        updated[index] = {
          ...current,
          productId: selected.id,
          productName: selected.name,
          unitPrice: selected.defaultCost,
        };
      }
    } else if (field === 'quantity') {
      updated[index] = {
        ...current,
        quantity: Number(value) || 0,
      };
    } else if (field === 'unitPrice') {
      updated[index] = {
        ...current,
        unitPrice: Number(value) || 0,
      };
    }
    setFormItems(updated);
  };

  const calculatedFormTotal = formItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Submit Handler
  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const paid = Number(formData.paidAmount) || 0;
    const paymentStatus =
      paid >= calculatedFormTotal ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

    const newEntry = {
      id: `pur-${Date.now()}`,
      invoiceNo: formData.invoiceNo,
      vendorId: '1',
      vendorName: formData.vendorName,
      vendorType: 'fertilizer',
      date: formData.date ? formData.date : new Date().toISOString().slice(0, 10),
      vehicleNo: formData.vehicleNo || 'لوکل ٹرالی / ٹرک',
      biltyNo: formData.biltyNo || 'BL-NIL',
      items: formItems.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
      totalAmount: calculatedFormTotal,
      paidAmount: paid,
      paymentStatus: paymentStatus as any,
      paymentMethod: formData.paymentMethod as any,
      destination: formData.destination,
      notes: formData.notes,
    };

    setPurchases([newEntry, ...purchases]);
    setIsAddModalOpen(false);
    // Reset form
    setFormData({
      vendorName: 'Fauji Fertilizer (FFC)',
      invoiceNo: `PUR-2026-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      vehicleNo: '',
      biltyNo: '',
      destination: 'گودام 1 - مین ہال',
      paymentMethod: 'bank_transfer',
      paidAmount: '',
      notes: '',
    });
  };

  // Helper formatting currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? 'مال کی خریداری و اسٹاک آمد' : 'Purchases & Stock-In'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isUrdu
              ? 'کھاد کمپنیوں سے مال کی آمد، ٹرک و بلٹی ریکارڈ، بوریوں کی تعداد اور ادائیگیوں کا حساب'
              : 'Record incoming fertilizer trailers, bilty details, supplier invoices, and inventory increments.'}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          {isUrdu ? 'نیا مال داخل کریں (Stock In)' : 'New Stock-In Purchase'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Purchases */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600">
                {isUrdu ? 'کل خریداری مال' : 'Total Purchases This Month'}
              </h3>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {formatCurrency(totalPurchasesAmount)}
            </div>
            <div className="text-xs font-medium text-blue-600 mt-1">
              {isUrdu ? 'کمپنیوں سے خریدا گیا مال' : 'Total invoice value from suppliers'}
            </div>
          </div>
        </div>

        {/* Bags Received */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600">
                {isUrdu ? 'موصولہ بوریاں (گودام آمد)' : 'Total Bags Received'}
              </h3>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {totalBagsReceived.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-500">{isUrdu ? 'بوریاں' : 'Bags'}</span>
            </div>
            <div className="text-xs font-medium text-emerald-600 mt-1">
              {isUrdu ? 'گودام میں شامل شدہ مال' : 'Added to current warehouse stock'}
            </div>
          </div>
        </div>

        {/* Unpaid Payables */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600">
                {isUrdu ? 'سپلائر کے بقایا جات' : 'Pending Supplier Payables'}
              </h3>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {formatCurrency(totalUnpaidPayables)}
            </div>
            <div className="text-xs font-medium text-rose-600 mt-1">
              {isUrdu ? 'کمپنیوں کو دینے والی رقم' : 'Outstanding dues on recent invoices'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls: Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isUrdu
                ? 'بل نمبر، کمپنی، گاڑی نمبر یا پراڈکٹ تلاش کریں...'
                : 'Search bill #, company, vehicle, or product...'
            }
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-3">
          {/* Vendor Filter */}
          <Select value={filterVendor} onValueChange={setFilterVendor}>
            <SelectTrigger className="w-full sm:w-[200px] bg-slate-50 border-slate-200 text-slate-700">
              <SelectValue placeholder={isUrdu ? 'تمام کمپنیاں' : 'All Vendors'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isUrdu ? 'تمام کمپنیاں (All Vendors)' : 'All Vendors'}</SelectItem>
              <SelectItem value="Fauji Fertilizer (FFC)">Fauji Fertilizer (FFC)</SelectItem>
              <SelectItem value="Engro Fertilizers">Engro Fertilizers</SelectItem>
              <SelectItem value="Pioneer Seeds">Pioneer Seeds</SelectItem>
              <SelectItem value="Bayer Crop Science">Bayer Crop Science</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Status Filter */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[170px] bg-slate-50 border-slate-200 text-slate-700">
              <SelectValue placeholder={isUrdu ? 'تمام بل اسٹیٹس' : 'All Status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isUrdu ? 'تمام بل (All Status)' : 'All Status'}</SelectItem>
              <SelectItem value="paid">{isUrdu ? 'ادا شدہ (Paid)' : 'Paid'}</SelectItem>
              <SelectItem value="partial">{isUrdu ? 'کچھ باقی (Partial)' : 'Partial'}</SelectItem>
              <SelectItem value="unpaid">{isUrdu ? 'غیر ادا شدہ (Unpaid)' : 'Unpaid'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Purchases List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 font-semibold text-slate-700">{isUrdu ? 'بل نمبر و تاریخ' : 'Invoice & Date'}</th>
                <th className="py-3 px-4 font-semibold text-slate-700">{isUrdu ? 'سپلائر کمپنی' : 'Supplier Company'}</th>
                <th className="py-3 px-4 font-semibold text-slate-700">{isUrdu ? 'آمد مال (تفصیل)' : 'Items Received'}</th>
                <th className="py-3 px-4 font-semibold text-right text-slate-700">{isUrdu ? 'کل رقم' : 'Total Bill'}</th>
                <th className="py-3 px-4 font-semibold text-center text-slate-700">{isUrdu ? 'ادائیگی اسٹیٹس' : 'Payment'}</th>
                <th className="py-3 px-4 font-semibold text-center text-slate-700">{isUrdu ? 'ایکشن' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">{isUrdu ? 'کوئی بل نہیں ملا' : 'No purchase records found matching criteria.'}</p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase) => {
                  const remaining = purchase.totalAmount - purchase.paidAmount;
                  const totalBags = purchase.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <tr key={purchase.id} className="hover:bg-slate-50/50 transition group">
                      {/* Bill & Date */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm font-mono flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-emerald-600" />
                            {purchase.invoiceNo}
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {purchase.date}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {purchase.vehicleNo}
                          </span>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{purchase.vendorName}</div>
                            <div className="text-xs text-slate-400">{purchase.destination}</div>
                          </div>
                        </div>
                      </td>

                      {/* Items Received Summary */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {totalBags} {isUrdu ? 'بوریاں' : 'Bags'}
                          </span>
                          <div className="text-xs text-slate-600 truncate max-w-xs">
                            {purchase.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                          </div>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-bold text-slate-900">
                            {formatCurrency(purchase.totalAmount)}
                          </span>
                          {remaining > 0 ? (
                            <span className="text-[11px] text-rose-500 font-semibold mt-0.5">
                              {isUrdu ? `باقی: ${formatCurrency(remaining)}` : `Bal: ${formatCurrency(remaining)}`}
                            </span>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                              {isUrdu ? 'مکمل ادا شدہ' : 'Fully Paid'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-4 px-4 text-center">
                        {purchase.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {isUrdu ? 'ادا شدہ' : 'Paid'}
                          </span>
                        ) : purchase.paymentStatus === 'partial' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-500" />
                            {isUrdu ? 'کچھ باقی' : 'Partial'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            {isUrdu ? 'قرض / ادھار' : 'Unpaid'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setViewingPurchase(purchase)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-semibold transition flex items-center gap-1 mx-auto"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isUrdu ? 'بل تفصیل' : 'View Bill'}</span>
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
      {/* MODAL 1: RECORD NEW STOCK-IN PURCHASE                                     */}
      {/* ========================================================================= */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-3xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'نیا مال خریداری و اسٹاک ان' : 'Record New Stock-In Purchase'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu
                ? 'کمپنی سے آئی ہوئی گاڑی، بلٹی، بوریاں اور خریداری ریٹ درج کریں'
                : 'Enter supplier invoice, vehicle details, received bags, and cost rate.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePurchase} className="flex-1 flex flex-col overflow-hidden">
            <DialogBody>
              {/* Top Row: Supplier & Invoice */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'سپلائر کمپنی*' : 'Supplier Vendor*'}
                  </label>
                  <Select
                    value={formData.vendorName}
                    onValueChange={(val) => setFormData({ ...formData, vendorName: val })}
                  >
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white focus:ring-emerald-500 h-[42px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                      <SelectItem value="Fauji Fertilizer (FFC)">Fauji Fertilizer (FFC) - سونا</SelectItem>
                      <SelectItem value="Engro Fertilizers">Engro Fertilizers - اینگرو</SelectItem>
                      <SelectItem value="Fatima Fertilizer">Fatima Fertilizer - سرسبز</SelectItem>
                      <SelectItem value="Pioneer Seeds">Pioneer Seeds - پائینیر</SelectItem>
                      <SelectItem value="Bayer Crop Science">Bayer Crop Science - بائر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'بل نمبر / انوائس*' : 'Invoice / Bill No*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'تاریخ آمد*' : 'Purchase Date*'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Second Row: Vehicle & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'گاڑی نمبر / ٹرانسپورٹ' : 'Vehicle / Truck No'}
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                    placeholder={isUrdu ? 'مثلاً: TK-4421 ملتان گڈز' : 'e.g. TRK-7842 Goods'}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'بلٹی نمبر' : 'Bilty / LR Number'}
                  </label>
                  <input
                    type="text"
                    value={formData.biltyNo}
                    onChange={(e) => setFormData({ ...formData, biltyNo: e.target.value })}
                    placeholder="BL-xxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'گودام / منزل' : 'Warehouse Godown'}
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="گودام 1 - مین ہال"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Items Section Header */}
              <div className="pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    {isUrdu ? 'موصولہ اشیاء کی فہرست (بوریاں و ریٹ)' : 'Items Received (Bags & Cost)'}
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {isUrdu ? '+ مزید آئٹم شامل کریں' : '+ Add Item Row'}
                  </button>
                </div>

                {/* Items Dynamic Rows */}
                <div className="space-y-3 mt-3">
                  {formItems.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2.5 items-center p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60"
                    >
                      <div className="col-span-5">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          {isUrdu ? 'پراڈکٹ / کھاد' : 'Product'}
                        </label>
                        <Select
                          value={item.productId}
                          onValueChange={(val) => handleItemChange(index, 'productId', val)}
                        >
                          <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[38px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white z-[160]">
                            {AVAILABLE_PRODUCTS.map((p) => (
                              <SelectItem key={p.id} value={p.id} className="text-xs">
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          {isUrdu ? 'بوریاں (تعداد)*' : 'Quantity (Bags)*'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block text-[11px] text-slate-400 mb-1">
                          {isUrdu ? 'فی بوری ریٹ (روپے)*' : 'Cost Rate / Bag*'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="col-span-1 flex items-center justify-center pt-5">
                        {formItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Settlement Summary */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-300">
                    {isUrdu ? 'کل بل کی رقم (Grand Total):' : 'Grand Total:'}
                  </span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {formatCurrency(calculatedFormTotal)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700/60">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isUrdu ? 'ادائیگی کا ذریعہ' : 'Payment Method'}
                    </label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                    >
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[40px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                        <SelectItem value="bank_transfer">{isUrdu ? 'بینک ٹرانسفر (Bank)' : 'Bank Transfer'}</SelectItem>
                        <SelectItem value="cash">{isUrdu ? 'نقد کاؤنٹر (Cash)' : 'Cash'}</SelectItem>
                        <SelectItem value="cheque">{isUrdu ? 'بینک چیک (Cheque)' : 'Cheque'}</SelectItem>
                        <SelectItem value="credit">{isUrdu ? 'کمپنی کریڈٹ کھاتہ (Company Credit)' : 'Company Credit'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isUrdu ? 'ادا شدہ رقم (روپے)' : 'Amount Paid (PKR)'}
                    </label>
                    <input
                      type="number"
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                      placeholder="0"
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-emerald-400 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isUrdu
                        ? `باقی واجب الادا: ${formatCurrency(
                            Math.max(0, calculatedFormTotal - (Number(formData.paidAmount) || 0))
                          )}`
                        : `Remaining Balance: ${formatCurrency(
                            Math.max(0, calculatedFormTotal - (Number(formData.paidAmount) || 0))
                          )}`}
                    </p>
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition active:scale-95"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
              >
                {isUrdu ? 'مال محفوظ کریں اور اسٹاک بڑھائیں' : 'Save Purchase & Increment Stock'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW PURCHASE BILL DETAILS                                       */}
      {/* ========================================================================= */}
      <Dialog open={!!viewingPurchase} onOpenChange={(open) => !open && setViewingPurchase(null)}>
        <DialogContent className="max-w-xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          {viewingPurchase && (
            <>
              <DialogHeader>
                <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? 'خریداری انوائس بل' : 'Purchase Invoice Receipt'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5 font-mono">
                  {viewingPurchase.invoiceNo} — {viewingPurchase.date}
                </DialogDescription>
              </DialogHeader>

              <DialogBody>
                {/* Meta details card */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-400 block">{isUrdu ? 'سپلائر کمپنی:' : 'Supplier:'}</span>
                    <span className="font-bold text-white text-sm mt-0.5 block">{viewingPurchase.vendorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isUrdu ? 'گاڑی / ٹرانسپورٹ:' : 'Vehicle:'}</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{viewingPurchase.vehicleNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isUrdu ? 'بلٹی نمبر:' : 'Bilty No:'}</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{viewingPurchase.biltyNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isUrdu ? 'گودام لوکیشن:' : 'Godown:'}</span>
                    <span className="font-semibold text-slate-200 mt-0.5 block">{viewingPurchase.destination}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/80 text-slate-300">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">{isUrdu ? 'آئٹم' : 'Item'}</th>
                        <th className="py-2.5 px-3 font-semibold text-center">{isUrdu ? 'تعداد' : 'Qty'}</th>
                        <th className="py-2.5 px-3 font-semibold text-right">{isUrdu ? 'ریٹ' : 'Rate'}</th>
                        <th className="py-2.5 px-3 font-semibold text-right">{isUrdu ? 'کل رقم' : 'Total'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {viewingPurchase.items.map((it: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-medium">{it.productName}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{it.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                            {formatCurrency(it.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{isUrdu ? 'کل بل رقم:' : 'Total Invoice Amount:'}</span>
                    <span className="font-bold text-white font-mono text-sm">{formatCurrency(viewingPurchase.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isUrdu ? 'ادا شدہ رقم:' : 'Paid Amount:'}</span>
                    <span className="font-bold text-emerald-400 font-mono">{formatCurrency(viewingPurchase.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/60 font-semibold">
                    <span className="text-rose-400">{isUrdu ? 'بقایا واجبات:' : 'Remaining Balance:'}</span>
                    <span className="font-bold text-rose-400 font-mono text-sm">
                      {formatCurrency(Math.max(0, viewingPurchase.totalAmount - viewingPurchase.paidAmount))}
                    </span>
                  </div>
                </div>
              </DialogBody>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isUrdu ? 'پرنٹ کریں' : 'Print Invoice'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPurchase(null)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                >
                  {isUrdu ? 'بند کریں' : 'Close'}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
