'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../lib/language-context';
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
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

// Category Breakdown Data
const CATEGORY_SALES = [
  {
    name: 'سونا یوریا (Sona Urea 50kg)',
    company: 'Fauji Fertilizer (FFC)',
    bagsSold: 620,
    saleAmount: 2759000,
    costAmount: 2604000,
    profit: 155000,
    marginPercent: '5.9%',
  },
  {
    name: 'اینگرو یوریا (Engro Urea 50kg)',
    company: 'Engro Fertilizers',
    bagsSold: 380,
    saleAmount: 1683400,
    costAmount: 1588400,
    profit: 95000,
    marginPercent: '6.0%',
  },
  {
    name: 'سونا ڈی اے پی (Sona DAP 50kg)',
    company: 'Fauji Fertilizer (FFC)',
    bagsSold: 180,
    saleAmount: 2232000,
    costAmount: 2124000,
    profit: 108000,
    marginPercent: '5.1%',
  },
  {
    name: 'سرسبز کین گوارا (CAN 50kg)',
    company: 'Fatima Fertilizer',
    bagsSold: 290,
    saleAmount: 1116500,
    costAmount: 1044000,
    profit: 72500,
    marginPercent: '6.9%',
  },
  {
    name: 'ایس او پی پوٹاش (Potash SOP 50kg)',
    company: 'Fauji Fertilizer (FFC)',
    bagsSold: 65,
    saleAmount: 942500,
    costAmount: 897000,
    profit: 45500,
    marginPercent: '5.1%',
  },
  {
    name: 'زرعی ادویات و سپرے (Pesticides)',
    company: 'Bayer Crop Science',
    bagsSold: 140,
    saleAmount: 322000,
    costAmount: 287000,
    profit: 35000,
    marginPercent: '12.2%',
  },
  {
    name: 'مکئی و گندم بیج (Certified Seeds)',
    company: 'Pioneer & Punjab Seed',
    bagsSold: 95,
    saleAmount: 684000,
    costAmount: 644000,
    profit: 40000,
    marginPercent: '6.2%',
  },
];

// Top Recoveries / Cash inflow log
const RECENT_RECOVERIES = [
  { farmer: 'چوہدری نذیر احمد وٹو', chak: 'چک 45/12L', amount: 100000, method: 'کاؤنٹر کیش', date: '2026-10-06' },
  { farmer: 'ملک بشیر احمد اعوان', chak: 'چک 88/WB', amount: 250000, method: 'بینک آن لائن', date: '2026-10-04' },
  { farmer: 'میاں طارق جاوید ارائیں', chak: 'قبولہ شریف', amount: 85000, method: 'کاؤنٹر کیش', date: '2026-10-03' },
  { farmer: 'سردار اللہ دتہ کھوکھر', chak: 'بستی ملوک', amount: 150000, method: 'چیک ادائیگی', date: '2026-10-01' },
];

