'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Building2,
  DollarSign,
  FileBarChart2,
  Settings,
  LogOut,
  Sprout,
  Menu,
  X,
  Search,
  PlusCircle,
  Bell,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { LanguageToggle } from '../../components/language-toggle';

interface NavItem {
  name: string;
  urduName: string;
  href: string;
  icon: any;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', urduName: 'ڈیش بورڈ', href: '/dashboard', icon: LayoutDashboard },
  { name: 'POS Counter', urduName: 'کاؤنٹر سیل (پرچی)', href: '/dashboard/pos', icon: ShoppingCart, badge: 'FAST' },
  { name: 'Products & Stock', urduName: 'کھاد اسٹاک و پراڈکٹس', href: '/dashboard/products', icon: Package },
  { name: 'Purchases', urduName: 'مال کی خریداری', href: '/dashboard/purchases', icon: Truck },
  { name: 'Customers & Khata', urduName: 'زمیندار کھاتہ رجسٹر', href: '/dashboard/customers', icon: Users },
  { name: 'Vendors (Suppliers)', urduName: 'سپلائرز و کمپنیاں', href: '/dashboard/vendors', icon: Building2 },
  { name: 'Daily Expenses', urduName: 'روزانہ کا خرچہ', href: '/dashboard/expenses', icon: DollarSign },
  { name: 'Reports & Profit', urduName: 'نفع و نقصان رپورٹس', href: '/dashboard/reports', icon: FileBarChart2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const { isUrdu, t } = useLanguage();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '280px',
          backgroundColor: '#064e3b',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderInlineEnd: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        {/* Top Brand */}
        <div>
          <div
            style={{
              padding: '24px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Sprout size={24} color="#ffffff" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2
                style={{
                  fontSize: '16px',
                  fontWeight: '800',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {profile?.shop_name || 'Kissan Fertilizer'}
              </h2>
              <p style={{ fontSize: '12px', color: '#6ee7b7' }}>انوینٹری اور سیلز سسٹم</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    background: isActive ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                    border: isActive ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={19} color={isActive ? '#34d399' : '#94a3b8'} />
                    <span style={{ fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit' }}>
                      {isUrdu ? item.urduName : item.name}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        padding: '2px 8px',
                        fontSize: '10px',
                        fontWeight: '800',
                        borderRadius: '999px',
                        background: '#f59e0b',
                        color: '#78350f',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#ffffff',
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {profile?.full_name || 'Admin'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Shield size={11} color="#34d399" />
                  <span style={{ fontSize: '11px', color: '#a7f3d0', textTransform: 'capitalize' }}>
                    {profile?.role?.replace('_', ' ') || 'Super Admin'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={16} />
            <span>{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header
          style={{
            height: '70px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '480px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder={
                  isUrdu
                    ? 'کھاد (یوریا، ڈی اے پی)، بل نمبر، زمیندار کا نام تلاش کریں...'
                    : 'Search fertilizer (Urea, DAP), bills, customer...'
                }
                className="form-input"
                style={{
                  paddingInlineStart: '38px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                }}
              />
            </div>
          </div>

          {/* Quick Actions & Language Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Language Switcher */}
            <LanguageToggle />

            <Link
              href="/dashboard/pos"
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <ShoppingCart size={16} />
              <span>{isUrdu ? 'نیا بل (پرچی)' : 'New POS Bill'}</span>
            </Link>

            <Link
              href="/dashboard/purchases/new"
              className="btn btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <PlusCircle size={16} />
              <span>{isUrdu ? 'مال خریداری' : 'Stock In'}</span>
            </Link>

            {/* Notification Bell */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                background: '#ffffff',
              }}
            >
              <Bell size={18} color="#64748b" />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                }}
              />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main style={{ padding: '32px', flex: 1 }}>{children}</main>
      </div>
    </div>
  );
}
