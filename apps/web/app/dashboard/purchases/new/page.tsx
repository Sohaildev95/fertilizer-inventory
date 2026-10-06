'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../../lib/language-context';
import {
  Truck,
  Package,
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  PlusCircle,
  Trash2,
  CheckCircle2,
  Wallet,
  MapPin,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

const AVAILABLE_PRODUCTS = [
  { id: 'prd-1', name: 'Sona Urea 50kg (سونا یوریا)', defaultCost: 4200 },
  { id: 'prd-2', name: 'Engro Urea 50kg (اینگرو یوریا)', defaultCost: 4180 },
  { id: 'prd-3', name: 'Sona DAP 50kg (سونا ڈی اے پی)', defaultCost: 11800 },
  { id: 'prd-4', name: 'Engro Zorawar DAP (اینگرو ڈی اے پی)', defaultCost: 12200 },
  { id: 'prd-5', name: 'Sarsabz CAN (گوارا سرسبز)', defaultCost: 3600 },
  { id: 'prd-6', name: 'Pioneer Corn 30Y87 (مکئی بیج)', defaultCost: 8500 },
  { id: 'prd-7', name: 'Belt Expert 100ml (سپرے)', defaultCost: 1850 },
];

export default function NewPurchasePage() {
  const { isUrdu } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    vendorName: 'Fauji Fertilizer (FFC)',
    invoiceNo: `PUR-2026-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().slice(0, 10),
    vehicleNo: '',
    biltyNo: '',
    destination: 'گودام 1 - مین ہال',
    paymentMethod: 'bank_transfer',
    paidAmount: '',
    notes: '',
  });

  const [items, setItems] = useState([
    { productId: 'prd-1', productName: 'Sona Urea 50kg (سونا یوریا)', quantity: 100, unitPrice: 4200 },
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { productId: 'prd-1', productName: 'Sona Urea 50kg (سونا یوریا)', quantity: 50, unitPrice: 4200 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity' | 'unitPrice', value: string | number) => {
    const updated = [...items];
    const current = updated[index];
    if (!current) return;

    if (field === 'productId') {
      const selected = AVAILABLE_PRODUCTS.find((p) => p.id === value);
      if (selected) {
        updated[index] = {
          ...current,
          productId: selected.id,
          productName: selected.name,
          unitPrice: selected.defaultCost,
        };
      }
    } else if (field === 'quantity') {
      updated[index] = {
        ...current,
        quantity: Number(value) || 0,
      };
    } else if (field === 'unitPrice') {
      updated[index] = {
        ...current,
        unitPrice: Number(value) || 0,
      };
    }
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const totalBags = items.reduce((sum, it) => sum + it.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate save and return to purchases list
    router.push('/dashboard/purchases');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Top back button & title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/purchases"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className={`text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'نیا اسٹاک ان بل اندراج' : 'New Stock-In Purchase Bill'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isUrdu
                ? 'کھاد یا بیج کی گاڑی کی آمد، بلٹی اور گودام میں مال شامل کرنے کا فارم'
                : 'Enter incoming fertilizer trailer, bilty number, bags, and auto-increment warehouse stock.'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Package className="w-3.5 h-3.5" />
          <span>{totalBags} {isUrdu ? 'بوریاں' : 'Bags Total'}</span>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Invoice & Supplier Info */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            {isUrdu ? '1. سپلائر و ٹرانسپورٹ کی معلومات' : '1. Supplier & Transport Information'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {isUrdu ? 'کھاد کمپنی / سپلائر*' : 'Supplier Vendor*'}
              </label>
              <Select
                value={formData.vendorName}
                onValueChange={(val) => setFormData({ ...formData, vendorName: val })}
              >
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-[42px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fauji Fertilizer (FFC)">Fauji Fertilizer (FFC) - سونا</SelectItem>
                  <SelectItem value="Engro Fertilizers">Engro Fertilizers - اینگرو</SelectItem>
                  <SelectItem value="Fatima Fertilizer">Fatima Fertilizer - سرسبز</SelectItem>
                  <SelectItem value="Pioneer Seeds">Pioneer Seeds - پائینیر</SelectItem>
                  <SelectItem value="Bayer Crop Science">Bayer Crop Science - بائر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {isUrdu ? 'انوائس / بل نمبر*' : 'Invoice / Bill No*'}
              </label>
              <input
                type="text"
                required
                value={formData.invoiceNo}
                onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {isUrdu ? 'آمد کی تاریخ*' : 'Arrival Date*'}
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {isUrdu ? 'گاڑی نمبر / ٹرانسپورٹ' : 'Vehicle / Truck No'}
              </label>
              <input
                type="text"
                value={formData.vehicleNo}
                onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                placeholder={isUrdu ? 'مثلاً: TK-4421 ملتان گڈز' : 'e.g. TRK-7842 Goods'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {isUrdu ? 'بلٹی نمبر' : 'Bilty / LR Number'}
              </label>
              <input
                type="text"
                value={formData.biltyNo}
                onChange={(e) => setFormData({ ...formData, biltyNo: e.target.value })}
                placeholder="BL-xxxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {isUrdu ? 'گودام / منزل' : 'Warehouse Godown'}
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="گودام 1 - مین ہال"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Received Items Table */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              {isUrdu ? '2. موصولہ اشیاء (بوریاں و خریداری ریٹ)' : '2. Received Items (Bags & Cost Rates)'}
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              {isUrdu ? '+ مزید کھاد شامل کریں' : '+ Add Item Row'}
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 items-center p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80"
              >
                <div className="col-span-5">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {isUrdu ? 'پراڈکٹ / کھاد' : 'Product'}
                  </label>
                  <Select
                    value={item.productId}
                    onValueChange={(val) => handleItemChange(index, 'productId', val)}
                  >
                    <SelectTrigger className="w-full bg-white border-slate-200 h-[40px] text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_PRODUCTS.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="text-xs">
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {isUrdu ? 'بوریاں (تعداد)*' : 'Quantity (Bags)*'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {isUrdu ? 'فی بوری ریٹ (روپے)*' : 'Cost Rate / Bag*'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-1 flex items-center justify-center pt-5">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Financial Settlement & Actions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            {isUrdu ? '3. ادائیگی و حساب کتاب' : '3. Payment Settlement'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {isUrdu ? 'ادائیگی کا طریقہ' : 'Payment Method'}
              </label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}
              >
                <SelectTrigger className="w-full bg-slate-50 border-slate-200 h-[42px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">{isUrdu ? 'بینک ٹرانسفر (Bank)' : 'Bank Transfer'}</SelectItem>
                  <SelectItem value="cash">{isUrdu ? 'نقد کاؤنٹر (Cash)' : 'Cash'}</SelectItem>
                  <SelectItem value="cheque">{isUrdu ? 'بینک چیک (Cheque)' : 'Cheque'}</SelectItem>
                  <SelectItem value="credit">{isUrdu ? 'کمپنی کریڈٹ کھاتہ (Company Credit)' : 'Company Credit'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                {isUrdu ? 'ادا شدہ رقم (روپے)' : 'Amount Paid (PKR)'}
              </label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between mt-3">
            <div>
              <span className="text-xs text-emerald-800 font-semibold block">
                {isUrdu ? 'کل بل کی رقم (Grand Total):' : 'Grand Total:'}
              </span>
              <span className="text-2xl font-black text-emerald-900 font-mono mt-0.5 block">
                Rs. {totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold block">
                {isUrdu ? 'باقی واجب الادا رقم:' : 'Remaining Balance:'}
              </span>
              <span className="text-lg font-bold text-rose-600 font-mono mt-0.5 block">
                Rs. {Math.max(0, totalAmount - (Number(formData.paidAmount) || 0)).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/purchases"
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition"
            >
              {isUrdu ? 'منسوخ کریں' : 'Cancel'}
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm shadow-emerald-600/20 transition transform active:scale-95"
            >
              {isUrdu ? 'مال محفوظ کریں اور اسٹاک بڑھائیں' : 'Save Purchase & Increment Stock'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
