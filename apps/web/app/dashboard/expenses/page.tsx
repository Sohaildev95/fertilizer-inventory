'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLanguage } from '../../../lib/language-context';
import { apiRequest } from '../../../lib/api-client';
import {
  DollarSign,
  Calendar,
  Coffee,
  Truck,
  Building,
  Zap,
  Users,
  Fuel,
  Wrench,
  Search,
  PlusCircle,
  Trash2,
  Receipt,
  FileText,
  Wallet,
  Clock,
  Printer,
  Loader2,
  CheckCircle2,
  PieChart,
  RefreshCw,
  AlertCircle,
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

// Expense Item Interface
interface ExpenseItem {
  id: string;
  voucherNo: string;
  category: 'palledari' | 'transport' | 'refreshment' | 'rent' | 'utilities' | 'salary' | 'fuel' | 'misc' | 'general';
  categoryTitleUrdu: string;
  categoryTitleEn: string;
  description: string;
  title?: string;
  amount: number;
  date: string;
  expenseDate?: string;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
  paidBy: string;
  notes?: string;
  createdAt?: string;
}

interface StatsSummary {
  todayDate: string;
  todayTotal: number;
  todayCount: number;
  monthTotal: number;
  monthCount: number;
  palledariTotal: number;
  cashOutflow: number;
  bankOutflow: number;
  categoryBreakdown: Array<{
    category: string;
    categoryTitleUrdu: string;
    categoryTitleEn: string;
    total: number;
    count: number;
    percentage: number;
  }>;
}

const CATEGORIES = [
  { id: 'all', urdu: 'تمام اخراجات', en: 'All Expenses', icon: Wallet },
  { id: 'palledari', urdu: 'پلے داری و لوڈنگ', en: 'Labour & Palledari', icon: Users },
  { id: 'transport', urdu: 'لوکل ٹرانسپورٹ کرایہ', en: 'Local Transport', icon: Truck },
  { id: 'refreshment', urdu: 'چائے، کھانا و مہمان', en: 'Tea & Refreshment', icon: Coffee },
  { id: 'rent', urdu: 'دکان و گودام کرایہ', en: 'Rent', icon: Building },
  { id: 'utilities', urdu: 'بجلی و یوٹیلیٹیز', en: 'Electricity / Bills', icon: Zap },
  { id: 'salary', urdu: 'ملازمین تنخواہ', en: 'Staff Salary', icon: DollarSign },
  { id: 'fuel', urdu: 'پیٹرول و بائیک', en: 'Fuel / Travel', icon: Fuel },
  { id: 'misc', urdu: 'متفرق و مرمت', en: 'Misc & Maintenance', icon: Wrench },
];

export default function ExpensesPage() {
  const { isUrdu } = useLanguage();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'palledari' as const,
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'cash' as const,
    paidBy: 'منشی خرم',
    notes: '',
  });

  // Printable Voucher Modal State
  const [selectedVoucher, setSelectedVoucher] = useState<ExpenseItem | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Fetch Data from Live API
  const loadExpensesData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [expensesRes, statsRes] = await Promise.all([
        apiRequest<{ data: ExpenseItem[] }>('/expenses?limit=100'),
        apiRequest<StatsSummary>('/expenses/stats/summary'),
      ]);

      setExpenses(expensesRes?.data || []);
      setStats(statsRes || null);
    } catch (err: any) {
      console.error('Failed to load expenses data:', err);
      setErrorMsg(err.message || 'اخراجات کا ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpensesData();
  }, [loadExpensesData]);

  // Fallback calculations if stats pending
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTotal = stats?.todayTotal ?? 0;
  const monthTotal = stats?.monthTotal ?? 0;
  const palledariTotal = stats?.palledariTotal ?? 0;
  const cashOutflow = stats?.cashOutflow ?? 0;

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.voucherNo && e.voucherNo.toLowerCase().includes(q)) ||
        (e.paidBy && e.paidBy.toLowerCase().includes(q)) ||
        (e.categoryTitleUrdu && e.categoryTitleUrdu.toLowerCase().includes(q)) ||
        (e.notes && e.notes.toLowerCase().includes(q));

      const matchCategory =
        selectedCategory === 'all' || e.category === selectedCategory;

      let matchDate = true;
      if (dateFilter === 'today') {
        matchDate = e.date === todayStr;
      }

      return matchSearch && matchCategory && matchDate;
    });
  }, [expenses, search, selectedCategory, dateFilter, todayStr]);

  // Add Expense Handler (Calls POST /api/v1/expenses)
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(newExpense.amount) || 0;
    if (amt <= 0 || !newExpense.description.trim()) return;

    setIsSaving(true);
    try {
      await apiRequest('/expenses', {
        method: 'POST',
        body: JSON.stringify({
          title: newExpense.description.trim(),
          category: newExpense.category,
          amount: amt,
          paymentMethod: newExpense.paymentMethod,
          expenseDate: newExpense.date || todayStr,
          paidBy: newExpense.paidBy.trim() || 'کاؤنٹر نقد',
          notes: newExpense.notes.trim() || undefined,
        }),
      });

      // Reset form & close modal
      setIsAddModalOpen(false);
      setNewExpense({
        category: 'palledari',
        description: '',
        amount: '',
        date: todayStr,
        paymentMethod: 'cash',
        paidBy: 'منشی خرم',
        notes: '',
      });

      // Reload fresh data from backend
      await loadExpensesData();
    } catch (err: any) {
      alert(err.message || 'خرچہ محفوظ کرنے میں مسئلہ پیش آیا');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Expense Handler (Calls DELETE /api/v1/expenses/:id)
  const handleDeleteExpense = async (id: string, voucherNo: string) => {
    const confirmText = isUrdu
      ? `کیا آپ واقعی خرچہ واؤچر "${voucherNo}" حذف کرنا چاہتے ہیں؟`
      : `Are you sure you want to delete expense voucher "${voucherNo}"?`;

    if (!window.confirm(confirmText)) return;

    try {
      await apiRequest(`/expenses/${id}`, { method: 'DELETE' });
      await loadExpensesData();
    } catch (err: any) {
      alert(err.message || 'خرچہ حذف کرنے میں مسئلہ پیش آیا');
    }
  };

  const formatCurrency = (amt: number) => `Rs. ${amt.toLocaleString()}`;

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'palledari':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'transport':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'refreshment':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rent':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'utilities':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'salary':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'fuel':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const openVoucherModal = (exp: ExpenseItem) => {
    setSelectedVoucher(exp);
    setIsVoucherModalOpen(true);
  };

  const handlePrintVoucher = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'روزانہ کے اخراجات (Daily Expenses)' : 'Daily Shop & Godown Expenses'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isUrdu
                ? 'پلے داری و لوڈنگ، ٹرانسپورٹ کرایہ، چائے پانی، دکان کرایہ اور متفرق اخراجات کا لائیو ریکارڈ'
                : 'Track daily labour palledari, freight, tea, shop utilities, rent, and staff salaries in live Supabase DB.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadExpensesData()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title={isUrdu ? 'تازہ ترین کریں' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 flex items-center gap-2 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isUrdu ? 'نیا خرچہ درج کریں' : 'Record New Expense'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'آج کا کل خرچہ' : "Today's Expenses"}
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
            {formatCurrency(todayTotal)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isUrdu
              ? `آج کی تاریخ میں ${stats?.todayCount ?? 0} اخراجات درج`
              : `${stats?.todayCount ?? 0} expense entries today`}
          </p>
        </div>

        {/* This Month's Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'اس ماہ کا کل خرچہ' : 'Total This Month'}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatCurrency(monthTotal)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isUrdu ? 'مجموعی دکان و گودام اخراجات' : 'Monthly operating expenses'}
          </p>
        </div>

        {/* Palledari Total */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'پلے داری و مزدوری' : 'Labour & Palledari'}
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {formatCurrency(palledariTotal)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isUrdu ? 'کھاد بوریاں ان لوڈنگ و چٹھا خرچہ' : 'Bag loading & stacking'}
          </p>
        </div>

        {/* Cash Drawer Outflow */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کاؤنٹر نقد خرچ' : 'Paid in Cash'}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
            {formatCurrency(cashOutflow)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isUrdu ? 'دکان کے گلے سے نقد نکلی رقم' : 'Out of counter drawer'}
          </p>
        </div>
      </div>

      {/* 2.1 Category Breakdown Distribution Bar */}
      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {isUrdu ? 'اخراجات کی تقسیم (Category Breakdown)' : 'Expense Distribution'}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {isUrdu ? `کل مدات: ${stats.categoryBreakdown.length}` : `${stats.categoryBreakdown.length} Categories`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {stats.categoryBreakdown.map((cat) => (
              <div
                key={cat.category}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
              >
                <div className="text-[11px] font-semibold text-slate-600 truncate">
                  {isUrdu ? cat.categoryTitleUrdu : cat.categoryTitleEn}
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs font-black text-slate-900 font-mono">
                    Rs. {cat.total.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 font-mono">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Search & Category Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isUrdu
                  ? 'تفصیل، واؤچر نمبر، خرچ کنندہ یا کیٹیگری سے تلاش کریں...'
                  : 'Search by description, voucher no, paid by, notes...'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none transition"
            />
          </div>

          {/* Quick Date filter dropdown */}
          <div className="w-[170px]">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-xs sm:text-sm h-[40px] rounded-xl">
                <SelectValue placeholder="تمام تاریخیں" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 z-[120]">
                <SelectItem value="all">{isUrdu ? 'تمام ریکارڈز' : 'All Dates'}</SelectItem>
                <SelectItem value="today">{isUrdu ? 'صرف آج کا دن' : 'Today Only'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs whitespace-nowrap">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{isUrdu ? cat.urdu : cat.en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Expenses Table (1-Line Whitespace-Nowrap) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'واؤچر نمبر و تاریخ' : 'Voucher & Date'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'کیٹیگری / مد' : 'Category'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'تفصیل خرچہ' : 'Description'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'خرچ کنندہ (Paid By)' : 'Paid By'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'ادائیگی کا ذریعہ' : 'Method'}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'رقم (روپے)' : 'Amount (PKR)'}</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">{isUrdu ? 'پرچی / عمل' : 'Voucher / Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-rose-600 mb-2" />
                    <p className="font-semibold text-slate-600">
                      {isUrdu ? 'ڈیٹا لوڈ ہو رہا ہے...' : 'Loading expenses...'}
                    </p>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 whitespace-nowrap">
                    <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-1" />
                    <p className="font-semibold text-slate-600">
                      {isUrdu ? 'کوئی خرچہ ریکارڈ نہیں ملا' : 'No expenses found'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {isUrdu ? 'فلٹر تبدیل کریں یا نیا خرچہ درج کریں' : 'Try adjusting filters or add an expense.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/70 transition-colors group whitespace-nowrap"
                  >
                    {/* Voucher & Date */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5 whitespace-nowrap">
                        <FileText className="w-3.5 h-3.5 text-rose-600" />
                        <span>{exp.voucherNo}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 whitespace-nowrap">
                        {exp.date}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getCategoryBadgeColor(
                          exp.category
                        )}`}
                      >
                        {isUrdu ? exp.categoryTitleUrdu : exp.categoryTitleEn}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800 whitespace-nowrap">
                        {exp.description || exp.title}
                      </div>
                      {exp.notes && (
                        <div className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                          {exp.notes}
                        </div>
                      )}
                    </td>

                    {/* Paid By */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700 whitespace-nowrap">
                        {exp.paidBy || 'کاؤنٹر نقد'}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                        {exp.paymentMethod === 'cash'
                          ? isUrdu
                            ? 'نقد کاؤنٹر (Cash)'
                            : 'Cash'
                          : isUrdu
                          ? 'بینک آن لائن (Bank)'
                          : 'Bank Transfer'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <span className="text-base font-black text-rose-600 font-mono whitespace-nowrap">
                        {formatCurrency(exp.amount)}
                      </span>
                    </td>

                    {/* Actions: Print Voucher & Delete */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => openVoucherModal(exp)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                          title={isUrdu ? 'واؤچر پرچی پرنٹ کریں' : 'Print Voucher'}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(exp.id, exp.voucherNo)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title={isUrdu ? 'حذف کریں' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RECORD NEW EXPENSE                                               */}
      {/* ========================================================================= */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'نیا روزانہ کا خرچہ درج کریں' : 'Record New Expense'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu
                ? 'پلے داری، ٹرانسپورٹ، چائے پانی یا دکان کا یومیہ خرچ لائیو ڈیٹا بیس میں محفوظ کریں'
                : 'Enter daily operating expense details, amount, category, and cashier.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveExpense} className="flex-1 flex flex-col overflow-hidden">
            <DialogBody>
              <div className="space-y-4">
                {/* Category & Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'خرچے کی مد / کیٹیگری*' : 'Expense Category*'}
                    </label>
                    <Select
                      value={newExpense.category}
                      onValueChange={(val: any) => setNewExpense({ ...newExpense, category: val })}
                    >
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[42px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                        <SelectItem value="palledari">پلے داری و لوڈنگ (Labour)</SelectItem>
                        <SelectItem value="transport">لوکل ٹرانسپورٹ کرایہ (Freight)</SelectItem>
                        <SelectItem value="refreshment">چائے، کھانا و مہمان (Tea/Food)</SelectItem>
                        <SelectItem value="rent">دکان و گودام کرایہ (Rent)</SelectItem>
                        <SelectItem value="utilities">بجلی بل و یوٹیلیٹیز (Bills)</SelectItem>
                        <SelectItem value="salary">ملازمین تنخواہ و ایڈوانس (Salary)</SelectItem>
                        <SelectItem value="fuel">پیٹرول و بائیک خرچ (Fuel)</SelectItem>
                        <SelectItem value="misc">متفرق مرمت و لوازمات (Misc)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'خرچے کی رقم (روپے)*' : 'Amount (PKR)*'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-base text-rose-400 font-mono font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'تفصیل خرچہ*' : 'Description / Reason*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder={
                      isUrdu
                        ? 'مثلاً: 250 بوری یوریا ٹرک ان لوڈنگ پلے داری'
                        : 'e.g. 250 bags loading charges...'
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                {/* Date & Paid By */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'تاریخ*' : 'Date*'}
                    </label>
                    <DatePicker
                      value={newExpense.date}
                      onChange={(date) => setNewExpense({ ...newExpense, date })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'خرچ کنندہ (Paid By)' : 'Paid By / Incharge'}
                    </label>
                    <input
                      type="text"
                      value={newExpense.paidBy}
                      onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                      placeholder={isUrdu ? 'منشی خرم' : 'Cashier Name'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Payment Method & Additional Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'ادائیگی کا ذریعہ' : 'Payment Method'}
                    </label>
                    <Select
                      value={newExpense.paymentMethod}
                      onValueChange={(val: any) =>
                        setNewExpense({ ...newExpense, paymentMethod: val })
                      }
                    >
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[42px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                        <SelectItem value="cash">{isUrdu ? 'نقد کاؤنٹر (Cash Drawer)' : 'Cash'}</SelectItem>
                        <SelectItem value="bank_transfer">{isUrdu ? 'بینک ٹرانسفر (Online Bank)' : 'Bank'}</SelectItem>
                        <SelectItem value="cheque">{isUrdu ? 'بینک چیک (Bank Cheque)' : 'Cheque'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'اضافی نوٹ / رسید' : 'Memo / Remarks'}
                    </label>
                    <input
                      type="text"
                      value={newExpense.notes}
                      onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                      placeholder={isUrdu ? 'اختیاری نوٹ...' : 'Optional memo...'}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
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
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-900/30 transition transform active:scale-95 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isUrdu ? 'خرچہ محفوظ کریں' : 'Save Expense'}</span>
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: PRINTABLE EXPENSE VOUCHER SLIP (واؤچر پرچی)                     */}
      {/* ========================================================================= */}
      <Dialog open={isVoucherModalOpen} onOpenChange={setIsVoucherModalOpen}>
        <DialogContent className="max-w-lg bg-white border border-slate-200 text-slate-900 rounded-3xl shadow-2xl p-0 overflow-hidden">
          {selectedVoucher && (
            <div>
              <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-rose-600" />
                    <span>{isUrdu ? 'خرچہ واؤچر پرچی' : 'Expense Cash Voucher'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedVoucher.voucherNo}</p>
                </div>

                <button
                  type="button"
                  onClick={handlePrintVoucher}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isUrdu ? 'پرنٹ کریں' : 'Print Voucher'}</span>
                </button>
              </div>

              {/* Printable Body */}
              <div id="printable-expense-voucher" className="p-6 space-y-5 bg-white">
                <div className="text-center border-b pb-4">
                  <h2 className="text-xl font-black text-slate-900 font-urdu">
                    بسم اللہ کھاد، بیج و زرعی ادویات ایجنسی
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">غلہ منڈی، ساہیوال روڈ | فون: 0300-1234567</p>
                  <div className="inline-block mt-2 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-xs font-bold">
                    {isUrdu ? 'دکان اخراجات واؤچر پرچی' : 'Official Expense Voucher'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">{isUrdu ? 'واؤچر نمبر:' : 'Voucher No:'}</span>
                    <span className="font-mono font-bold text-slate-900">{selectedVoucher.voucherNo}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">{isUrdu ? 'تاریخ:' : 'Date:'}</span>
                    <span className="font-mono font-bold text-slate-900">{selectedVoucher.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isUrdu ? 'کیٹیگری / مد:' : 'Category:'}</span>
                    <span className="font-bold text-slate-800">{selectedVoucher.categoryTitleUrdu}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">{isUrdu ? 'ادائیگی کا ذریعہ:' : 'Payment:'}</span>
                    <span className="font-bold text-slate-800">
                      {selectedVoucher.paymentMethod === 'cash' ? 'نقد کاؤنٹر' : 'بینک ٹرانسفر'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <span className="text-slate-500 block font-semibold">{isUrdu ? 'تفصیل خرچہ:' : 'Description:'}</span>
                  <p className="text-sm font-bold text-slate-900">{selectedVoucher.description}</p>
                  {selectedVoucher.notes && (
                    <p className="text-xs text-slate-500 italic mt-1">{selectedVoucher.notes}</p>
                  )}
                </div>

                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900 uppercase">
                    {isUrdu ? 'کل ادا شدہ رقم:' : 'Total Amount Paid:'}
                  </span>
                  <span className="text-2xl font-black text-rose-600 font-mono">
                    Rs. {selectedVoucher.amount.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-dashed border-slate-300 text-center text-xs">
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                      {selectedVoucher.paidBy || 'منشی خرم'}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isUrdu ? 'دستخط کیشیئر / خرچ کنندہ' : 'Cashier Signature'}
                    </span>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">
                      حاجی صاحب
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isUrdu ? 'تصدیق مالک / منیجر' : 'Manager Signature'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
                >
                  {isUrdu ? 'بند کریں' : 'Close'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-expense-voucher,
          #printable-expense-voucher * {
            visibility: visible;
          }
          #printable-expense-voucher {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
}
