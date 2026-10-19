'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../../lib/language-context';
import {
  BookOpen,
  Search,
  Printer,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Users,
  DollarSign,
  FileBarChart2,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  Smartphone,
  Info,
  Loader2,
} from 'lucide-react';

interface ManualSection {
  id: string;
  badge: string;
  titleUrdu: string;
  titleEn: string;
  subtitleUrdu: string;
  subtitleEn: string;
  url: string;
  icon: any;
  color: string;
  bgLight: string;
  steps: Array<{
    headingUrdu: string;
    headingEn: string;
    detailsUrdu: string;
    detailsEn: string;
    keyPoints?: string[];
  }>;
  highlightBox?: {
    title: string;
    content: string;
    type: 'tip' | 'warning' | 'info';
  };
}

// Static definition outside component to avoid reference recreation
const STATIC_SECTIONS: ManualSection[] = [
  {
    id: 'mod-1',
    badge: 'ماڈیول 1',
    titleUrdu: 'سسٹم لاگ ان، کردار اور دکان پروفائل',
    titleEn: 'Login, Staff Roles & Shop Profile',
    subtitleUrdu: 'ای میل لاگ ان، اردو/انگریزی زبان کی تبدیلی اور عملے کے اختیارات',
    subtitleEn: 'System authentication, bilingual Urdu/English RTL switch, and RBAC permissions',
    url: '/login',
    icon: ShieldCheck,
    color: '#059669',
    bgLight: '#ecfdf5',
    steps: [
      {
        headingUrdu: '1. سسٹم میں لاگ ان ہونا',
        headingEn: '1. How to Login',
        detailsUrdu:
          'اپنے کمپیوٹر یا موبائل براؤزر میں سافٹ ویئر کا ایڈریس کھولیں۔ دکان مالک یا منشی اپنا رجسٹرڈ ای میل ایڈریس اور خفیہ پاس ورڈ درج کریں، اور "لاگ ان کریں" کا بٹن دبائیں۔',
        detailsEn:
          'Navigate to the portal URL. Enter your shop email and password. Click Login to access the dashboard.',
        keyPoints: [
          'ڈیمو ایڈمن: admin@fertilizer.pk / Admin@123',
          'منشی لاگ ان: munshi@fertilizer.pk / Munshi@123',
          'کاؤنٹر کیشئر: cashier@fertilizer.pk / Cashier@123',
        ],
      },
      {
        headingUrdu: '2. اردو اور انگریزی زبان کی تبدیلی (RTL Toggle)',
        headingEn: '2. Urdu / English Switch',
        detailsUrdu:
          'اسکرین کے اوپر دائیں یا بائیں کونے میں ایک کلک سے اردو اور انگریزی کے درمیان سوئچ کیا جا سکتا ہے۔ اردو منتخب کرنے پر پورا سافٹ ویئر قلمی نستعلیق (Noto Nastaliq) فونٹ میں دائیں سے بائیں (RTL) ہو جاتا ہے۔',
        detailsEn: 'Toggle between Nastaliq Urdu (RTL) and English (LTR) with one click in the header.',
      },
      {
        headingUrdu: '3. عملے کے مختلف اختیارات (Role Permissions)',
        headingEn: '3. Staff Permissions',
        detailsUrdu:
          'سپر ایڈمن (چچا جی / دکان مالک) تمام رپورٹس، منافع اور خریداری دیکھ سکتے ہیں۔ منشی روزانہ بل، کسان کھاتہ اور اخراجات درج کر سکتا ہے۔ کاؤنٹر سیلزمین صرف بل بنا سکتا ہے۔',
        detailsEn: 'Super Admin (Shop Owner), Munshi (Manager), and Counter Cashier have separate role-based access.',
      },
    ],
  },
  {
    id: 'mod-2',
    badge: 'ماڈیول 2',
    titleUrdu: 'دکان کا مرکزی ڈیش بورڈ اور لائیو میٹرز',
    titleEn: 'Live Dealership Dashboard & KPIs',
    subtitleUrdu: 'آج کی سیل، مارکیٹ کا کل ادھار، کمپنیوں کے واجبات اور کم اسٹاک وارننگ',
    subtitleEn: 'Real-time counters for today sales, farmer credit balance, supplier dues and low stock',
    url: '/dashboard',
    icon: LayoutDashboard,
    color: '#2563eb',
    bgLight: '#eff6ff',
    steps: [
      {
        headingUrdu: '1. اہم لائیو میٹرز (KPI Cards) کو سمجھنا',
        headingEn: '1. Interpreting Live KPIs',
        detailsUrdu:
          'ڈیش بورڈ کھولتے ہی 4 بڑے کارڈز سامنے آتے ہیں: (1) آج کی کل فروخت اور بلوں کی تعداد، (2) زمینداروں کا مارکیٹ میں کل ادھار بقایا اور آج کی وصولی، (3) کھاد کمپنیوں (FFC, Engro) کے واجبات، (4) کم اسٹاک کھاد وارننگ الرٹ۔',
        detailsEn:
          'View real-time daily sales, total receivables (market udhar), company payables, and low stock alert counters.',
      },
      {
        headingUrdu: '2. فوری شارٹ کٹ بٹنز',
        headingEn: '2. Quick Action Buttons',
        detailsUrdu:
          'ڈیش بورڈ کے اوپر دیے گئے بٹنز کے ذریعے فوری طور پر: نیا کاؤنٹر بل بنانا، نیا کسان رجسٹر کرنا، رقم وصولی درج کرنا، یا دکان کا نیا خرچہ ڈالنا ممکن ہے۔',
        detailsEn:
          'Quickly access POS billing, customer registration, payment collection, or expense voucher.',
      },
      {
        headingUrdu: '3. حالیہ فروخت اور کم اسٹاک الرٹ لسٹ',
        headingEn: '3. Recent Sales & Low Stock List',
        detailsUrdu:
          'صفحے کے نیچے آج کے حالیہ بل، گاہک کا نام، خریدی گئی کھاد اور ادائیگی اسٹیٹس (نقد/ادھار) کی تازہ لائیو فیڈ نظر آتی ہے۔',
        detailsEn: 'Monitor recent sales transactions and live alerts for products falling below safety thresholds.',
      },
    ],
  },
  {
    id: 'mod-3',
    badge: 'ماڈیول 3',
    titleUrdu: 'کاؤنٹر سیل، پی او ایس (POS) بلنگ اور 80mm تھرمل پرچی',
    titleEn: 'POS Counter Billing & Thermal Slip',
    subtitleUrdu: 'واک ان یا کھاتے دار کسان، فوری بوری سلیکشن، نقد/ادھار اور تھرمل پرنٹ',
    subtitleEn: 'High-speed counter checkout, partial or credit billing, instant bag deduction and 80mm receipts',
    url: '/dashboard/pos',
    icon: ShoppingCart,
    color: '#059669',
    bgLight: '#ecfdf5',
    steps: [
      {
        headingUrdu: '1. گاہک کی قسم کا انتخاب (Customer Selection)',
        headingEn: '1. Select Customer Type',
        detailsUrdu:
          'کاؤنٹر پر دو طرح کے گاہک ہوتے ہیں: (الف) واک ان کسان: جو نقد پیسے دے کر کھاد کی بوری لے جائے، اس کے لیے "عام واک ان کسان" منتخب کریں۔ (ب) کھاتے دار زمیندار: جس کے کھاتے میں ادھار لکھنا ہو، سرچ بار میں اس کا نام یا فون نمبر لکھ کر منتخب کریں۔',
        detailsEn: 'Choose between Walk-in Cash Farmer or select a registered Khata Farmer to allow credit billing.',
      },
      {
        headingUrdu: '2. کھاد ٹوکری (Cart) میں شامل کرنا',
        headingEn: '2. Adding Bags to Cart',
        detailsUrdu:
          'سامنے موجود کھادوں (یوریا، ڈی اے پی، گوارا، پوٹاش) پر کلک کریں۔ بوریوں کی تعداد بڑھانے یا کم کرنے کے لیے + یا - دبائیں یا سیدھا تعداد ٹائپ کریں۔ ہر کھاد کا سرکاری سیل ریٹ اور گودام میں موجود بوریوں کی تعداد موقع پر نظر آتی ہے۔',
        detailsEn:
          'Click product cards or scan barcode to add fertilizer bags to the cart. Real-time rates and available godown stock are displayed.',
      },
      {
        headingUrdu: '3. ادائیگی کے طریقے (نقد، ادھار، جزوی ادائیگی)',
        headingEn: '3. Payment Modes & Split Payment',
        detailsUrdu:
          'مکمل نقد (Full Cash)، مکمل ادھار (Full Credit)، یا جزوی ادائیگی (Partial Payment) منتخب کریں۔ مثال: اگر کل بل 100,000 روپے بنا اور زمیندار نے 30,000 روپے دیے، تو 70,000 روپے خود بخود کسان کے کھاتے میں ڈیبٹ (نام) لکھ دیے جائیں گے۔',
        detailsEn: 'Support Full Cash, Full Credit, or Partial Payment (remaining automatically posted to farmer ledger).',
      },
      {
        headingUrdu: '4. خودکار بوری کٹوتی اور 80mm تھرمل بل پرچی',
        headingEn: '4. Instant Stock Deduction & Thermal Print',
        detailsUrdu:
          '"بل مکمل کریں" دبانے پر گودام سے بوریاں فوراً کم ہو جاتی ہیں اور اسکرین پر روایتی 80mm دکانداری پرچی آ جاتی ہے جس پر دکان کا نام، گاہک، خریدی گئی کھادیں، ریٹ، ادا شدہ رقم اور نیا بقایا کھاتہ درج ہوتا ہے۔',
        detailsEn: 'Real-time atomic stock reduction with automatic 80mm/58mm thermal receipt generation.',
      },
    ],
    highlightBox: {
      title: 'منشی ٹپ (POS Keyboard Shortcut)',
      content: 'تیز رفتار بلنگ کے لیے: سرچ بار میں F2 یا ڈائریکٹ ٹائپ کریں، تعداد تبدیل کریں اور Enter دبا کر بل مکمل کریں۔',
      type: 'tip',
    },
  },
  {
    id: 'mod-4',
    badge: 'ماڈیول 4',
    titleUrdu: 'کھاد گودام، پراڈکٹس اور پھٹی بوری اسٹاک ایڈجسٹمنٹ',
    titleEn: 'Fertilizer Products & Stock Adjustments',
    subtitleUrdu: 'نئی کھاد، کمپنی، خریداری/سیل ریٹ، کم اسٹاک الرٹ اور پھٹی بوری اندراج',
    subtitleEn: 'Manage fertilizer catalog, cost/sale pricing, minimum alert thresholds, and damaged bag adjustments',
    url: '/dashboard/products',
    icon: Package,
    color: '#d97706',
    bgLight: '#fef3c7',
    steps: [
      {
        headingUrdu: '1. نئی کھاد یا زرعی ادویات شامل کرنا',
        headingEn: '1. Add New Fertilizer Item',
        detailsUrdu:
          '"نئی کھاد شامل کریں" دبائیں اور تفصیلات درج کریں: کھاد کا نام (انگریزی و اردو)، کمپنی (FFC, Engro, Fatima, FMC وغیرہ)، کیٹگری (یوریا، ڈی اے پی، پوٹاش، کیمیکل، بیج)، خریداری لاگت ریٹ، کاؤنٹر سیل ریٹ، الرٹ کی حد، اور گودام کی لوکیشن۔',
        detailsEn:
          'Enter Urdu/English product name, manufacturer, unit (50kg bag), cost price, sale price, and minimum alert quantity.',
      },
      {
        headingUrdu: '2. پھٹی بوری اور اسٹاک ایڈجسٹمنٹ (Torn/Damaged Bags)',
        headingEn: '2. Stock Adjustment & Damaged Bags',
        detailsUrdu:
          'ٹرک اتروائی کے دوران بوری پھٹ جانے، نمی سے کھاد خراب ہونے یا گنتی کے فرق کی صورت میں ہر کھاد کے سامنے "اسٹاک ایڈجسٹمنٹ" کا بٹن دبائیں۔ وجہ منتخب کریں اور تعداد درج کر کے تصدیق کریں۔',
        detailsEn: 'Record torn bags, moisture damage, physical audit differences with detailed adjustment audit trail.',
      },
      {
        headingUrdu: '3. کم اسٹاک الرٹ فلٹر (Low Stock Filter)',
        headingEn: '3. Low Stock Safety Warning',
        detailsUrdu:
          'جن کھادوں کی بوریاں ختم ہونے کے قریب ہوں وہ فہرست میں سرخ رنگ کے بیج کے ساتھ نظر آتی ہیں تاکہ مال ختم ہونے سے پہلے نیا ٹرک آرڈر کیا جا سکے۔',
        detailsEn: 'Visual red badges highlight low stock items requiring immediate reorder from suppliers.',
      },
    ],
  },
  {
    id: 'mod-5',
    badge: 'ماڈیول 5',
    titleUrdu: 'سپلائرز، کمپنیوں کا مال اور ٹرک بلٹی خریداری',
    titleEn: 'Suppliers & Incoming Truck Purchases',
    subtitleUrdu: 'کمپنیوں کے نام، ٹرک بلٹی انوائس، گودام میں مال کی آمد اور وینڈر کھاتہ',
    subtitleEn: 'Register fertilizer companies, log incoming truck consignments, bilty numbers, and supplier ledger dues',
    url: '/dashboard/purchases',
    icon: Truck,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    steps: [
      {
        headingUrdu: '1. سپلائر / کھاد کمپنی بنانا (Add Vendor)',
        headingEn: '1. Register Supplier Company',
        detailsUrdu:
          'فوجی فرٹیلائزر (FFC)، اینگرو، فاطمہ فرٹیلائزر یا لوکل ڈسٹری بیوٹرز کو رجسٹر کریں۔ ان کا فون، شہر، اور اگر کوئی پرانا سابقہ واجب الادا بیلنس ہو تو وہ درج کریں۔',
        detailsEn: 'Maintain records for fertilizer manufacturers and local distributors along with credit balances.',
      },
      {
        headingUrdu: '2. نئے ٹرک کی خریداری کا اندراج (Record Inward Stock)',
        headingEn: '2. Record Truck Inward Consignment',
        detailsUrdu:
          '"نئی خریداری درج کریں" دبائیں۔ سپلائر منتخب کریں، بلٹی یا ٹرک نمبر لکھیں (مثلاً BILTY-8842 / ٹرک TK-512)۔ اتری ہوئی کھاد کی قسم، بوریوں کی تعداد، اور فی بوری خریداری ریٹ درج کریں۔',
        detailsEn: 'Select vendor, input bilty/truck number, product line items, bag quantities, and cost rates.',
      },
      {
        headingUrdu: '3. کمپنی کو ادائیگی اور گودام اسٹاک میں خودکار اضافہ',
        headingEn: '3. Payment & Automatic Stock-In',
        detailsUrdu:
          'اگر فیکٹری کو بینک سے ڈرافٹ یا پے آرڈر دیا گیا ہے تو ادا شدہ رقم درج کریں۔ بقایا رقم سپلائر کے کھاتے میں خودکار طریقے سے کریڈٹ ہو جائے گی اور گودام میں بوریاں فوری شامل ہو جائیں گی۔',
        detailsEn:
          'Log cash or bank payments to suppliers. The remaining balance updates the vendor ledger and godown bags increase atomically.',
      },
    ],
  },
  {
    id: 'mod-6',
    badge: 'ماڈیول 6',
    titleUrdu: 'کسان و زمیندار کھاتہ، وصولی، واٹس ایپ اور تھرمل رسید',
    titleEn: 'Farmers, Unified Khata Ledger, Recovery & WhatsApp',
    subtitleUrdu: 'نیا زمیندار رجسٹریشن، کریڈٹ لمیٹ الرٹ، جامع کھاتہ، رقم وصولی اور 80mm پرچی',
    subtitleEn:
      'Farmer profile, land acreage, guarantor, unified debit/credit running ledger, 80mm recovery receipt and 1-click WhatsApp reminder',
    url: '/dashboard/customers',
    icon: Users,
    color: '#059669',
    bgLight: '#ecfdf5',
    steps: [
      {
        headingUrdu: '1. نیا کسان اور زمیندار رجسٹریشن (Add New Farmer)',
        headingEn: '1. Farmer Registration Form',
        detailsUrdu:
          '"نیا زمیندار رجسٹر کریں" بٹن دبائیں اور فارم مکمل کریں: (1) کسان کا نام، (2) ولدیت، (3) چک یا گاؤں (مثلاً چک نمبر 45/12L)، (4) موبائل نمبر، (5) شناختی کارڈ، (6) کل رقبہ / زمین ایکڑ میں، (7) موجودہ فصل (گندم، کپاس، چاول)، (8) ضمانتی کا نام و فون، (9) ادھار کی زیادہ سے زیادہ حد (کریڈٹ لمٹ)، اور (10) پرانے رجسٹر کا سابقہ بقایا۔',
        detailsEn:
          'Capture farmer name, father name, village/chak, phone, CNIC, land acreage, seasonal crop, guarantor name/phone, credit limit and opening balance.',
        keyPoints: [
          'چک یا گاؤں کا درست اندراج ضروری ہے تاکہ ہم نام زمینداروں میں مغالطہ نہ ہو',
          'ضمانتی کا موبائل نمبر ایمرجنسی میں رابطہ کے کام آتا ہے',
          'کریڈٹ لمٹ طے کرنے سے ادھار کنٹرول میں رہتا ہے',
        ],
      },
      {
        headingUrdu: '2. کریڈٹ لمیٹ الرٹ وارننگ (Over-Limit Warning)',
        headingEn: '2. Credit Limit Warning Badge',
        detailsUrdu:
          'اگر کسی زمیندار کا ادھار اس کی طے شدہ حد سے تجاوز کر جائے تو اس کے نام کے ساتھ نمایاں سرخ رنگ کا بیج (حد سے تجاوز - Over Limit) ظاہر ہوتا ہے۔ منشی کو فوری وارننگ ملتی ہے کہ مالک کی اجازت کے بغیر نیا مال ادھار نہ دیا جائے۔',
        detailsEn: 'Visual red badges warn staff if a farmer owes more than his approved credit limit.',
      },
      {
        headingUrdu: '3. جامع کھاتہ لیجر (Unified Khata Ledger)',
        headingEn: '3. Unified Running Khata Ledger',
        detailsUrdu:
          'کسی بھی زمیندار پر کلک کرنے سے اس کا اصلی دیسی کھاتہ لیجر کھل جاتا ہے: نام / ڈیبٹ (کسان نے کتنی بوریاں ادھار لیں)، جمع / کریڈٹ (کسان نے کتنی رقم ادا کی)، اور چلتا میزان (Running Balance)۔ ساتھ ہی بلٹی و رسید نمبر اور کھاتہ اسٹیٹمنٹ پرنٹ کرنے کا بٹن موجود ہے۔',
        detailsEn:
          'Interactive ledger displaying date-wise purchases (debit), recovery payments (credit), and running balance with print support.',
      },
      {
        headingUrdu: '4. رقم وصولی اندراج (Payment Collection)',
        headingEn: '4. Record Payment Collection',
        detailsUrdu:
          'جب کسان پیسے جمع کرانے آئے تو "وصولی درج کریں" دبائیں۔ زمیندار منتخب کریں، رقم درج کریں، اور وصولی کا طریقہ منتخب کریں: کاؤنٹر کیش، بینک ٹرانسفر، یا چیک۔',
        detailsEn: 'Collect payments via cash, bank transfer, or cheque, atomically updating the running balance.',
      },
      {
        headingUrdu: '5. 80mm تھرمل وصولی پرچی (Thermal Slip)',
        headingEn: '5. 80mm Thermal Recovery Slip',
        detailsUrdu:
          'وصولی ہوتے ہی خودکار طور پر تھرمل پرچی کھل جاتی ہے جس پر دکان کا نام، رسید نمبر، کسان کا نام، وصول شدہ رقم، سابقہ بقایا اور نیا واجب الادا بیلنس لکھا ہوتا ہے۔ ایک کلک سے تھرمل پرنٹر سے پرچی کسان کو دی جا سکتی ہے۔',
        detailsEn:
          'Print instant 80mm recovery receipt showing amount received, previous balance, and new remaining balance.',
      },
      {
        headingUrdu: '6. 1-Click WhatsApp Reminder (ایک کلک واٹس ایپ میسج)',
        headingEn: '6. 1-Click WhatsApp Reminder',
        detailsUrdu:
          'کسان کارڈ کے سامنے واٹس ایپ کے آئیکون پر کلک کریں۔ سسٹم خود بخود اس کسان کے موبائل نمبر پر باوقار اردو میسج تیار کر کے واٹس ایپ کھول دیتا ہے جس میں اس کا کل بقایا روپے درج ہوتا ہے۔',
        detailsEn:
          'Automatically construct polite Urdu recovery reminder with exact pending balance and launch WhatsApp in 1 click.',
      },
    ],
    highlightBox: {
      title: 'واٹس ایپ خودکار میسج کا نمونہ (Sample Text)',
      content:
        'محترم چوہدری نذیر احمد وٹو صاحب، السلام علیکم! پنجاب کھاد ایجنسی کی طرف آپ کا کھاد و زرعی ادویات کا کل واجب الادا بقایا کھاتہ Rs. 650,000 ہے۔ برائے مہربانی تشریف لا کر حساب کلیئر فرمائیں۔ شکریہ!',
      type: 'info',
    },
  },
  {
    id: 'mod-7',
    badge: 'ماڈیول 7',
    titleUrdu: 'روزانہ دکان کے اخراجات، پلے داری اور واؤچر پرچی',
    titleEn: 'Daily Shop Expenses, Labour & Cash Vouchers',
    subtitleUrdu: 'پلے داری لوڈنگ، لوکل کرایہ، چائے پانی، کرایہ اور پرنٹ ایبل کیش واؤچر',
    subtitleEn: 'Track labour/palledari per bag, freight transport, tea refreshment, rent, utilities and official voucher slips',
    url: '/dashboard/expenses',
    icon: DollarSign,
    color: '#dc2626',
    bgLight: '#fef2f2',
    steps: [
      {
        headingUrdu: '1. دکان کے دیسی اخراجات کے زمرے (Categories)',
        headingEn: '1. Expense Categories',
        detailsUrdu:
          'سسٹم میں کھاد دکان کی تمام ضروری کیٹگریز موجود ہیں: (1) پلے داری و لوڈنگ (مزدوروں کی فی بوری اجرت)، (2) لوکل ٹرانسپورٹ کرایہ (چنگچی، ٹریکٹر ٹرالی)، (3) چائے، کھانا و مہمان نوازی، (4) دکان و گودام کرایہ، (5) واپڈا بجلی بلز، (6) ملازمین تنخواہ، اور (7) پیٹرول و سفر۔',
        detailsEn: 'Categorize shop outflows: Labour/Palledari, Freight, Refreshments, Rent, Electricity, Staff Salary, Fuel.',
      },
      {
        headingUrdu: '2. نیا خرچہ درج کرنا (Record Expense)',
        headingEn: '2. Record Expense Outflow',
        detailsUrdu:
          '"نیا خرچہ درج کریں" دبائیں۔ کیٹگری منتخب کریں، خرچے کی تفصیل لکھیں، رقم درج کریں اور بتائیں کہ کیش دراز سے دیا گیا یا بینک سے۔',
        detailsEn: 'Specify expense category, description, amount, payment method (cash/bank), and staff member name.',
      },
      {
        headingUrdu: '3. آفیشل پرنٹ ایبل خرچہ واؤچر پرچی (Print Voucher)',
        headingEn: '3. Official Printable Expense Voucher',
        detailsUrdu:
          'ہر خرچے کے سامنے پرنٹر کا بٹن دیا گیا ہے۔ کلک کرنے پر باقاعدہ دفتری واؤچر پرچی پرنٹ ہو جاتی ہے جس پر وصول کنندہ مزدور کے دستخط یا انگوٹھا لیا جا سکتا ہے۔',
        detailsEn: 'Print a clean official expense voucher for signature/thumb impression of labourers or payees.',
      },
      {
        headingUrdu: '4. اخراجات کا فیصد بار (Breakdown Bar)',
        headingEn: '4. Visual Category Distribution',
        detailsUrdu:
          'ڈیش بورڈ پر رنگین بار چارٹ دکھاتا ہے کہ آج یا اس مہینے سب سے زیادہ پیسہ کس مد میں خرچ ہوا (مثلاً 55% پلے داری، 20% ٹرانسپورٹ وغیرہ)۔',
        detailsEn: 'Interactive visual progress bar illustrating percentage distribution of dealership expenses.',
      },
    ],
  },
  {
    id: 'mod-8',
    badge: 'ماڈیول 8',
    titleUrdu: 'منشی روزنامچہ (Daily Cash Book) اور منافع آڈٹ رپورٹس',
    titleEn: 'Munshi Roznamcha & Profit/Loss Audit Reports',
    subtitleUrdu: 'شام کی کیش دراز بک، نفع و نقصان، گودام اسٹاک مالیت اور مارکیٹ ادھار آڈٹ',
    subtitleEn: 'Evening Cash In/Out book, P&L statement, godown inventory valuation, and market debtor recovery audit',
    url: '/dashboard/reports',
    icon: FileBarChart2,
    color: '#0284c7',
    bgLight: '#f0f9ff',
    steps: [
      {
        headingUrdu: '1. منشی روزنامچہ کیش بک (Daily Munshi Roznamcha)',
        headingEn: '1. Daily Munshi Cash Book',
        detailsUrdu:
          'روایتی منشی کا سب سے پسندیدہ ماڈیول: (1) کل کیش ان (کاؤنٹر کی نقد فروخت + کسانوں سے وصولی)، (2) کل کیش آؤٹ (فیکٹریوں کو ادائیگی + دکان کے اخراجات و پلے داری)، (3) گلے کا خالص کیش یعنی شام کو دراز میں جتنے پیسے ہونے چاہییں۔',
        detailsEn:
          'Audit evening cash drawer: Total Inflows (Sales + Recoveries), Total Outflows (Supplier payments + Palledari), and net cash in hand.',
      },
      {
        headingUrdu: '2. نفع و نقصان کا تخمینہ (Profit & Loss Statement)',
        headingEn: '2. Profit & Loss (P&L)',
        detailsUrdu:
          'کل آمدنی منفی کھاد کی خریداری لاگت = مجموعی منافع۔ اس میں سے تمام دکان اخراجات نکال کر دکان کا اصل خالص منافع ظاہر ہوتا ہے۔',
        detailsEn: 'Calculate Revenue, Cost of Goods Sold, Gross Margin, Operating Expenses, and Net Profit.',
      },
      {
        headingUrdu: '3. گودام مال کی مالیت (Godown Stock Valuation)',
        headingEn: '3. Godown Stock Valuation',
        detailsUrdu:
          'گودام میں موجود کل بوریوں کی تعداد، خریداری لاگت کے مطابق گودام میں بند کل رقم، اور موجودہ مارکیٹ ریٹ پر بیچنے کی صورت میں متوقع منافع۔',
        detailsEn: 'Audit total bags in godown, purchase cost asset value, market sales value, and potential future profit.',
      },
      {
        headingUrdu: '4. مارکیٹ ادھار آڈٹ (Market Udhar Aging & Debtors)',
        headingEn: '4. Market Udhar Aging',
        detailsUrdu:
          'مارکیٹ میں پھنسے کل ادھار کا خلاصہ، سب سے بڑے مقروض زمینداروں کی فہرست، اور حالیہ دنوں میں ہونے والی وصولیوں کا تفصیلی ریکارڈ۔',
        detailsEn: 'Overview of total market credit exposure, top debtors list, and recent recovery timeline.',
      },
    ],
  },
  {
    id: 'mod-9',
    badge: 'ماڈیول 9',
    titleUrdu: 'کھاد کمپنیوں کا سیلف سروس سپلائر پورٹل',
    titleEn: 'Vendor & Fertilizer Manufacturers Portal',
    subtitleUrdu: 'بلٹی ٹریکنگ، ڈیجیٹل کھاتہ اسٹیٹمنٹ، سرکاری ریٹ ریویژن اور ایڈوانس ڈسپیچ نوٹس',
    subtitleEn: 'Bilty tracking, digital ledger statement, official rate updates, and advance truck notices',
    url: '/dashboard/vendors/portal',
    icon: Truck,
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    steps: [
      {
        headingUrdu: '1. کمپنی سوئچر (Multi-Vendor Switcher)',
        headingEn: '1. Multi-Vendor Switcher',
        detailsUrdu: 'ڈراپ ڈاؤن سے فوجی فرٹیلائزر FFC، اینگرو، فاطمہ کھاد یا سوات ایگرو کا پورٹل 1 سیکنڈ میں کھولیں۔',
        detailsEn: 'Quickly toggle between fertilizer manufacturers and distributors to review their dedicated account.',
      },
      {
        headingUrdu: '2. ٹرک کنسائنمنٹس و بلٹی ٹریکنگ (Bilty Tracking)',
        headingEn: '2. Truck Bilty Tracking',
        detailsUrdu: 'گاڑی نمبر، بلٹی نمبر، بوریوں کی تعداد، ادائیگی کی کیفیت (ادا شدہ / بقایا) کا لائیو ریکارڈ دیکھیں۔',
        detailsEn: 'Track all arriving trucks, bilty numbers, vehicle numbers, bag quantities, and clearance status.',
      },
      {
        headingUrdu: '3. لائیو ڈیجیٹل کھاتہ اسٹیٹمنٹ پرنٹ (Digital Statement)',
        headingEn: '3. Print Khata Statement',
        detailsUrdu: 'فیکٹری سپلائی ڈیبٹ اور بینک ٹرانسفر کریڈٹ کا مکمل رننگ بیلنس اور 1-کلک پرنٹ ایبل دفتری اسٹیٹمنٹ۔',
        detailsEn: 'Audit chronological supplies, bank transfers, and generate an official printable statement.',
      },
      {
        headingUrdu: '4. ریٹ ریویژن اور ٹرک ڈسپیچ نوٹس (Rate & Dispatch Notices)',
        headingEn: '4. Advance Dispatch & Rate Revisions',
        detailsUrdu: 'فیکٹری سے نیا ریٹ جاری ہونے پر نوٹیفکیشن اور ٹرک روانہ ہوتے ہی گودام تیاری کے لیے ایڈوانس ڈسپیچ فارم۔',
        detailsEn: 'Send official price revision circulars and advance truck dispatch notices to shop godown.',
      },
    ],
  },
  {
    id: 'mod-10',
    badge: 'ماڈیول 10',
    titleUrdu: 'موبائل ایپ (کاؤنٹر سیلزمین و گودام بارکوڈ اسکینر)',
    titleEn: 'Cross-Platform Mobile App (POS & Godown Barcode Scanner)',
    subtitleUrdu: 'بغیر انٹرنیٹ آف لائن بلنگ، کیمرہ بارکوڈ اسکینر، کسان کھاتہ اور بلوٹوتھ تھرمل پرچی',
    subtitleEn: 'Offline billing, camera bag barcode scanner, farmer khata lookups, and Bluetooth slips',
    url: '/dashboard/pos',
    icon: Smartphone,
    color: '#059669',
    bgLight: '#ecfdf5',
    steps: [
      {
        headingUrdu: '1. تیز کاؤنٹر موبائل بلنگ (Rapid Bag Multiplier POS)',
        headingEn: '1. Fast Mobile POS Billing',
        detailsUrdu: 'سونا یوریا، ڈی اے پی کے لیے فوری بوری بٹن (+1، +5، +10، +50 بوری) اور نقد و ادھار کسان کا فوری انتخاب۔',
        detailsEn: 'One-touch bag increment buttons (+1, +5, +10, +50 bags) for high-speed counter sales on mobile.',
      },
      {
        headingUrdu: '2. کیمرہ بارکوڈ اسکینر (Rapid Bag Counting Scanner)',
        headingEn: '2. Camera Barcode Scanner',
        detailsUrdu: 'کھاد کی بوری کا بارکوڈ اسکین کریں: ٹرک سے اتارائی (Inward +Bags) یا ٹرالی لوڈنگ (Outward -Bags) فوری درج کریں۔',
        detailsEn: 'Scan bag barcodes with targeting viewfinder for inward truck delivery and outward trolley loading.',
      },
      {
        headingUrdu: '3. کسان کھاتہ، 1-ٹیپ وصولی اور واٹس ایپ (Farmer Khata & 1-Tap Recovery)',
        headingEn: '3. Instant Khata Lookup & WhatsApp Reminder',
        detailsUrdu: 'کسان کا بقایا میزان فوراً دیکھیں، موقع پر نقد وصولی درج کریں اور 1 کلک پر واٹس ایپ یاد دہانی بھیجیں۔',
        detailsEn: 'Lookup farmer balance, record cash recovery instantly, and trigger pre-formatted WhatsApp reminders.',
      },
      {
        headingUrdu: '4. آف لائن بلنگ اور سنک کیو (Offline Mode & Cloud Sync)',
        headingEn: '4. Offline Rural Billing & Sync',
        detailsUrdu: 'دیہات میں جہاں انٹرنیٹ نہ ہو وہاں ایپ آف لائن بل بناتی ہے، اور انٹرنیٹ بحال ہوتے ہی تمام بل کلاؤڈ پر سنک ہو جاتے ہیں۔',
        detailsEn: 'Full offline billing queue stored locally with one-tap cloud sync when internet is restored.',
      },
    ],
  },
];

