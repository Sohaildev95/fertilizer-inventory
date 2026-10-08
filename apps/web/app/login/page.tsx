'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { useLanguage } from '../../lib/language-context';
import { LanguageToggle } from '../../components/language-toggle';
import {
  Sprout,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Receipt,
  BookOpen,
  Wheat,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { isUrdu } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Baraye meharbani details check karein.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        background: `linear-gradient(${isUrdu ? '135deg' : '225deg'}, #064e3b 0%, #0f172a 100%)`,
        color: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
      }}
      className="flex-col lg:flex-row"
    >
      {/* ========================================================
          LEFT COLUMN (58% on Desktop):
          The Agricultural Showcase with Feature Cards & Background Photo in ORIGINAL Position
          ======================================================== */}
      <div
        style={{
          flex: '1.25',
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '32px 42px',
          overflow: 'hidden',
        }}
        className="hidden lg:flex"
      >
        {/* Full-bleed Photo Background - IN ORIGINAL POSITION & SCALE on Left */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/loginBg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            WebkitMaskImage: `linear-gradient(${isUrdu ? 'to left' : 'to right'}, black 72%, transparent 100%)`,
            maskImage: `linear-gradient(${isUrdu ? 'to left' : 'to right'}, black 72%, transparent 100%)`,
          }}
        />

        {/* Translucent Dark Tint - Dissolves smoothly with photo into the emerald background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            WebkitMaskImage: `linear-gradient(${isUrdu ? 'to left' : 'to right'}, black 72%, transparent 100%)`,
            maskImage: `linear-gradient(${isUrdu ? 'to left' : 'to right'}, black 72%, transparent 100%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '13px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Sprout size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: isUrdu ? '0' : '-0.5px', color: '#ffffff', fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit' }}>
              {isUrdu ? 'کسان ایگری پی او ایس اور انوینٹری' : 'Kissan AgriPOS & Inventory'}
            </h1>
            <p style={{ fontSize: '13px', color: '#a7f3d0' }}>
              فرٹیلائزر، بیج اور زرعی ادویات مینجمنٹ سسٹم
            </p>
          </div>
        </div>

        {/* Center Content */}
        <div style={{ maxWidth: '540px', position: 'relative', zIndex: 2, margin: 'auto 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#6ee7b7',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '14px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Wheat size={15} color="#34d399" />
            <span>
              {isUrdu ? 'پاکستانی فرٹیلائزر مارکیٹ کے لیے مخصوص' : 'Pakistani Fertilizer Market ke liye Makhsoos'}
            </span>
          </div>

          <h2
            style={{
              fontSize: isUrdu ? '28px' : '30px',
              fontWeight: '800',
              lineHeight: isUrdu ? '1.4' : '1.25',
              letterSpacing: isUrdu ? '0' : '-0.8px',
              marginBottom: '10px',
              color: '#ffffff',
              fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit',
            }}
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

          <p style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '20px' }}>
            {isUrdu
              ? 'تیز ترین کاؤنٹر بلنگ، گودام اسٹاک ٹریکنگ، زمیندار ادھار کھاتہ لیجر اور وینڈر بلز کا مکمل ڈیجیٹل ریکارڈ۔'
              : 'Fast POS counter billing, godown stock tracking, zamindar udhaar khata ledger aur vendor bills ka digital record.'}
          </p>

          {/* Feature Highlights Grid - Borderless Floating Cards with Shadow & Radius */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
              }}
            >
              <Receipt size={19} color="#34d399" style={{ marginBottom: '6px' }} />
              <h4 style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '3px', color: '#ffffff' }}>
                {isUrdu ? 'فوری کاؤنٹر بلنگ (POS)' : 'Instant POS Billing'}
              </h4>
              <p style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.4' }}>
                {isUrdu ? 'تھرمل پرنٹر اور اردو کسٹمر پرچی۔' : 'Thermal print aur Urdu customer receipt.'}
              </p>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
              }}
            >
              <BookOpen size={19} color="#fbbf24" style={{ marginBottom: '6px' }} />
              <h4 style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '3px', color: '#ffffff' }}>
                {isUrdu ? 'زمیندار ادھار کھاتہ لیجر' : 'Udhaar Khata Ledger'}
              </h4>
              <p style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.4' }}>
                {isUrdu ? 'زمینداروں کا آسان حساب اور الرٹس۔' : 'Zamindaron ka ba-aasan hisaab aur limit alerts.'}
              </p>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
              }}
            >
              <TrendingUp size={19} color="#60a5fa" style={{ marginBottom: '6px' }} />
              <h4 style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '3px', color: '#ffffff' }}>
                {isUrdu ? 'اسٹاک اور ایکسپائری الرٹس' : 'Stock & Expiry Alerts'}
              </h4>
              <p style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.4' }}>
                {isUrdu ? 'بیچ نمبر اور گودام کے ریک کی ٹریکنگ۔' : 'Batch number aur godown rack tracking.'}
              </p>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
              }}
            >
              <ShieldCheck size={19} color="#a78bfa" style={{ marginBottom: '6px' }} />
              <h4 style={{ fontSize: '13.5px', fontWeight: '700', marginBottom: '3px', color: '#ffffff' }}>
                {isUrdu ? 'مختلف اختیارات (Roles)' : 'Role Based Access'}
              </h4>
              <p style={{ fontSize: '11.5px', color: '#cbd5e1', lineHeight: '1.4' }}>
                {isUrdu ? 'مالک، منشی، سیلز مین اور سپلائر پورٹل۔' : 'Malik, Manager, Salesman aur Vendor Portal.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Status & Developer Credit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '12.5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span>
              {isUrdu ? 'کلاؤڈ ڈیٹا بیس فعال ہے (پاکستان ریجن کنیکٹڈ)' : 'Cloud Database Active (Supabase Pakistan Region Connected)'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '11.5px', paddingInlineStart: '16px' }}>
            <span>{isUrdu ? 'سافٹ ویئر ڈویلپر:' : 'Software Developed by:'}</span>
            <span style={{ color: '#34d399', fontWeight: '700', letterSpacing: '0.3px' }}>
              {isUrdu ? 'محمد سہیل' : 'Muhammad Sohail'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          RIGHT COLUMN (42% on Desktop / 100% on Mobile):
          The Seamless Botanical Auth Studio (Fully Transparent over Continuous Emerald Gradient)
          ======================================================== */}
      <div
        style={{
          flex: '0.85',
          background: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '24px 32px',
          position: 'relative',
          zIndex: 2,
          overflowY: 'auto',
          height: '100vh',
        }}
        className="w-full"
      >

        <div
          className="fade-in"
          style={{
            width: '100%',
            maxWidth: '390px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              {/* Mobile-only brand badge */}
              <div className="lg:hidden flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <Sprout size={18} />
                </div>
                <span className="text-sm font-extrabold text-white">Kissan AgriPOS</span>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#6ee7b7',
                  fontSize: '11px',
                  fontWeight: '700',
                  marginBottom: '10px',
                }}
              >
                <ShieldCheck size={13} />
                <span>{isUrdu ? 'محفوظ پورٹل لاگ ان' : 'SECURE PORTAL LOGIN'}</span>
              </div>

              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '4px', fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit' }}>
                {isUrdu ? 'خوش آمدید! 👋' : 'Welcome Back! 👋'}
              </h1>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                {isUrdu ? 'اپنے اکاؤنٹ سے لاگ ان کریں' : 'Sign in to access your shop portal'}
              </p>
            </div>
            <LanguageToggle />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                fontSize: '12.5px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" htmlFor="email-input" style={{ color: '#cbd5e1' }}>
                <span>Email Address</span>
                <span style={{ color: '#64748b', fontWeight: '400', fontSize: '11px' }}>رجسٹرڈ ای میل</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={17}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="admin@fertilizer.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" htmlFor="password-input" style={{ color: '#cbd5e1' }}>
                <span>Password</span>
                <span style={{ color: '#64748b', fontWeight: '400', fontSize: '11px' }}>پاس ورڈ</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={17}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 38px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.14)',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                margin: '10px 0 14px',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#94a3b8' }}>
                <input type="checkbox" style={{ accentColor: '#10b981' }} defaultChecked />
                <span>Mujhe yaad rakhein (Remember)</span>
              </label>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '14px',
                border: 'none',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? (
                <span>Taseeq ho rahi hai...</span>
              ) : (
                <>
                  <span>Sign In Karein</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#94a3b8', marginTop: '20px' }}>
            Nayi dukan ka account banana hai?{' '}
            <Link
              href="/register"
              style={{ color: '#34d399', fontWeight: '700', textDecoration: 'none' }}
            >
              Register Shop Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
