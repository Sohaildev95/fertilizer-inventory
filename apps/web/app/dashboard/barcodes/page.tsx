'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '../../../lib/language-context';
import { apiRequest } from '../../../lib/api-client';
import {
  ProductStickerCard,
  StickerProduct,
  StickerOptions,
} from '../../../components/barcode-sticker';
import {
  QrCode,
  Barcode,
  Printer,
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  CheckCircle2,
  ScanLine,
  LayoutGrid,
  Receipt,
  Sparkles,
  Loader2,
  RotateCcw,
} from 'lucide-react';

const FALLBACK_PRODUCTS: StickerProduct[] = [
  {
    id: 'prd-1',
    name: 'Sona Urea (سونا یوریا)',
    urdu_name: 'سونا یوریا کھاد ۵۰ کلو',
    sku: 'FFC-UREA-50',
    company_name: 'Fauji Fertilizer (FFC)',
    unit: 'bag_50kg',
    sale_price: 4450,
    batch_number: 'FFC-2026-08',
    rack_location: 'گودام 1 - ریک A',
  },
  {
    id: 'prd-2',
    name: 'Engro Urea (اینگرو یوریا)',
    urdu_name: 'اینگرو یوریا کھاد ۵۰ کلو',
    sku: 'ENG-UREA-50',
    company_name: 'Engro Fertilizers',
    unit: 'bag_50kg',
    sale_price: 4430,
    batch_number: 'ENG-2026-04',
    rack_location: 'گودام 1 - ریک B',
  },
  {
    id: 'prd-3',
    name: 'Sarsabz DAP (سرسَبز ڈی اے پی)',
    urdu_name: 'سرسَبز ڈی اے پی کھاد ۵۰ کلو',
    sku: 'FAT-DAP-50',
    company_name: 'Fatima Fertilizer',
    unit: 'bag_50kg',
    sale_price: 12400,
    batch_number: 'FAT-2026-11',
    rack_location: 'گودام 2 - ریک A',
  },
  {
    id: 'prd-4',
    name: 'FFC DAP (ایف ایف سی ڈی اے پی)',
    urdu_name: 'سونا ڈی اے پی کھاد ۵۰ کلو',
    sku: 'FFC-DAP-50',
    company_name: 'Fauji Fertilizer (FFC)',
    unit: 'bag_50kg',
    sale_price: 12500,
    batch_number: 'FFC-DAP-2026',
    rack_location: 'گودام 2 - ریک B',
  },
  {
    id: 'prd-5',
    name: 'Sona SOP Potash (سونا پوٹاش)',
    urdu_name: 'سونا پوٹاش ایس او پی ۵۰ کلو',
    sku: 'FFC-SOP-50',
    company_name: 'Fauji Fertilizer (FFC)',
    unit: 'bag_50kg',
    sale_price: 14500,
    batch_number: 'FFC-SOP-09',
    rack_location: 'گودام 3 - ریک A',
  },
  {
    id: 'prd-6',
    name: 'Belt Expert 100ml (بیلٹ سپرے)',
    urdu_name: 'بیلٹ ایکسپرٹ سنڈی سپرے 100ml',
    sku: 'BAY-BELT-100',
    company_name: 'Bayer CropScience',
    unit: 'bottle_100ml',
    sale_price: 2150,
    batch_number: 'BAY-2603',
    expiry_date: '2027-08',
    rack_location: 'دوائی کیبنٹ A2',
  },
];

interface QueueItem {
  product: StickerProduct;
  copies: number;
}