export default function ReportsPage() {
  const { isUrdu } = useLanguage();
  const [timeRange, setTimeRange] = useState('this_month');

  // Overall Financial Calculations
  const totalSales = CATEGORY_SALES.reduce((sum, c) => sum + c.saleAmount, 0);
  const totalCost = CATEGORY_SALES.reduce((sum, c) => sum + c.costAmount, 0);
  const grossProfit = totalSales - totalCost;
  const totalExpenses = 92400; // From daily operating expenses
  const netProfit = grossProfit - totalExpenses;
  const totalBagsSold = CATEGORY_SALES.reduce((sum, c) => sum + c.bagsSold, 0);

  const formatCurrency = (amt: number) => `Rs. ${amt.toLocaleString()}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Header with Time Range Filter & Print Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <FileBarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'نفع و نقصان اور آڈٹ رپورٹس' : 'Profit & Loss and Audit Reports'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isUrdu
                ? 'کھاد کی مجموعی سیلز، فی بوری منافع، دکان کے اخراجات، اور خالص بچت کا تفصیلی آڈٹ'
                : 'Complete fertilizer revenue, bag sales, gross margin, operating expenses, and net net profit.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time Range Filter */}
          <div className="w-[180px]">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full bg-white border-slate-300 text-xs sm:text-sm h-[40px] rounded-xl shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 z-[120]">
                <SelectItem value="today">{isUrdu ? 'صرف آج کا دن' : 'Today'}</SelectItem>
                <SelectItem value="this_week">{isUrdu ? 'اس ہفتے' : 'This Week'}</SelectItem>
                <SelectItem value="this_month">{isUrdu ? 'اس ماہ (Current Month)' : 'This Month'}</SelectItem>
                <SelectItem value="season">{isUrdu ? 'سیزن ربیع 2026' : 'Rabi Season 2026'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>{isUrdu ? 'رپورٹ پرنٹ کریں' : 'Print Report'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Financial Health Cards (P&L Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'مجموعی سیلز (Revenue)' : 'Total Revenue'}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {formatCurrency(totalSales)}
          </div>
          <p className="text-[11px] text-blue-600 mt-1 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{totalBagsSold.toLocaleString()} {isUrdu ? 'بوریاں فروخت ہوئیں' : 'Bags sold'}</span>
          </p>
        </div>

        {/* Cost of Goods Sold */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کھاد کی خرید لاگت (COGS)' : 'Cost of Goods'}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-700 font-mono tracking-tight">
            {formatCurrency(totalCost)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isUrdu ? 'کمپنیوں کو ادا شدہ خریداری ریٹ' : 'Supplier inventory cost'}
          </p>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'دکان و گودام اخراجات' : 'Operating Expenses'}
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-[11px] text-rose-600 mt-1 font-semibold flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'پلے داری، کرایہ، چائے پانی' : 'Labour, rent, utilities'}</span>
          </p>
        </div>

        {/* Net Profit (خالص بچت) */}
        <div className="bg-emerald-900 rounded-2xl p-5 border border-emerald-800 text-white shadow-lg shadow-emerald-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-700/40 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-800/80 rounded-lg text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {isUrdu ? 'خالص منافع / بچت (Net Profit)' : 'Net Profit'}
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-300 font-mono tracking-tight">
            {formatCurrency(netProfit)}
          </div>
          <p className="text-[11px] text-emerald-200 mt-1 font-semibold flex items-center gap-1">
            <span>{isUrdu ? 'اخراجات منہا کرنے کے بعد' : 'After all expenses'}</span>
            <span className="bg-emerald-800 text-emerald-200 px-1.5 py-0.5 rounded text-[10px]">
              +5.9% Net
            </span>
          </p>
        </div>
      </div>

      {/* 3. Product & Brand Profitability Table (1-Line Whitespace-Nowrap) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className={`font-bold text-slate-900 text-base flex items-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}>
              <Package className="w-5 h-5 text-emerald-600" />
              <span>{isUrdu ? 'کھاد و زرعی ادویات کی منافع بخش فروخت' : 'Fertilizer & Brand Profitability Breakdown'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUrdu ? 'ہر کھاد کی کل فروخت، فی بوری منافع اور مارجن فیصد' : 'Item-level revenue, unit margins, and profit contribution.'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {CATEGORY_SALES.length} {isUrdu ? 'آئٹمز' : 'Categories'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'پراڈکٹ / کھاد' : 'Product & Brand'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'سپلائر کمپنی' : 'Company'}</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">{isUrdu ? 'بوریاں فروخت' : 'Bags Sold'}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'کل سیلز رقم' : 'Revenue'}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'خرید لاگت' : 'Cost'}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'منافع (Profit)' : 'Gross Profit'}</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">{isUrdu ? 'مارجن %' : 'Margin %'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {CATEGORY_SALES.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50/70 transition-colors group whitespace-nowrap"
                >
                  {/* Name */}
                  <td className="py-4 px-4 whitespace-nowrap font-bold text-slate-900">
                    {item.name}
                  </td>

                  {/* Company */}
                  <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                    {item.company}
                  </td>

                  {/* Bags Sold */}
                  <td className="py-4 px-4 text-center whitespace-nowrap font-mono font-bold text-slate-800">
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs">
                      {item.bagsSold} {isUrdu ? 'بوریاں' : 'bags'}
                    </span>
                  </td>

                  {/* Revenue */}
                  <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-slate-700">
                    {formatCurrency(item.saleAmount)}
                  </td>

                  {/* Cost */}
                  <td className="py-4 px-4 text-right whitespace-nowrap font-mono text-slate-500">
                    {formatCurrency(item.costAmount)}
                  </td>

                  {/* Profit */}
                  <td className="py-4 px-4 text-right whitespace-nowrap font-mono font-black text-emerald-600 text-sm">
                    +{formatCurrency(item.profit)}
                  </td>

                  {/* Margin % */}
                  <td className="py-4 px-4 text-center whitespace-nowrap font-mono font-bold text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.marginPercent}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Bottom 2-Column: Market Udhar Health & Cash Inflow Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Market Udhar Health */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className={`font-bold text-slate-900 text-sm flex items-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}>
              <Users className="w-4 h-4 text-blue-600" />
              <span>{isUrdu ? 'مارکیٹ ادھار و ریکوری سمری' : 'Market Receivables & Recovery'}</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Live Sync</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-600 font-semibold">{isUrdu ? 'کل واجب الوصول مارکیٹ ادھار:' : 'Total Market Udhar:'}</span>
              <span className="font-mono font-bold text-rose-600 text-sm">Rs. 3,045,000</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <span className="text-emerald-800 font-semibold">{isUrdu ? 'اس ماہ کسانوں سے وصولی:' : 'Recovered This Month:'}</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">Rs. 1,450,000</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
              <span className="text-blue-800 font-semibold">{isUrdu ? 'کمپنیوں کو باقی ادائیگیاں (Payables):' : 'Company Payables:'}</span>
              <span className="font-mono font-bold text-blue-700 text-sm">Rs. 650,000</span>
            </div>
          </div>
        </div>

        {/* Recent Farmer Cash Recoveries Log */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className={`font-bold text-slate-900 text-sm flex items-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}>
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'حالیہ نقد وصولیاں (Recent Inflow)' : 'Recent Cash Inflows'}</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Top 4</span>
          </div>

          <div className="space-y-2.5">
            {RECENT_RECOVERIES.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{r.farmer}</span>
                  <span className="text-[10px] text-slate-400">{r.chak} • {r.date}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-emerald-600 text-sm block">
                    +{formatCurrency(r.amount)}
                  </span>
                  <span className="text-[10px] text-slate-500">{r.method}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
