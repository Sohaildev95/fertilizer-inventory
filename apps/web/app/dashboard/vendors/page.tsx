'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../../lib/language-context';
import { apiRequest } from '../../../lib/api-client';
import {
  Building2,
  Phone,
  MapPin,
  Search,
  PlusCircle,
  Wallet,
  TrendingUp,
  FileText,
  BadgeCent,
  Loader2,
  Printer,
  Receipt,
  CheckCircle2,
  Calendar,
  Send,
  ArrowUpRight,
  Sparkles,
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

interface VendorItem {
  id: string;
  name: string;
  company_name?: string;
  contact_person?: string;
  phone: string;
  alt_phone?: string;
  email?: string;
  cnic?: string;
  city: string;
  address?: string;
  current_balance: number;
  status: string;
  notes?: string;
  created_at: string;
}

export default function VendorsPage() {
  const { isUrdu } = useLanguage();
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats
  const [apiStats, setApiStats] = useState<{
    totalCount: number;
    activeCount: number;
    totalPayable: number;
    totalAdvance: number;
    thisMonthPurchases: number;
  } | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedVendorForPayment, setSelectedVendorForPayment] = useState<VendorItem | null>(null);
  const [selectedVendorForLedger, setSelectedVendorForLedger] = useState<VendorItem | null>(null);
  const [ledgerData, setLedgerData] = useState<{
    vendor: VendorItem;
    transactions: any[];
    summary: { totalPurchases: number; totalPayments: number; currentBalance: number };
  } | null>(null);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  // Form State: Add Vendor
  const [vendorForm, setVendorForm] = useState({
    name: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    altPhone: '',
    city: 'ملتان',
    address: '',
    currentBalance: '0',
    notes: '',
  });

  // Form State: Pay Vendor
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'bank_transfer',
    chequeNumber: '',
    chequeDate: '',
    notes: '',
  });

  // Load vendors and summary from backend
  const loadVendors = async () => {
    setIsLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        apiRequest<{ data: VendorItem[] }>('/vendors?limit=100'),
        apiRequest<{
          totalCount: number;
          activeCount: number;
          totalPayable: number;
          totalAdvance: number;
          thisMonthPurchases: number;
        }>('/vendors/stats/summary'),
      ]);

      if (listRes?.data) {
        setVendors(listRes.data);
      }
      if (statsRes) {
        setApiStats(statsRes);
      }
    } catch (err) {
      console.warn('Failed to load vendors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  // Stats calculation
  const totalPayable = useMemo(() => {
    if (apiStats) return apiStats.totalPayable;
    return vendors.reduce((acc, v) => (Number(v.current_balance) > 0 ? acc + Number(v.current_balance) : acc), 0);
  }, [apiStats, vendors]);

  const totalAdvance = useMemo(() => {
    if (apiStats) return apiStats.totalAdvance;
    return Math.abs(
      vendors.reduce((acc, v) => (Number(v.current_balance) < 0 ? acc + Number(v.current_balance) : acc), 0),
    );
  }, [apiStats, vendors]);

  const activeVendors = useMemo(() => {
    if (apiStats) return apiStats.activeCount;
    return vendors.filter((v) => v.status === 'active').length;
  }, [apiStats, vendors]);

  const thisMonthPurchases = useMemo(() => {
    return apiStats?.thisMonthPurchases || 0;
  }, [apiStats]);

  // Cities for filter
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    vendors.forEach((v) => {
      if (v.city) set.add(v.city);
    });
    return Array.from(set);
  }, [vendors]);

  // Formatting currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const q = search.toLowerCase();
      const matchSearch =
        (vendor.name && vendor.name.toLowerCase().includes(q)) ||
        (vendor.company_name && vendor.company_name.toLowerCase().includes(q)) ||
        (vendor.contact_person && vendor.contact_person.toLowerCase().includes(q)) ||
        (vendor.city && vendor.city.toLowerCase().includes(q)) ||
        (vendor.phone && vendor.phone.includes(q));

      const matchCity = filterCity === 'all' || vendor.city === filterCity;
      return matchSearch && matchCity;
    });
  }, [vendors, search, filterCity]);

  // Color generator for avatar
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
    ];
    const index = (name || 'V').length % colors.length;
    return colors[index];
  };

  // Handlers
  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim() || !vendorForm.phone.trim()) {
      alert('کمپنی کا نام اور فون نمبر لازمی ہے');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await apiRequest<VendorItem>('/vendors', {
        method: 'POST',
        body: JSON.stringify({
          name: vendorForm.name.trim(),
          companyName: vendorForm.companyName.trim() || undefined,
          contactPerson: vendorForm.contactPerson.trim() || undefined,
          phone: vendorForm.phone.trim(),
          altPhone: vendorForm.altPhone.trim() || undefined,
          city: vendorForm.city.trim() || 'ملتان',
          address: vendorForm.address.trim() || undefined,
          currentBalance: Number(vendorForm.currentBalance) || 0,
          notes: vendorForm.notes.trim() || undefined,
        }),
      });

      setVendors((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setVendorForm({
        name: '',
        companyName: '',
        contactPerson: '',
        phone: '',
        altPhone: '',
        city: 'ملتان',
        address: '',
        currentBalance: '0',
        notes: '',
      });
      loadVendors();
    } catch (err: any) {
      alert(`سپلائر محفوظ کرنے میں خرابی: ${err?.message || 'Error creating vendor'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentModal = (vendor: VendorItem) => {
    setSelectedVendorForPayment(vendor);
    setPaymentForm({
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'bank_transfer',
      chequeNumber: '',
      chequeDate: '',
      notes: '',
    });
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForPayment) return;
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) {
      alert('براہ کرم درست رقم درج کریں');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        paymentNumber: string;
        oldBalance: number;
        newBalance: number;
      }>(`/vendors/${selectedVendorForPayment.id}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amount,
          paymentMethod: paymentForm.paymentMethod,
          chequeNumber: paymentForm.chequeNumber.trim() || undefined,
          chequeDate: paymentForm.chequeDate || undefined,
          notes: paymentForm.notes.trim() || undefined,
        }),
      });

      // Update in state
      setVendors((prev) =>
        prev.map((v) =>
          v.id === selectedVendorForPayment.id
            ? { ...v, current_balance: res.newBalance }
            : v,
        ),
      );

      setIsPaymentModalOpen(false);
      alert(`ادائیگی کامیابی سے درج ہو گئی۔ واؤچر نمبر: ${res.paymentNumber}`);
      loadVendors();
    } catch (err: any) {
      alert(`ادائیگی درج کرنے میں خرابی: ${err?.message || 'Error recording payment'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openVendorLedger = async (vendor: VendorItem) => {
    setSelectedVendorForLedger(vendor);
    setIsLedgerLoading(true);
    try {
      const res = await apiRequest<{
        vendor: VendorItem;
        transactions: any[];
        summary: { totalPurchases: number; totalPayments: number; currentBalance: number };
      }>(`/vendors/${vendor.id}/ledger`);
      if (res) {
        setLedgerData(res);
      }
    } catch (err) {
      console.warn('Failed to load vendor ledger:', err);
    } finally {
      setIsLedgerLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl flex-shrink-0 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'کمپنیاں اور سپلائرز کھاتہ' : 'Vendors & Suppliers Khata'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isUrdu
                  ? 'کھاد، بیج، اور سپرے فراہم کرنے والی کمپنیوں کا ادھار کھاتہ، ادائیگیاں اور بل'
                  : 'Manage accounts, purchase bills, payments and running ledgers for suppliers.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          <span>{isUrdu ? 'نیا سپلائر شامل کریں' : 'Add New Vendor'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Payable */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل واجب الادا رقم' : 'Total Payable'}
            </h3>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
            {formatCurrency(totalPayable)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'کمپنیوں کے نام واجب الادا بقایا' : 'Total credit balance owed to suppliers'}
          </div>
        </div>

        {/* Total Advance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'ایڈوانس جمع رقم' : 'Advance Paid'}
            </h3>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
            {formatCurrency(totalAdvance)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'کمپنیوں کے پاس پیشگی جمع' : 'Credit excess advance with vendors'}
          </div>
        </div>

        {/* This Month Purchases */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'اس ماہ کی خریداری' : 'Month Purchases'}
            </h3>
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono tracking-tight">
            {formatCurrency(thisMonthPurchases)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'رواں ماہ حاصل کردہ مال کی مالیت' : 'Total stock billed this month'}
          </div>
        </div>

        {/* Active Vendors */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-50 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'فعال سپلائرز' : 'Active Vendors'}
            </h3>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {activeVendors} <span className="text-sm font-normal text-slate-500">{isUrdu ? 'کمپنیاں' : 'Companies'}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'منظور شدہ کھاد و بیج ڈسٹری بیوٹرز' : 'Approved supply partners'}
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
                ? 'کمپنی کا نام، شہر، نمائندہ یا فون تلاش کریں...'
                : 'Search company, city, contact person, or phone...'
            }
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger className="w-full md:w-[200px] bg-slate-50 border-slate-200 text-xs sm:text-sm h-[40px] rounded-xl">
              <SelectValue placeholder={isUrdu ? 'تمام شہر (All Cities)' : 'All Cities'} />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 z-[120]">
              <SelectItem value="all">{isUrdu ? 'تمام شہر (All Cities)' : 'All Cities'}</SelectItem>
              {uniqueCities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vendors Table view */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600 whitespace-nowrap">
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'کمپنی کا نام و برانڈ' : 'Company & Brand'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'رابطہ پرسن و فون' : 'Contact Person & Phone'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'شہر و ڈلیوری اسٹیشن' : 'City & Station'}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'واجب الادا کھاتہ بیلنس' : 'Payable Balance'}</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">{isUrdu ? 'اقدامات (Actions)' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <p>{isUrdu ? 'سپلائرز کا ریکارڈ لوڈ ہو رہا ہے...' : 'Loading vendors data...'}</p>
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-slate-600">
                      {isUrdu ? 'کوئی سپلائر نہیں ملا' : 'No vendors found.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => {
                  const avatarClasses = getAvatarColor(vendor.name);
                  const initial = (vendor.company_name || vendor.name).charAt(0).toUpperCase();
                  const bal = Number(vendor.current_balance || 0);

                  return (
                    <tr key={vendor.id} className="hover:bg-slate-50/60 transition group whitespace-nowrap">
                      {/* Company Info */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div
                          className="flex items-center gap-3 whitespace-nowrap cursor-pointer"
                          onClick={() => openVendorLedger(vendor)}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base border shadow-sm ${avatarClasses}`}>
                            {initial}
                          </div>
                          <div className="whitespace-nowrap">
                            <div className="font-bold text-slate-900 text-sm hover:text-emerald-700 transition whitespace-nowrap">
                              {vendor.company_name || vendor.name}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap">
                              {vendor.notes || 'کھاد و زرعی ادویات سپلائر'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800 whitespace-nowrap">
                          {vendor.contact_person || vendor.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1.5 whitespace-nowrap" dir="ltr">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{vendor.phone}</span>
                        </div>
                      </td>

                      {/* City */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-slate-700 font-medium whitespace-nowrap">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{vendor.city || 'ملتان'}</span>
                        </div>
                        {vendor.address && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {vendor.address}
                          </div>
                        )}
                      </td>

                      {/* Balance */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        {bal === 0 ? (
                          <span className="text-sm font-semibold text-slate-400 whitespace-nowrap">
                            Rs. 0 (صاف)
                          </span>
                        ) : bal > 0 ? (
                          <div className="flex flex-col items-end whitespace-nowrap">
                            <span className="text-sm font-extrabold font-mono text-rose-600 whitespace-nowrap">
                              {formatCurrency(bal)}
                            </span>
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">
                              {isUrdu ? 'واجب الادا (دینے ہیں)' : 'Payable'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end whitespace-nowrap">
                            <span className="text-sm font-extrabold font-mono text-emerald-600 whitespace-nowrap">
                              {formatCurrency(Math.abs(bal))}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">
                              {isUrdu ? 'ایڈوانس (جمع ہیں)' : 'Advance'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Make Payment */}
                          <button
                            onClick={() => openPaymentModal(vendor)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition"
                            title={isUrdu ? 'سپلائر کو ادائیگی درج کریں' : 'Make Payment'}
                          >
                            <BadgeCent className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'ادائیگی' : 'Pay'}</span>
                          </button>

                          {/* View Ledger */}
                          <button
                            onClick={() => openVendorLedger(vendor)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition"
                            title={isUrdu ? 'کھاتہ / لیجر دیکھیں' : 'View Ledger'}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'کھاتہ' : 'Ledger'}</span>
                          </button>
                        </div>
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
      {/* MODAL 1: ADD NEW VENDOR                                                   */}
      {/* ========================================================================= */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'نیا سپلائر یا کمپنی رجسٹر کریں' : 'Register New Supplier / Vendor'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu
                ? 'کھاد، بیج یا ادویات کی نئی کمپنی، ڈسٹری بیوٹر اور سابقہ واجب الادا بیلنس درج کریں'
                : 'Enter company details, contact person, city station, and opening payable balance.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveVendor} className="flex-1 flex flex-col overflow-hidden">
            <DialogBody>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'کمپنی کا نام*' : 'Company Name*'}
                    </label>
                    <input
                      type="text"
                      required
                      value={vendorForm.name}
                      onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                      placeholder={isUrdu ? 'مثلاً: فوجی فرٹیلائزر (FFC)' : 'e.g. Fauji Fertilizer (FFC)'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'برانڈ / گروپ' : 'Parent Brand / Group'}
                    </label>
                    <input
                      type="text"
                      value={vendorForm.companyName}
                      onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })}
                      placeholder={isUrdu ? 'سونا یوریا / سونا ڈی اے پی' : 'FFC Ltd'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'رابطہ پرسن / سیلز آفیسر' : 'Contact Person'}
                    </label>
                    <input
                      type="text"
                      value={vendorForm.contactPerson}
                      onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                      placeholder={isUrdu ? 'چوہدری زاہد خاں' : 'Zahid Khan'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'موبائل نمبر*' : 'Mobile / Phone Number*'}
                    </label>
                    <input
                      type="text"
                      required
                      value={vendorForm.phone}
                      onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'شہر / سپلائی اسٹیشن*' : 'City / Supply Station*'}
                    </label>
                    <input
                      type="text"
                      required
                      value={vendorForm.city}
                      onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                      placeholder={isUrdu ? 'ملتان / ساہیوال' : 'Multan'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'ابتدائی سابقہ بقایا (روپے)' : 'Opening Balance (PKR)'}
                    </label>
                    <input
                      type="number"
                      value={vendorForm.currentBalance}
                      onChange={(e) => setVendorForm({ ...vendorForm, currentBalance: e.target.value })}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-rose-400 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'پتہ و ڈپو کی تفصیل' : 'Address & Depot Location'}
                  </label>
                  <input
                    type="text"
                    value={vendorForm.address}
                    onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                    placeholder={isUrdu ? 'انڈسٹریل زون، خانیوال روڈ' : 'Industrial Area, Depot Road'}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
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
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition transform active:scale-95 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isUrdu ? 'محفوظ کریں' : 'Save Vendor'}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: MAKE PAYMENT TO VENDOR                                           */}
      {/* ========================================================================= */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'سپلائر کو ادائیگی کا اندراج' : 'Record Payment to Supplier'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {selectedVendorForPayment
                ? `${selectedVendorForPayment.company_name || selectedVendorForPayment.name} — موجودہ واجب الادا: Rs. ${Number(selectedVendorForPayment.current_balance || 0).toLocaleString()}`
                : 'Enter payment details to credit supplier ledger.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePayment} className="flex-1 flex flex-col overflow-hidden">
            <DialogBody>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'ادائیگی کی رقم (روپے)*' : 'Amount Paid (PKR)*'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base text-emerald-400 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'ادائیگی کی تاریخ*' : 'Payment Date*'}
                    </label>
                    <DatePicker
                      value={paymentForm.date}
                      onChange={(d) => setPaymentForm({ ...paymentForm, date: d })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'طریقہ ادائیگی' : 'Payment Method'}
                    </label>
                    <Select
                      value={paymentForm.paymentMethod}
                      onValueChange={(val) => setPaymentForm({ ...paymentForm, paymentMethod: val })}
                    >
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[42px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                        <SelectItem value="bank_transfer">{isUrdu ? 'بینک ٹرانسفر (HBL/MCB)' : 'Bank Transfer'}</SelectItem>
                        <SelectItem value="cash">{isUrdu ? 'نقد رقم (Cash)' : 'Cash'}</SelectItem>
                        <SelectItem value="cheque">{isUrdu ? 'بینک چیک (Cheque)' : 'Cheque'}</SelectItem>
                        <SelectItem value="online">{isUrdu ? 'آن لائن / ایپ (Online)' : 'Online App'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentForm.paymentMethod === 'cheque' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {isUrdu ? 'چیک نمبر' : 'Cheque Number'}
                      </label>
                      <input
                        type="text"
                        value={paymentForm.chequeNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, chequeNumber: e.target.value })}
                        placeholder="CHQ-889912"
                        className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'تفصیل / نوٹ' : 'Remarks / Note'}
                  </label>
                  <input
                    type="text"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    placeholder={isUrdu ? 'مثلاً: بلٹی نمبر 9921 کے حساب میں ادائیگی' : 'Payment remarks...'}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
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
                <span>{isUrdu ? 'ادائیگی محفوظ کریں' : 'Record Payment'}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: DETAILED VENDOR KHATA LEDGER                                      */}
      {/* ========================================================================= */}
      <Dialog open={!!selectedVendorForLedger} onOpenChange={(open) => !open && setSelectedVendorForLedger(null)}>
        <DialogContent className="max-w-4xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          {selectedVendorForLedger && (
            <>
              <DialogHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
                  <div>
                    <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
                      {selectedVendorForLedger.company_name || selectedVendorForLedger.name} — {isUrdu ? 'کھاتہ لیجر' : 'Supplier Ledger'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-0.5">
                      {selectedVendorForLedger.contact_person} • {selectedVendorForLedger.city} • {selectedVendorForLedger.phone}
                    </DialogDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'پرنٹ' : 'Print'}</span>
                    </button>
                    <button
                      onClick={() => {
                        const target = selectedVendorForLedger;
                        setSelectedVendorForLedger(null);
                        openPaymentModal(target);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <BadgeCent className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'ادائیگی کریں' : 'Pay'}</span>
                    </button>
                  </div>
                </div>
              </DialogHeader>

              <DialogBody>
                <div id="printable-vendor-ledger" className="space-y-4">
                  {/* Print-only Statement Header */}
                  <div className="hidden print:block text-center border-b-2 border-slate-900 pb-3 mb-4">
                    <h2 className="text-xl font-bold text-black font-urdu">پنجاب کھاد اینڈ کیمیکلز ایجنسی</h2>
                    <p className="text-xs text-black font-medium mt-0.5">کمپنی / سپلائر کھاتہ تفصیلی سٹیٹمنٹ</p>
                    <div className="flex justify-between text-xs text-black mt-2 font-mono border-t border-slate-300 pt-1.5">
                      <span>سپلائر: {selectedVendorForLedger.company_name || selectedVendorForLedger.name}</span>
                      <span>شہر: {selectedVendorForLedger.city} • فون: {selectedVendorForLedger.phone}</span>
                      <span>تاریخ: {new Date().toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>

                  {/* Top Snapshot Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">
                        {isUrdu ? 'کل خریدا گیا مال (خریداری)' : 'Total Purchases Billed'}
                      </span>
                      <span className="text-base font-bold text-slate-200 font-mono">
                        {formatCurrency(ledgerData?.summary?.totalPurchases || 0)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">
                        {isUrdu ? 'کل ادا کردہ رقوم (ادائیگیاں)' : 'Total Payments Made'}
                      </span>
                      <span className="text-base font-bold text-emerald-400 font-mono">
                        {formatCurrency(ledgerData?.summary?.totalPayments || 0)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">
                        {isUrdu ? 'موجودہ خالص واجب الادا' : 'Current Net Balance'}
                      </span>
                      <span className="text-base font-black text-rose-400 font-mono">
                        {formatCurrency(ledgerData?.summary?.currentBalance || Number(selectedVendorForLedger.current_balance || 0))}
                      </span>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="mt-4 rounded-2xl border border-slate-700/80 overflow-hidden bg-slate-800/40">
                    <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-emerald-400" />
                        {isUrdu ? 'تاریخ وار خریداری و ادائیگی کی تفصیل' : 'Chronological Transaction Records'}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {ledgerData?.transactions?.length || 0} Records
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-800/90 text-slate-400 text-[11px] border-b border-slate-700">
                            <th className="py-2.5 px-3">{isUrdu ? 'تاریخ' : 'Date'}</th>
                            <th className="py-2.5 px-3">{isUrdu ? 'بل / واؤچر نمبر' : 'Invoice/Slip #'}</th>
                            <th className="py-2.5 px-3">{isUrdu ? 'تفصیل لین دین' : 'Description'}</th>
                            <th className="py-2.5 px-3 text-right text-rose-400">
                              {isUrdu ? 'خریداری مال (بنام)' : 'Purchase (+)'}
                            </th>
                            <th className="py-2.5 px-3 text-right text-emerald-400">
                              {isUrdu ? 'ادائیگی (جمع)' : 'Payment (-)'}
                            </th>
                            <th className="py-2.5 px-3 text-right font-bold text-white">
                              {isUrdu ? 'بقایا بیلنس' : 'Running Bal'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {isLedgerLoading ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-emerald-500" />
                                <span>{isUrdu ? 'لیجر تیار ہو رہا ہے...' : 'Compiling ledger...'}</span>
                              </td>
                            </tr>
                          ) : !ledgerData?.transactions || ledgerData.transactions.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                {isUrdu ? 'کوئی لین دین درج نہیں ہے' : 'No transactions recorded yet.'}
                              </td>
                            </tr>
                          ) : (
                            ledgerData.transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-800/60 transition">
                                <td className="py-3 px-3 font-mono text-slate-300">{tx.date}</td>
                                <td className="py-3 px-3 font-mono text-slate-400">
                                  {tx.biltyOrSlipNo || '-'}
                                </td>
                                <td className="py-3 px-3 text-slate-200 font-medium">
                                  {tx.description}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-rose-400 font-semibold">
                                  {tx.debit > 0 ? formatCurrency(tx.debit) : '-'}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-emerald-400 font-semibold">
                                  {tx.credit > 0 ? formatCurrency(tx.credit) : '-'}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-white">
                                  {formatCurrency(tx.balance)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </DialogBody>

              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setSelectedVendorForLedger(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  {isUrdu ? 'بند کریں' : 'Close'}
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Specific CSS Rules */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-vendor-ledger,
          #printable-vendor-ledger * {
            visibility: visible !important;
          }
          #printable-vendor-ledger {
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
