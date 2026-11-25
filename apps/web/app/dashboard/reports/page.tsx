'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '../../../lib/language-context';
import { apiRequest } from '../../../lib/api-client';
import {
  PerBagMarginReport,
  ProductBagMargin,
  CompanyMarginSummary,
} from '@fertilizer/shared';
import {
  FileBarChart2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Printer,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Percent,
  Wallet,
  Receipt,
  Download,
  Clock,
  Sparkles,
  ShoppingBag,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Boxes,
  BadgeAlert,
  CheckCircle2,
  Coins,
  Award,
  Flame,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { DatePicker } from '../../../components/ui/date-picker';

// Types
interface ProfitLossData {
  period: {
    timeRange: string;
    startDate: string;
    endDate: string;
    labelUrdu: string;
    labelEn: string;
  };
  summary: {
    totalRevenue: number;
    totalCOGS: number;
    totalGrossProfit: number;
    grossMarginPercent: string;
    totalOperatingExpenses: number;
    netProfit: number;
    netProfitMarginPercent: string;
    totalBagsSold: number;
    totalInvoices: number;
  };
  productBreakdown: Array<{
    id: string;
    name: string;
    urduName: string;
    company: string;
    unit: string;
    bagsSold: number;
    saleAmount: number;
    costAmount: number;
    profit: number;
    marginPercent: string;
  }>;
}

interface RoznamchaData {
  date: string;
  summary: {
    totalCashIn: number;
    totalCashOut: number;
    netCashInHand: number;
    inflowTransactionsCount: number;
    outflowTransactionsCount: number;
  };
  inflows: {
    salesCash: number;
    recoveriesCash: number;
  };
  outflows: {
    vendorCash: number;
    expensesCash: number;
  };
  transactions: Array<{
    id: string;
    time: string;
    type: 'in' | 'out';
    categoryUrdu: string;
    categoryEn: string;
    description: string;
    partyName: string;
    amount: number;
    refNumber: string;
  }>;
}

interface StockValuationData {
  summary: {
    totalBags: number;
    totalCostValuation: number;
    totalSaleValuation: number;
    potentialTotalProfit: number;
    lowStockCount: number;
    productsCount: number;
  };
  items: Array<{
    id: string;
    name: string;
    urduName: string;
    company: string;
    currentStock: number;
    unit: string;
    costPrice: number;
    salePrice: number;
    costValuation: number;
    saleValuation: number;
    potentialProfit: number;
    isLowStock: boolean;
  }>;
}

interface MarketUdharData {
  summary: {
    totalUdhar: number;
    debtorsCount: number;
  };
  topDebtors: Array<{
    id: string;
    name: string;
    phone: string;
    village: string;
    current_balance: number;
    credit_limit: number;
  }>;
  recentRecoveries: Array<{
    id: string;
    farmer: string;
    chak: string;
    amount: number;
    method: string;
    date: string;
  }>;
}

export default function ReportsPage() {
  const { isUrdu } = useLanguage();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'profit_loss' | 'margins' | 'roznamcha' | 'stock' | 'udhar'>('profit_loss');

  // Filters
  const [timeRange, setTimeRange] = useState('this_month');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [roznamchaDate, setRoznamchaDate] = useState(new Date().toISOString().slice(0, 10));

  // States
  const [plData, setPlData] = useState<ProfitLossData | null>(null);
  const [marginsData, setMarginsData] = useState<PerBagMarginReport | null>(null);
  const [roznamchaData, setRoznamchaData] = useState<RoznamchaData | null>(null);
  const [stockData, setStockData] = useState<StockValuationData | null>(null);
  const [udharData, setUdharData] = useState<MarketUdharData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load Reports Data from Live API
  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [plRes, marginsRes, rozRes, stockRes, udharRes] = await Promise.all([
        apiRequest<ProfitLossData>(`/reports/profit-loss?timeRange=${timeRange}`),
        apiRequest<PerBagMarginReport>(
          `/reports/per-bag-margins?timeRange=${timeRange}&company=${companyFilter}`,
        ),
        apiRequest<RoznamchaData>(`/reports/roznamcha?date=${roznamchaDate}`),
        apiRequest<StockValuationData>('/reports/stock-valuation'),
        apiRequest<MarketUdharData>('/reports/market-udhar'),
      ]);

      setPlData(plRes);
      setMarginsData(marginsRes);
      setRoznamchaData(rozRes);
      setStockData(stockRes);
      setUdharData(udharRes);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setErrorMsg(err.message || 'رپورٹس ڈیٹا لوڈ کرنے میں مسئلہ پیش آیا');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange, companyFilter, roznamchaDate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const formatCurrency = (amt: number) => `Rs. ${(amt || 0).toLocaleString()}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Header with Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <FileBarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'نفع و نقصان اور منشی روزنامچہ' : 'Profit & Loss and Munshi Roznamcha'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isUrdu
                ? 'کھاد کی مجموعی سیلز، فی بوری منافع، یومیہ روزنامچہ کیش بک اور گودام اسٹاک مالیت کا لائیو آڈٹ'
                : 'Live financial audit: Gross & net profit, daily cash book, godown inventory valuation, and market credit.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full lg:w-auto">
          <button
            onClick={() => loadReports()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex-shrink-0"
            title={isUrdu ? 'تازہ ترین کریں' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          {/* Time Range Filter (For P&L & Margins Tab) */}
          {(activeTab === 'profit_loss' || activeTab === 'margins') && (
            <div className="w-[145px] sm:w-[175px]">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full bg-white border-slate-300 text-xs sm:text-sm h-[40px] rounded-xl shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 z-[120]">
                  <SelectItem value="today">{isUrdu ? 'صرف آج کا دن' : 'Today'}</SelectItem>
                  <SelectItem value="this_week">{isUrdu ? 'موجودہ ہفتہ' : 'This Week'}</SelectItem>
                  <SelectItem value="this_month">{isUrdu ? 'موجودہ ماہ' : 'This Month'}</SelectItem>
                  <SelectItem value="season">{isUrdu ? 'سیزن ربیع ۲۰۲۶' : 'Rabi Season 2026'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Company Filter (For Margins Tab) */}
          {activeTab === 'margins' && (
            <div className="w-[145px] sm:w-[175px]">
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-full bg-white border-slate-300 text-xs sm:text-sm h-[40px] rounded-xl shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 z-[120]">
                  <SelectItem value="all">{isUrdu ? 'تمام کمپنیاں' : 'All Companies'}</SelectItem>
                  <SelectItem value="FFC">FFC (سونا کھاد)</SelectItem>
                  <SelectItem value="Engro">Engro (اینگرو)</SelectItem>
                  <SelectItem value="Fatima">Fatima (سرسبز)</SelectItem>
                  <SelectItem value="Bayer">Bayer (بائر سپرے)</SelectItem>
                  <SelectItem value="Syngenta">Syngenta (سنجینٹا)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Picker for Roznamcha Tab */}
          {activeTab === 'roznamcha' && (
            <div className="w-[165px] sm:w-[180px]">
              <DatePicker
                value={roznamchaDate}
                onChange={(d) => setRoznamchaDate(d)}
              />
            </div>
          )}

          <button
            onClick={handlePrint}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2 transition active:scale-95 whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>{isUrdu ? 'رپورٹ پرنٹ کریں' : 'Print Statement'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none whitespace-nowrap">
        <button
          onClick={() => setActiveTab('profit_loss')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
            activeTab === 'profit_loss'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{isUrdu ? 'نفع و نقصان رپورٹ (P&L)' : 'Profit & Loss Statement'}</span>
        </button>

        <button
          onClick={() => setActiveTab('margins')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
            activeTab === 'margins'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>{isUrdu ? 'فی بوری خالص منافع و مارجن' : 'Per-Bag Profit & Margins'}</span>
        </button>

        <button
          onClick={() => setActiveTab('roznamcha')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
            activeTab === 'roznamcha'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isUrdu ? 'منشی روزنامچہ کیش بک (Roznamcha)' : 'Daily Cash Book'}</span>
        </button>

        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
            activeTab === 'stock'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{isUrdu ? 'گودام اسٹاک مالیت (Stock Valuation)' : 'Godown Stock Valuation'}</span>
        </button>

        <button
          onClick={() => setActiveTab('udhar')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
            activeTab === 'udhar'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isUrdu ? 'مارکیٹ ادھار رجسٹر (Farmer Credit)' : 'Market Credit & Recoveries'}</span>
        </button>
      </div>

      {isLoading && !plData ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-600 mb-3" />
          <p className="font-semibold text-slate-700">
            {isUrdu ? 'لائیو آڈٹ ڈیٹا لوڈ ہو رہا ہے...' : 'Loading financial audit data from Supabase...'}
          </p>
        </div>
      ) : (
        <div id="printable-audit-report" className="space-y-6">
          {/* Printable Shop Header (Only visible when printing) */}
          <div className="hidden print:block text-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-black text-slate-900 font-urdu">
              بسم اللہ کھاد، بیج و زرعی ادویات ایجنسی
            </h1>
            <p className="text-xs text-slate-600">
              غلہ منڈی ساہیوال روڈ | پروپرائٹر: حاجی محمد افضل وٹو | فون: 0300-1234567
            </p>
            <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-800">
              {isUrdu ? 'جامع مالیاتی آڈٹ و روزنامچہ رپورٹ' : 'Official Financial Audit Statement'}
            </div>
          </div>

          {/* ================================================================= */}
          {/* TAB 1: PROFIT & LOSS STATEMENT                                    */}
          {/* ================================================================= */}
          {activeTab === 'profit_loss' && plData && (
            <div className="space-y-6">
              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Sales Revenue */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isUrdu ? 'مجموعی سیلز آمدنی' : 'Total Revenue'}
                    </span>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                    {formatCurrency(plData.summary.totalRevenue)}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>{isUrdu ? `کل فروخت شدہ بوریاں: ${plData.summary.totalBagsSold}` : `${plData.summary.totalBagsSold} bags sold`}</span>
                    <span className="font-semibold text-blue-600 font-mono">{plData.summary.totalInvoices} Invoices</span>
                  </div>
                </div>

                {/* 2. Cost of Goods Sold (COGS) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isUrdu ? 'مال خریداری لاگت (COGS)' : 'Cost of Goods Sold'}
                    </span>
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-700 font-mono tracking-tight">
                    {formatCurrency(plData.summary.totalCOGS)}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {isUrdu ? 'کھاد فیکٹری خریداری قیمت' : 'Direct supplier cost of sold stock'}
                  </div>
                </div>

                {/* 3. Gross Profit Margin */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isUrdu ? 'مجموعی منافع (Gross Margin)' : 'Gross Profit'}
                    </span>
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 font-bold text-xs">
                      {plData.summary.grossMarginPercent}
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                    {formatCurrency(plData.summary.totalGrossProfit)}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {isUrdu ? 'فروخت اور خریداری قیمت کا خالص فرق' : 'Sale price minus purchase price'}
                  </div>
                </div>

                {/* 4. Operating Expenses & Net Net Profit */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isUrdu ? 'دکان اخراجات منہا' : 'Operating Expenses'}
                    </span>
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                    {formatCurrency(plData.summary.totalOperatingExpenses)}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                    <span>{isUrdu ? 'پلے داری، کرایہ، بل، چائے' : 'Labour, rent, bills'}</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {isUrdu ? 'خالص:' : 'Net:'} {formatCurrency(plData.summary.netProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product-Wise Margin Breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                      {isUrdu ? 'پراڈکٹ و کھاد کے حساب سے منافع کا تفصیلی جائزہ' : 'Product-wise Sales Volume & Margin Breakdown'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isUrdu
                        ? 'یوریا، ڈی اے پی، پوٹاش اور زرعی ادویات کی فی بوری آمدنی، لاگت اور منافع'
                        : 'Bag volume, gross revenue, purchase cost, and net margin per product.'}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {plData.period.labelUrdu}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'کھاد و پراڈکٹ' : 'Product / Fertilizer'}</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'کمپنی / برانڈ' : 'Company'}</th>
                        <th className="py-3.5 px-4 text-center whitespace-nowrap">{isUrdu ? 'فروخت شدہ بوریاں' : 'Bags Sold'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'مجموعی سیلز (روپے)' : 'Sale Amount'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'خریداری لاگت (روپے)' : 'Cost Amount'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'خام منافع (روپے)' : 'Gross Profit'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'مارجن (%)' : 'Margin (%)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {plData.productBreakdown.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            {isUrdu ? 'اس دورانیہ میں کوئی سیلز ریکارڈ نہیں ملا' : 'No sales recorded for this period.'}
                          </td>
                        </tr>
                      ) : (
                        plData.productBreakdown.map((prod) => (
                          <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors whitespace-nowrap">
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900">{isUrdu ? prod.urduName : prod.name}</div>
                              <div className="text-[11px] text-slate-400">{prod.name}</div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                                {prod.company}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 whitespace-nowrap">
                              {prod.bagsSold} {isUrdu ? 'بوریاں' : 'bags'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-800 whitespace-nowrap">
                              {formatCurrency(prod.saleAmount)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                              {formatCurrency(prod.costAmount)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 whitespace-nowrap">
                              {formatCurrency(prod.profit)}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold font-mono">
                                {prod.marginPercent}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: MUNSHI DAILY ROZNAMCHA (CASH BOOK)                         */}
          {/* ================================================================= */}
          {activeTab === 'roznamcha' && roznamchaData && (
            <div className="space-y-6">
              {/* Daily Roznamcha KPI Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Total Cash In */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isUrdu ? 'آج کی کل نقد وصولی (Cash In)' : "Today's Total Cash In"}
                    </span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <ArrowDownRight className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
                    {formatCurrency(roznamchaData.summary.totalCashIn)}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex justify-between">
                    <span>{isUrdu ? 'کاؤنٹر سیلز:' : 'Sales:'} {formatCurrency(roznamchaData.inflows.salesCash)}</span>
                    <span>{isUrdu ? 'کھاتہ ریکوری:' : 'Recovery:'} {formatCurrency(roznamchaData.inflows.recoveriesCash)}</span>
                  </div>
                </div>

                {/* 2. Total Cash Out */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isUrdu ? 'آج کا کل نقد خرچہ و ادائیگی (Cash Out)' : "Today's Total Cash Out"}
                    </span>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                    {formatCurrency(roznamchaData.summary.totalCashOut)}
                  </div>
                  <div className="mt-2 text-xs text-slate-500 flex justify-between">
                    <span>{isUrdu ? 'دکان اخراجات:' : 'Expenses:'} {formatCurrency(roznamchaData.outflows.expensesCash)}</span>
                    <span>{isUrdu ? 'سپلائر نقد:' : 'Vendors:'} {formatCurrency(roznamchaData.outflows.vendorCash)}</span>
                  </div>
                </div>

                {/* 3. Closing Cash In Hand */}
                <div className="bg-emerald-950 text-white rounded-2xl p-5 border border-emerald-800 shadow-md relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      {isUrdu ? 'شام کا گلہ میزان (Closing Cash in Hand)' : 'Closing Cash in Counter Drawer'}
                    </span>
                    <div className="p-2 bg-emerald-800 text-emerald-300 rounded-lg">
                      <Wallet className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    {formatCurrency(roznamchaData.summary.netCashInHand)}
                  </div>
                  <div className="mt-2 text-xs text-emerald-300/80">
                    {isUrdu ? 'شام کو کاؤنٹر دراز میں یہ رقم موجود ہونی چاہیے' : 'Exact cash in hand for end of day'}
                  </div>
                </div>
              </div>

              {/* Chronological Transactions Log of the Day */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                      {isUrdu ? 'یومیہ روزنامچہ کیش انٹریز' : 'Daily Cash Movement Log'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isUrdu
                        ? `تاریخ: ${roznamchaData.date} — آمدنی و اخراجات کی مکمل تفصیل`
                        : `Chronological cash flow log for ${roznamchaData.date}`}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    {roznamchaData.transactions.length} {isUrdu ? 'لین دین' : 'Transactions'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'وقت و نمبر' : 'Time & Ref'}</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'نوعیت' : 'Type'}</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'مد / کیٹیگری' : 'Category'}</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'پارٹی / کسان / تفصیل' : 'Party / Description'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'آمدنی (+ وصولی)' : 'Cash In (+)'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'خرچہ (- ادائیگی)' : 'Cash Out (-)'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {roznamchaData.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            {isUrdu ? 'اس تاریخ کا کوئی نقد لین دین نہیں ملا' : 'No cash transactions recorded on this date.'}
                          </td>
                        </tr>
                      ) : (
                        roznamchaData.transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors whitespace-nowrap">
                            <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                              <div className="font-bold text-slate-900 text-xs">{tx.time}</div>
                              <div className="text-[10px] text-slate-400">{tx.refNumber}</div>
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  tx.type === 'in'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                }`}
                              >
                                {tx.type === 'in' ? (isUrdu ? 'آمدنی / وصولی' : 'Cash In') : (isUrdu ? 'خرچہ / ادائیگی' : 'Cash Out')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                              {isUrdu ? tx.categoryUrdu : tx.categoryEn}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-bold text-slate-900">{tx.partyName}</div>
                              <div className="text-[11px] text-slate-400">{tx.description}</div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                              {tx.type === 'in' ? `+ ${formatCurrency(tx.amount)}` : '—'}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 whitespace-nowrap">
                              {tx.type === 'out' ? `- ${formatCurrency(tx.amount)}` : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: GODOWN STOCK VALUATION                                     */}
          {/* ================================================================= */}
          {activeTab === 'stock' && stockData && (
            <div className="space-y-6">
              {/* Stock KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{isUrdu ? 'گودام میں کل بوریاں' : 'Total Bags in Stock'}</span>
                    <Boxes className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-black text-purple-700 font-mono">
                    {stockData.summary.totalBags.toLocaleString()} {isUrdu ? 'بوریاں' : 'Bags'}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{isUrdu ? `کل ${stockData.summary.productsCount} قسم کی کھادیں` : `${stockData.summary.productsCount} product items`}</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{isUrdu ? 'اسٹاک خریداری لاگت مالیت' : 'Total Cost Value'}</span>
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {formatCurrency(stockData.summary.totalCostValuation)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{isUrdu ? 'فیکٹری ریٹ پر گودام اثاثہ' : 'Asset value at cost'}</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{isUrdu ? 'متوقع ریٹیل سیلز مالیت' : 'Total Retail Value'}</span>
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 font-mono">
                    {formatCurrency(stockData.summary.totalSaleValuation)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{isUrdu ? 'سیلز ریٹ پر متوقع فروخت' : 'Expected revenue at retail'}</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{isUrdu ? 'گودام میں چھپا منافع' : 'Expected Profit Margin'}</span>
                    <Sparkles className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-600 font-mono">
                    {formatCurrency(stockData.summary.potentialTotalProfit)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{isUrdu ? 'اسٹاک بکنے پر ممکنہ نفع' : 'Profit upon total clearance'}</p>
                </div>
              </div>

              {/* Stock Items Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu ? 'کھاد اسٹاک کی مکمل تفصیلی مالیت' : 'Complete Godown Inventory Valuation List'}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'کھاد نام' : 'Product'}</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'کمپنی' : 'Company'}</th>
                        <th className="py-3.5 px-4 text-center whitespace-nowrap">{isUrdu ? 'موجود اسٹاک' : 'Current Stock'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'خریداری ریٹ' : 'Cost Price'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'فروخت ریٹ' : 'Sale Price'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'کل خریداری مالیت' : 'Cost Valuation'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'کل متوقع فروخت' : 'Sale Valuation'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {stockData.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors whitespace-nowrap">
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-slate-900">{isUrdu ? item.urduName : item.name}</div>
                            <div className="text-[11px] text-slate-400">{item.name}</div>
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                              {item.company}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                            {item.currentStock} {isUrdu ? 'بوریاں' : 'bags'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                            {formatCurrency(item.costPrice)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-900 font-bold whitespace-nowrap">
                            {formatCurrency(item.salePrice)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                            {formatCurrency(item.costValuation)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 whitespace-nowrap">
                            {formatCurrency(item.saleValuation)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: MARKET UDHAR & RECOVERIES                                  */}
          {/* ================================================================= */}
          {activeTab === 'udhar' && udharData && (
            <div className="space-y-6">
              {/* Udhar Summary Header */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{isUrdu ? 'مارکیٹ میں کل پھنسا ادھار' : 'Total Market Udhar'}</span>
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-3xl font-black text-amber-600 font-mono">
                    {formatCurrency(udharData.summary.totalUdhar)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{isUrdu ? `کل ${udharData.summary.debtorsCount} زمینداروں کے ذمے ادھار ہے` : `${udharData.summary.debtorsCount} farmers have outstanding balances`}</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">{isUrdu ? 'حالیہ نقد وصولیاں' : 'Recent Cash Recoveries'}</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-600 font-mono">
                    {formatCurrency(udharData.recentRecoveries.reduce((sum, r) => sum + r.amount, 0))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{isUrdu ? 'پچھلے چند دنوں میں کسانوں کی وصولی' : 'Recent recovery deposits'}</p>
                </div>
              </div>

              {/* Debtors List */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200">
                  <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu ? 'زیادہ ادھار والے سرفہرست زمیندار' : 'Top Farmers with Outstanding Credit Balances'}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'کسان کا نام' : 'Farmer Name'}</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'موبائل نمبر' : 'Phone'}</th>
                        <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'چک / پتہ' : 'Village / Location'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'مقررہ حد ادھار' : 'Credit Limit'}</th>
                        <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'واجب الادا ادھار (روپے)' : 'Current Balance'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {udharData.topDebtors.map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors whitespace-nowrap">
                          <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                            {cust.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {cust.phone}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                            {cust.village}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-500 whitespace-nowrap">
                            {formatCurrency(cust.credit_limit)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-black text-rose-600 whitespace-nowrap">
                            {formatCurrency(cust.current_balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: PER-BAG PROFIT & MARGIN ANALYTICS (فی بوری خالص منافع)       */}
          {/* ================================================================= */}
          {activeTab === 'margins' && marginsData && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* 1. Top 4 Profit Margin KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Average Profit Per Bag */}
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-md shadow-rose-500/20 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-100">
                      {isUrdu ? 'اوسط خالص منافع فی بوری' : 'Avg Profit Per Bag'}
                    </span>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Coins className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-black font-mono">
                    Rs. {marginsData.summary.averageProfitPerBag.toLocaleString()}
                    <span className="text-sm font-normal text-rose-100"> / {isUrdu ? 'بوری' : 'bag'}</span>
                  </div>
                  <p className="text-[11px] text-rose-100 mt-1">
                    {isUrdu
                      ? `مجموعی اوسط مارجن: ${marginsData.summary.overallMarginPercent}%`
                      : `Overall margin rate: ${marginsData.summary.overallMarginPercent}%`}
                  </p>
                </div>

                {/* Total Bags Sold */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isUrdu ? 'کل فروخت شدہ بوریاں' : 'Total Bags Sold'}
                    </span>
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-slate-900 font-mono">
                    {marginsData.summary.totalBagsSold.toLocaleString()}{' '}
                    <span className="text-sm font-normal text-slate-500">{isUrdu ? 'بوریاں' : 'Bags'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isUrdu
                      ? `کل سیلز ریونیو: ${formatCurrency(marginsData.summary.totalRevenue)}`
                      : `Total Revenue: ${formatCurrency(marginsData.summary.totalRevenue)}`}
                  </p>
                </div>

                {/* Gross Profit on Bags */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isUrdu ? 'بوریاں بیچ کر حاصل شدہ منافع' : 'Gross Profit on Bags'}
                    </span>
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-emerald-600 font-mono">
                    {formatCurrency(marginsData.summary.totalGrossProfit)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isUrdu
                      ? `خریداری لاگت: ${formatCurrency(marginsData.summary.totalCost)}`
                      : `Cost of goods: ${formatCurrency(marginsData.summary.totalCost)}`}
                  </p>
                </div>

                {/* Udhaar Margin Premium */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {isUrdu ? 'فصلی ادھار منافع پریمیم' : 'Udhaar Margin Premium'}
                    </span>
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-purple-700 font-mono">
                    +{formatCurrency(marginsData.summary.cashVsCredit.creditMarginPremium)}
                    <span className="text-sm font-normal text-slate-500"> / {isUrdu ? 'بوری' : 'bag'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isUrdu
                      ? `نقد اوسط: Rs. ${marginsData.summary.cashVsCredit.cash.avgProfitPerBag} | ادھار: Rs. ${marginsData.summary.cashVsCredit.credit.avgProfitPerBag}`
                      : `Cash avg: Rs. ${marginsData.summary.cashVsCredit.cash.avgProfitPerBag} vs Credit: Rs. ${marginsData.summary.cashVsCredit.credit.avgProfitPerBag}`}
                  </p>
                </div>
              </div>

              {/* 2. Cash vs Udhaar (Credit) Comparison Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cash Sales Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {isUrdu ? 'نقد کاؤنٹر سیلز (Cash Sales)' : 'Cash Counter Sales'}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {marginsData.summary.cashVsCredit.cash.bags} {isUrdu ? 'بوریاں فروخت' : 'bags sold'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                      {marginsData.summary.cashVsCredit.cash.marginPercent}% {isUrdu ? 'مارجن' : 'margin'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <span className="text-[11px] text-slate-500 block mb-0.5">
                        {isUrdu ? 'کل سیلز' : 'Revenue'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-slate-800">
                        {formatCurrency(marginsData.summary.cashVsCredit.cash.revenue)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/60">
                      <span className="text-[11px] text-slate-600 block mb-0.5">
                        {isUrdu ? 'خالص منافع' : 'Net Profit'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-emerald-700">
                        {formatCurrency(marginsData.summary.cashVsCredit.cash.profit)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <span className="text-[11px] text-slate-500 block mb-0.5">
                        {isUrdu ? 'اوسط فی بوری' : 'Per Bag'}
                      </span>
                      <span className="text-xs sm:text-sm font-black font-mono text-slate-900">
                        Rs. {marginsData.summary.cashVsCredit.cash.avgProfitPerBag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Credit / Udhaar Sales Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {isUrdu ? 'فصلی ادھار سیلز (Farmer Khata Credit)' : 'Farmer Credit Sales'}
                        </h4>
                        <span className="text-xs text-slate-500">
                          {marginsData.summary.cashVsCredit.credit.bags} {isUrdu ? 'بوریاں فصلی ادھار' : 'bags on credit'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 font-mono">
                      {marginsData.summary.cashVsCredit.credit.marginPercent}% {isUrdu ? 'مارجن' : 'margin'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-4 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <span className="text-[11px] text-slate-500 block mb-0.5">
                        {isUrdu ? 'کل سیلز' : 'Revenue'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-slate-800">
                        {formatCurrency(marginsData.summary.cashVsCredit.credit.revenue)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50/60">
                      <span className="text-[11px] text-slate-600 block mb-0.5">
                        {isUrdu ? 'خالص منافع' : 'Net Profit'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold font-mono text-purple-700">
                        {formatCurrency(marginsData.summary.cashVsCredit.credit.profit)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50">
                      <span className="text-[11px] text-slate-600 block mb-0.5">
                        {isUrdu ? 'اوسط فی بوری' : 'Per Bag'}
                      </span>
                      <span className="text-xs sm:text-sm font-black font-mono text-purple-900">
                        Rs. {marginsData.summary.cashVsCredit.credit.avgProfitPerBag}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Company-wise Margin Breakdown Grid */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                      {isUrdu ? 'کمپنی و برانڈ وائز منافع و مارجن' : 'Company & Brand Profit Margins'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isUrdu
                        ? 'مختلف فرٹیلائزر و پیسٹی سائیڈ کمپنیوں پر حاصل ہونے والے منافع کا تقابلی جائزہ'
                        : 'Comparison of margins and volumes across FFC, Engro, Fatima, Bayer, Syngenta.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(marginsData.companyWise || []).map((comp) => {
                    const isHigh = comp.marginPercent >= 10;
                    const isMed = comp.marginPercent >= 5;
                    return (
                      <div
                        key={comp.company}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900 truncate max-w-[170px]">
                            {comp.company}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono ${
                              isHigh
                                ? 'bg-emerald-100 text-emerald-800'
                                : isMed
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {comp.marginPercent}%
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-3 text-xs">
                          <span className="text-slate-500">{isUrdu ? 'فروخت شدہ بوریاں:' : 'Bags Sold:'}</span>
                          <span className="font-mono font-bold text-slate-800">
                            {comp.bagsSold.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-1 text-xs">
                          <span className="text-slate-500">{isUrdu ? 'اوسط منافع فی بوری:' : 'Profit / Bag:'}</span>
                          <span className="font-mono font-bold text-emerald-700">
                            Rs. {comp.avgProfitPerBag.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mt-1 text-xs">
                          <span className="text-slate-500">{isUrdu ? 'مجموعی حاصل منافع:' : 'Total Profit:'}</span>
                          <span className="font-mono font-black text-slate-900">
                            {formatCurrency(comp.profit)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-200 rounded-full mt-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isHigh ? 'bg-emerald-500' : isMed ? 'bg-blue-500' : 'bg-slate-400'
                            }`}
                            style={{ width: `${Math.min(100, comp.marginPercent * 5)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Detailed Product Margin Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                      {isUrdu ? 'فی بوری و فی پراڈکٹ تفصیلی منافع ٹیبل' : 'Product-wise Per-Bag Margin Statement'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isUrdu
                        ? 'ہر کھاد اور زرعی دوا کی خریداری، فروخت اور خالص منافع فی بوری کی مکمل تفصیل'
                        : 'Comprehensive line-item profitability audit for each fertilizer brand.'}
                    </p>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {marginsData.productMargins.length} {isUrdu ? 'پراڈکٹس لسٹڈ' : 'Products Listed'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="py-3.5 px-4">{isUrdu ? 'کھاد / پراڈکٹ' : 'Product'}</th>
                        <th className="py-3.5 px-4">{isUrdu ? 'کمپنی' : 'Company'}</th>
                        <th className="py-3.5 px-4 text-center">{isUrdu ? 'فروخت شدہ' : 'Qty Sold'}</th>
                        <th className="py-3.5 px-4 text-right">{isUrdu ? 'اوسط لاگت خرید' : 'Avg Cost'}</th>
                        <th className="py-3.5 px-4 text-right">{isUrdu ? 'اوسط فروخت ریٹ' : 'Avg Sale'}</th>
                        <th className="py-3.5 px-4 text-right bg-rose-50/50 text-rose-900">
                          {isUrdu ? 'خالص منافع / بوری' : 'Profit / Bag'}
                        </th>
                        <th className="py-3.5 px-4 text-center">{isUrdu ? 'مارجن شرح' : 'Margin %'}</th>
                        <th className="py-3.5 px-4 text-center">{isUrdu ? 'نقد / ادھار' : 'Cash / Credit'}</th>
                        <th className="py-3.5 px-4 text-right">{isUrdu ? 'کل خالص منافع' : 'Total Profit'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                      {marginsData.productMargins.map((prod, idx) => {
                        const isTop = idx < 3;
                        return (
                          <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                {isTop && (
                                  <span className="p-1 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black">
                                    ★ #{idx + 1}
                                  </span>
                                )}
                                <div>
                                  <span>{isUrdu ? prod.urduName : prod.name}</span>
                                  <span className="block text-[11px] font-normal text-slate-400">
                                    {prod.unit}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">{prod.company}</td>
                            <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                              {prod.bagsSold.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                              {formatCurrency(prod.avgCostPrice)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-800 font-semibold">
                              {formatCurrency(prod.avgSalePrice)}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-black text-rose-600 bg-rose-50/40 text-sm">
                              +{formatCurrency(prod.profitPerBag)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold font-mono ${
                                  prod.profitRating === 'high'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : prod.profitRating === 'medium'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {prod.marginPercent}%
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600">
                              <span className="text-emerald-700 font-bold">{prod.cashBags}</span>
                              <span className="text-slate-300 mx-1">/</span>
                              <span className="text-purple-700 font-bold">{prod.creditBags}</span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 text-sm">
                              {formatCurrency(prod.totalProfit)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Printable Signatures Footer (Only for Print) */}
          <div className="hidden print:grid grid-cols-2 gap-12 pt-12 border-t border-dashed border-slate-300 text-center text-xs">
            <div>
              <div className="border-t border-slate-500 pt-1 font-semibold text-slate-800">
                منشی خرم (انوینٹری و کیش انچارج)
              </div>
              <span className="text-[10px] text-slate-400">تیار کنندہ / کیشیئر</span>
            </div>
            <div>
              <div className="border-t border-slate-500 pt-1 font-semibold text-slate-800">
                حاجی محمد افضل وٹو (مالک دکان)
              </div>
              <span className="text-[10px] text-slate-400">تصدیق مالک / پروپرائٹر</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
