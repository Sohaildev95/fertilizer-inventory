'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../lib/language-context';
import { apiRequest } from '../../../lib/api-client';
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
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';

interface Category {
  id: string;
  name: string;
  urdu_name?: string;
  slug?: string;
}

interface Product {
  id: string;
  name: string;
  urdu_name?: string;
  sku: string;
  category_id?: string;
  company_name: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  min_sale_price?: number;
  current_stock: number;
  min_stock_alert: number;
  rack_location?: string;
  batch_number?: string;
  expiry_date?: string;
  is_active: boolean;
  category?: Category;
}

const INITIAL_FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prd-1',
    name: 'Sona Urea (سونا یوریا)',
    urdu_name: 'سونا یوریا کھاد ۵۰ کلو',
    sku: 'FFC-UREA-50',
    company_name: 'Fauji Fertilizer (FFC)',
    unit: 'bag_50kg',
    cost_price: 4200,
    sale_price: 4450,
    min_sale_price: 4350,
    current_stock: 350,
    min_stock_alert: 25,
    rack_location: 'گودام 1 - ریک A',
    batch_number: 'FFC-2026-08',
    is_active: true,
  },
  {
    id: 'prd-2',
    name: 'Engro Urea (اینگرو یوریا)',
    urdu_name: 'اینگرو یوریا کھاد ۵۰ کلو',
    sku: 'ENG-UREA-50',
    company_name: 'Engro Fertilizers',
    unit: 'bag_50kg',
    cost_price: 4180,
    sale_price: 4430,
    min_sale_price: 4300,
    current_stock: 180,
    min_stock_alert: 20,
    rack_location: 'گودام 1 - ریک B',
    batch_number: 'ENG-2026-04',
    is_active: true,
  },
  {
    id: 'prd-3',
    name: 'Sarsabz DAP (سرسَبز ڈی اے پی)',
    urdu_name: 'سرسَبز ڈی اے پی کھاد ۵۰ کلو',
    sku: 'FAT-DAP-50',
    company_name: 'Fatima Fertilizer',
    unit: 'bag_50kg',
    cost_price: 11800,
    sale_price: 12400,
    min_sale_price: 12100,
    current_stock: 85,
    min_stock_alert: 15,
    rack_location: 'گودام 2 - ریک A',
    batch_number: 'FAT-2026-11',
    is_active: true,
  },
  {
    id: 'prd-4',
    name: 'FFC DAP (ایف ایف سی ڈی اے پی)',
    urdu_name: 'سونا ڈی اے پی کھاد ۵۰ کلو',
    sku: 'FFC-DAP-50',
    company_name: 'Fauji Fertilizer (FFC)',
    unit: 'bag_50kg',
    cost_price: 11900,
    sale_price: 12500,
    min_sale_price: 12200,
    current_stock: 8, // Low Stock!
    min_stock_alert: 15,
    rack_location: 'گودام 2 - ریک B',
    batch_number: 'FFC-DAP-2026',
    is_active: true,
  },
  {
    id: 'prd-5',
    name: 'Sona SOP Potash (سونا پوٹاش)',
    urdu_name: 'سونا پوٹاش ایس او پی ۵۰ کلو',
    sku: 'FFC-SOP-50',
    company_name: 'Fauji Fertilizer (FFC)',
    unit: 'bag_50kg',
    cost_price: 14500,
    sale_price: 15200,
    min_sale_price: 14900,
    current_stock: 42,
    min_stock_alert: 10,
    rack_location: 'گودام 2 - ریک C',
    batch_number: 'SOP-2026',
    is_active: true,
  },
  {
    id: 'prd-6',
    name: 'Karate 2.5 EC (کراٹے اسپرے)',
    urdu_name: 'کراٹے کیڑے مار دوا ۱ لیٹر',
    sku: 'SYN-KAR-1L',
    company_name: 'Syngenta',
    unit: 'bottle_1l',
    cost_price: 2100,
    sale_price: 2450,
    min_sale_price: 2300,
    current_stock: 60,
    min_stock_alert: 12,
    rack_location: 'میڈیسن روم - شیلف 1',
    batch_number: 'SYN-8842',
    expiry_date: '2028-06-30',
    is_active: true,
  },
  {
    id: 'prd-7',
    name: 'Belt Expert (بیلٹ ایکسپرٹ سنڈی مار)',
    urdu_name: 'بیلٹ ایکسپرٹ ۵۰۰ ملی لٹر',
    sku: 'BAY-BELT-500',
    company_name: 'Bayer Crop Science',
    unit: 'bottle_500ml',
    cost_price: 3200,
    sale_price: 3650,
    min_sale_price: 3500,
    current_stock: 3, // Low Stock!
    min_stock_alert: 10,
    rack_location: 'میڈیسن روم - شیلف 2',
    batch_number: 'BAY-2026-X',
    expiry_date: '2027-12-31',
    is_active: true,
  },
  {
    id: 'prd-8',
    name: 'Pioneer 30Y87 Hybrid Maize',
    urdu_name: 'پائینیر مکئی ہائبرڈ بیج ۱۰ کلو',
    sku: 'PIO-30Y87',
    company_name: 'Pioneer Seeds',
    unit: 'pack_10kg',
    cost_price: 12000,
    sale_price: 13200,
    min_sale_price: 12800,
    current_stock: 25,
    min_stock_alert: 5,
    rack_location: 'بیج گودام - ریک 1',
    batch_number: 'PIO-SEED-2026',
    is_active: true,
  },
];

