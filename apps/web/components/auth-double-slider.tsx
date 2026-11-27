'use client';

import React, { useRef, useState } from 'react';
import { UserRole } from '@fertilizer/shared';
import { useAuth } from '../lib/auth-context';
import { useLanguage } from '../lib/language-context';
import { LanguageToggle } from './language-toggle';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  QrCode,
  Receipt,
  ShieldCheck,
  Sprout,
  Store,
  TrendingUp,
  User,
  Wheat,
} from 'lucide-react';

interface AuthDoubleSliderProps {
  initialMode?: 'login' | 'register';
}

export function AuthDoubleSlider({ initialMode = 'login' }: AuthDoubleSliderProps) {
  const { login, register } = useAuth();
  const { isUrdu } = useLanguage();

  const [isSignUp, setIsSignUp] = useState(initialMode === 'register');

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState<'shop' | 'pos' | 'vendor'>('shop');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up State
  const [regData, setRegData] = useState({
    fullName: '',
    shopName: 'Al-Razaq Fertilizer & Agri Store',
    email: '',
    phone: '',
    password: '',
    address: 'Multan, Punjab',
    role: UserRole.SUPER_ADMIN,
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  const loginHeadingRef = useRef<HTMLHeadingElement>(null);
  const regHeadingRef = useRef<HTMLHeadingElement>(null);

  const switchMode = (nextSignUp: boolean) => {
    if (nextSignUp === isSignUp) return;
    setIsSignUp(nextSignUp);
    setLoginError(null);
    setRegError(null);

    if (typeof window !== 'undefined') {
      const targetPath = nextSignUp ? '/register' : '/login';
      if (window.location.pathname !== targetPath) {
        window.history.replaceState(null, '', targetPath);
      }
    }

    requestAnimationFrame(() => {
      if (nextSignUp) {
        regHeadingRef.current?.focus();
      } else {
        loginHeadingRef.current?.focus();
      }
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      await login(loginEmail, loginPassword);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      setLoginError(message || 'Login failed. Baraye meharbani details check karein.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegLoading(true);

    try {
      await register(regData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : null;
      setRegError(message || 'Registration failed. Baraye meharbani details check karein.');
    } finally {
      setRegLoading(false);
    }
  };

  const textDir = isUrdu ? 'rtl' : 'ltr';

  return (
    <div
      style={{
        backgroundColor: '#1f2937',
        backgroundImage: "url('/loginBg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
      className="ds-page-root px-4 py-2.5 sm:px-6 sm:py-3"
    >
      {/* Soft Dark Overlay over Background Photo */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(6, 24, 18, 0.42)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Brand + Language Toggle */}
      <header
        className="w-full max-w-[960px] mx-auto flex items-center justify-between gap-3 mb-2 shrink-0"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <div
          className="flex items-center gap-3 px-3 py-1.5 rounded-2xl"
          style={{
            background: 'rgba(15, 23, 42, 0.68)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              flexShrink: 0,
            }}
          >
            <Sprout size={20} color="#ffffff" />
          </div>
          <div>
            <h1
              className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight"
              style={{ fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit' }}
            >
              {isUrdu ? 'کسان ایگری پی او ایس اور انوینٹری' : 'Kissan AgriPOS & Inventory'}
            </h1>
            <p className="text-[11px] sm:text-xs text-emerald-200/90">
              {isUrdu
                ? 'فرٹیلائزر، بیج اور زرعی ادویات مینجمنٹ سسٹم'
                : 'Fertilizer, Seed & Agri Store Management'}
            </p>
          </div>
        </div>

        <LanguageToggle variant="light" />
      </header>

      {/* Main Stage: #18 Double Slider Container */}
      <main
        className="w-full flex-1 min-h-0 flex items-center justify-center py-1"
        style={{ position: 'relative', zIndex: 10 }}
      >
        {/* Force physical LTR coordinates on .ds-shell so horizontal CSS translateX stays deterministic in Urdu & English */}
        <div
          dir="ltr"
          className={`ds-shell ${isSignUp ? 'ds-right-panel-active' : ''}`}
        >
          {/* Mobile Compact Switcher Header (< 768px only) */}
          <div
            dir={textDir}
            className="md:hidden px-5 pt-5 pb-4 text-white"
            style={{
              background: 'linear-gradient(145deg, #064e3b 0%, #043927 52%, #0f172a 100%)',
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/15 border border-white/25">
                <Wheat size={13} />
                <span>{isUrdu ? 'کسان پورٹل' : 'Kissan Portal'}</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-100">
                {isSignUp
                  ? isUrdu
                    ? 'نئی دکان رجسٹریشن'
                    : 'New Shop Setup'
                  : isUrdu
                    ? 'محفوظ سائن ان'
                    : 'Secure Access'}
              </span>
            </div>

            <div
              role="tablist"
              aria-label={isUrdu ? 'لاگ ان یا رجسٹریشن منتخب کریں' : 'Switch authentication form'}
              className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/25 border border-white/15"
            >
              <button
                type="button"
                role="tab"
                aria-selected={!isSignUp}
                onClick={() => switchMode(false)}
                className="min-h-[40px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all"
                style={{
                  backgroundColor: !isSignUp ? '#ffffff' : 'transparent',
                  color: !isSignUp ? '#065f46' : '#ecfdf5',
                }}
              >
                {isUrdu ? 'سائن ان (Sign In)' : 'Sign In'}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignUp}
                onClick={() => switchMode(true)}
                className="min-h-[40px] py-2 px-3 rounded-xl text-xs font-extrabold transition-all"
                style={{
                  backgroundColor: isSignUp ? '#ffffff' : 'transparent',
                  color: isSignUp ? '#065f46' : '#ecfdf5',
                }}
              >
                {isUrdu ? 'نیا اکاؤنٹ (Sign Up)' : 'Create Account'}
              </button>
            </div>
          </div>

          {/* ====================================================
              LEFT FORM PANEL: SIGN IN
              ==================================================== */}
          <div
            dir={textDir}
            inert={isSignUp ? true : undefined}
            className={`ds-form-panel ds-sign-in-panel custom-scrollbar ${!isSignUp ? 'ds-mobile-panel-anim' : ''}`}
          >
            <form
              method="post"
              onSubmit={handleLoginSubmit}
              aria-labelledby="login-heading"
              className="w-full max-w-[416px] mx-auto my-auto px-5 py-4 sm:px-7 sm:py-5"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={13} />
                  <span>{isUrdu ? 'محفوظ پورٹل' : 'SECURE SIGN IN'}</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-400">AgriPOS v2.0</span>
              </div>

              <h2
                id="login-heading"
                ref={loginHeadingRef}
                tabIndex={-1}
                className="text-2xl font-extrabold text-slate-900 tracking-tight outline-none"
                style={{ fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit' }}
              >
                {isUrdu ? 'خوش آمدید! 👋' : 'Sign In'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 mb-3">
                {selectedPortal === 'vendor'
                  ? isUrdu
                    ? 'کھاد کمپنی و سپلائر پورٹل میں سائن ان کریں'
                    : 'Sign in to Supplier & Dispatch Portal'
                  : selectedPortal === 'pos'
                    ? isUrdu
                      ? 'کاؤنٹر بلنگ اور اسٹاک اسکینر کھولیں'
                      : 'Sign in to Counter Billing & Khata'
                    : isUrdu
                      ? 'اپنی دکان کا مکمل ڈیش بورڈ اور کھاتہ کھولیں'
                      : 'Access your dealership dashboard & khata'}
              </p>

              {/* Workspace Switcher Pills */}
              <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 mb-3">
                {[
                  { id: 'shop' as const, labelEn: 'Owner', labelUr: 'مالک / منشی', icon: '👑' },
                  { id: 'pos' as const, labelEn: 'POS Counter', labelUr: 'کاؤنٹر', icon: '🛒' },
                  { id: 'vendor' as const, labelEn: 'Vendor', labelUr: 'سپلائر', icon: '🚚' },
                ].map((tab) => {
                  const active = selectedPortal === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedPortal(tab.id)}
                      className="min-h-[34px] py-1 px-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                      style={{
                        backgroundColor: active ? '#ffffff' : 'transparent',
                        color: active ? '#047857' : '#64748b',
                        boxShadow: active ? '0 2px 6px rgba(15, 23, 42, 0.08)' : 'none',
                      }}
                    >
                      <span aria-hidden="true">{tab.icon}</span>
                      <span className="whitespace-nowrap">{isUrdu ? tab.labelUr : tab.labelEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Error Alert (only active when login panel visible) */}
              {!isSignUp && loginError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs font-medium bg-red-50 border border-red-200 text-red-800"
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Email */}
                <div>
                  <label
                    htmlFor="login-email-input"
                    className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1"
                  >
                    <span>{isUrdu ? 'ای میل ایڈریس' : 'Email Address'}</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {isUrdu ? 'Email' : 'رجسٹرڈ ای میل'}
                    </span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      color="#64748b"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        insetInlineStart: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="login-email-input"
                      name="email"
                      type="email"
                      autoComplete="username"
                      spellCheck={false}
                      enterKeyHint="next"
                      required
                      dir="ltr"
                      placeholder="admin@fertilizer.pk"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="ds-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="login-password-input"
                    className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1"
                  >
                    <span>{isUrdu ? 'پاس ورڈ' : 'Password'}</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      {isUrdu ? 'Password' : 'خفیہ کوڈ'}
                    </span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      color="#64748b"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        insetInlineStart: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="login-password-input"
                      name="password"
                      type={showLoginPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      enterKeyHint="done"
                      required
                      dir="ltr"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="ds-input"
                      style={{ paddingInlineEnd: '42px' }}
                    />
                    <button
                      type="button"
                      aria-pressed={showLoginPassword}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60 transition"
                      style={{
                        position: 'absolute',
                        insetInlineEnd: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember Session */}
                <div className="flex items-center gap-2 text-xs pt-0.5">
                  <input
                    id="login-remember"
                    name="remember"
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded accent-emerald-600 cursor-pointer"
                  />
                  <label
                    htmlFor="login-remember"
                    className="text-slate-600 font-medium cursor-pointer select-none"
                  >
                    {isUrdu ? 'مجھے یاد رکھیں' : 'Remember session'}
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  id="login-submit-button"
                  type="submit"
                  disabled={loginLoading}
                  className="w-full min-h-[46px] py-2.5 px-5 rounded-full font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 12px 24px -8px rgba(16, 185, 129, 0.5)',
                  }}
                >
                  {loginLoading ? (
                    <span>{isUrdu ? 'تصدیق ہو رہی ہے...' : 'Verifying Credentials...'}</span>
                  ) : (
                    <>
                      <span>{isUrdu ? 'پورٹل میں سائن ان کریں' : 'Sign In Karein'}</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>

              {/* Mobile Switch Hint */}
              <div className="md:hidden mt-5 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'نئی دکان کا اکاؤنٹ بنانا ہے؟' : 'New fertilizer dealership?'}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode(true)}
                    className="font-extrabold text-emerald-700 underline underline-offset-4"
                  >
                    {isUrdu ? 'یہاں رجسٹر کریں' : 'Create Account'}
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* ====================================================
              RIGHT FORM PANEL (SLIDES IN ON SIGN UP): CREATE ACCOUNT
              ==================================================== */}
          <div
            dir={textDir}
            inert={!isSignUp ? true : undefined}
            className={`ds-form-panel ds-sign-up-panel custom-scrollbar ${isSignUp ? 'ds-mobile-panel-anim' : ''}`}
          >
            <form
              method="post"
              onSubmit={handleRegisterSubmit}
              aria-labelledby="register-heading"
              className="w-full max-w-[440px] mx-auto my-auto px-5 py-3.5 sm:px-6 sm:py-4"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Store size={12} />
                  <span>{isUrdu ? 'نئی دکان رجسٹریشن' : 'CREATE ACCOUNT'}</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-400">Free Setup</span>
              </div>

              <h2
                id="register-heading"
                ref={regHeadingRef}
                tabIndex={-1}
                className="text-xl font-extrabold text-slate-900 tracking-tight outline-none"
                style={{ fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit' }}
              >
                {isUrdu ? 'نئی دکان رجسٹر کریں 🌱' : 'Create Shop Account'}
              </h2>
              <p className="text-[11.5px] text-slate-500 mt-0.5 mb-2.5">
                {isUrdu
                  ? 'فرٹیلائزر انوینٹری سسٹم میں اپنی دکان setup کریں'
                  : 'Register your fertilizer agency & admin portal'}
              </p>

              {/* Error Alert (only active when signup panel visible) */}
              {isSignUp && regError && (
                <div
                  role="alert"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl mb-2 text-xs font-medium bg-red-50 border border-red-200 text-red-800"
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="reg-fullname-input"
                    className="block text-[11.5px] font-bold text-slate-700 mb-1"
                  >
                    {isUrdu ? 'آپ کا نام' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      color="#64748b"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        insetInlineStart: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="reg-fullname-input"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      enterKeyHint="next"
                      required
                      placeholder="Chaudhry Rizwan"
                      value={regData.fullName}
                      onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                      className="ds-input"
                    />
                  </div>
                </div>

                {/* Shop Name */}
                <div>
                  <label
                    htmlFor="reg-shopname-input"
                    className="block text-[11.5px] font-bold text-slate-700 mb-1"
                  >
                    {isUrdu ? 'دکان / ایجنسی کا نام' : 'Shop / Agency Name'}
                  </label>
                  <div className="relative">
                    <Store
                      size={15}
                      color="#64748b"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        insetInlineStart: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="reg-shopname-input"
                      name="shopName"
                      type="text"
                      autoComplete="organization"
                      enterKeyHint="next"
                      required
                      placeholder="Kissan Agri Store"
                      value={regData.shopName}
                      onChange={(e) => setRegData({ ...regData, shopName: e.target.value })}
                      className="ds-input"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="reg-email-input"
                    className="block text-[11.5px] font-bold text-slate-700 mb-1"
                  >
                    {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      color="#64748b"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        insetInlineStart: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="reg-email-input"
                      name="email"
                      type="email"
                      autoComplete="username"
                      spellCheck={false}
                      enterKeyHint="next"
                      required
                      dir="ltr"
                      placeholder="rizwan@fertilizer.pk"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      className="ds-input"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="reg-phone-input"
                    className="block text-[11.5px] font-bold text-slate-700 mb-1"
                  >
                    {isUrdu ? 'موبائل نمبر' : 'Phone Number'}
                  </label>
                  <div className="relative">
                    <Phone
                      size={15}
                      color="#64748b"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        insetInlineStart: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="reg-phone-input"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      enterKeyHint="next"
                      dir="ltr"
                      placeholder="0300-1234567"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      className="ds-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="reg-password-input"
                    className="flex items-center justify-between text-[11.5px] font-bold text-slate-700 mb-1"
                  >
                    <span>{isUrdu ? 'پاس ورڈ' : 'Password'}</span>
                    <span id="reg-password-hint" className="text-[10px] font-normal text-slate-400">
                      Min 6 chars
                    </span>
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      color="#64748b"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        insetInlineStart: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="reg-password-input"
                      name="password"
                      type={showRegPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      minLength={6}
                      aria-describedby="reg-password-hint"
                      enterKeyHint="next"
                      required
                      dir="ltr"
                      placeholder="••••••••"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      className="ds-input"
                      style={{ paddingInlineEnd: '40px' }}
                    />
                    <button
                      type="button"
                      aria-pressed={showRegPassword}
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-700 hover:bg-slate-200/60 transition"
                      style={{
                        position: 'absolute',
                        insetInlineEnd: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label
                    htmlFor="reg-role-select"
                    className="block text-[11.5px] font-bold text-slate-700 mb-1"
                  >
                    {isUrdu ? 'اکاؤنٹ رول' : 'Account Role'}
                  </label>
                  <div className="relative">
                    <ShieldCheck
                      size={15}
                      color="#64748b"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        insetInlineStart: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <select
                      id="reg-role-select"
                      name="role"
                      value={regData.role}
                      onChange={(e) =>
                        setRegData({ ...regData, role: e.target.value as UserRole })
                      }
                      className="ds-input"
                    >
                      <option value={UserRole.SUPER_ADMIN}>Super Admin (Malik)</option>
                      <option value={UserRole.SHOP_MANAGER}>Shop Manager</option>
                      <option value={UserRole.SALES_STAFF}>Sales Staff (POS)</option>
                      <option value={UserRole.VENDOR}>Vendor (Supplier)</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="reg-address-input"
                    className="block text-[11.5px] font-bold text-slate-700 mb-1"
                  >
                    {isUrdu ? 'دکان / گودام کا پتہ' : 'Shop / Godown Address'}
                  </label>
                  <div className="relative">
                    <MapPin
                      size={15}
                      color="#64748b"
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        insetInlineStart: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      id="reg-address-input"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      enterKeyHint="done"
                      placeholder="G.T Road, Multan, Punjab"
                      value={regData.address}
                      onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                      className="ds-input"
                    />
                  </div>
                </div>
              </div>

              <button
                id="register-submit-button"
                type="submit"
                disabled={regLoading}
                className="w-full min-h-[44px] mt-4 py-2.5 px-5 rounded-full font-extrabold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 12px 24px -8px rgba(16, 185, 129, 0.5)',
                }}
              >
                {regLoading ? (
                  <span>{isUrdu ? 'اکاؤنٹ بنایا جا رہا ہے...' : 'Creating Shop Account...'}</span>
                ) : (
                  <>
                    <span>
                      {isUrdu
                        ? 'اکاؤنٹ بنائیں اور ڈیش بورڈ کھولیں'
                        : 'Create Account & Start'}
                    </span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              {/* Mobile Switch Hint */}
              <div className="md:hidden mt-4 pt-3 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'پہلے سے اکاؤنٹ موجود ہے؟' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => switchMode(false)}
                    className="font-extrabold text-emerald-700 underline underline-offset-4"
                  >
                    {isUrdu ? 'یہاں لاگ ان کریں' : 'Sign In'}
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* ====================================================
              ANIMATED DOUBLE SLIDER OVERLAY (Desktop >= 768px)
              ==================================================== */}
          <div className="ds-overlay-container">
            <div className="ds-overlay">
              {/* Left Overlay Panel (slides into view when Sign Up active - Onboarding Showcase) */}
              <div
                dir={textDir}
                inert={!isSignUp ? true : undefined}
                className="ds-overlay-panel ds-overlay-left custom-scrollbar"
              >
                <div className="w-full max-w-[404px] mx-auto my-auto text-start">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-black/25 border border-white/25 text-emerald-100 mb-2.5 backdrop-blur-sm"
                  >
                    <Sprout size={14} color="#a7f3d0" />
                    <span>
                      {isUrdu
                        ? 'نئی فرٹیلائزر دکان کا ڈیجیٹل سیٹ اپ'
                        : 'Digital Fertilizer Dealership Setup'}
                    </span>
                  </div>

                  <h2
                    className="text-xl sm:text-[22px] font-extrabold text-white leading-snug mb-1.5"
                    style={{ fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit' }}
                  >
                    {isUrdu ? (
                      <>
                        اپنی دکان ڈیجیٹل بنائیں،{' '}
                        <span
                          style={{
                            background: 'linear-gradient(90deg, #34d399, #fbbf24)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          صرف 1 منٹ میں
                        </span>
                      </>
                    ) : (
                      <>
                        Apni Dukan Digital Banayein,{' '}
                        <span
                          style={{
                            background: 'linear-gradient(90deg, #34d399, #fbbf24)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          Sirf 1 Minute Mein
                        </span>
                      </>
                    )}
                  </h2>

                  <p className="text-[11.5px] text-emerald-50/90 leading-relaxed mb-3">
                    {isUrdu
                      ? 'نیا ایڈمن اکاؤنٹ بناتے ہی پی او ایس بلنگ، بارکوڈ پرنٹنگ، زمیندار کھاتہ اور سپلائر لیجر فوراً شروع ہو جاتا ہے۔'
                      : 'Account banate hi POS billing, barcode labels, zamindar khata aur supplier bill tracking turant start ho jata hai.'}
                  </p>

                  {/* 4 Dealership Onboarding Feature Cards */}
                  <div className="grid grid-cols-2 gap-2 w-full mb-3.5">
                    {[
                      {
                        icon: <Store size={15} color="#34d399" className="mb-1" />,
                        title: isUrdu ? 'دکان اور گودام سیٹ اپ' : 'Instant Godown Setup',
                        desc: isUrdu
                          ? 'یوریا، ڈی اے پی، بیج اور اسپرے اسٹاک فوراً درج کریں۔'
                          : 'Urea, DAP, Seed & Spray stock turant add karein.',
                      },
                      {
                        icon: <QrCode size={15} color="#fbbf24" className="mb-1" />,
                        title: isUrdu ? 'بارکوڈ اور کیو آر اسٹیکرز' : 'Barcode & QR Stickers',
                        desc: isUrdu
                          ? 'ہر بوری پر اپنا لیبل پرنٹ اور اسکین کریں۔'
                          : 'Har bag par apna label print aur scan karein.',
                      },
                      {
                        icon: <MessageSquare size={15} color="#60a5fa" className="mb-1" />,
                        title: isUrdu ? 'واٹس ایپ اور ایس ایم ایس' : 'WhatsApp & SMS Alerts',
                        desc: isUrdu
                          ? 'ادھار وصولی اور سیزن پیغامات ایک کلک میں۔'
                          : 'Udhaar wasooli aur season alerts ek click mein.',
                      },
                      {
                        icon: <ShieldCheck size={15} color="#c4b5fd" className="mb-1" />,
                        title: isUrdu ? 'کلاؤڈ بیک اپ اور سیکیورٹی' : 'Cloud Backup & Roles',
                        desc: isUrdu
                          ? 'مالک، منشی اور اسٹاف رولز کے ساتھ محفوظ ڈیٹا۔'
                          : 'Malik, Munshi & Staff access ke sath safe record.',
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="p-2.5 rounded-xl bg-black/30 border border-white/15 backdrop-blur-sm"
                      >
                        {item.icon}
                        <h3 className="text-[11.5px] font-bold text-white leading-tight mb-0.5">
                          {item.title}
                        </h3>
                        <p className="text-[10.5px] text-emerald-100/80 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-[11px] font-semibold text-emerald-100/90">
                      {isUrdu ? 'پہلے سے اکاؤنٹ ہے؟' : 'Already have an account?'}
                    </span>
                    <button
                      type="button"
                      dir="ltr"
                      onClick={() => switchMode(false)}
                      className="ds-ghost-btn"
                      style={{ padding: '8px 22px', minHeight: '40px' }}
                    >
                      <span>{isUrdu ? 'سائن ان کریں' : 'Sign In'}</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Overlay Panel (visible by default during Sign In - Original AgriPOS Showcase) */}
              <div
                dir={textDir}
                inert={isSignUp ? true : undefined}
                className="ds-overlay-panel ds-overlay-right custom-scrollbar"
              >
                <div className="w-full max-w-[404px] mx-auto my-auto text-start">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-black/25 border border-white/25 text-emerald-100 mb-2.5 backdrop-blur-sm"
                  >
                    <Wheat size={14} color="#a7f3d0" />
                    <span>
                      {isUrdu
                        ? 'پاکستانی فرٹیلائزر مارکیٹ کے لیے مخصوص'
                        : 'Pakistani Fertilizer Market ke liye Makhsoos'}
                    </span>
                  </div>

                  <h2
                    className="text-xl sm:text-[22px] font-extrabold text-white leading-snug mb-1.5"
                    style={{ fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit' }}
                  >
                    {isUrdu ? (
                      <>
                        دکان کا منافع اور کھاتہ،{' '}
                        <span
                          style={{
                            background: 'linear-gradient(90deg, #34d399, #fbbf24)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          اب ایک جگہ کنٹرول میں
                        </span>
                      </>
                    ) : (
                      <>
                        Dukan ka Munafa aur Khata,{' '}
                        <span
                          style={{
                            background: 'linear-gradient(90deg, #34d399, #fbbf24)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          Ab Ek Jagah Control Mein
                        </span>
                      </>
                    )}
                  </h2>

                  <p className="text-[11.5px] text-emerald-50/90 leading-relaxed mb-3">
                    {isUrdu
                      ? 'تیز ترین کاؤنٹر بلنگ، گودام اسٹاک ٹریکنگ، زمیندار ادھار کھاتہ لیجر اور وینڈر بلز کا مکمل ڈیجیٹل ریکارڈ۔'
                      : 'Fast POS counter billing, godown stock tracking, zamindar udhaar khata ledger aur vendor bills ka digital record.'}
                  </p>

                  {/* 4 Original AgriPOS Feature Cards */}
                  <div className="grid grid-cols-2 gap-2 w-full mb-3.5">
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/15 backdrop-blur-sm">
                      <Receipt size={15} color="#34d399" className="mb-1" />
                      <h3 className="text-[11.5px] font-bold text-white leading-tight mb-0.5">
                        {isUrdu ? 'فوری کاؤنٹر بلنگ (POS)' : 'Instant POS Billing'}
                      </h3>
                      <p className="text-[10.5px] text-emerald-100/80 leading-snug">
                        {isUrdu
                          ? 'تھرمل پرنٹر اور اردو کسٹمر پرچی۔'
                          : 'Thermal print aur Urdu customer receipt.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/15 backdrop-blur-sm">
                      <BookOpen size={15} color="#fbbf24" className="mb-1" />
                      <h3 className="text-[11.5px] font-bold text-white leading-tight mb-0.5">
                        {isUrdu ? 'زمیندار ادھار کھاتہ لیجر' : 'Udhaar Khata Ledger'}
                      </h3>
                      <p className="text-[10.5px] text-emerald-100/80 leading-snug">
                        {isUrdu
                          ? 'زمینداروں کا آسان حساب اور الرٹس۔'
                          : 'Zamindaron ka ba-aasan hisaab aur limit alerts.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/15 backdrop-blur-sm">
                      <TrendingUp size={15} color="#60a5fa" className="mb-1" />
                      <h3 className="text-[11.5px] font-bold text-white leading-tight mb-0.5">
                        {isUrdu ? 'اسٹاک اور ایکسپائری الرٹس' : 'Stock & Expiry Alerts'}
                      </h3>
                      <p className="text-[10.5px] text-emerald-100/80 leading-snug">
                        {isUrdu
                          ? 'بیچ نمبر اور گودام کے ریک کی ٹریکنگ۔'
                          : 'Batch number aur godown rack tracking.'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/15 backdrop-blur-sm">
                      <ShieldCheck size={15} color="#c4b5fd" className="mb-1" />
                      <h3 className="text-[11.5px] font-bold text-white leading-tight mb-0.5">
                        {isUrdu ? 'مختلف اختیارات (Roles)' : 'Role Based Access'}
                      </h3>
                      <p className="text-[10.5px] text-emerald-100/80 leading-snug">
                        {isUrdu
                          ? 'مالک، منشی، سیلز مین اور سپلائر پورٹل۔'
                          : 'Malik, Manager, Salesman aur Vendor Portal.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-[11px] font-semibold text-emerald-100/90">
                      {isUrdu ? 'نئی دکان کا اکاؤنٹ بنائیں:' : 'New shop dealership?'}
                    </span>
                    <button
                      type="button"
                      dir="ltr"
                      onClick={() => switchMode(true)}
                      className="ds-ghost-btn"
                      style={{ padding: '8px 22px', minHeight: '40px' }}
                    >
                      <ArrowLeft size={15} />
                      <span>{isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Sign Up'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Status & Developer Credit */}
      <footer
        className="w-full max-w-[960px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] shrink-0"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-white"
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
            }}
          />
          <span>
            {isUrdu
              ? 'کلاؤڈ ڈیٹا بیس فعال ہے (پاکستان ریجن کنیکٹڈ)'
              : 'Cloud Database Active (Supabase Pakistan Region Connected)'}
          </span>
        </div>

        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-slate-200"
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
          }}
        >
          <span>{isUrdu ? 'سافٹ ویئر ڈویلپر:' : 'Software Developed by:'}</span>
          <span className="font-bold text-emerald-300">
            {isUrdu ? 'محمد سہیل' : 'Muhammad Sohail'}
          </span>
        </div>
      </footer>
    </div>
  );
}
