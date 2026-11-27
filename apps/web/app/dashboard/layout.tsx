'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { canRoleAccessRoute, getRoleHomeRoute } from '@fertilizer/shared';
import { useAuth } from '../../lib/auth-context';
import {
  Gauge,
  Wheat,
  ScanBarcode,
  ScanQrCode,
  PackagePlus,
  BookUser,
  Radio,
  Warehouse,
  ShieldCheck,
  WalletCards,
  ChartNoAxesCombined,
  Compass,
  ShoppingCart,
  LogOut,
  Sprout,
  Menu,
  X,
  PlusCircle,
  Bell,
  BookOpen,
} from 'lucide-react';
import { useLanguage } from '../../lib/language-context';
import { LanguageToggle } from '../../components/language-toggle';

interface NavItem {
  name: string;
  urduName: string;
  href: string;
  icon: any;
  accent: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', urduName: 'ڈیش بورڈ', href: '/dashboard', icon: Gauge, accent: '#34d399' },
  { name: 'POS Counter', urduName: 'کاؤنٹر سیل (پرچی)', href: '/dashboard/pos', icon: ScanBarcode, accent: '#fbbf24', badge: 'FAST' },
  { name: 'Products & Stock', urduName: 'کھاد اسٹاک و پراڈکٹس', href: '/dashboard/products', icon: Wheat, accent: '#4ade80' },
  { name: 'Barcodes & Stickers', urduName: 'بارکوڈ و اسٹیکر پرنٹ', href: '/dashboard/barcodes', icon: ScanQrCode, accent: '#22d3ee', badge: 'PRINT' },
  { name: 'Purchases', urduName: 'مال کی خریداری', href: '/dashboard/purchases', icon: PackagePlus, accent: '#38bdf8' },
  { name: 'Customers & Khata', urduName: 'زمیندار کھاتہ رجسٹر', href: '/dashboard/customers', icon: BookUser, accent: '#a3e635' },
  { name: 'Broadcast & SMS', urduName: 'پیغامات و براڈکاسٹ', href: '/dashboard/broadcast', icon: Radio, accent: '#2dd4bf', badge: 'SMS' },
  { name: 'Vendors (Suppliers)', urduName: 'سپلائرز و کمپنیاں', href: '/dashboard/vendors', icon: Warehouse, accent: '#818cf8' },
  { name: 'Vendor Portal', urduName: 'کھاد کمپنی پورٹل', href: '/dashboard/vendors/portal', icon: ShieldCheck, accent: '#c084fc', badge: 'PORTAL' },
  { name: 'Daily Expenses', urduName: 'روزانہ کا خرچہ', href: '/dashboard/expenses', icon: WalletCards, accent: '#fb7185' },
  { name: 'Reports & Profit', urduName: 'نفع و نقصان رپورٹس', href: '/dashboard/reports', icon: ChartNoAxesCombined, accent: '#facc15' },
  { name: 'User Manual & Guide', urduName: 'رہنمائی و یوزر مینوئل', href: '/dashboard/guide', icon: Compass, accent: '#6ee7b7', badge: 'GUIDE' },
];

