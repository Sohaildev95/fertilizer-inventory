// ============================================
// Application Constants
// ============================================

export const APP_NAME = 'Fertilizer Inventory';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Fertilizer Inventory Management System';

// ============================================
// Pagination Defaults
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ============================================
// Stock Alert Thresholds
// ============================================

export const LOW_STOCK_THRESHOLD = 10;
export const CRITICAL_STOCK_THRESHOLD = 5;

// ============================================
// Invoice Prefix
// ============================================

export const SALE_INVOICE_PREFIX = 'SI';
export const PURCHASE_INVOICE_PREFIX = 'PI';

// ============================================
// Date Formats
// ============================================

export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// ============================================
// Currency
// ============================================

export const CURRENCY = {
  code: 'PKR',
  symbol: 'Rs.',
  name: 'Pakistani Rupee',
};

// ============================================
// Default Categories (Fertilizer Shop)
// ============================================

export const DEFAULT_CATEGORIES = [
  'Urea',
  'DAP (Diammonium Phosphate)',
  'NPK Fertilizers',
  'SOP (Sulphate of Potash)',
  'SSP (Single Super Phosphate)',
  'Pesticides',
  'Herbicides',
  'Fungicides',
  'Seeds',
  'Micronutrients',
  'Growth Regulators',
  'Organic Fertilizers',
] as const;

// ============================================
// User Role Labels
// ============================================

export const ROLE_LABELS = {
  super_admin: 'Super Admin (Malik)',
  shop_manager: 'Shop Manager (Munshi/Manager)',
  sales_staff: 'Sales Staff (Counter Sales)',
  vendor: 'Vendor (Company/Supplier)',
} as const;

// ============================================
// Pakistani Agricultural Crops & Seasons (فصلیں اور سیزن)
// ============================================

export interface CropDefinition {
  key: string;
  name: string;
  urduName: string;
  season: 'rabi' | 'kharif' | 'zaid';
  sowingMonths: string;
  harvestMonths: string;
  peakHarvestMonthNumber: number; // 1-12
  recommendedUreaBagsPerAcre: number;
  recommendedDapBagsPerAcre: number;
  icon: string;
}

export const PAKISTANI_CROPS: CropDefinition[] = [
  {
    key: 'wheat',
    name: 'Wheat (Gandum)',
    urduName: 'گندم',
    season: 'rabi',
    sowingMonths: 'نومبر - دسمبر',
    harvestMonths: 'مارچ - مئی',
    peakHarvestMonthNumber: 4, // April
    recommendedUreaBagsPerAcre: 2.5,
    recommendedDapBagsPerAcre: 1.5,
    icon: '🌾',
  },
  {
    key: 'cotton',
    name: 'Cotton (Kapas)',
    urduName: 'کپاس (پھٹی)',
    season: 'kharif',
    sowingMonths: 'اپریل - مئی',
    harvestMonths: 'ستمبر - نومبر',
    peakHarvestMonthNumber: 10, // October
    recommendedUreaBagsPerAcre: 3.0,
    recommendedDapBagsPerAcre: 1.5,
    icon: '☁️',
  },
  {
    key: 'rice',
    name: 'Rice / Paddy (Dhan/Chawal)',
    urduName: 'دھان / چاول (مونجی)',
    season: 'kharif',
    sowingMonths: 'مئی - جون',
    harvestMonths: 'اکتوبر - نومبر',
    peakHarvestMonthNumber: 11, // November
    recommendedUreaBagsPerAcre: 2.5,
    recommendedDapBagsPerAcre: 1.0,
    icon: '🌱',
  },
  {
    key: 'maize',
    name: 'Corn / Maize (Makai)',
    urduName: 'مکئی (بہاریہ و خریف)',
    season: 'kharif',
    sowingMonths: 'فروری / جولائی',
    harvestMonths: 'جون / اکتوبر',
    peakHarvestMonthNumber: 6, // June
    recommendedUreaBagsPerAcre: 3.5,
    recommendedDapBagsPerAcre: 2.0,
    icon: '🌽',
  },
  {
    key: 'sugarcane',
    name: 'Sugarcane (Kamaad)',
    urduName: 'کماد (گنا)',
    season: 'kharif',
    sowingMonths: 'ستمبر / فروری',
    harvestMonths: 'نومبر - مارچ',
    peakHarvestMonthNumber: 12, // December
    recommendedUreaBagsPerAcre: 4.0,
    recommendedDapBagsPerAcre: 2.0,
    icon: '🎋',
  },
  {
    key: 'potato',
    name: 'Potato (Aloo)',
    urduName: 'آلو',
    season: 'rabi',
    sowingMonths: 'ستمبر - اکتوبر',
    harvestMonths: 'دسمبر - فروری',
    peakHarvestMonthNumber: 1, // January
    recommendedUreaBagsPerAcre: 3.0,
    recommendedDapBagsPerAcre: 2.5,
    icon: '🥔',
  },
  {
    key: 'mustard',
    name: 'Mustard / Canola (Sarson/Raya)',
    urduName: 'سرسوں / رایا / کینولا',
    season: 'rabi',
    sowingMonths: 'ستمبر - اکتوبر',
    harvestMonths: 'فروری - مارچ',
    peakHarvestMonthNumber: 3, // March
    recommendedUreaBagsPerAcre: 1.5,
    recommendedDapBagsPerAcre: 1.0,
    icon: '🌼',
  },
  {
    key: 'citrus_mango',
    name: 'Orchards (Kino / Mango)',
    urduName: 'باغات (مالٹا / کنو / آم)',
    season: 'zaid',
    sowingMonths: 'سارا سال',
    harvestMonths: 'دسمبر - اگست',
    peakHarvestMonthNumber: 1,
    recommendedUreaBagsPerAcre: 3.0,
    recommendedDapBagsPerAcre: 2.0,
    icon: '🍊',
  },
  {
    key: 'other',
    name: 'Other Seasonal Crops',
    urduName: 'دیگر موسمی فصل و سبزی',
    season: 'zaid',
    sowingMonths: 'موسمی',
    harvestMonths: 'موسمی',
    peakHarvestMonthNumber: 5,
    recommendedUreaBagsPerAcre: 2.0,
    recommendedDapBagsPerAcre: 1.0,
    icon: '🌿',
  },
];