export default function GuidePage() {
  const { isUrdu } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'mod-1': true,
    'mod-2': true,
    'mod-3': true,
    'mod-4': true,
    'mod-5': true,
    'mod-6': true,
    'mod-7': true,
    'mod-8': true,
    'mod-9': true,
    'mod-10': true,
    'mod-faq': true,
  });
  const [copiedText, setCopiedText] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    STATIC_SECTIONS.forEach((s) => (allExpanded[s.id] = true));
    allExpanded['mod-faq'] = true;
    setExpandedSections(allExpanded);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const copyWhatsAppSample = () => {
    const text =
      'محترم چوہدری نذیر احمد وٹو صاحب،\nالسلام علیکم! پنجاب کھاد ایجنسی کی طرف آپ کا کھاد و زرعی ادویات کا کل واجب الادا بقایا کھاتہ Rs. 650,000 ہے۔ برائے مہربانی تشریف لا کر حساب کلیئر فرمائیں۔ شکریہ!';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  // Filtered Sections
  const filteredSections = useMemo(() => {
    return STATIC_SECTIONS.filter((sec) => {
      const matchesCat = selectedCategory === 'all' || sec.id === selectedCategory;

      if (!matchesCat) return false;

      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      const matchTitle =
        sec.titleUrdu.toLowerCase().includes(q) ||
        sec.titleEn.toLowerCase().includes(q) ||
        sec.subtitleUrdu.toLowerCase().includes(q) ||
        sec.subtitleEn.toLowerCase().includes(q);

      const matchSteps = sec.steps.some(
        (st) =>
          st.headingUrdu.toLowerCase().includes(q) ||
          st.headingEn.toLowerCase().includes(q) ||
          st.detailsUrdu.toLowerCase().includes(q) ||
          st.detailsEn.toLowerCase().includes(q) ||
          (st.keyPoints && st.keyPoints.some((kp) => kp.toLowerCase().includes(q))),
      );

      return matchTitle || matchSteps;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div translate="no" className="notranslate space-y-6 pb-12" suppressHydrationWarning>
      {/* ========================================================================= */}
      {/* 1. Header Banner                                                          */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'مکمل سسٹم یوزر مینوئل و دکانداری گائیڈ' : 'Official System Manual & Operating Guide'}</span>
              <span className="bg-emerald-400 text-emerald-950 text-[10px] px-1.5 py-0.5 rounded font-extrabold">v1.0</span>
            </div>

            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'کھاد ڈیلرشپ یوزر مینوئل و آپریٹنگ گائیڈ' : 'Fertilizer Dealership User Manual'}
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              {isUrdu
                ? 'دکان مالک (چچا جی) اور منشی کے لیے مکمل تصویری و تحریری رہنمائی۔ تمام 8 ماڈیولز، کاؤنٹر سیل، کسان کھاتہ، وصولی، پلے داری اور روزنامچہ کی مرحلہ وار گائیڈ۔'
                : 'Exhaustive step-by-step operating documentation for shop owner and inventory managers across all 8 modules.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold flex items-center gap-2 backdrop-blur-sm transition active:scale-95 shadow-sm"
              title="پرنٹ مینوئل / Print Guide"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span suppressHydrationWarning>{isUrdu ? 'پرنٹ مینوئل' : 'Print Guide'}</span>
            </button>

            <Link
              href="/dashboard/pos"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span suppressHydrationWarning>{isUrdu ? 'پی او ایس کاؤنٹر' : 'Open POS'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Search & Category Filters                                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              suppressHydrationWarning
              placeholder={
                isUrdu
                  ? 'مینوئل میں تلاش کریں (مثلاً: وصولی، پلے داری، واٹس ایپ، بوری، کریڈٹ لمٹ...)'
                  : 'Search guide (e.g. wasooli, palledari, whatsapp, thermal slip...)'
              }
              className="w-full ps-9 pe-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Expand/Collapse All buttons */}
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={expandAll}
              className="text-xs px-2.5 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 font-medium transition"
            >
              <span>{isUrdu ? 'تمام کھولیں' : 'Expand All'}</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-xs px-2.5 py-1.5 rounded-md text-slate-600 hover:bg-slate-100 font-medium transition"
            >
              <span>{isUrdu ? 'تمام بند کریں' : 'Collapse All'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{isUrdu ? 'تمام ماڈیولز' : 'All Modules'}</span>
          </button>
          {STATIC_SECTIONS.map((sec) => (
            <button
              key={`filter-${sec.id}`}
              type="button"
              onClick={() => setSelectedCategory(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCategory === sec.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{isUrdu ? sec.titleUrdu.split('،')[0] : sec.titleEn.split('&')[0]}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelectedCategory('mod-faq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'mod-faq'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>{isUrdu ? 'اہم سوالات و شارٹ کٹس' : 'FAQs & Tips'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. Guide Sections List                                                    */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {filteredSections.map((sec) => {
          const Icon = sec.icon;
          const isExpanded = !!expandedSections[sec.id];

          return (
            <div
              key={`section-card-${sec.id}`}
              id={sec.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Header Bar */}
              <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className="flex items-center gap-3.5 min-w-0 text-start flex-1"
                >
                  <div
                    style={{ backgroundColor: sec.bgLight, color: sec.color }}
                    className="p-3 rounded-xl flex-shrink-0 shadow-sm"
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                        {sec.badge}
                      </span>
                      <h2
                        className={`text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate ${
                          isUrdu ? 'font-urdu' : ''
                        }`}
                      >
                        {isUrdu ? sec.titleUrdu : sec.titleEn}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {isUrdu ? sec.subtitleUrdu : sec.subtitleEn}
                    </p>
                  </div>
                </button>

                {/* Right controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={sec.url}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200/60 transition active:scale-95"
                  >
                    <span>{isUrdu ? 'پیج کھولیں' : 'Open Page'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Section Body */}
              {isExpanded && (
                <div className="p-4 sm:p-6 space-y-5 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sec.steps.map((st, sIdx) => (
                      <div
                        key={`${sec.id}-step-${sIdx}`}
                        className="p-4 rounded-xl border border-slate-150 bg-slate-50/60 space-y-2.5 hover:border-slate-300 transition"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <h3
                            className={`text-sm font-bold text-slate-900 ${
                              isUrdu ? 'font-urdu' : ''
                            }`}
                          >
                            {isUrdu ? st.headingUrdu : st.headingEn}
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                          {isUrdu ? st.detailsUrdu : st.detailsEn}
                        </p>

                        {st.keyPoints && st.keyPoints.length > 0 && (
                          <div className="pt-2 border-t border-slate-200/60 space-y-1">
                            {st.keyPoints.map((kp, kIdx) => (
                              <div key={`${sec.id}-step-${sIdx}-kp-${kIdx}`} className="flex items-start gap-1.5 text-xs text-slate-700">
                                <span className="text-emerald-600 font-bold">•</span>
                                <span>{kp}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {sec.highlightBox && (
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        sec.highlightBox.type === 'tip'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-blue-50 border-blue-200 text-blue-900'
                      }`}
                    >
                      <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                      <div className="space-y-1 text-xs sm:text-sm">
                        <div className="font-extrabold">{sec.highlightBox.title}</div>
                        <div className="leading-relaxed font-sans">{sec.highlightBox.content}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ========================================================================= */}
        {/* 4. WhatsApp Copy & FAQs                                                   */}
        {/* ========================================================================= */}
        {(selectedCategory === 'all' || selectedCategory === 'mod-faq') && (
          <div
            key="section-card-mod-faq"
            id="mod-faq"
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
          >
            <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition border-b border-slate-100">
              <button
                type="button"
                onClick={() => toggleSection('mod-faq')}
                className="flex items-center gap-3.5 text-start flex-1"
              >
                <div className="p-3 rounded-xl bg-purple-50 text-purple-700 shadow-sm">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={`text-base sm:text-lg font-extrabold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                    {isUrdu ? 'اہم دیسی نکات، واٹس ایپ ٹیمپلیٹ اور شارٹ کٹس' : 'FAQs, WhatsApp Template & Shortcuts'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isUrdu
                      ? 'کسان کو یاد دہانی کا خودکار میسج، انٹرنیٹ بندش، اور کی بورڈ شارٹ کٹس'
                      : 'Copyable recovery message, offline handling, and cashier keybindings'}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => toggleSection('mod-faq')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition"
              >
                {expandedSections['mod-faq'] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {expandedSections['mod-faq'] && (
              <div className="p-4 sm:p-6 space-y-6 bg-white">
                {/* 1. WhatsApp Template Card */}
                <div className="p-4 sm:p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-emerald-700" />
                      <h3 className="text-sm font-bold text-emerald-950 font-urdu">
                        {isUrdu ? 'کسان وصولی واٹس ایپ کا شائستہ پیغام (Sample WhatsApp Message)' : 'Sample WhatsApp Text'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={copyWhatsAppSample}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText ? (isUrdu ? 'کاپی ہو گیا!' : 'Copied!') : (isUrdu ? 'میسج کاپی کریں' : 'Copy Text')}</span>
                    </button>
                  </div>

                  <div className="bg-white p-3.5 rounded-lg border border-emerald-200/80 text-sm font-urdu leading-relaxed text-slate-800 space-y-1">
                    <p>محترم چوہدری نذیر احمد وٹو صاحب،</p>
                    <p>
                      السلام علیکم! پنجاب کھاد ایجنسی کی طرف آپ کا کھاد و زرعی ادویات کا کل واجب الادا بقایا کھاتہ{' '}
                      <span className="font-bold text-emerald-700">Rs. 650,000</span> ہے۔ برائے مہربانی تشریف لا کر حساب کلیئر فرمائیں۔ شکریہ!
                    </p>
                  </div>
                  <p className="text-xs text-emerald-800">
                    💡 کسان کھاتہ پیج پر واٹس ایپ بٹن دبانے سے یہ میسج ہر کسان کے ذاتی بقایا کے ساتھ خودکار تیار ہو جاتا ہے۔
                  </p>
                </div>

                {/* 2. Key Shortcuts Table */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 font-urdu">
                    {isUrdu ? 'کی بورڈ شارٹ کٹس (Keyboard Shortcuts for Cashier)' : 'Cashier Shortcuts'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="font-semibold text-slate-700">سیل مکمل / سبمٹ</span>
                      <kbd className="px-2 py-1 bg-white border border-slate-300 rounded shadow-xs font-mono font-bold text-slate-800">Enter</kbd>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="font-semibold text-slate-700">کھڑکی بند کرنا</span>
                      <kbd className="px-2 py-1 bg-white border border-slate-300 rounded shadow-xs font-mono font-bold text-slate-800">Esc</kbd>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <span className="font-semibold text-slate-700">پرچی پرنٹ کرنا</span>
                      <kbd className="px-2 py-1 bg-white border border-slate-300 rounded shadow-xs font-mono font-bold text-slate-800">Ctrl + P</kbd>
                    </div>
                  </div>
                </div>

                {/* 3. Common FAQs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                    <div className="text-xs font-extrabold text-slate-900 font-urdu">س: کیا انٹرنیٹ کے بغیر سافٹ ویئر چلے گا؟</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      ج: جی ہاں، لوکل نیٹ ورک پر چلنے کی صورت میں سسٹم انٹرنیٹ کے بغیر بھی کاؤنٹر بلنگ کرتا ہے اور ڈیٹا لوکل سرور پر محفوظ رہتا ہے۔
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                    <div className="text-xs font-extrabold text-slate-900 font-urdu">س: کیا پرانا بل ڈیلیٹ یا تبدیل ہو سکتا ہے؟</div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      ج: صرف دکان مالک (ایڈمن) کو بل ڈیلیٹ کرنے یا ترمیم کرنے کا اختیار ہے۔ منشی یا کیشئر بل میں خود سے تبدیلی نہیں کر سکتے۔
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
