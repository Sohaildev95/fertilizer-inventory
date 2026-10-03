// ==============================================================================
// BILINGUAL TRANSLATIONS DICTIONARY (URDU & ENGLISH)
// Specialized for Pakistani Fertilizer, Seeds & Pesticides Businesses
// ==============================================================================

export type Language = 'ur' | 'en';

export const translations = {
  // Navigation
  nav: {
    dashboard: { en: 'Dashboard', ur: 'ڈیش بورڈ' },
    pos: { en: 'POS Counter (Sales)', ur: 'کاؤنٹر سیل (پرچی بل)' },
    products: { en: 'Products & Stock', ur: 'کھاد اسٹاک و پراڈکٹس' },
    purchases: { en: 'Purchases (Stock In)', ur: 'مال کی خریداری' },
    customers: { en: 'Customers & Khata', ur: 'زمیندار کھاتہ رجسٹر' },
    vendors: { en: 'Vendors (Suppliers)', ur: 'سپلائرز و کمپنیاں' },
    expenses: { en: 'Daily Expenses', ur: 'روزانہ دکان خرچہ' },
    reports: { en: 'Reports & Profit', ur: 'نفع نقصان رپورٹس' },
    settings: { en: 'Shop Settings', ur: 'دکان کی ترتیبات' },
    logout: { en: 'Sign Out', ur: 'لاگ آؤٹ' },
  },

  // Auth & Profile
  auth: {
    welcomeBack: { en: 'Welcome Back!', ur: 'خوش آمدید!' },
    loginSubtitle: { en: 'Sign in to access your shop portal', ur: 'اپنی دکان کے پورٹل میں داخل ہونے کے لیے لاگ ان کریں' },
    email: { en: 'Email Address', ur: 'ای میل ایڈریس' },
    password: { en: 'Password', ur: 'پاس ورڈ' },
    showPassword: { en: 'Show', ur: 'دیکھیں' },
    hidePassword: { en: 'Hide', ur: 'چھپائیں' },
    rememberMe: { en: 'Remember me', ur: 'مجھے لاگ ان رکھیں' },
    signInBtn: { en: 'Sign In to Portal', ur: 'لاگ ان کریں' },
    autoFillDemo: { en: 'Auto Fill Demo Admin', ur: 'ڈیمو ایڈمن درج کریں' },
    noAccount: { en: 'New shop setup?', ur: 'نئی دکان کا کھاتہ بنانا ہے؟' },
    registerHere: { en: 'Register Shop Here', ur: 'یہاں دکان رجسٹر کریں' },
    alreadyAccount: { en: 'Already have an account?', ur: 'پہلے سے اکاونٹ موجود ہے؟' },
    fullName: { en: 'Owner / User Name', ur: 'مالک / صارف کا نام' },
    shopName: { en: 'Shop / Agency Name', ur: 'دکان / ایجنسی کا نام' },
    phone: { en: 'Mobile Phone Number', ur: 'موبائل فون نمبر' },
    address: { en: 'Shop Address & City', ur: 'دکان کا پتہ اور شہر' },
    role: { en: 'Account Role', ur: 'عہدہ / رول' },
    registerBtn: { en: 'Create Shop Account', ur: 'اکاؤنٹ رجسٹر کریں' },
  },

  // Dashboard Stats & KPIs
  dashboard: {
    title: { en: 'Shop Dashboard', ur: 'دکان کا جائزہ (ڈیش بورڈ)' },
    overviewBadge: { en: 'LIVE OVERVIEW', ur: 'لائیو جائزہ' },
    subtitle: { en: 'Complete daily sales, khata receivables and stock monitoring.', ur: 'روزانہ کی فروخت، زمینداروں کا کھاتہ اور کھاد اسٹاک کنٹرول۔' },
    newSaleBtn: { en: 'New POS Bill', ur: 'نیا کاؤنٹر بل بنائیں' },
    addStockBtn: { en: 'Receive Stock', ur: 'مال داخل کریں' },
    todaySales: { en: "Today's Sales", ur: 'آج کی کل فروخت' },
    todaySalesSub: { en: 'bills generated today', ur: 'آج کٹے گئے بل' },
    customerKhata: { en: 'Customer Udhaar (Khata)', ur: 'کسٹمرز کا بقایا (ادھار کھاتہ)' },
    customerKhataSub: { en: 'farmers pending balance', ur: 'زمینداروں کا مجموعی ادھار' },
    companyPayables: { en: 'Company Payables', ur: 'کمپنیوں کے واجبات' },
    companyPayablesSub: { en: 'due to suppliers & distributors', ur: 'سپلائرز کو ادا کرنے والی رقم' },
    lowStockAlerts: { en: 'Low Stock Alerts', ur: 'کم اسٹاک کی الرٹس' },
    lowStockAlertsSub: { en: 'products need reorder', ur: 'کھاد جن کا اسٹاک ختم ہونے والا ہے' },
    recentSales: { en: 'Recent Counter Sales', ur: 'حالیہ فروخت بل' },
    recentSalesSub: { en: 'Latest customer transactions and receipts', ur: 'تازہ ترین بل اور کسٹمرز' },
    viewAll: { en: 'View All', ur: 'سب دیکھیں' },
    billNo: { en: 'Bill #', ur: 'بل نمبر' },
    customer: { en: 'Customer / Zamindar', ur: 'کسٹمر / زمیندار' },
    items: { en: 'Items Sold', ur: 'اشیاء' },
    total: { en: 'Total Amount', ur: 'کل رقم' },
    paid: { en: 'Paid', ur: 'وصول رقم' },
    balance: { en: 'Balance (Udhaar)', ur: 'بقایا ادھار' },
    status: { en: 'Status', ur: 'حیثیت' },
    paidStatus: { en: 'Paid (Cash)', ur: 'نقد وصول' },
    partialStatus: { en: 'Partial Paid', ur: 'کچھ ادا' },
    unpaidStatus: { en: 'Udhaar (Pending)', ur: 'ادھار کھاتہ' },
    lowStockTable: { en: 'Low Stock Warning', ur: 'کم کھاد اسٹاک وارننگ' },
    lowStockTableSub: { en: 'Bags and bottles at critical levels in godown', ur: 'گودام میں موجود بوریوں کی تعداد کم ہے' },
    reorderBtn: { en: 'Order Now', ur: 'آرڈر کریں' },
  },

  // POS / Counter Sales
  pos: {
    title: { en: 'POS Billing Counter', ur: 'فوری بلنگ کاؤنٹر (پرچی)' },
    searchProduct: { en: 'Search fertilizer by name, SKU or Urdu...', ur: 'کھاد تلاش کریں (یوریا، ڈی اے پی، زنک)...' },
    selectCustomer: { en: 'Select Zamindar / Customer', ur: 'زمیندار / کھاتہ دار منتخب کریں' },
    walkInCustomer: { en: 'Walk-in Cash Customer', ur: 'عام نقد گاہک (غیر رجسٹرڈ)' },
    cartEmpty: { en: 'Bill cart is empty. Add products from left.', ur: 'بل خالی ہے۔ کھاد پراڈکٹ شامل کریں۔' },
    subtotal: { en: 'Subtotal', ur: 'میزان رقم' },
    discount: { en: 'Discount', ur: 'رعایت (ڈسکاؤنٹ)' },
    grandTotal: { en: 'Grand Total', ur: 'کل واجب الادا' },
    receivedAmount: { en: 'Received Cash', ur: 'وصول شدہ رقم' },
    changeReturn: { en: 'Change Return', ur: 'واپسی رقم' },
    remainingUdhaar: { en: 'Added to Udhaar Khata', ur: 'کھاتے میں شامل ادھار' },
    paymentMethod: { en: 'Payment Method', ur: 'طریقہ ادائیگی' },
    cash: { en: 'Cash', ur: 'نقد' },
    bank: { en: 'Bank Transfer', ur: 'بینک ٹرانسفر' },
    cheque: { en: 'Cheque', ur: 'چیک' },
    easypaisa: { en: 'EasyPaisa / JazzCash', ur: 'ایزی پیسہ / جاز کیش' },
    generatePrintBtn: { en: 'Confirm & Print Bill', ur: 'بل جاری و پرنٹ کریں' },
  },

  // Khata & Customers
  khata: {
    title: { en: 'Farmer & Customer Khata Register', ur: 'زمیندار ادھار رجسٹر (کھاتہ)' },
    village: { en: 'Village / Chak', ur: 'چک / موضع / گاؤں' },
    creditLimit: { en: 'Credit Limit', ur: 'ادھار کی حد' },
    currentBalance: { en: 'Total Balance Due', ur: 'کل واجب الادا رقم' },
    receivePayment: { en: 'Receive Payment (Wasooli)', ur: 'ادائیگی وصول کریں' },
    addCustomer: { en: 'Add New Farmer', ur: 'نیا زمیندار درج کریں' },
    ledgerHistory: { en: 'Ledger Statement', ur: 'کھاتہ تفصیل (لیجر)' },
  },

  // Units
  units: {
    bag_50kg: { en: '50kg Bag', ur: '50 کلو بوری' },
    bag_25kg: { en: '25kg Bag', ur: '25 کلو بوری' },
    bottle_1l: { en: '1 Litre Bottle', ur: '1 لیٹر بوتل' },
    bottle_500ml: { en: '500ml Bottle', ur: '500 ملی لیٹر بوتل' },
    pack_1kg: { en: '1kg Pack', ur: '1 کلو پیک' },
    pack_3kg: { en: '3kg Pack', ur: '3 کلو پیک' },
  },

  // Common UI
  common: {
    save: { en: 'Save', ur: 'محفوظ کریں' },
    cancel: { en: 'Cancel', ur: 'منسوخ' },
    delete: { en: 'Delete', ur: 'حذف کریں' },
    edit: { en: 'Edit', ur: 'تبدیل کریں' },
    search: { en: 'Search...', ur: 'تلاش کریں...' },
    filter: { en: 'Filter', ur: 'فلٹر' },
    actions: { en: 'Actions', ur: 'اختیارات' },
    loading: { en: 'Loading...', ur: 'لوڈ ہو رہا ہے...' },
    success: { en: 'Operation successful', ur: 'کامیابی سے محفوظ ہو گیا' },
    error: { en: 'Something went wrong', ur: 'کوئی مسئلہ پیش آ گیا' },
    currency: { en: 'Rs.', ur: 'روپے' },
    languageToggle: { en: 'اردو', ur: 'English' },
  },
} as const;

export type TranslationKey = keyof typeof translations;