// ============================================
// Default Pakistani Agri-Dealer Broadcast Message Templates
// ============================================

export const DEFAULT_BROADCAST_TEMPLATES = [
  {
    key: 'stock_arrival',
    title: 'New Stock Arrival Alert',
    titleUrdu: 'کھاد کا نیا سٹاک آمد الرٹ',
    icon: '🚚',
    category: 'inventory',
    defaultUrdu:
      'محترم کسان بھائی! السلام علیکم، پنجاب کھاد ایجنسی پر سونا یوریا، اینگرو ڈی اے پی اور پوٹاش کی نئی گاڑی پہنچ چکی ہے۔ معیاری اور تازہ مال کے لیے جلد تشریف لائیں تاکہ اپنا کوٹہ حاصل کر سکیں۔ شکریہ!',
    defaultEn:
      'Dear Farmer, Fresh consignment of Sona Urea and Engro DAP has arrived at Punjab Fertilizer Agency. Visit soon to collect your seasonal allocation.',
  },
  {
    key: 'rate_update',
    title: 'Official Fertilizer Rates',
    titleUrdu: 'سرکاری نرخ نامہ و ریٹ لسٹ',
    icon: '🏷️',
    category: 'rates',
    defaultUrdu:
      'محترم زمیندار بھائی! پنجاب کھاد ایجنسی کی تازہ ترین کنٹرول ریٹ لسٹ: سونا یوریا 4,450 روپے، اینگرو ڈی اے پی 12,400 روپے، سرسبز کین گوارا 3,800 روپے۔ تمام مال اصل کمپنی پیکنگ میں دستیاب ہے۔',
    defaultEn:
      'Latest Official Fertilizer Rates: Sona Urea Rs. 4,450, Engro DAP Rs. 12,400, Sarsabz CAN Rs. 3,800 at Punjab Fertilizer Agency.',
  },
  {
    key: 'recovery_reminder',
    title: 'Fasli Udhaar Harvest Recovery',
    titleUrdu: 'فصلی ادھار و کٹائی پر ادائیگی یاد دہانی',
    icon: '🌾',
    category: 'recovery',
    defaultUrdu:
      'محترم کسان صاحب! امید ہے فصل کی کٹائی خیر و عافیت سے مکمل ہو چکی ہوگی۔ گزارش ہے کہ پنجاب کھاد ایجنسی تشریف لا کر اپنا فصلی کھاتہ و بقایا واجبات کلیئر فرما لیں تاکہ آئندہ سیزن میں بلا تعطل مال مل سکے۔ شکریہ!',
    defaultEn:
      'Dear Farmer, Congratulations on the harvest. Please visit Punjab Fertilizer Agency to clear your pending seasonal khata balance. Thank you!',
  },
  {
    key: 'pest_alert',
    title: 'Pest Advisory & Spray Alert',
    titleUrdu: 'زرعی مشورہ و سپرے الرٹ',
    icon: '🐛',
    category: 'advisory',
    defaultUrdu:
      'زرعی الرٹ: فصل پر کیڑے مکوڑے و سنڈی کے خطرے کے پیشِ نظر مستند کمپنی سپرے (بیلٹ، نیٹایوو، کوراژن) پنجاب کھاد ایجنسی پر دستیاب ہیں۔ ماہرانہ مشورے کے ساتھ حاصل کریں۔ رابطہ: 0300-1234567',
    defaultEn:
      'Agri Advisory Alert: Protect your crop from pests. Original Bayer & Syngenta pesticides available at Punjab Fertilizer Agency with expert agronomy guidance.',
  },
  {
    key: 'custom',
    title: 'Custom Announcement',
    titleUrdu: 'خصوصی / اپنی مرضی کا اعلان',
    icon: '📢',
    category: 'general',
    defaultUrdu:
      'محترم کسان بھائی! پنجاب کھاد ایجنسی کی جانب سے خصوصی اطلاع: کل صبح 8 بجے سے کاؤنٹر کھلا رہے گا۔ تشریف لائیں یا فون پر رابطہ کریں۔ شکریہ!',
    defaultEn:
      'Special Announcement from Punjab Fertilizer Agency: Shop open from 8:00 AM tomorrow. Contact 0300-1234567 for inquiries.',
  },
];