function BarcodesStudioInner() {
  const { isUrdu } = useLanguage();
  const searchParams = useSearchParams();
  const initialSku = searchParams.get('sku');

  const [products, setProducts] = useState<StickerProduct[]>(FALLBACK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Print Queue
  const [queue, setQueue] = useState<QueueItem[]>([
    { product: FALLBACK_PRODUCTS[0]!, copies: 6 },
    { product: FALLBACK_PRODUCTS[2]!, copies: 3 },
  ]);

  // Sticker Options
  const [mode, setMode] = useState<'barcode' | 'qr' | 'both'>('both');
  const [paperMode, setPaperMode] = useState<'a4' | 'thermal'>('a4');
  const [showShopName, setShowShopName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showBatch, setShowBatch] = useState(true);
  const [showRack, setShowRack] = useState(true);
  const [shopName, setShopName] = useState('پنجاب کھاد ایجنسی');

  // Hardware Scanner Test Box
  const [scannerTestInput, setScannerTestInput] = useState('');
  const [scannedResult, setScannedResult] = useState<StickerProduct | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const res = await apiRequest<{ data: any[] }>('/products?limit=100');
        if (res?.data && res.data.length > 0) {
          const mapped: StickerProduct[] = res.data.map((p) => ({
            id: p.id,
            name: p.name,
            urdu_name: p.urdu_name,
            sku: p.sku || `SKU-${String(p.id).slice(0, 6).toUpperCase()}`,
            company_name: p.company_name || 'Agri Brand',
            unit: p.unit || 'bag_50kg',
            sale_price: Number(p.sale_price || 0),
            batch_number: p.batch_number,
            expiry_date: p.expiry_date,
            rack_location: p.rack_location,
          }));
          setProducts(mapped);

          if (initialSku) {
            const match = mapped.find(
              (p) => p.sku.toLowerCase() === initialSku.toLowerCase(),
            );
            if (match) {
              setQueue([{ product: match, copies: 9 }]);
            }
          } else if (mapped.length >= 2) {
            setQueue([
              { product: mapped[0]!, copies: 6 },
              { product: mapped[1]!, copies: 3 },
            ]);
          }
        }
      } catch (err) {
        console.warn('Using fallback products for barcode studio:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [initialSku]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.urdu_name || '').toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.company_name.toLowerCase().includes(q),
    );
  }, [products, search]);

  const addToQueue = (product: StickerProduct, addCopies = 3) => {
    setQueue((prev) => {
      const existing = prev.find((q) => q.product.id === product.id);
      if (existing) {
        return prev.map((q) =>
          q.product.id === product.id ? { ...q, copies: q.copies + addCopies } : q,
        );
      }
      return [...prev, { product, copies: addCopies }];
    });
  };

  const updateCopies = (productId: string, delta: number) => {
    setQueue((prev) =>
      prev
        .map((q) =>
          q.product.id === productId
            ? { ...q, copies: Math.max(0, Math.min(120, q.copies + delta)) }
            : q,
        )
        .filter((q) => q.copies > 0),
    );
  };

  const setExactCopies = (productId: string, count: number) => {
    const clean = Math.max(1, Math.min(120, count || 1));
    setQueue((prev) =>
      prev.map((q) => (q.product.id === productId ? { ...q, copies: clean } : q)),
    );
  };

  const totalStickersCount = useMemo(
    () => queue.reduce((sum, q) => sum + q.copies, 0),
    [queue],
  );

  // Flatten queue into individual stickers for rendering the print sheet
  const flattenedStickers = useMemo(() => {
    const list: Array<{ key: string; product: StickerProduct }> = [];
    for (const item of queue) {
      for (let i = 0; i < item.copies; i++) {
        list.push({ key: `${item.product.id}-${i}`, product: item.product });
      }
    }
    return list;
  }, [queue]);

  const stickerOptions: StickerOptions = {
    mode,
    showShopName,
    showPrice,
    showBatch,
    showRack,
    shopName,
    isUrdu,
  };

  // Handle Scanner Test Input
  const handleScannerTestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && scannerTestInput.trim()) {
      e.preventDefault();
      const raw = scannerTestInput.trim();
      const skuPart = raw.includes('|') ? raw.split('|')[0]!.trim() : raw;
      const found = products.find(
        (p) => p.sku.toLowerCase() === skuPart.toLowerCase(),
      );
      setScannedResult(found || null);
      setScannerTestInput('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl sm:text-3xl font-black text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'بارکوڈ و QR اسٹیکر پرنٹنگ اسٹوڈیو' : 'Barcode & QR Code Sticker Studio'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Code 128 + QR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isUrdu
                ? 'گودام کی بوریوں، زرعی ادویات کی بوتلوں اور ریک کے لیے بارکوڈ / QR لیبلز تیار کر کے پرنٹ کریں'
                : 'Generate and print Code 128 barcodes and QR labels for fertilizer bags, pesticide bottles, and godown racks.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={() => setQueue([])}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isUrdu ? 'قطار صاف کریں' : 'Clear Queue'}</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            disabled={flattenedStickers.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>
              {isUrdu
                ? `اسٹیکرز پرنٹ کریں (${totalStickersCount})`
                : `Print Stickers (${totalStickersCount})`}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Studio Controls + Scanner Test Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Product Picker + Print Queue Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Format & Print Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-4">
            <h3 className={`text-sm font-bold text-slate-900 flex items-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}>
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'اسٹیکر ڈیزائن اور پرنٹ سیٹنگز' : 'Label Format & Print Settings'}</span>
            </h3>

            {/* Barcode vs QR vs Both */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMode('barcode')}
                className={`p-2.5 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition ${
                  mode === 'barcode'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Barcode className="w-4 h-4" />
                <span>{isUrdu ? 'صرف بارکوڈ' : 'Barcode'}</span>
              </button>

              <button
                onClick={() => setMode('qr')}
                className={`p-2.5 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition ${
                  mode === 'qr'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>{isUrdu ? 'صرف QR کوڈ' : 'QR Code'}</span>
              </button>

              <button
                onClick={() => setMode('both')}
                className={`p-2.5 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition ${
                  mode === 'both'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>{isUrdu ? 'دونوں (مکمل)' : 'Both'}</span>
              </button>
            </div>

            {/* Paper Size: A4 Grid vs Thermal Roll */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaperMode('a4')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                  paperMode === 'a4'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'A4 اسٹیکر شیٹ (3 کالم)' : 'A4 Sheet (3-Col Grid)'}</span>
              </button>

              <button
                onClick={() => setPaperMode('thermal')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                  paperMode === 'thermal'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'تھرمل لیبل رول (76mm)' : 'Thermal Label Roll'}</span>
              </button>
            </div>

            {/* Shop Name Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {isUrdu ? 'اسٹیکر پر دکان کا نام:' : 'Shop Name on Label:'}
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Detail Toggles */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: isUrdu ? 'دکان کا نام دکھائیں' : 'Show Shop Name', val: showShopName, set: setShowShopName },
                { label: isUrdu ? 'قیمت (Rate) دکھائیں' : 'Show Price', val: showPrice, set: setShowPrice },
                { label: isUrdu ? 'بیچ و ایکسپائری' : 'Batch & Expiry', val: showBatch, set: setShowBatch },
                { label: isUrdu ? 'گودام ریک لوکیشن' : 'Rack Location', val: showRack, set: setShowRack },
              ].map((t, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={t.val}
                    onChange={(e) => t.set(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-700 truncate">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Product Selector Catalog */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-bold text-slate-900 flex items-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}>
                <Package className="w-4 h-4 text-emerald-600" />
                <span>{isUrdu ? 'اسٹاک سے کھاد / دوا منتخب کریں' : 'Select Products for Labels'}</span>
              </h3>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isUrdu ? 'کھاد، SKU یا کمپنی تلاش کریں...' : 'Search product or SKU...'}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="max-h-[260px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="p-2.5 rounded-xl border border-slate-200/80 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/30 flex items-center justify-between gap-2 transition"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {isUrdu && prod.urdu_name ? prod.urdu_name : prod.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                      <span className="bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                        {prod.sku}
                      </span>
                      <span>Rs. {prod.sale_price.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => addToQueue(prod, 3)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 flex-shrink-0 transition active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+3</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Queue Quantity Adjuster */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {isUrdu ? 'پرنٹ قطار (تعداد ایڈجسٹ کریں)' : 'Print Queue Quantities'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                {totalStickersCount} {isUrdu ? 'اسٹیکرز' : 'Labels'}
              </span>
            </div>

            {queue.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                {isUrdu ? 'اوپر سے کوئی کھاد منتخب کریں' : 'Select a product above to add stickers'}
              </p>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                {queue.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">
                        {isUrdu && item.product.urdu_name
                          ? item.product.urdu_name
                          : item.product.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {item.product.sku}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => updateCopies(item.product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={item.copies}
                        onChange={(e) =>
                          setExactCopies(item.product.id, Number(e.target.value))
                        }
                        className="w-11 text-center py-0.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg"
                      />
                      <button
                        onClick={() => updateCopies(item.product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateCopies(item.product.id, -item.copies)}
                        className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Hardware Scanner Test + Live Print Sheet Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Hardware Barcode Scanner Quick Tester */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-emerald-400" />
                <span className="text-xs sm:text-sm font-bold">
                  {isUrdu
                    ? 'بارکوڈ اسکینر ٹیسٹ باکس (USB / Bluetooth Scanner)'
                    : 'Barcode Scanner Test Box'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                POS Ready (Code 128B & QR)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={scannerTestInput}
                onChange={(e) => setScannerTestInput(e.target.value)}
                onKeyDown={handleScannerTestKeyDown}
                placeholder={
                  isUrdu
                    ? 'یہاں کلک کر کے اسکینر سے بارکوڈ اسکین کریں یا SKU لکھ کر Enter دبائیں...'
                    : 'Focus here & scan any printed barcode/QR (or type SKU + Enter)...'
                }
                className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {scannedResult && (
                <div className="px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">
                    {scannedResult.name} — Rs. {scannedResult.sale_price.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Printable Sticker Sheet Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {paperMode === 'a4'
                    ? isUrdu
                      ? 'A4 پرنٹ شیٹ پیش منظر (3 کالم اسٹیکرز)'
                      : 'A4 Sticker Sheet Preview (3-Column Grid)'
                    : isUrdu
                    ? 'تھرمل لیبل رول پیش منظر (76mm)'
                    : 'Thermal Roll Label Preview (76mm)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isUrdu
                    ? 'پرنٹ بٹن دبانے پر صرف یہ اسٹیکر شیٹ پرنٹ ہوگی'
                    : 'Only these labels will appear when printing.'}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {totalStickersCount} Labels
              </span>
            </div>

            {flattenedStickers.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <QrCode className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">
                  {isUrdu ? 'اسٹیکرز دیکھنے کے لیے بائیں جانب سے کھاد شامل کریں' : 'Add products from the left to preview labels'}
                </p>
              </div>
            ) : (
              <div
                id={paperMode === 'a4' ? 'printable-barcode-sheet' : 'printable-thermal-sticker'}
                className={
                  paperMode === 'a4'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'
                    : 'flex flex-col gap-3 max-w-[76mm] mx-auto'
                }
              >
                {flattenedStickers.map((entry) => (
                  <ProductStickerCard
                    key={entry.key}
                    product={entry.product}
                    options={stickerOptions}
                    compact={paperMode === 'thermal'}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BarcodesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
          <p className="text-xs font-semibold">Loading Barcode Studio...</p>
        </div>
      }
    >
      <BarcodesStudioInner />
    </Suspense>
  );
}
