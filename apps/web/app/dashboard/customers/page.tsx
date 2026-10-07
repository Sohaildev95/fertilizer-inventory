'use client';

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../lib/language-context';
import {
  Users,
  Phone,
  MapPin,
  Search,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Printer,
  Calendar,
  Sprout,
  ShieldCheck,
  Send,
  Building2,
  Trash2,
  ExternalLink,
  ChevronRight,
  CreditCard,
  Receipt,
  BadgeAlert,
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

// Types for Customer & Khata Transaction
interface KhataTransaction {
  id: string;
  date: string;
  description: string;
  biltyOrSlipNo?: string;
  debit: number; // نام / مال ادھار لیا (بڑھ گیا)
  credit: number; // جمع / رقم ادا کی (کم ہو گیا)
  balance: number; // چلتا بقایا
  paymentMethod?: string;
}

interface CustomerFarmer {
  id: string;
  name: string;
  fatherName: string;
  phone: string;
  cnic: string;
  village: string; // چک یا موزہ
  landAcreage: number; // کل رقبہ (ایکڑ)
  currentCrop: string; // موجودہ فصل (گندم، کپاس وغیرہ)
  guarantor: string; // ضمانتی
  guarantorPhone?: string;
  creditLimit: number; // کریڈٹ لمٹ
  balance: number; // موجودہ ادھار (positive = owes us)
  dueDate: string; // ادائیگی کا وعدہ
  status: 'active' | 'blocked' | 'over_limit';
  transactions: KhataTransaction[];
}

// Initial Mock Farmers with Real Pakistani Dealership Records
const INITIAL_CUSTOMERS: CustomerFarmer[] = [
  {
    id: 'cst-1',
    name: 'چوہدری نذیر احمد وٹو',
    fatherName: 'برکت علی',
    phone: '0300-7654321',
    cnic: '36502-1234567-1',
    village: 'چک نمبر 45/12L (چیچہ وطنی روڈ)',
    landAcreage: 35,
    currentCrop: 'گندم (Wheat)',
    guarantor: 'حاجی سرفراز نمبردار',
    guarantorPhone: '0300-9876543',
    creditLimit: 1000000,
    balance: 650000,
    dueDate: '2026-11-20 (گندم بوائی)',
    status: 'active',
    transactions: [
      {
        id: 'tx-101',
        date: '2026-09-15',
        description: 'اوپننگ بیلنس (سابقہ ادھار کھاتہ)',
        biltyOrSlipNo: 'OP-001',
        debit: 200000,
        credit: 0,
        balance: 200000,
      },
      {
        id: 'tx-102',
        date: '2026-09-28',
        description: 'سونا ڈی اے پی کھاد (20 بوریاں @ 11,800)',
        biltyOrSlipNo: 'INV-4401',
        debit: 236000,
        credit: 0,
        balance: 436000,
      },
      {
        id: 'tx-103',
        date: '2026-10-02',
        description: 'کاؤنٹر نقد وصولی (منشی خرم)',
        biltyOrSlipNo: 'REC-108',
        debit: 0,
        credit: 100000,
        balance: 336000,
        paymentMethod: 'cash',
      },
      {
        id: 'tx-104',
        date: '2026-10-05',
        description: 'سونا یوریا کھاد (70 بوریاں @ 4,450) و زنک',
        biltyOrSlipNo: 'INV-4489',
        debit: 314000,
        credit: 0,
        balance: 650000,
      },
    ],
  },
  {
    id: 'cst-2',
    name: 'ملک بشیر احمد اعوان',
    fatherName: 'ملک غلام رسول',
    phone: '0301-4455223',
    cnic: '36103-7654321-3',
    village: 'چک 88/WB، جہانیاں روڈ',
    landAcreage: 55,
    currentCrop: 'کپاس و مکئی (Cotton/Corn)',
    guarantor: 'سردار فیاض خان ایڈووکیٹ',
    guarantorPhone: '0301-7788990',
    creditLimit: 1200000,
    balance: 1420000, // OVER LIMIT!
    dueDate: '2026-10-25 (کپاس چنائی)',
    status: 'over_limit',
    transactions: [
      {
        id: 'tx-201',
        date: '2026-09-10',
        description: 'سابقہ واجب الادا بیلنس',
        biltyOrSlipNo: 'OP-002',
        debit: 700000,
        credit: 0,
        balance: 700000,
      },
      {
        id: 'tx-202',
        date: '2026-09-22',
        description: 'اینگرو زورآور ڈی اے پی (40 بوریاں @ 12,200)',
        biltyOrSlipNo: 'INV-4350',
        debit: 488000,
        credit: 0,
        balance: 1188000,
      },
      {
        id: 'tx-203',
        date: '2026-09-29',
        description: 'بیلٹ ایکسپرٹ و نیٹایوو سپرے ادویات',
        biltyOrSlipNo: 'INV-4412',
        debit: 232000,
        credit: 0,
        balance: 1420000,
      },
    ],
  },
  {
    id: 'cst-3',
    name: 'میاں طارق جاوید ارائیں',
    fatherName: 'میاں محمد شریف',
    phone: '0321-8899771',
    cnic: '36501-9988776-5',
    village: 'قبولہ شریف، تحصیل عارف والا',
    landAcreage: 18,
    currentCrop: 'دھان / باسمتی چاول',
    guarantor: 'سیٹھ منیر احمد رائس ملز',
    guarantorPhone: '0321-1122334',
    creditLimit: 600000,
    balance: 185000,
    dueDate: '2026-11-15 (دھان کٹائی)',
    status: 'active',
    transactions: [
      {
        id: 'tx-301',
        date: '2026-09-18',
        description: 'سرسبز کین گوارا کھاد (50 بوریاں)',
        biltyOrSlipNo: 'INV-4310',
        debit: 185000,
        credit: 0,
        balance: 185000,
      },
    ],
  },
  {
    id: 'cst-4',
    name: 'رانا خرم شہزاد',
    fatherName: 'رانا محمد اکرم',
    phone: '0345-6677889',
    cnic: '36101-5544332-1',
    village: 'ٹھٹھہ صادق آباد، تحصیل خانیوال',
    landAcreage: 24,
    currentCrop: 'کماد (Sugarcane)',
    guarantor: 'ملک انور نمبردار',
    guarantorPhone: '0345-0099887',
    creditLimit: 800000,
    balance: 0, // Clear
    dueDate: 'نقد سودا / کلیئر کھاتہ',
    status: 'active',
    transactions: [
      {
        id: 'tx-401',
        date: '2026-09-20',
        description: 'سونا یوریا (40 بوریاں)',
        biltyOrSlipNo: 'INV-4330',
        debit: 178000,
        credit: 0,
        balance: 178000,
      },
      {
        id: 'tx-402',
        date: '2026-10-01',
        description: 'بینک ٹرانسفر کے ذریعے مکمل ادائیگی',
        biltyOrSlipNo: 'REC-109',
        debit: 0,
        credit: 178000,
        balance: 0,
        paymentMethod: 'bank_transfer',
      },
    ],
  },
  {
    id: 'cst-5',
    name: 'سردار اللہ دتہ کھوکھر',
    fatherName: 'سردار بہادر خان',
    phone: '0302-3344556',
    cnic: '36502-3322110-9',
    village: 'بستی ملوک، ملتان بائی پاس',
    landAcreage: 40,
    currentCrop: 'گندم و مکئی',
    guarantor: 'چوہدری اصغر نمبردار',
    guarantorPhone: '0302-6655443',
    creditLimit: 1200000,
    balance: 790000,
    dueDate: '2026-11-30',
    status: 'active',
    transactions: [
      {
        id: 'tx-501',
        date: '2026-09-25',
        description: 'سونا ڈی اے پی (40 بوریاں @ 11,800)',
        biltyOrSlipNo: 'INV-4390',
        debit: 472000,
        credit: 0,
        balance: 472000,
      },
      {
        id: 'tx-502',
        date: '2026-10-04',
        description: 'سونا یوریا (70 بوریاں @ 4,450) و پوٹاش',
        biltyOrSlipNo: 'INV-4475',
        debit: 318000,
        credit: 0,
        balance: 790000,
      },
    ],
  },
];

// Available Products for Quick Debit
const AVAILABLE_FERTILIZERS = [
  { id: 'prd-1', name: 'Sona Urea 50kg (سونا یوریا)', price: 4450 },
  { id: 'prd-2', name: 'Engro Urea 50kg (اینگرو یوریا)', price: 4430 },
  { id: 'prd-3', name: 'Sona DAP 50kg (سونا ڈی اے پی)', price: 12400 },
  { id: 'prd-4', name: 'Engro Zorawar DAP (اینگرو ڈی اے پی)', price: 12600 },
  { id: 'prd-5', name: 'Sarsabz CAN (گوارا سرسبز)', price: 3800 },
  { id: 'prd-6', name: 'SOP Potash (ایف ایف سی پوٹاش)', price: 14500 },
  { id: 'prd-7', name: 'Belt Expert 100ml (سپرے)', price: 2100 },
];

export default function CustomersPage() {
  const { isUrdu } = useLanguage();
  const [customers, setCustomers] = useState<CustomerFarmer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVillage, setFilterVillage] = useState('all');

  // Modals
  const [isAddFarmerOpen, setIsAddFarmerOpen] = useState(false);
  const [isReceivePaymentOpen, setIsReceivePaymentOpen] = useState(false);
  const [isAddDebitOpen, setIsAddDebitOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<CustomerFarmer | null>(null);

  // Form State: Add Farmer
  const [farmerForm, setFarmerForm] = useState({
    name: '',
    fatherName: '',
    phone: '',
    cnic: '',
    village: '',
    landAcreage: '',
    currentCrop: 'گندم (Wheat)',
    guarantor: '',
    guarantorPhone: '',
    creditLimit: '500000',
    openingBalance: '0',
    dueDate: '',
  });

  // Form State: Receive Payment (وصولی)
  const [paymentForm, setPaymentForm] = useState({
    customerId: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'cash',
    receiptNo: `REC-${Math.floor(100 + Math.random() * 900)}`,
    notes: '',
  });

  // Form State: Add Debit / Fertilizer on Khata (ادھار اندراج)
  const [debitForm, setDebitForm] = useState({
    customerId: '',
    productId: 'prd-1',
    quantity: '10',
    unitPrice: '4450',
    slipNo: `INV-${Math.floor(4000 + Math.random() * 900)}`,
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  // KPI Calculations
  const totalMarketUdhar = useMemo(() => {
    return customers.reduce((sum, c) => sum + Math.max(0, c.balance), 0);
  }, [customers]);

  const totalOverLimitCount = useMemo(() => {
    return customers.filter((c) => c.balance > c.creditLimit).length;
  }, [customers]);

  const totalRegisteredFarmers = customers.length;

  const totalCollectedRecent = useMemo(() => {
    // Total credits from transactions
    return customers.reduce(
      (sum, c) => sum + c.transactions.reduce((tSum, t) => tSum + t.credit, 0),
      0
    );
  }, [customers]);

  // Unique villages for filter
  const uniqueVillages = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => set.add(c.village));
    return Array.from(set);
  }, [customers]);

  // Filtered List
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.fatherName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.village.toLowerCase().includes(q) ||
        c.cnic.includes(q) ||
        c.guarantor.toLowerCase().includes(q);

      const matchVillage = filterVillage === 'all' || c.village === filterVillage;

      let matchStatus = true;
      if (filterStatus === 'udhar') {
        matchStatus = c.balance > 0;
      } else if (filterStatus === 'over_limit') {
        matchStatus = c.balance > c.creditLimit;
      } else if (filterStatus === 'clear') {
        matchStatus = c.balance <= 0;
      }

      return matchSearch && matchVillage && matchStatus;
    });
  }, [customers, search, filterVillage, filterStatus]);

  // Handlers
  const handleSaveNewFarmer = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = Number(farmerForm.creditLimit) || 500000;
    const initialBalance = Number(farmerForm.openingBalance) || 0;
    const newId = `cst-${Date.now()}`;

    const newFarmer: CustomerFarmer = {
      id: newId,
      name: farmerForm.name,
      fatherName: farmerForm.fatherName,
      phone: farmerForm.phone,
      cnic: farmerForm.cnic || '36502-xxxxxxx-x',
      village: farmerForm.village || 'چک لوکل',
      landAcreage: Number(farmerForm.landAcreage) || 10,
      currentCrop: farmerForm.currentCrop,
      guarantor: farmerForm.guarantor || 'ذاتی ضمانت',
      guarantorPhone: farmerForm.guarantorPhone,
      creditLimit: limit,
      balance: initialBalance,
      dueDate: farmerForm.dueDate || 'فصل کٹائی',
      status: initialBalance > limit ? 'over_limit' : 'active',
      transactions:
        initialBalance > 0
          ? [
              {
                id: `tx-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                description: 'سابقہ اوپننگ بیلنس',
                biltyOrSlipNo: 'OP-NEW',
                debit: initialBalance,
                credit: 0,
                balance: initialBalance,
              },
            ]
          : [],
    };

    setCustomers([newFarmer, ...customers]);
    setIsAddFarmerOpen(false);
    // Reset Form
    setFarmerForm({
      name: '',
      fatherName: '',
      phone: '',
      cnic: '',
      village: '',
      landAcreage: '',
      currentCrop: 'گندم (Wheat)',
      guarantor: '',
      guarantorPhone: '',
      creditLimit: '500000',
      openingBalance: '0',
      dueDate: '',
    });
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(paymentForm.amount);
    if (!amount || !paymentForm.customerId) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === paymentForm.customerId) {
          const newBal = c.balance - amount;
          const newTx: KhataTransaction = {
            id: `tx-${Date.now()}`,
            date: paymentForm.date || new Date().toISOString().slice(0, 10),
            description: paymentForm.notes
              ? `وصولی: ${paymentForm.notes}`
              : `نقد وصولی (${paymentForm.paymentMethod === 'bank_transfer' ? 'بینک ٹرانسفر' : 'کاؤنٹر کیش'})`,
            biltyOrSlipNo: paymentForm.receiptNo,
            debit: 0,
            credit: amount,
            balance: newBal,
            paymentMethod: paymentForm.paymentMethod,
          };
          const updated = {
            ...c,
            balance: newBal,
            status: (newBal > c.creditLimit ? 'over_limit' : 'active') as any,
            transactions: [...c.transactions, newTx],
          };
          if (selectedFarmer?.id === c.id) {
            setSelectedFarmer(updated);
          }
          return updated;
        }
        return c;
      })
    );

    setIsReceivePaymentOpen(false);
    setPaymentForm({
      customerId: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'cash',
      receiptNo: `REC-${Math.floor(100 + Math.random() * 900)}`,
      notes: '',
    });
  };

  const handleSaveDebit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(debitForm.quantity) || 1;
    const rate = Number(debitForm.unitPrice) || 0;
    const totalAmount = qty * rate;
    if (!totalAmount || !debitForm.customerId) return;

    const prod = AVAILABLE_FERTILIZERS.find((p) => p.id === debitForm.productId);
    const prodTitle = prod ? prod.name : 'کھاد بوریاں';

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === debitForm.customerId) {
          const newBal = c.balance + totalAmount;
          const newTx: KhataTransaction = {
            id: `tx-${Date.now()}`,
            date: debitForm.date || new Date().toISOString().slice(0, 10),
            description: `${prodTitle} (${qty} بوریاں @ Rs. ${rate.toLocaleString()})`,
            biltyOrSlipNo: debitForm.slipNo,
            debit: totalAmount,
            credit: 0,
            balance: newBal,
          };
          const updated = {
            ...c,
            balance: newBal,
            status: (newBal > c.creditLimit ? 'over_limit' : 'active') as any,
            transactions: [...c.transactions, newTx],
          };
          if (selectedFarmer?.id === c.id) {
            setSelectedFarmer(updated);
          }
          return updated;
        }
        return c;
      })
    );

    setIsAddDebitOpen(false);
    setDebitForm({
      customerId: '',
      productId: 'prd-1',
      quantity: '10',
      unitPrice: '4450',
      slipNo: `INV-${Math.floor(4000 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
  };

  const openPaymentForCustomer = (farmer: CustomerFarmer) => {
    setPaymentForm({
      customerId: farmer.id,
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'cash',
      receiptNo: `REC-${Math.floor(100 + Math.random() * 900)}`,
      notes: '',
    });
    setIsReceivePaymentOpen(true);
  };

  const openDebitForCustomer = (farmer: CustomerFarmer) => {
    setDebitForm({
      customerId: farmer.id,
      productId: 'prd-1',
      quantity: '10',
      unitPrice: '4450',
      slipNo: `INV-${Math.floor(4000 + Math.random() * 900)}`,
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setIsAddDebitOpen(true);
  };

  const getWhatsAppLink = (c: CustomerFarmer) => {
    const rawPhone = c.phone.replace(/[^0-9]/g, '');
    const intlPhone = rawPhone.startsWith('0') ? '92' + rawPhone.slice(1) : rawPhone;
    const msg = encodeURIComponent(
      `محترم ${c.name} صاحب،\nآپ کا کھاد و زرعی ادویات کا کھاتہ بیلنس بقایا Rs. ${c.balance.toLocaleString()} ہے۔ برائے مہربانی وعدہ ادائیگی (${c.dueDate}) کے مطابق کھاتہ کلیئر فرمائیں۔ شکریہ۔`
    );
    return `https://wa.me/${intlPhone}?text=${msg}`;
  };

  const formatCurrency = (amt: number) => `Rs. ${amt.toLocaleString()}`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* ========================================================================= */}
      {/* 1. Header Section                                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-2xl sm:text-3xl font-extrabold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'زمیندار کھاتہ رجسٹر (کسٹمرز)' : 'Farmer Khata & Customers'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {isUrdu
                  ? 'زمینداروں کے ادھار کھاتے، فصل پر ادائیگی، کریڈٹ لمٹ اور وصولیوں کا مکمل حساب'
                  : 'Manage farmer credit ledgers, seasonal crop terms, guarantees, and cash recovery.'}
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsReceivePaymentOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{isUrdu ? 'وصولی درج کریں' : 'Receive Payment'}</span>
          </button>

          <button
            onClick={() => setIsAddDebitOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-amber-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{isUrdu ? 'ادھار مال اندراج' : 'Issue Credit'}</span>
          </button>

          <button
            onClick={() => setIsAddFarmerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isUrdu ? 'نیا زمیندار رجسٹر کریں' : 'Add New Farmer'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. KPI Cards Row                                                          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Market Udhar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل مارکیٹ ادھار' : 'Total Receivables'}
            </span>
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
            {formatCurrency(totalMarketUdhar)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'زمینداروں کے ذمہ واجب الوصول رقم' : 'Outstanding credit across all farmers'}
          </p>
        </div>

        {/* Collected Recent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل وصول شدہ رقم' : 'Recovered Amount'}
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
            {formatCurrency(totalCollectedRecent)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'کاؤنٹر و بینک کے ذریعے موصولہ' : 'Recorded collections through cash/bank'}
          </p>
        </div>

        {/* Over Limit Alert Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'حد سے زیادہ ادھار' : 'Over-Limit Risk'}
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono tracking-tight">
            {totalOverLimitCount}{' '}
            <span className="text-sm font-normal text-slate-500">{isUrdu ? 'کھاتے' : 'Farmers'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'جن کا ادھار حد سے بڑھ چکا ہے' : 'Farmers exceeding their safe credit limit'}
          </p>
        </div>

        {/* Total Farmers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-2xl -mr-6 -mt-6"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل زمیندار' : 'Registered Farmers'}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono tracking-tight">
            {totalRegisteredFarmers}{' '}
            <span className="text-sm font-normal text-slate-500">{isUrdu ? 'کھاتے' : 'Accounts'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'رجسٹرڈ گاہک و کاشتکار' : 'Active customer profiles in system'}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Search & Filters Bar                                                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isUrdu
                ? 'نام، ولدیت، فون، چک/گاؤں، شناختی کارڈ یا ضمانتی سے تلاش کریں...'
                : 'Search farmer by name, father, phone, village, cnic, or guarantor...'
            }
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="w-[160px]">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-xs sm:text-sm h-[40px] rounded-xl">
                <SelectValue placeholder="تمام کھاتے" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 z-[120]">
                <SelectItem value="all">{isUrdu ? 'تمام کھاتے' : 'All Accounts'}</SelectItem>
                <SelectItem value="udhar">{isUrdu ? 'واجب الادا ادھار' : 'Has Outstanding'}</SelectItem>
                <SelectItem value="over_limit">{isUrdu ? 'حد سے زیادہ (Over Limit)' : 'Over Credit Limit'}</SelectItem>
                <SelectItem value="clear">{isUrdu ? 'کلیئر کھاتہ (Clear)' : 'Zero Balance'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Village Filter */}
          <div className="w-[170px]">
            <Select value={filterVillage} onValueChange={setFilterVillage}>
              <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-xs sm:text-sm h-[40px] rounded-xl">
                <SelectValue placeholder="تمام دیہات / چک" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 z-[120]">
                <SelectItem value="all">{isUrdu ? 'تمام دیہات / چک' : 'All Villages'}</SelectItem>
                {uniqueVillages.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. Farmers & Khata Table                                                  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'زمیندار کا نام و ولدیت' : 'Farmer & Parentage'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'چک / موزہ و رقبہ' : 'Village & Acreage'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'ضمانتی / حوالہ' : 'Guarantor'}</th>
                <th className="py-3.5 px-4 whitespace-nowrap">{isUrdu ? 'کریڈٹ لمیٹ استعمال' : 'Credit Limit Usage'}</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">{isUrdu ? 'موجودہ ادھار بیلنس' : 'Current Balance'}</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">{isUrdu ? 'اقدامات (Actions)' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-1" />
                    <p className="font-semibold text-slate-600">
                      {isUrdu ? 'کوئی زمیندار نہیں ملا' : 'No farmer accounts found'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {isUrdu ? 'تلاش کا لفظ تبدیل کریں یا نیا زمیندار رجسٹر کریں' : 'Try adjusting search or add a new customer.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((farmer) => {
                  const percentUsed = Math.min(100, Math.round((farmer.balance / farmer.creditLimit) * 100));
                  const isOver = farmer.balance > farmer.creditLimit;

                  return (
                    <tr
                      key={farmer.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Farmer Name & Contact */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                            {farmer.name.charAt(0)}
                          </div>
                          <div className="whitespace-nowrap">
                            <div className="font-bold text-slate-900 flex items-center gap-2 whitespace-nowrap">
                              <span className="whitespace-nowrap">{farmer.name}</span>
                              {isOver && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 whitespace-nowrap">
                                  {isUrdu ? 'حد سے زیادہ' : 'OVER LIMIT'}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 whitespace-nowrap flex items-center gap-1.5">
                              <span className="whitespace-nowrap">{isUrdu ? `ولد: ${farmer.fatherName}` : `S/O: ${farmer.fatherName}`}</span>
                              <span>•</span>
                              <span className="font-mono whitespace-nowrap" dir="ltr">{farmer.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Village & Land */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium flex items-center gap-1.5 whitespace-nowrap">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="whitespace-nowrap">{farmer.village}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 whitespace-nowrap">
                          <Sprout className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {farmer.landAcreage} {isUrdu ? 'ایکڑ' : 'Acres'} • {farmer.currentCrop}
                          </span>
                        </div>
                      </td>

                      {/* Guarantor */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium flex items-center gap-1.5 whitespace-nowrap">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                          <span className="whitespace-nowrap">{farmer.guarantor}</span>
                        </div>
                        {farmer.guarantorPhone && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 whitespace-nowrap" dir="ltr">
                            {farmer.guarantorPhone}
                          </div>
                        )}
                      </td>

                      {/* Credit Limit Usage */}
                      <td className="py-4 px-4 min-w-[200px] whitespace-nowrap">
                        <div className="flex items-center justify-between text-[11px] mb-1 whitespace-nowrap">
                          <span className="text-slate-500 font-mono whitespace-nowrap">
                            {formatCurrency(farmer.creditLimit)}
                          </span>
                          <span
                            className={`font-bold font-mono whitespace-nowrap ${
                              isOver
                                ? 'text-rose-600'
                                : percentUsed > 75
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {percentUsed}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isOver
                                ? 'bg-rose-500'
                                : percentUsed > 75
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, percentUsed)}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">
                          {isUrdu ? `وعدہ: ${farmer.dueDate}` : `Due: ${farmer.dueDate}`}
                        </div>
                      </td>

                      {/* Current Balance */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div
                          className={`text-base font-extrabold font-mono whitespace-nowrap ${
                            farmer.balance > 0
                              ? isOver
                                ? 'text-rose-600'
                                : 'text-amber-700'
                              : 'text-emerald-600'
                          }`}
                        >
                          {farmer.balance > 0
                            ? formatCurrency(farmer.balance)
                            : farmer.balance === 0
                            ? 'Rs. 0 (صاف)'
                            : `+${formatCurrency(Math.abs(farmer.balance))} (پیشگی)`}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                          {farmer.transactions.length}{' '}
                          {isUrdu ? 'لین دین درج ہیں' : 'transactions'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Ledger */}
                          <button
                            onClick={() => setSelectedFarmer(farmer)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition"
                            title={isUrdu ? 'کھاتہ لیجر دیکھیں' : 'View Ledger'}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'کھاتہ' : 'Khata'}</span>
                          </button>

                          {/* Quick Recovery */}
                          <button
                            onClick={() => openPaymentForCustomer(farmer)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition"
                            title={isUrdu ? 'وصولی درج کریں' : 'Receive Cash'}
                          >
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'وصولی' : 'Receive'}</span>
                          </button>

                          {/* WhatsApp Reminder */}
                          <a
                            href={getWhatsAppLink(farmer)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition"
                            title={isUrdu ? 'واٹس ایپ یاد دہانی بھیجیں' : 'Send WhatsApp Reminder'}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>
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
      {/* MODAL 1: ADD NEW FARMER (نیا زمیندار رجسٹر کریں)                             */}
      {/* ========================================================================= */}
      <Dialog open={isAddFarmerOpen} onOpenChange={setIsAddFarmerOpen}>
        <DialogContent className="max-w-3xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'نیا زمیندار کھاتہ رجسٹر کریں' : 'Register New Farmer Customer'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu
                ? 'زمیندار کی مکمل تفصیل، چک/موزہ، رقبہ، ضمانتی اور ادھار کریڈٹ لمیٹ درج کریں'
                : 'Enter farmer personal info, land size, guarantor, and assigned credit limit.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNewFarmer} className="flex-1 flex flex-col overflow-hidden">
            <DialogBody>
              {/* Row 1: Name, Father, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'زمیندار کا نام*' : 'Farmer Full Name*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerForm.name}
                    onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                    placeholder={isUrdu ? 'مثلاً: چوہدری نذیر احمد' : 'e.g. Nazir Ahmad'}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'ولدیت / ذات*' : "Father's Name / Caste*"}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerForm.fatherName}
                    onChange={(e) => setFarmerForm({ ...farmerForm, fatherName: e.target.value })}
                    placeholder={isUrdu ? 'برکت علی وٹو' : 'Barkat Ali'}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'موبائل نمبر (WhatsApp)*' : 'Mobile / WhatsApp*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerForm.phone}
                    onChange={(e) => setFarmerForm({ ...farmerForm, phone: e.target.value })}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 2: CNIC, Village, Land */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'شناختی کارڈ (CNIC)' : 'CNIC Number'}
                  </label>
                  <input
                    type="text"
                    value={farmerForm.cnic}
                    onChange={(e) => setFarmerForm({ ...farmerForm, cnic: e.target.value })}
                    placeholder="36502-xxxxxxx-x"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'چک / موزہ / علاقہ*' : 'Village / Chak Address*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={farmerForm.village}
                    onChange={(e) => setFarmerForm({ ...farmerForm, village: e.target.value })}
                    placeholder={isUrdu ? 'مثلاً: چک نمبر 45/12L' : 'e.g. Chak 45/12L'}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'کل رقبہ (ایکڑ)' : 'Total Land (Acres)'}
                  </label>
                  <input
                    type="number"
                    value={farmerForm.landAcreage}
                    onChange={(e) => setFarmerForm({ ...farmerForm, landAcreage: e.target.value })}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 3: Current Crop, Guarantor & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'موجودہ فصل' : 'Current Crop Season'}
                  </label>
                  <Select
                    value={farmerForm.currentCrop}
                    onValueChange={(val) => setFarmerForm({ ...farmerForm, currentCrop: val })}
                  >
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[42px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                      <SelectItem value="گندم (Wheat)">گندم (Wheat)</SelectItem>
                      <SelectItem value="کپاس (Cotton)">کپاس (Cotton)</SelectItem>
                      <SelectItem value="مکئی (Corn/Maize)">مکئی (Corn/Maize)</SelectItem>
                      <SelectItem value="دھان / چاول (Rice)">دھان / چاول (Rice)</SelectItem>
                      <SelectItem value="کماد (Sugarcane)">کماد (Sugarcane)</SelectItem>
                      <SelectItem value="سبزیات و باغات (Vegetables/Orchards)">سبزیات و باغات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'ضمانتی / حوالہ دار' : 'Guarantor / Reference'}
                  </label>
                  <input
                    type="text"
                    value={farmerForm.guarantor}
                    onChange={(e) => setFarmerForm({ ...farmerForm, guarantor: e.target.value })}
                    placeholder={isUrdu ? 'حاجی سرفراز نمبردار' : 'Haji Sarfraz Nambardar'}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'ضمانتی کا فون' : 'Guarantor Phone'}
                  </label>
                  <input
                    type="text"
                    value={farmerForm.guarantorPhone}
                    onChange={(e) => setFarmerForm({ ...farmerForm, guarantorPhone: e.target.value })}
                    placeholder="0300-xxxxxxx"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Row 4: Financials & Due Date */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {isUrdu ? 'مالیاتی حد و سابقہ کھاتہ' : 'Financial Limits & Balance'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isUrdu ? 'کریڈٹ لمیٹ (روپے)*' : 'Credit Limit (PKR)*'}
                    </label>
                    <input
                      type="number"
                      required
                      value={farmerForm.creditLimit}
                      onChange={(e) => setFarmerForm({ ...farmerForm, creditLimit: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isUrdu ? 'سابقہ اوپننگ ادھار (اگر ہے)' : 'Opening Balance (PKR)'}
                    </label>
                    <input
                      type="number"
                      value={farmerForm.openingBalance}
                      onChange={(e) => setFarmerForm({ ...farmerForm, openingBalance: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-rose-400 font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isUrdu ? 'ادائیگی کا وعدہ (تاریخ یا سیزن)' : 'Promised Due Date / Term'}
                    </label>
                    <input
                      type="text"
                      value={farmerForm.dueDate}
                      onChange={(e) => setFarmerForm({ ...farmerForm, dueDate: e.target.value })}
                      placeholder={isUrdu ? 'گندم کٹائی (مئی 2026)' : 'Harvest due (May 2026)'}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsAddFarmerOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition active:scale-95"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
              >
                {isUrdu ? 'زمیندار محفوظ کریں' : 'Save Farmer Account'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: RECEIVE PAYMENT / RECOVERY (زمیندار سے وصولی درج کریں)            */}
      {/* ========================================================================= */}
      <Dialog open={isReceivePaymentOpen} onOpenChange={setIsReceivePaymentOpen}>
        <DialogContent className="max-w-xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'زمیندار سے وصولی کا اندراج' : 'Record Farmer Payment Recovery'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu
                ? 'کاؤنٹر نقد یا بینک کے ذریعے وصول شدہ رقم درج کریں، کھاتہ خود بخود اپڈیٹ ہو جائے گا'
                : 'Record cash or bank receipt from farmer to credit their ledger balance.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePayment} className="flex-1 flex flex-col overflow-hidden">
            <DialogBody>
              <div className="space-y-4">
                {/* Farmer Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'زمیندار منتخب کریں*' : 'Select Farmer*'}
                  </label>
                  <Select
                    value={paymentForm.customerId}
                    onValueChange={(val) => setPaymentForm({ ...paymentForm, customerId: val })}
                  >
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[42px]">
                      <SelectValue placeholder={isUrdu ? 'زمیندار منتخب کریں...' : 'Choose farmer...'} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.village}) — بقایا: Rs. {c.balance.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'وصولی کی رقم (روپے)*' : 'Amount Received (PKR)*'}
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
                      {isUrdu ? 'وصولی کی تاریخ*' : 'Payment Date*'}
                    </label>
                    <DatePicker
                      value={paymentForm.date}
                      onChange={(date) => setPaymentForm({ ...paymentForm, date })}
                      required
                    />
                  </div>
                </div>

                {/* Payment Method & Slip No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'ادائیگی کا ذریعہ' : 'Payment Method'}
                    </label>
                    <Select
                      value={paymentForm.paymentMethod}
                      onValueChange={(val) => setPaymentForm({ ...paymentForm, paymentMethod: val })}
                    >
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[42px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                        <SelectItem value="cash">{isUrdu ? 'نقد کاؤنٹر (Cash)' : 'Cash Counter'}</SelectItem>
                        <SelectItem value="bank_transfer">{isUrdu ? 'بینک آن لائن (HBL/MCB)' : 'Bank Transfer'}</SelectItem>
                        <SelectItem value="cheque">{isUrdu ? 'بینک چیک (Cheque)' : 'Cheque'}</SelectItem>
                        <SelectItem value="crop_settlement">{isUrdu ? 'زرعی جنس / گندم بدلہ' : 'Crop Barter'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'رسید / واؤچر نمبر' : 'Receipt / Voucher No'}
                    </label>
                    <input
                      type="text"
                      value={paymentForm.receiptNo}
                      onChange={(e) => setPaymentForm({ ...paymentForm, receiptNo: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'تفصیل / نوٹ' : 'Remarks / Note'}
                  </label>
                  <input
                    type="text"
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    placeholder={isUrdu ? 'مثلاً: گندم کٹائی کی پیشگی وصولی' : 'Optional memo...'}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsReceivePaymentOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition active:scale-95"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-900/30 transition transform active:scale-95"
              >
                {isUrdu ? 'وصولی محفوظ کریں' : 'Record Receipt'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: QUICK DEBIT / FERTILIZER ON KHATA (ادھار مال اندراج)               */}
      {/* ========================================================================= */}
      <Dialog open={isAddDebitOpen} onOpenChange={setIsAddDebitOpen}>
        <DialogContent className="max-w-xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'ادھار مال کا کھاتہ میں اندراج' : 'Issue Fertilizer on Credit'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu
                ? 'زمیندار کو گودام سے دی گئی کھاد یا زرعی ادویات کا کھاتہ میں اندراج کریں'
                : 'Record fertilizer bags released to farmer on credit terms.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDebit} className="flex-1 flex flex-col overflow-hidden">
            <DialogBody>
              <div className="space-y-4">
                {/* Farmer Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'زمیندار منتخب کریں*' : 'Select Farmer*'}
                  </label>
                  <Select
                    value={debitForm.customerId}
                    onValueChange={(val) => setDebitForm({ ...debitForm, customerId: val })}
                  >
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[42px]">
                      <SelectValue placeholder={isUrdu ? 'زمیندار منتخب کریں...' : 'Choose farmer...'} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.village}) — بقایا: Rs. {c.balance.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Select */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {isUrdu ? 'کھاد / پراڈکٹ*' : 'Fertilizer Product*'}
                  </label>
                  <Select
                    value={debitForm.productId}
                    onValueChange={(val) => {
                      const sel = AVAILABLE_FERTILIZERS.find((p) => p.id === val);
                      setDebitForm({
                        ...debitForm,
                        productId: val,
                        unitPrice: sel ? String(sel.price) : debitForm.unitPrice,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-[42px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white z-[150]">
                      {AVAILABLE_FERTILIZERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — Rs. {p.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity & Unit Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'تعداد (بوریاں)*' : 'Quantity (Bags)*'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={debitForm.quantity}
                      onChange={(e) => setDebitForm({ ...debitForm, quantity: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {isUrdu ? 'فی بوری ریٹ (روپے)*' : 'Rate / Bag (PKR)*'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={debitForm.unitPrice}
                      onChange={(e) => setDebitForm({ ...debitForm, unitPrice: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Grand Total Preview */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300">
                    {isUrdu ? 'کل ادھار اضافہ (Total Debit):' : 'Total Debit Amount:'}
                  </span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    Rs.{' '}
                    {(
                      (Number(debitForm.quantity) || 0) * (Number(debitForm.unitPrice) || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsAddDebitOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition active:scale-95"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-900/30 transition transform active:scale-95"
              >
                {isUrdu ? 'ادھار کھاتہ میں ڈالیں' : 'Issue on Khata'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 4: DETAILED KHATA LEDGER STATEMENT (کھاتہ لیجر و پرچی)                */}
      {/* ========================================================================= */}
      <Dialog open={!!selectedFarmer} onOpenChange={(open) => !open && setSelectedFarmer(null)}>
        <DialogContent className="max-w-4xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          {selectedFarmer && (
            <>
              <DialogHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
                  <div>
                    <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
                      {selectedFarmer.name} — {isUrdu ? 'کھاتہ لیجر' : 'Khata Ledger'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 mt-0.5">
                      {isUrdu ? `ولد: ${selectedFarmer.fatherName}` : `S/O: ${selectedFarmer.fatherName}`} •{' '}
                      {selectedFarmer.village} • {selectedFarmer.phone}
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

                    <a
                      href={getWhatsAppLink(selectedFarmer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              </DialogHeader>

              <DialogBody>
                {/* Top Ledger Snapshot Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      {isUrdu ? 'موجودہ بقایا ادھار' : 'Current Balance'}
                    </span>
                    <span className="text-base font-black text-rose-400 font-mono">
                      {formatCurrency(selectedFarmer.balance)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      {isUrdu ? 'کریڈٹ لمیٹ' : 'Credit Limit'}
                    </span>
                    <span className="text-base font-bold text-slate-200 font-mono">
                      {formatCurrency(selectedFarmer.creditLimit)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      {isUrdu ? 'ضمانتی' : 'Guarantor'}
                    </span>
                    <span className="font-semibold text-slate-200 truncate block">
                      {selectedFarmer.guarantor}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">
                      {isUrdu ? 'وعدہ ادائیگی' : 'Promised Date'}
                    </span>
                    <span className="font-semibold text-amber-300 truncate block">
                      {selectedFarmer.dueDate}
                    </span>
                  </div>
                </div>

                {/* Ledger Transactions Table */}
                <div className="mt-4 rounded-2xl border border-slate-700/80 overflow-hidden bg-slate-800/40">
                  <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      {isUrdu ? 'تاریخ وار لین دین کی تفصیل' : 'Chronological Transaction Records'}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {selectedFarmer.transactions.length} Records
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-800/90 text-slate-400 text-[11px] border-b border-slate-700">
                          <th className="py-2.5 px-3">{isUrdu ? 'تاریخ' : 'Date'}</th>
                          <th className="py-2.5 px-3">{isUrdu ? 'پرچی نمبر' : 'Slip/Inv #'}</th>
                          <th className="py-2.5 px-3">{isUrdu ? 'تفصیل مال / ادائیگی' : 'Description'}</th>
                          <th className="py-2.5 px-3 text-right text-rose-400">
                            {isUrdu ? 'بنام / ادھار (Debit)' : 'Debit (+)'}
                          </th>
                          <th className="py-2.5 px-3 text-right text-emerald-400">
                            {isUrdu ? 'جمع / وصولی (Credit)' : 'Credit (-)'}
                          </th>
                          <th className="py-2.5 px-3 text-right font-bold text-white">
                            {isUrdu ? 'بقایا بیلنس' : 'Running Bal'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {selectedFarmer.transactions.map((tx) => (
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </DialogBody>

              <DialogFooter>
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFarmer(null);
                        openDebitForCustomer(selectedFarmer);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 text-xs font-semibold transition"
                    >
                      + {isUrdu ? 'ادھار مال درج کریں' : 'Add Debit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFarmer(null);
                        openPaymentForCustomer(selectedFarmer);
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 text-xs font-semibold transition"
                    >
                      + {isUrdu ? 'وصولی درج کریں' : 'Receive Payment'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedFarmer(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition active:scale-95"
                  >
                    {isUrdu ? 'بند کریں' : 'Close'}
                  </button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
