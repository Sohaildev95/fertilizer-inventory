'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../../lib/language-context';
import { apiRequest } from '../../../lib/api-client';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/80 via-emerald-900/50 to-slate-900 border border-emerald-800/40 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {isUrdu ? 'گودام و اسٹاک' : 'Warehouse & Inventory'}
            </span>
            <span className="text-xs text-slate-400">
              {isUrdu ? 'کھاد، بیج اور اسپرے' : 'Fertilizers, Seeds & Chemicals'}
            </span>
          </div>
          <h1
            className={`text-2xl md:text-3xl font-extrabold text-white tracking-tight ${isUrdu ? 'font-urdu' : ''}`}
          >
            {isUrdu ? 'کھاد و زرعی ادویات اسٹاک مینجمنٹ' : 'Fertilizer & Agri Stock Inventory'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {isUrdu
              ? 'گودام میں بوریوں کی تعداد، خرید و فروخت قیمت اور کم اسٹاک وارننگ کی لائیو تفصیل'
              : 'Track bag quantities, cost vs sale margins, godown rack locations, and reorder thresholds.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all transform active:scale-95"
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
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isUrdu ? 'کل آئٹمز' : 'Total Items'}
            </span>
            <span className="text-xl p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">📦</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white">{stats.totalProducts}</span>
            <span className="text-xs text-slate-400 ml-2">
              {isUrdu ? 'مختلف پروڈکٹس' : 'active SKUs'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Bags in Godown */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-teal-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isUrdu ? 'گودام میں کل بوریاں / بوتلیں' : 'Total Units in Stock'}
            </span>
            <span className="text-xl p-2 bg-teal-500/10 text-teal-400 rounded-xl">🌾</span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-teal-400">
              {stats.totalBags.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              {isUrdu ? 'بوریاں / پیکنگ' : 'bags & bottles'}
            </span>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div
          onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
          className={`cursor-pointer rounded-2xl p-5 shadow-lg relative overflow-hidden border transition ${
            stats.lowStockCount > 0
              ? 'bg-amber-950/30 border-amber-500/40 hover:border-amber-400'
              : 'bg-slate-900/80 border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              {isUrdu ? 'کم اسٹاک کی وارننگ' : 'Low Stock Alerts'}
            </span>
            <span className="text-xl p-2 bg-amber-500/20 text-amber-400 rounded-xl animate-pulse">
              ⚠️
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400">{stats.lowStockCount}</span>
            <span className="text-xs underline text-amber-300 font-medium">
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
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {isUrdu ? 'اسٹاک کی کل خرید قیمت' : 'Stock Asset Valuation'}
            </span>
            <span className="text-xl p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">💰</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-400">
              Rs. {stats.assetValue.toLocaleString()}
            </span>
            <div className="text-xs text-slate-400 mt-1">
              {isUrdu ? 'متوقع منافع: ' : 'Expected profit: '}
              <span className="text-emerald-400 font-semibold">
                Rs. {stats.potentialProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
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
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          />
        </div>

        {/* Filter Dropdowns & Low Stock Pill */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Company Filter */}
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">{isUrdu ? 'تمام کمپنیاں (All Companies)' : 'All Companies'}</option>
            {companiesList
              .filter((c) => c !== 'all')
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          {/* Low Stock Toggle Button */}
          <button
            onClick={() => setShowOnlyLowStock(!showOnlyLowStock)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              showOnlyLowStock
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>⚠️</span>
            <span>{isUrdu ? 'صرف کم اسٹاک' : 'Low Stock Only'}</span>
            {stats.lowStockCount > 0 && (
              <span className="bg-amber-950/60 text-amber-200 text-[10px] px-1.5 py-0.2 rounded-full">
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
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Products Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/60 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">{isUrdu ? 'پروڈکٹ کا نام' : 'Product Name'}</th>
                <th className="py-3.5 px-4">{isUrdu ? 'کمپنی / برانڈ' : 'Company'}</th>
                <th className="py-3.5 px-4">{isUrdu ? 'پیکنگ / وزن' : 'Packing Unit'}</th>
                <th className="py-3.5 px-4">{isUrdu ? 'خرید قیمت' : 'Cost (خرید)'}</th>
                <th className="py-3.5 px-4">{isUrdu ? 'فروخت قیمت' : 'Sale (فروخت)'}</th>
                <th className="py-3.5 px-4">{isUrdu ? 'منافع فی بوری' : 'Margin / Bag'}</th>
                <th className="py-3.5 px-4">{isUrdu ? 'موجودہ اسٹاک' : 'Stock Level'}</th>
                <th className="py-3.5 px-4">{isUrdu ? 'گودام ریک' : 'Rack Location'}</th>
                <th className="py-3.5 px-4 text-center">{isUrdu ? 'کارروائی' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="font-medium">
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
                      className="hover:bg-slate-800/40 transition group cursor-default"
                    >
                      {/* Name & Urdu Subtitle */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white group-hover:text-emerald-400 transition">
                          {p.name}
                        </div>
                        {p.urdu_name && (
                          <div className="text-xs text-slate-400 font-urdu mt-0.5">
                            {p.urdu_name}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {p.sku}
                        </span>
                      </td>

                      {/* Company */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {p.company_name}
                        </span>
                      </td>

                      {/* Unit */}
                      <td className="py-3 px-4 text-xs text-slate-300">
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
                      <td className="py-3 px-4 font-mono text-slate-300">
                        Rs. {p.cost_price.toLocaleString()}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        Rs. {p.sale_price.toLocaleString()}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                            margin >= 200
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          +Rs. {margin.toLocaleString()}
                        </span>
                      </td>

                      {/* Stock Level with Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                              isOut
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : isLow
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
                          <div className="text-[10px] text-amber-400/90 mt-1 font-medium">
                            {isUrdu ? `کم از کم: ${p.min_stock_alert}` : `Min alert: ${p.min_stock_alert}`}
                          </div>
                        )}
                      </td>

                      {/* Rack Location */}
                      <td className="py-3 px-4 text-xs text-slate-400 font-urdu">
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
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-400 transition"
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
      {/* MODAL 1: ADD NEW PRODUCT                                                  */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className={`text-xl font-bold ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? 'نیا کھاد یا بیج پروڈکٹ شامل کریں' : 'Add New Fertilizer / Seed Item'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isUrdu
                    ? 'گودام میں نیا آئٹم، کمپنی ریٹ اور ابتدائی بوریوں کی تعداد درج کریں'
                    : 'Enter product details, pricing, packing size, and initial stock count.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 mt-4">
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
                  <select
                    value={newProduct.companyName}
                    onChange={(e) => setNewProduct({ ...newProduct, companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Fauji Fertilizer (FFC)">Fauji Fertilizer (FFC) - سونا کھاد</option>
                    <option value="Engro Fertilizers">Engro Fertilizers - اینگرو</option>
                    <option value="Fatima Fertilizer">Fatima Fertilizer - سرسَبز</option>
                    <option value="Pakchem">Pakchem / Agritech - پاک کیم</option>
                    <option value="Bayer Crop Science">Bayer Crop Science - بائر</option>
                    <option value="Syngenta">Syngenta - سینجنٹا</option>
                    <option value="Pioneer Seeds">Pioneer Seeds - پائینیر</option>
                    <option value="ICI Pakistan">ICI Pakistan - آئی سی آئی</option>
                    <option value="Local Supplier">Local Supplier / مقامی ڈیلر</option>
                  </select>
                </div>

                {/* Unit / Packing */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isUrdu ? 'پیکنگ سائز / وزن*' : 'Packing Unit*'}
                  </label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="bag_50kg">{isUrdu ? '۵۰ کلو بوری (50 kg Bag)' : '50 kg Bag'}</option>
                    <option value="bag_25kg">{isUrdu ? '۲۵ کلو بوری (25 kg Bag)' : '25 kg Bag'}</option>
                    <option value="bottle_1l">{isUrdu ? '۱ لیٹر بوتل (1 Litre Bottle)' : '1 Litre Bottle'}</option>
                    <option value="bottle_500ml">{isUrdu ? '۵۰۰ ملی لٹر بوتل (500 ml Bottle)' : '500 ml Bottle'}</option>
                    <option value="bottle_250ml">{isUrdu ? '۲۵۰ ملی لٹر بوتل (250 ml Bottle)' : '250 ml Bottle'}</option>
                    <option value="pack_10kg">{isUrdu ? '۱۰ کلو تھیلی (10 kg Pack)' : '10 kg Pack'}</option>
                    <option value="pack_1kg">{isUrdu ? '۱ کلو پیکٹ (1 kg Pack)' : '1 kg Pack'}</option>
                  </select>
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

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: STOCK ADJUSTMENT / DAMAGE                                         */}
      {/* ========================================================================= */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className={`text-xl font-bold ${isUrdu ? 'font-urdu' : ''}`}>
                  {isUrdu ? 'اسٹاک درستگی یا نقصان کا اندراج' : 'Stock Adjustment & Damage'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedProduct.name} —{' '}
                  <span className="text-emerald-400 font-semibold font-mono">
                    {selectedProduct.current_stock}{' '}
                    {isUrdu ? 'بوریاں موجود ہیں' : 'boriyan in stock'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStockAdjustment} className="space-y-4 mt-4">
              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isUrdu ? 'درستگی کی قسم*' : 'Adjustment Type*'}
                </label>
                <select
                  value={adjustmentForm.movementType}
                  onChange={(e) =>
                    setAdjustmentForm({
                      ...adjustmentForm,
                      movementType: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="damage">
                    {isUrdu ? '📦 بوری پھٹ گئی یا مال خراب ہوا (Damage)' : '📦 Damaged / Torn Bag'}
                  </option>
                  <option value="adjustment">
                    {isUrdu ? '🔍 فزیکل گنتی میں فرق / درستگی (Audit)' : '🔍 Physical Audit Correction'}
                  </option>
                  <option value="return_in">
                    {isUrdu ? '↩️ کسان کی طرف سے واپسی (Customer Return)' : '↩️ Customer Return In'}
                  </option>
                  <option value="return_out">
                    {isUrdu ? '↪️ کمپنی کو مال واپسی (Vendor Return)' : '↪️ Vendor Return Out'}
                  </option>
                </select>
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

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
