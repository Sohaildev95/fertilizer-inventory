'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../lib/language-context';
import {
  Building2,
  Phone,
  MapPin,
  Search,
  PlusCircle,
  MoreVertical,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  FileText,
  BadgeCent
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

// Mock Data
const MOCK_VENDORS = [
  {
    id: '1',
    companyName: 'Fauji Fertilizer (FFC)',
    contactPerson: 'Zahid Khan',
    phone: '0300-1234567',
    city: 'Lahore',
    balance: 550000, // Payable
    status: 'active',
    lastPurchase: '2023-10-01',
    type: 'fertilizer',
  },
  {
    id: '2',
    companyName: 'Engro Fertilizers',
    contactPerson: 'Ali Raza',
    phone: '0321-7654321',
    city: 'Multan',
    balance: -25000, // Advance
    status: 'active',
    lastPurchase: '2023-09-28',
    type: 'fertilizer',
  },
  {
    id: '3',
    companyName: 'Pioneer Seeds',
    contactPerson: 'Naveed Ahmed',
    phone: '0333-9876543',
    city: 'Sahiwal',
    balance: 120000,
    status: 'active',
    lastPurchase: '2023-09-15',
    type: 'seed',
  },
  {
    id: '4',
    companyName: 'Bayer Crop Science',
    contactPerson: 'Imran Shah',
    phone: '0345-1122334',
    city: 'Faisalabad',
    balance: 0,
    status: 'inactive',
    lastPurchase: '2023-08-10',
    type: 'pesticide',
  },
  {
    id: '5',
    companyName: 'Local Supplier (Haji Sons)',
    contactPerson: 'Haji Aslam',
    phone: '0301-4455667',
    city: 'Local Market',
    balance: 45000,
    status: 'active',
    lastPurchase: '2023-10-05',
    type: 'mixed',
  },
];

export default function VendorsPage() {
  const { isUrdu } = useLanguage();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Stats calculation
  const totalPayable = MOCK_VENDORS.reduce((acc, v) => (v.balance > 0 ? acc + v.balance : acc), 0);
  const totalAdvance = Math.abs(MOCK_VENDORS.reduce((acc, v) => (v.balance < 0 ? acc + v.balance : acc), 0));
  const activeVendors = MOCK_VENDORS.filter(v => v.status === 'active').length;

  // Formatting currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  // Filtered Vendors
  const filteredVendors = useMemo(() => {
    return MOCK_VENDORS.filter((vendor) => {
      const matchSearch =
        vendor.companyName.toLowerCase().includes(search.toLowerCase()) ||
        vendor.contactPerson.toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || vendor.type === filterType;
      return matchSearch && matchType;
    });
  }, [search, filterType]);

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
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
            {isUrdu ? 'کمپنیاں اور سپلائرز' : 'Vendors & Suppliers'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isUrdu
              ? 'کھاد، بیج، اور سپرے فراہم کرنے والی کمپنیوں کا کھاتہ اور تفصیلات'
              : 'Manage accounts and ledgers for fertilizer, seed, and pesticide suppliers.'}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          {isUrdu ? 'نیا سپلائر شامل کریں' : 'Add New Vendor'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Payable */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600">
                {isUrdu ? 'کل واجب الادا رقم' : 'Total Payable'}
              </h3>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {formatCurrency(totalPayable)}
            </div>
            <div className="text-xs font-medium text-rose-600 mt-1">
              {isUrdu ? 'کمپنیوں کو دینے والے پیسے' : 'Amount owed to vendors'}
            </div>
          </div>
        </div>

        {/* Total Advance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600">
                {isUrdu ? 'ایڈوانس جمع رقم' : 'Advance Paid'}
              </h3>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {formatCurrency(totalAdvance)}
            </div>
            <div className="text-xs font-medium text-emerald-600 mt-1">
              {isUrdu ? 'کمپنیوں کے پاس جمع' : 'Excess amount with vendors'}
            </div>
          </div>
        </div>

        {/* Active Vendors */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600">
                {isUrdu ? 'فعال سپلائرز' : 'Active Vendors'}
              </h3>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {activeVendors}
            </div>
            <div className="text-xs font-medium text-blue-600 mt-1">
              {isUrdu ? 'جن کے ساتھ لین دین جاری ہے' : 'Currently dealing with'}
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
                ? 'کمپنی کا نام یا رابطہ پرسن تلاش کریں...'
                : 'Search company or contact person...'
            }
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="w-full md:w-auto flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[220px] bg-slate-50 border-slate-200 text-slate-700">
              <SelectValue placeholder={isUrdu ? 'تمام اقسام (All Types)' : 'All Vendor Types'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isUrdu ? 'تمام (All)' : 'All Types'}</SelectItem>
              <SelectItem value="fertilizer">{isUrdu ? 'کھاد (Fertilizer)' : 'Fertilizer'}</SelectItem>
              <SelectItem value="seed">{isUrdu ? 'بیج (Seeds)' : 'Seeds'}</SelectItem>
              <SelectItem value="pesticide">{isUrdu ? 'سپرے (Pesticides)' : 'Pesticides'}</SelectItem>
              <SelectItem value="mixed">{isUrdu ? 'متفرق (Mixed/Local)' : 'Mixed / Local'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vendors Table/List view */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 font-semibold text-slate-700">{isUrdu ? 'کمپنی کا نام' : 'Company'}</th>
                <th className="py-3 px-4 font-semibold text-slate-700">{isUrdu ? 'رابطہ و پتہ' : 'Contact & Address'}</th>
                <th className="py-3 px-4 font-semibold text-slate-700">{isUrdu ? 'اسٹیٹس' : 'Status'}</th>
                <th className="py-3 px-4 font-semibold text-right text-slate-700">{isUrdu ? 'موجودہ بیلنس' : 'Current Balance'}</th>
                <th className="py-3 px-4 font-semibold text-center text-slate-700">{isUrdu ? 'عمل' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">{isUrdu ? 'کوئی سپلائر نہیں ملا' : 'No vendors found matching your criteria.'}</p>
                  </td>
                </tr>
              ) : (
                filteredVendors.map((vendor) => {
                  const avatarClasses = getAvatarColor(vendor.companyName);
                  const initial = vendor.companyName.charAt(0).toUpperCase();

                  return (
                    <tr key={vendor.id} className="hover:bg-slate-50/50 transition group">
                      {/* Company Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border shadow-sm ${avatarClasses}`}>
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{vendor.companyName}</div>
                            <div className="text-xs text-slate-500 mt-0.5 capitalize">{vendor.type} Supplier</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                            {vendor.contactPerson}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-3">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {vendor.phone}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {vendor.city}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          vendor.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${vendor.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {vendor.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="py-4 px-4 text-right">
                        {vendor.balance === 0 ? (
                          <span className="text-sm font-semibold text-slate-400">Rs. 0 (Nil)</span>
                        ) : vendor.balance > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-rose-600">{formatCurrency(vendor.balance)}</span>
                            <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5 tracking-wider">Payable (دینے ہیں)</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-emerald-600">{formatCurrency(Math.abs(vendor.balance))}</span>
                            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 tracking-wider">Advance (جمع ہیں)</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title={isUrdu ? 'ادائیگی کریں (Payment)' : 'Make Payment'}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition"
                          >
                            <BadgeCent className="w-4 h-4" />
                          </button>
                          <button
                            title={isUrdu ? 'کھاتہ / لیجر دیکھیں' : 'View Ledger'}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            title={isUrdu ? 'مزید آپشنز' : 'More Options'}
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                          >
                            <MoreVertical className="w-4 h-4" />
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

      {/* Add Vendor Modal (Styled exactly like Add Product modal) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'نیا سپلائر یا کمپنی شامل کریں' : 'Add New Vendor'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu 
                ? 'نئے سپلائر یا کھاد کمپنی کے کوائف اور ابتدائی بقایا درج کریں' 
                : 'Enter company details, contact person, and starting ledger balance.'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isUrdu ? 'کمپنی کا نام *' : 'Company Name *'}
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  placeholder={isUrdu ? 'مثلاً: فوجی فرٹیلائزر' : 'e.g. Fauji Fertilizer'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isUrdu ? 'سپلائر کی قسم' : 'Vendor Type'}
                </label>
                <Select defaultValue="fertilizer">
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white focus:ring-emerald-500 h-[42px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                    <SelectItem value="fertilizer" className="text-slate-200 focus:bg-slate-700 focus:text-white">{isUrdu ? 'کھاد (Fertilizer)' : 'Fertilizer'}</SelectItem>
                    <SelectItem value="seed" className="text-slate-200 focus:bg-slate-700 focus:text-white">{isUrdu ? 'بیج (Seeds)' : 'Seeds'}</SelectItem>
                    <SelectItem value="pesticide" className="text-slate-200 focus:bg-slate-700 focus:text-white">{isUrdu ? 'سپرے (Pesticides)' : 'Pesticides'}</SelectItem>
                    <SelectItem value="mixed" className="text-slate-200 focus:bg-slate-700 focus:text-white">{isUrdu ? 'متفرق (Mixed/Local)' : 'Mixed / Local'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isUrdu ? 'رابطہ پرسن' : 'Contact Person'}
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  placeholder={isUrdu ? 'نام' : 'Contact Person Name'}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isUrdu ? 'فون نمبر' : 'Phone Number'}
                </label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  placeholder="03xx-xxxxxxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isUrdu ? 'ابتدائی بیلنس (روپے)' : 'Opening Balance (Rs)'}
              </label>
              <input
                type="number"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                placeholder="0"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                {isUrdu
                  ? 'اگر کمپنی کے پیسے دینے ہیں تو پلس (+) لکھیں، اگر ایڈوانس جمع ہیں تو منفی (-) لکھیں۔'
                  : 'Positive amount if payable (you owe them), negative if advance paid.'}
              </p>
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
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
            >
              {isUrdu ? 'محفوظ کریں' : 'Save Vendor'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
