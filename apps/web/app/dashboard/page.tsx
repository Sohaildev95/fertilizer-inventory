'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import {
  TrendingUp,
  Receipt,
  BookOpen,
  AlertTriangle,
  ShoppingCart,
} from 'lucide-react';
import { DashboardCharts } from '../../components/dashboard-charts';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { isUrdu } = useLanguage();

  const stats = [
    {
      title: isUrdu ? 'آج کی کل فروخت' : "Today's Sales",
      amount: 'Rs. 285,400',
      change: isUrdu ? '+14% کل سے زیادہ' : '+14% from yesterday',
      subtext: isUrdu ? 'آج 18 بل بنائے گئے' : '18 bills generated today',
      icon: TrendingUp,
      color: '#059669',
      bgLight: '#ecfdf5',
    },
    {
      title: isUrdu ? 'زمینداروں کا بقایا (ادھار کھاتہ)' : 'Customer Khata (Receivables)',
      amount: 'Rs. 1,420,000',
      change: isUrdu ? '38 زمیندار بقایا' : '38 farmers with balance',
      subtext: isUrdu ? 'Rs. 120,000 آج وصول ہوا' : 'Rs. 120,000 received today',
      icon: BookOpen,
      color: '#d97706',
      bgLight: '#fef3c7',
    },
    {
      title: isUrdu ? 'کمپنیوں کے واجبات (سپلائرز)' : 'Company Payables',
      amount: 'Rs. 2,650,000',
      change: 'Engro, FFC, Fatima',
      subtext: isUrdu ? 'اگلی ادائیگی: جمعہ' : 'Next payment: Friday',
      icon: Receipt,
      color: '#2563eb',
      bgLight: '#eff6ff',
    },
    {
      title: isUrdu ? 'کم اسٹاک کھاد الرٹ' : 'Low Stock Warning',
      amount: isUrdu ? '4 کھاد پراڈکٹس' : '4 Products',
      change: isUrdu ? 'فوری آرڈر کریں' : 'Reorder needed',
      subtext: isUrdu ? 'یوریا، پوٹاش، زنک 33%' : 'Urea, SOP, Zinc 33%',
      icon: AlertTriangle,
      color: '#dc2626',
      bgLight: '#fef2f2',
    },
  ];

  const recentSales = [
    { id: 'SI-1042', customer: isUrdu ? 'چوہدری اسلم (چک 14)' : 'Chaudhry Aslam (Chak 14)', items: isUrdu ? 'یوریا (15 بوری)' : 'Urea (15 Bags)', total: 'Rs. 67,500', paid: 'Rs. 40,000', balance: 'Rs. 27,500', status: 'partial' },
    { id: 'SI-1041', customer: isUrdu ? 'میاں طارق (موضع خانپور)' : 'Mian Tariq (Mauza Khanpur)', items: isUrdu ? 'ڈی اے پی (10 بوری)، پوٹاش (4 بوری)' : 'DAP (10 Bags), SOP (4 Bags)', total: 'Rs. 182,000', paid: 'Rs. 182,000', balance: 'Rs. 0', status: 'paid' },
    { id: 'SI-1040', customer: isUrdu ? 'عام نقد کسان (واک ان)' : 'Walk-in Cash Farmer', items: isUrdu ? 'زنک سلفیٹ (5 پیک)' : 'Zinc Sulphate (5 Packs)', total: 'Rs. 8,500', paid: 'Rs. 8,500', balance: 'Rs. 0', status: 'paid' },
    { id: 'SI-1039', customer: isUrdu ? 'رانا بشیر (چک 22)' : 'Rana Bashir (Chak 22)', items: isUrdu ? 'اینگرو زورآور (20 بوری)' : 'Engro Zorawar (20 Bags)', total: 'Rs. 110,000', paid: 'Rs. 0', balance: 'Rs. 110,000', status: 'unpaid' },
  ];

  const lowStockItems = [
    { name: isUrdu ? 'سونا یوریا کھاد' : 'Sona Urea (Prilled)', company: 'FFC', stock: 12, minAlert: 50, unit: isUrdu ? 'بوری (50 کلو)' : 'Bags (50kg)' },
    { name: isUrdu ? 'اینگرو ڈی اے پی' : 'Engro DAP', company: 'Engro Fertilizers', stock: 8, minAlert: 30, unit: isUrdu ? 'بوری (50 کلو)' : 'Bags (50kg)' },
    { name: isUrdu ? 'سلفیٹ آف پوٹاش (SOP)' : 'Fauji SOP Potash', company: 'FFC', stock: 5, minAlert: 20, unit: isUrdu ? 'بوری (50 کلو)' : 'Bags (50kg)' },
    { name: isUrdu ? 'سوات ایگرو زنک 33%' : 'Swat Agro Zinc 33%', company: 'Swat Agro', stock: 4, minAlert: 15, unit: isUrdu ? 'پیکٹ (3 کلو)' : 'Packs (3kg)' },
  ];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              {isUrdu ? 'دکان کا جائزہ' : 'SHOP OVERVIEW'}
            </span>
            <span style={{ fontSize: '13px', color: '#a7f3d0' }}>
              {new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: '800',
              marginBottom: '6px',
              fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit',
            }}
          >
            {isUrdu
              ? `خوش آمدید، ${profile?.full_name || 'ملک صاحب'}! 👋`
              : `Welcome, ${profile?.full_name || 'Admin'}! 👋`}
          </h1>
          <p style={{ fontSize: '14px', color: '#ecfdf5', opacity: 0.9 }}>
            {profile?.shop_name || (isUrdu ? 'الرزاق فرٹیلائزر اینڈ پیسٹیسائیڈز ایجنسی' : 'Al-Razaq Fertilizer Agency')} —{' '}
            {isUrdu ? 'دکان کی تمام فروخت اور کھاتہ ایکٹیو ہے۔' : 'All sales and inventory systems active.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            href="/dashboard/pos"
            className="btn"
            style={{
              backgroundColor: '#ffffff',
              color: '#065f46',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '12px 20px',
              fontWeight: '700',
            }}
          >
            <ShoppingCart size={18} />
            <span>{isUrdu ? 'کاؤنٹر بل بنائیں (POS)' : 'New POS Bill'}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>
                    {stat.title}
                  </span>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: stat.bgLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} color={stat.color} />
                  </div>
                </div>

                <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                  {stat.amount}
                </h3>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '12px',
                }}
              >
                <span style={{ color: stat.color, fontWeight: '700' }}>{stat.change}</span>
                <span style={{ color: '#94a3b8' }}>{stat.subtext}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4 Beautiful Animated Business Charts */}
      <DashboardCharts />

      {/* Lower Section: 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr', gap: '24px' }}>
        {/* Recent Counter Sales */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                {isUrdu ? 'حالیہ کاؤنٹر فروخت (بل پرچی)' : 'Recent POS Counter Sales'}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                {isUrdu ? 'آج کی گئی کسٹمر سیلز کی تفصیل' : 'Latest customer transactions and receipts'}
              </p>
            </div>
            <Link
              href="/dashboard/pos"
              style={{ fontSize: '13px', fontWeight: '700', color: '#059669', textDecoration: 'none' }}
            >
              {isUrdu ? 'تمام بل دیکھیں ←' : 'View All →'}
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '12px' }}>
                  <th style={{ padding: '10px 8px' }}>{isUrdu ? 'بل نمبر' : 'Bill #'}</th>
                  <th style={{ padding: '10px 8px' }}>{isUrdu ? 'کسٹمر / زمیندار' : 'Zamindar / Customer'}</th>
                  <th style={{ padding: '10px 8px' }}>{isUrdu ? 'کھاد پراڈکٹس' : 'Items'}</th>
                  <th style={{ padding: '10px 8px' }}>{isUrdu ? 'کل رقم' : 'Total'}</th>
                  <th style={{ padding: '10px 8px' }}>{isUrdu ? 'بقایا (ادھار)' : 'Balance (Udhaar)'}</th>
                  <th style={{ padding: '10px 8px' }}>{isUrdu ? 'حیثیت' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '700', color: '#059669' }}>{sale.id}</td>
                    <td style={{ padding: '12px 8px', fontWeight: '600', color: '#1e293b' }}>{sale.customer}</td>
                    <td style={{ padding: '12px 8px', color: '#64748b' }}>{sale.items}</td>
                    <td style={{ padding: '12px 8px', fontWeight: '700' }}>{sale.total}</td>
                    <td style={{ padding: '12px 8px', fontWeight: '700', color: sale.balance !== 'Rs. 0' ? '#d97706' : '#64748b' }}>
                      {sale.balance}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        className={`badge ${
                          sale.status === 'paid'
                            ? 'badge-success'
                            : sale.status === 'partial'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {sale.status === 'paid'
                          ? (isUrdu ? 'نقد وصول' : 'Paid')
                          : sale.status === 'partial'
                          ? (isUrdu ? 'کچھ ادا' : 'Partial')
                          : (isUrdu ? 'ادھار کھاتہ' : 'Udhaar')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                {isUrdu ? 'کم کھاد اسٹاک الرٹ' : 'Low Stock Warning'}
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>
                {isUrdu ? 'گودام میں موجود بوریوں کی تعداد کم ہے' : 'Bags below minimum alert level'}
              </p>
            </div>
            <Link
              href="/dashboard/products"
              style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', textDecoration: 'none' }}
            >
              {isUrdu ? 'آرڈر کریں ←' : 'Reorder →'}
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lowStockItems.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fee2e2',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#991b1b', marginBottom: '2px' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#b91c1c' }}>
                    {item.company}
                  </p>
                </div>
                <div style={{ textAlign: isUrdu ? 'left' : 'right' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#dc2626' }}>
                    {item.stock} {item.unit}
                  </span>
                  <p style={{ fontSize: '11px', color: '#7f1d1d' }}>
                    {isUrdu ? `کم از کم حد: ${item.minAlert}` : `Min alert: ${item.minAlert}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