const getRoleDetails = (role?: string) => {
  switch (role) {
    case 'super_admin':
      return { label: 'Super Admin', urdu: 'دکان مالک (چاچو)', icon: '👑', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: '#10b981' };
    case 'shop_manager':
      return { label: 'Shop Manager', urdu: 'منشی / انوینٹری مینیجر', icon: '📋', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)', border: '#0284c7' };
    case 'sales_staff':
      return { label: 'Sales Counter', urdu: 'کاؤنٹر سیلزمین', icon: '🛒', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b' };
    case 'vendor':
      return { label: 'Vendor Portal', urdu: 'کھاد کمپنی سپلائر', icon: '🚚', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', border: '#8b5cf6' };
    default:
      return { label: 'Staff Member', urdu: 'اسٹاف اکاؤنٹ', icon: '👤', color: '#64748b', bg: 'rgba(100, 116, 139, 0.12)', border: '#64748b' };
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, logout } = useAuth();
  const { isUrdu, t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const roleInfo = getRoleDetails(profile?.role);
  const homeRoute = getRoleHomeRoute(profile?.role);
  const canAccessCurrentRoute = !profile?.role || canRoleAccessRoute(profile.role, pathname);
  const visibleNavItems = navItems.filter((item) =>
    profile?.role ? canRoleAccessRoute(profile.role, item.href) : false,
  );
  const canCreatePosBill = Boolean(profile?.role && canRoleAccessRoute(profile.role, '/dashboard/pos'));
  const canCreateStockIn = Boolean(
    profile?.role && canRoleAccessRoute(profile.role, '/dashboard/purchases/new'),
  );

  // Redirect to the user's role home portal if they visit a restricted dashboard URL
  useEffect(() => {
    if (!isLoading && profile?.role && !canRoleAccessRoute(profile.role, pathname)) {
      router.replace(getRoleHomeRoute(profile.role));
    }
  }, [isLoading, profile?.role, pathname, router]);

  // Auto-close mobile/tablet drawer when tab/route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar - Desktop Fixed / Mobile Slide-in Drawer */}
      <aside
        style={{
          width: '280px',
          backgroundColor: '#064e3b',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          borderInlineEnd: '1px solid rgba(255, 255, 255, 0.1)',
          height: '100vh',
          zIndex: 50,
          flexShrink: 0,
          overflow: 'hidden',
        }}
        className={`fixed lg:static inset-y-0 start-0 h-screen transition-transform duration-300 ease-in-out ${sidebarOpen
          ? 'translate-x-0 pointer-events-auto visible'
          : '-translate-x-full rtl:translate-x-full lg:translate-x-0 pointer-events-none invisible lg:pointer-events-auto lg:visible'
          }`}
      >
        {/* Top Brand (Pinned) */}
        <div
          style={{
            flexShrink: 0,
            padding: '20px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Link
            href={homeRoute}
            onClick={() => setSidebarOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden', textDecoration: 'none' }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                flexShrink: 0,
              }}
            >
              <Sprout size={22} color="#ffffff" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2
                style={{
                  fontSize: '15px',
                  fontWeight: '800',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {profile?.shop_name || 'Kissan Fertilizer'}
              </h2>
              <p style={{ fontSize: '11px', color: '#6ee7b7' }}>انوینٹری اور سیلز سسٹم</p>
            </div>
          </Link>

          {/* Close Button on Mobile Drawer */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800/60 transition"
            title="Close Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items (Scrollable inner area) */}
        <nav
          className="custom-scrollbar"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
          }}
        >
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#ffffff' : '#e2e8f0',
                  background: isActive
                    ? `linear-gradient(90deg, ${item.accent}24 0%, rgba(16, 185, 129, 0.08) 100%)`
                    : 'transparent',
                  border: isActive
                    ? `1px solid ${item.accent}60`
                    : '1px solid transparent',
                  boxShadow: isActive ? `0 4px 14px -4px ${item.accent}35` : 'none',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                  <div
                    className="transition-transform duration-200 group-hover:scale-110"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      background: isActive ? `${item.accent}30` : `${item.accent}18`,
                      border: `1px solid ${isActive ? `${item.accent}70` : `${item.accent}28`}`,
                      boxShadow: isActive ? `0 0 12px ${item.accent}40` : 'none',
                    }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={isActive ? 2.4 : 2}
                      color={isActive ? '#ffffff' : item.accent}
                    />
                  </div>
                  <span
                    className="truncate"
                    style={{ fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit' }}
                  >
                    {isUrdu ? item.urduName : item.name}
                  </span>
                </div>

                {item.badge && (
                  <span
                    style={{
                      padding: '2px 7px',
                      fontSize: '9.5px',
                      fontWeight: '800',
                      borderRadius: '999px',
                      background: item.badge === 'PORTAL' ? '#8b5cf6' : item.badge === 'FAST' ? '#f59e0b' : '#059669',
                      color: item.badge === 'FAST' ? '#78350f' : '#ffffff',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Card (Pinned at bottom, always fully visible) */}
        <div
          style={{
            flexShrink: 0,
            padding: '12px 14px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(5, 60, 45, 0.9)',
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#ffffff',
                  fontSize: '13px',
                  flexShrink: 0,
                }}
              >
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p
                  style={{
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {profile?.full_name || 'Admin'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                  <span style={{ fontSize: '11px' }}>{roleInfo.icon}</span>
                  <span style={{ fontSize: '10.5px', color: '#a7f3d0', fontWeight: '600' }}>
                    {isUrdu ? roleInfo.urdu : roleInfo.label}
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
              gap: '7px',
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={15} />
            <span>{isUrdu ? 'لاگ آؤٹ' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-[70px] flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 z-30">
          {/* Left: Mobile Drawer Trigger + System Title */}
          <div className="flex items-center gap-2.5">
            {/* Hamburger Button on Mobile/Tablet (< 1024px) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ms-1 rounded-xl text-slate-700 hover:bg-slate-100 transition active:scale-95 flex-shrink-0"
              title="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            <div className="hidden xl:flex items-center gap-2.5 whitespace-nowrap">
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)',
                }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#64748b',
                  letterSpacing: '0.01em',
                }}
                className={isUrdu ? 'font-urdu' : ''}
              >
                {isUrdu ? 'کھاد انوینٹری و کاؤنٹر سیلنگ سسٹم (آن لائن)' : 'Fertilizer POS & Inventory Portal'}
              </span>
            </div>
          </div>

          {/* Quick Actions & Language Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3.5 min-w-0">
            {/* Active User Role Badge (Hidden on mobile/tablet) */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0"
              style={{
                backgroundColor: roleInfo.bg,
                border: `1px solid ${roleInfo.border}40`,
                color: roleInfo.color,
              }}
            >
              <span>{roleInfo.icon}</span>
              <span className={isUrdu ? 'font-urdu' : ''}>
                {isUrdu ? roleInfo.urdu : roleInfo.label}
              </span>
            </div>

            {/* Language Switcher */}
            <LanguageToggle />

            {/* User Manual Guide Button */}
            <Link
              href="/dashboard/guide"
              className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-600/30 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap shadow-xs"
              title="User Manual Guide / مینوئل گائیڈ"
            >
              <BookOpen size={15} className="text-emerald-700" />
              <span className="hidden sm:inline font-medium" suppressHydrationWarning>{isUrdu ? 'مینوئل' : 'Guide'}</span>
            </Link>

            {/* Quick POS Bill Button */}
            {canCreatePosBill && (
              <Link
                href="/dashboard/pos"
                className="btn btn-primary px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
              >
                <ShoppingCart size={15} />
                <span>{isUrdu ? 'نیا بل' : 'POS Bill'}</span>
              </Link>
            )}

            {/* Stock In Button (Hidden on small mobile & restricted roles) */}
            {canCreateStockIn && (
              <Link
                href="/dashboard/purchases/new"
                className="hidden sm:inline-flex btn btn-secondary px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
              >
                <PlusCircle size={15} />
                <span>{isUrdu ? 'مال خریداری' : 'Stock In'}</span>
              </Link>
            )}

            {/* Notification Bell */}
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                background: '#ffffff',
              }}
              className="hover:bg-slate-50 transition flex-shrink-0"
            >
              <Bell size={17} color="#64748b" />
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                }}
              />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content - Scrollable Inner Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="w-full max-w-[1920px] mx-auto min-w-0">
            {isLoading || !user || !profile ? (
              <div className="min-h-[380px] flex flex-col items-center justify-center gap-3 text-slate-500">
                <div className="w-9 h-9 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                <span className="text-sm font-semibold">
                  {isUrdu ? 'اکاؤنٹ و اختیارات کی تصدیق ہو رہی ہے...' : 'Verifying account role permissions...'}
                </span>
              </div>
            ) : !canAccessCurrentRoute ? (
              <div className="max-w-lg mx-auto my-12 bg-white border border-amber-200 rounded-2xl p-6 text-center shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
                  🔒
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {isUrdu ? 'رسائی محدود ہے (Role Protected)' : 'Access Restricted for Current Role'}
                </h2>
                <p className="text-xs text-slate-600">
                  {isUrdu
                    ? 'آپ کے اکاؤنٹ رول کو اس صفحے کی اجازت نہیں ہے۔ آپ کو آپ کے پورٹل پر منتقل کیا جا رہا ہے۔'
                    : 'Your assigned account role does not include access to this module. Redirecting to your portal...'}
                </p>
                <Link
                  href={homeRoute}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  {isUrdu ? 'اپنے پورٹل پر جائیں' : 'Go to My Portal'}
                </Link>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