const getCompanyColor = (companyName: string) => {
  const name = companyName.toLowerCase();
  if (name.includes('engro')) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (name.includes('fauji') || name.includes('ffc')) return 'bg-green-50 text-green-700 border-green-200';
  if (name.includes('fatima') || name.includes('sarsabz')) return 'bg-lime-50 text-lime-700 border-lime-200';
  if (name.includes('bayer')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (name.includes('syngenta')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  if (name.includes('fmc')) return 'bg-red-50 text-red-700 border-red-200';
  if (name.includes('ici')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (name.includes('pioneer')) return 'bg-amber-50 text-amber-700 border-amber-200';
  
  const colors = [
    'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    'bg-purple-50 text-purple-700 border-purple-200',
    'bg-pink-50 text-pink-700 border-pink-200',
    'bg-rose-50 text-rose-700 border-rose-200',
    'bg-teal-50 text-teal-700 border-teal-200',
    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'bg-sky-50 text-sky-700 border-sky-200',
  ];
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function ProductsPage() {
  const { isUrdu } = useLanguage();

  const [products, setProducts] = useState<Product[]>(INITIAL_FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [showOnlyLowStock, setShowOnlyLowStock] = useState<boolean>(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    urduName: '',
    sku: '',
    categoryId: '',
    companyName: 'Fauji Fertilizer (FFC)',
    unit: 'bag_50kg',
    costPrice: '',
    salePrice: '',
    minSalePrice: '',
    initialStock: '',
    minStockAlert: '15',
    rackLocation: '',
    batchNumber: '',
    expiryDate: '',
  });

  // Stock Adjustment Form State
  const [adjustmentForm, setAdjustmentForm] = useState({
    quantity: '',
    movementType: 'damage' as 'damage' | 'adjustment' | 'return_in' | 'return_out',
    reason: '',
  });

  // Fetch products and categories on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const catRes = await apiRequest<{ success: boolean; data: Category[] }>(
        '/products/categories',
      ).catch(() => null);

      if (catRes?.success && catRes.data?.length > 0) {
        setCategories(catRes.data);
      }

      // 2. Fetch products
      const prodRes = await apiRequest<{ success: boolean; data: Product[] }>(
        '/products',
      ).catch(() => null);

      if (prodRes?.success && prodRes.data?.length > 0) {
        setProducts(prodRes.data);
      } else {
        setProducts(INITIAL_FALLBACK_PRODUCTS);
      }
    } catch {
      // Use fallback if API not running or empty
      setProducts(INITIAL_FALLBACK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  // Companies list from products
  const companiesList = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.company_name).filter(Boolean)));
    return ['all', ...list];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const s = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(s) ||
        (p.urdu_name && p.urdu_name.includes(search)) ||
        p.sku.toLowerCase().includes(s) ||
        p.company_name.toLowerCase().includes(s) ||
        (p.rack_location && p.rack_location.toLowerCase().includes(s));

      // Category
      const matchesCat =
        selectedCategory === 'all' ||
        p.category_id === selectedCategory ||
        p.category?.slug === selectedCategory;

      // Company
      const matchesComp = selectedCompany === 'all' || p.company_name === selectedCompany;

      // Low Stock
      const matchesLowStock = !showOnlyLowStock || p.current_stock <= p.min_stock_alert;

      return matchesSearch && matchesCat && matchesComp && matchesLowStock;
    });
  }, [products, search, selectedCategory, selectedCompany, showOnlyLowStock]);

  // Aggregate Stats
  const stats = useMemo(() => {
    let totalBags = 0;
    let lowStockCount = 0;
    let assetValue = 0;
    let retailValue = 0;

    for (const p of products) {
      const stock = Number(p.current_stock || 0);
      totalBags += stock;
      assetValue += stock * Number(p.cost_price || 0);
      retailValue += stock * Number(p.sale_price || 0);
      if (stock <= Number(p.min_stock_alert || 0)) {
        lowStockCount++;
      }
    }

    return {
      totalProducts: products.length,
      totalBags,
      lowStockCount,
      assetValue,
      potentialProfit: retailValue - assetValue,
    };
  }, [products]);

  // Handle Add Product Submit
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.companyName || !newProduct.salePrice) {
      alert(isUrdu ? 'براہ کرم تمام ضروری خانے پر کریں۔' : 'Please fill all required fields.');
      return;
    }

    const payload = {
      name: newProduct.name,
      urduName: newProduct.urduName || undefined,
      sku: newProduct.sku || undefined,
      categoryId: newProduct.categoryId || undefined,
      companyName: newProduct.companyName,
      unit: newProduct.unit,
      costPrice: Number(newProduct.costPrice) || 0,
      salePrice: Number(newProduct.salePrice),
      minSalePrice: newProduct.minSalePrice ? Number(newProduct.minSalePrice) : undefined,
      initialStock: Number(newProduct.initialStock) || 0,
      minStockAlert: Number(newProduct.minStockAlert) || 10,
      rackLocation: newProduct.rackLocation || undefined,
      batchNumber: newProduct.batchNumber || undefined,
      expiryDate: newProduct.expiryDate || undefined,
    };

    try {
      const res = await apiRequest<{ success: boolean; data: Product }>('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (res?.success && res.data) {
        setProducts([res.data, ...products]);
      } else {
        // Fallback local state insertion
        const localProduct: Product = {
          id: `prd-${Date.now()}`,
          name: payload.name,
          urdu_name: payload.urduName,
          sku: payload.sku || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
          company_name: payload.companyName,
          unit: payload.unit,
          cost_price: payload.costPrice,
          sale_price: payload.salePrice,
          min_sale_price: payload.minSalePrice,
          current_stock: payload.initialStock,
          min_stock_alert: payload.minStockAlert,
          rack_location: payload.rackLocation,
          batch_number: payload.batchNumber,
          expiry_date: payload.expiryDate,
          is_active: true,
        };
        setProducts([localProduct, ...products]);
      }

      setIsAddModalOpen(false);
      setNewProduct({
        name: '',
        urduName: '',
        sku: '',
        categoryId: '',
        companyName: 'Fauji Fertilizer (FFC)',
        unit: 'bag_50kg',
        costPrice: '',
        salePrice: '',
        minSalePrice: '',
        initialStock: '',
        minStockAlert: '15',
        rackLocation: '',
        batchNumber: '',
        expiryDate: '',
      });
      alert(isUrdu ? 'نیا آئٹم کامیابی سے شامل ہو گیا!' : 'Product added successfully!');
    } catch (err: any) {
      alert(err.message || 'Error creating product');
    }
  };

  // Handle Stock Adjustment
  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qty = Number(adjustmentForm.quantity);
    if (!qty || isNaN(qty)) {
      alert(isUrdu ? 'براہ کرم درست تعداد درج کریں۔' : 'Please enter a valid quantity.');
      return;
    }

    try {
      const res = await apiRequest<{ success: boolean; data: { newStock: number } }>(
        `/products/${selectedProduct.id}/adjust-stock`,
        {
          method: 'POST',
          body: JSON.stringify({
            quantity: qty,
            movementType: adjustmentForm.movementType,
            reason: adjustmentForm.reason,
          }),
        },
      ).catch(() => null);

      const updatedStock = res?.success
        ? res.data.newStock
        : Math.max(0, selectedProduct.current_stock + qty);

      setProducts(
        products.map((p) =>
          p.id === selectedProduct.id ? { ...p, current_stock: updatedStock } : p,
        ),
      );

      setIsAdjustModalOpen(false);
      setAdjustmentForm({ quantity: '', movementType: 'damage', reason: '' });
      alert(
        isUrdu
          ? `اسٹاک کامیابی سے تبدیل ہو گیا! نیا اسٹاک: ${updatedStock}`
          : `Stock adjusted successfully! New stock: ${updatedStock}`,
      );
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f3443 0%, #34e89e 100%)',
          color: '#ffffff',
        }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl shadow-xl border border-white/10"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-emerald-100 border border-white/20">
              {isUrdu ? 'گودام و اسٹاک' : 'Warehouse & Inventory'}
            </span>
            <span className="text-xs text-emerald-100/80">
              {isUrdu ? 'کھاد، بیج اور اسپرے' : 'Fertilizers, Seeds & Chemicals'}
            </span>
          </div>
          <h1
            className={`text-2xl md:text-3xl font-extrabold text-white tracking-tight ${isUrdu ? 'font-urdu' : ''}`}
          >
            {isUrdu ? 'کھاد و زرعی ادویات اسٹاک مینجمنٹ' : 'Fertilizer & Agri Stock Inventory'}
          </h1>
          <p className="text-sm text-emerald-100/90 mt-1">
            {isUrdu
              ? 'گودام میں بوریوں کی تعداد، خرید و فروخت قیمت اور کم اسٹاک وارننگ کی لائیو تفصیل'
              : 'Track bag quantities, cost vs sale margins, godown rack locations, and reorder thresholds.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-xl shadow-lg transition-all transform active:scale-95"
          >
            <span className="text-lg">+</span>
            <span className={isUrdu ? 'font-urdu' : ''}>
              {isUrdu ? 'نیا آئٹم شامل کریں' : 'Add New Product'}
            </span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Products */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل آئٹمز' : 'Total Items'}
            </span>
            <span className="text-xl p-2 bg-slate-50 text-slate-600 rounded-xl">📦</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-800">{stats.totalProducts}</span>
            <span className="text-xs text-slate-500 ml-2">
              {isUrdu ? 'مختلف پروڈکٹس' : 'active SKUs'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Bags in Godown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-teal-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'گودام میں کل بوریاں / بوتلیں' : 'Total Units in Stock'}
            </span>
            <span className="text-xl p-2 bg-teal-50 text-teal-600 rounded-xl">🌾</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-teal-600">
              {stats.totalBags.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 ml-2">
              {isUrdu ? 'بوریاں / پیکنگ' : 'bags & bottles'}
            </span>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div
          onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
          className={`cursor-pointer rounded-2xl p-5 relative overflow-hidden transition ${
            stats.lowStockCount > 0
              ? 'bg-red-50 border border-red-200 hover:border-red-300 shadow-sm hover:shadow-md'
              : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-slate-500'}`}
            >
              {isUrdu ? 'کم اسٹاک کی وارننگ' : 'Low Stock Alerts'}
            </span>
            <span
              className={`text-xl p-2 rounded-xl ${stats.lowStockCount > 0 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-50 text-slate-400'}`}
            >
              ⚠️
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span
              className={`text-3xl font-extrabold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-slate-800'}`}
            >
              {stats.lowStockCount}
            </span>
            <span
              className={`text-xs underline font-semibold ${stats.lowStockCount > 0 ? 'text-red-500 hover:text-red-700' : 'text-slate-500'}`}
            >
              {showOnlyLowStock
                ? isUrdu
                  ? 'سب دکھائیں'
                  : 'Show All'
                : isUrdu
                  ? 'فلٹر کریں'
                  : 'Click to filter'}
            </span>
          </div>
        </div>

        {/* Card 4: Inventory Asset Value */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:shadow-md hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'اسٹاک کی کل خرید قیمت' : 'Stock Asset Valuation'}
            </span>
            <span className="text-xl p-2 bg-emerald-50 text-emerald-600 rounded-xl">💰</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600">
              Rs. {stats.assetValue.toLocaleString()}
            </span>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {isUrdu ? 'متوقع منافع: ' : 'Expected profit: '}
              <span className="text-emerald-600 font-bold">
                Rs. {stats.potentialProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isUrdu
                ? 'نام، کمپنی، یا SKU تلاش کریں...'
                : 'Search product, company, SKU, rack...'
            }
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Filter Dropdowns & Low Stock Pill */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Company Filter */}
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[200px] border-slate-200 text-slate-700 bg-white">
              <SelectValue placeholder={isUrdu ? 'تمام کمپنیاں (All Companies)' : 'All Companies'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isUrdu ? 'تمام کمپنیاں (All Companies)' : 'All Companies'}</SelectItem>
              {companiesList
                .filter((c) => c !== 'all')
                .map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Low Stock Toggle Button */}
          <button
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              showOnlyLowStock
                ? 'bg-amber-100 text-amber-900 shadow-sm border border-amber-200'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>⚠️</span>
            <span>{isUrdu ? 'صرف کم اسٹاک' : 'Low Stock Only'}</span>
            {stats.lowStockCount > 0 && (
              <span className="bg-red-100 text-red-600 font-bold text-[10px] px-1.5 py-0.5 rounded-full">
                {stats.lowStockCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: isUrdu ? 'تمام کھاد و بیج' : 'All Products' },
          { id: 'urea', label: isUrdu ? 'یوریا کھاد (Urea)' : 'Urea Fertilizer' },
          { id: 'dap', label: isUrdu ? 'ڈی اے پی (DAP)' : 'DAP Fertilizer' },
          { id: 'potash', label: isUrdu ? 'پوٹاش (Potash/SOP)' : 'Potash / SOP' },
          { id: 'insecticides', label: isUrdu ? 'کیڑے مار اسپرے' : 'Pesticides / Sprays' },
          { id: 'seeds', label: isUrdu ? 'بیج و تخم' : 'Certified Seeds' },
          { id: 'micronutrients', label: isUrdu ? 'زنک و بوران' : 'Zinc & Micronutrients' },
        ].map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Products Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                <th className="py-3.5 px-4 min-w-[250px] text-blue-600 whitespace-nowrap">{isUrdu ? 'پروڈکٹ کا نام' : 'Product Name'}</th>
                <th className="py-3.5 px-4 text-purple-600 whitespace-nowrap">{isUrdu ? 'کمپنی / برانڈ' : 'Company'}</th>
                <th className="py-3.5 px-4 text-pink-600 whitespace-nowrap">{isUrdu ? 'پیکنگ / وزن' : 'Packing Unit'}</th>
                <th className="py-3.5 px-4 text-rose-600 whitespace-nowrap">{isUrdu ? 'خرید قیمت' : 'Cost (خرید)'}</th>
                <th className="py-3.5 px-4 text-emerald-600 whitespace-nowrap">{isUrdu ? 'فروخت قیمت' : 'Sale (فروخت)'}</th>
                <th className="py-3.5 px-4 text-teal-600 whitespace-nowrap">{isUrdu ? 'منافع فی بوری' : 'Margin / Bag'}</th>
                <th className="py-3.5 px-4 text-amber-600 whitespace-nowrap">{isUrdu ? 'موجودہ اسٹاک' : 'Stock Level'}</th>
                <th className="py-3.5 px-4 text-indigo-600 whitespace-nowrap">{isUrdu ? 'گودام ریک' : 'Rack Location'}</th>
                <th className="py-3.5 px-4 text-center text-slate-600 whitespace-nowrap">{isUrdu ? 'کارروائی' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500">
                    <div className="text-3xl mb-2 text-slate-300">🔍</div>
                    <p className="font-medium text-slate-700">
                      {isUrdu ? 'کوئی پراڈکٹ نہیں ملی' : 'No products found'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {isUrdu
                        ? 'تلاش یا فلٹر تبدیل کریں یا نیا آئٹم شامل کریں'
                        : 'Try adjusting your search criteria or add a new product.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.current_stock <= p.min_stock_alert;
                  const isOut = p.current_stock === 0;
                  const margin = p.sale_price - p.cost_price;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition group cursor-default"
                    >
                      {/* Name & Urdu Subtitle */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 group-hover:text-emerald-600 transition">
                          {p.name}
                        </div>
                        {p.urdu_name && (
                          <div className="text-xs text-slate-500 font-urdu mt-0.5">
                            {p.urdu_name}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {p.sku}
                        </span>
                      </td>

                      {/* Company */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${getCompanyColor(p.company_name)}`}>
                          {p.company_name}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-4 text-xs text-slate-500 font-medium">
                        {p.unit === 'bag_50kg' && (isUrdu ? '۵۰ کلو بوری' : '50 kg Bag')}
                        {p.unit === 'bag_25kg' && (isUrdu ? '۲۵ کلو بوری' : '25 kg Bag')}
                        {p.unit === 'bottle_1l' && (isUrdu ? '۱ لیٹر بوتل' : '1 Litre')}
                        {p.unit === 'bottle_500ml' && (isUrdu ? '۵۰۰ ملی لٹر' : '500 ml')}
                        {p.unit === 'pack_10kg' && (isUrdu ? '۱۰ کلو تھیلی' : '10 kg Pack')}
                        {!['bag_50kg', 'bag_25kg', 'bottle_1l', 'bottle_500ml', 'pack_10kg'].includes(
                          p.unit,
                        ) && p.unit}
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        Rs. {p.cost_price.toLocaleString()}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        Rs. {p.sale_price.toLocaleString()}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`inline-block whitespace-nowrap text-xs px-2 py-0.5 rounded-md font-semibold ${
                            margin >= 200
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          +Rs. {margin.toLocaleString()}
                        </span>
                      </td>

                      {/* Stock Level with Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border ${
                              isOut
                                ? 'bg-red-50 text-red-600 border-red-200'
                                : isLow
                                  ? 'bg-amber-50 text-amber-600 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}
                          >
                            <span>{isOut ? '🔴' : isLow ? '🟡' : '🟢'}</span>
                            <span>{p.current_stock}</span>
                            <span className="text-[10px] opacity-80">
                              {isUrdu ? 'بوریاں' : 'bags'}
                            </span>
                          </span>
                        </div>
                        {isLow && !isOut && (
                          <div className="text-[10px] text-amber-600 mt-1 font-medium">
                            {isUrdu ? `کم از کم: ${p.min_stock_alert}` : `Min alert: ${p.min_stock_alert}`}
                          </div>
                        )}
                      </td>

                      {/* Rack Location */}
                      <td className="py-3 px-4 text-xs text-slate-500 font-urdu">
                        {p.rack_location || (isUrdu ? 'عام گودام' : 'General Godown')}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Stock Adjustment Button */}
                          <button
                            title={isUrdu ? 'اسٹاک درستگی یا نقصان کا اندراج' : 'Adjust Stock'}
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsAdjustModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-emerald-600 transition"
                          >
                            ⚖️
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
      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW PRODUCT                                                  */}
      {/* ========================================================================= */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'نیا کھاد یا بیج پروڈکٹ شامل کریں' : 'Add New Fertilizer / Seed Item'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-0.5">
              {isUrdu
                ? 'گودام میں نیا آئٹم، کمپنی ریٹ اور ابتدائی بوریوں کی تعداد درج کریں'
                : 'Enter product details, pricing, packing size, and initial stock count.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddProduct} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* English Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'پروڈکٹ نام (English)*' : 'Product English Name*'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Sona Urea 50kg"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Urdu Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'اردو نام (اختیاری)' : 'Urdu Name (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={newProduct.urduName}
                    onChange={(e) => setNewProduct({ ...newProduct, urduName: e.target.value })}
                    placeholder="مثلاً: سونا یوریا کھاد ۵۰ کلو"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-urdu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'کمپنی / مینوفیکچرر*' : 'Company / Brand*'}
                  </label>
                  <Select
                    value={newProduct.companyName}
                    onValueChange={(val) => setNewProduct({ ...newProduct, companyName: val })}
                  >
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white focus:ring-emerald-500">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="Fauji Fertilizer (FFC)">Fauji Fertilizer (FFC) - سونا کھاد</SelectItem>
                      <SelectItem value="Engro Fertilizers">Engro Fertilizers - اینگرو</SelectItem>
                      <SelectItem value="Fatima Fertilizer">Fatima Fertilizer - سرسَبز</SelectItem>
                      <SelectItem value="Pakchem">Pakchem / Agritech - پاک کیم</SelectItem>
                      <SelectItem value="Bayer Crop Science">Bayer Crop Science - بائر</SelectItem>
                      <SelectItem value="Syngenta">Syngenta - سینجنٹا</SelectItem>
                      <SelectItem value="Pioneer Seeds">Pioneer Seeds - پائینیر</SelectItem>
                      <SelectItem value="ICI Pakistan">ICI Pakistan - آئی سی آئی</SelectItem>
                      <SelectItem value="Local Supplier">Local Supplier / مقامی ڈیلر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Unit / Packing */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'پیکنگ سائز / وزن*' : 'Packing Unit*'}
                  </label>
                  <Select
                    value={newProduct.unit}
                    onValueChange={(val) => setNewProduct({ ...newProduct, unit: val })}
                  >
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white focus:ring-emerald-500">
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="bag_50kg">{isUrdu ? '۵۰ کلو بوری (50 kg Bag)' : '50 kg Bag'}</SelectItem>
                      <SelectItem value="bag_25kg">{isUrdu ? '۲۵ کلو بوری (25 kg Bag)' : '25 kg Bag'}</SelectItem>
                      <SelectItem value="bottle_1l">{isUrdu ? '۱ لیٹر بوتل (1 Litre Bottle)' : '1 Litre Bottle'}</SelectItem>
                      <SelectItem value="bottle_500ml">{isUrdu ? '۵۰۰ ملی لٹر بوتل (500 ml Bottle)' : '500 ml Bottle'}</SelectItem>
                      <SelectItem value="bottle_250ml">{isUrdu ? '۲۵۰ ملی لٹر بوتل (250 ml Bottle)' : '250 ml Bottle'}</SelectItem>
                      <SelectItem value="pack_10kg">{isUrdu ? '۱۰ کلو تھیلی (10 kg Pack)' : '10 kg Pack'}</SelectItem>
                      <SelectItem value="pack_1kg">{isUrdu ? '۱ کلو پیکٹ (1 kg Pack)' : '1 kg Pack'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'خرید قیمت (PKR)*' : 'Cost Price (PKR)*'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    placeholder="4200"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'فروخت قیمت (PKR)*' : 'Sale Price (PKR)*'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.salePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value })}
                    placeholder="4450"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-emerald-400 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'کم سے کم فروخت ریٹ' : 'Min Allowed Rate'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.minSalePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, minSalePrice: e.target.value })}
                    placeholder="4350"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'ابتدائی بوریاں (Stock)' : 'Opening Stock (Bags)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.initialStock}
                    onChange={(e) => setNewProduct({ ...newProduct, initialStock: e.target.value })}
                    placeholder="100"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'کم اسٹاک الرٹ کی حد' : 'Low Stock Alert Limit'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProduct.minStockAlert}
                    onChange={(e) => setNewProduct({ ...newProduct, minStockAlert: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-amber-400 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'گودام ریک / شیلف' : 'Godown Rack / Shelf'}
                  </label>
                  <input
                    type="text"
                    value={newProduct.rackLocation}
                    onChange={(e) => setNewProduct({ ...newProduct, rackLocation: e.target.value })}
                    placeholder="گودام 1 - ریک A"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-urdu"
                  />
                </div>
              </div>

            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition transform active:scale-95"
              >
                {isUrdu ? 'پروڈکٹ محفوظ کریں' : 'Save Product'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL 2: STOCK ADJUSTMENT / DAMAGE                                         */}
      {/* ========================================================================= */}
      <Dialog open={isAdjustModalOpen && !!selectedProduct} onOpenChange={(open) => setIsAdjustModalOpen(open)}>
        <DialogContent className="max-w-lg bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className={`text-xl font-bold text-white ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? 'اسٹاک درستگی یا نقصان کا اندراج' : 'Stock Adjustment & Damage'}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  {selectedProduct.name} —{' '}
                  <span className="text-emerald-400 font-semibold font-mono">
                    {selectedProduct.current_stock}{' '}
                    {isUrdu ? 'بوریاں موجود ہیں' : 'boriyan in stock'}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleStockAdjustment} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar space-y-4">
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isUrdu ? 'درستگی کی قسم*' : 'Adjustment Type*'}
                    </label>
                    <Select
                      value={adjustmentForm.movementType}
                      onValueChange={(val: any) =>
                        setAdjustmentForm({
                          ...adjustmentForm,
                          movementType: val,
                        })
                      }
                    >
                      <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white focus:ring-emerald-500">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="damage">
                          {isUrdu ? '📦 بوری پھٹ گئی یا مال خراب ہوا (Damage)' : '📦 Damaged / Torn Bag'}
                        </SelectItem>
                        <SelectItem value="adjustment">
                          {isUrdu ? '🔍 فزیکل گنتی میں فرق / درستگی (Audit)' : '🔍 Physical Audit Correction'}
                        </SelectItem>
                        <SelectItem value="return_in">
                          {isUrdu ? '↩️ کسان کی طرف سے واپسی (Customer Return)' : '↩️ Customer Return In'}
                        </SelectItem>
                        <SelectItem value="return_out">
                          {isUrdu ? '↪️ کمپنی کو مال واپسی (Vendor Return)' : '↪️ Vendor Return Out'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isUrdu
                        ? 'بوریوں کی تعداد (کم کرنے کے لیے منفی مثلاً -2 لگائیں)*'
                        : 'Quantity Change (Use negative e.g. -2 to deduct)*'}
                    </label>
                    <input
                      type="number"
                      required
                      value={adjustmentForm.quantity}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, quantity: e.target.value })
                      }
                      placeholder="-2"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-amber-400 font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isUrdu
                        ? `تبدیلی کے بعد متوقع اسٹاک: ${
                            selectedProduct.current_stock + (Number(adjustmentForm.quantity) || 0)
                          } بوریاں`
                        : `Projected new stock: ${
                            selectedProduct.current_stock + (Number(adjustmentForm.quantity) || 0)
                          } bags`}
                    </p>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isUrdu ? 'وجہ یا تفصیل' : 'Reason / Note'}
                    </label>
                    <textarea
                      rows={2}
                      value={adjustmentForm.reason}
                      onChange={(e) =>
                        setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })
                      }
                      placeholder={
                        isUrdu
                          ? 'مثلاً: لوڈنگ کے دوران ہک لگنے سے بوری پھٹ گئی'
                          : 'e.g. Torn bag during trolley loading'
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-urdu"
                    />
                  </div>
                </div>

                {/* Actions */}
                <DialogFooter>
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                  >
                    {isUrdu ? 'منسوخ کریں' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-900/30 transition transform active:scale-95"
                  >
                    {isUrdu ? 'اسٹاک درست کریں' : 'Confirm Adjustment'}
                  </button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
  </div>
);
}
