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

  const handleFillDemo = () => {
    setEmail('admin@fertilizer.pk');
    setPassword('AdminPassword123!');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
        color: '#ffffff',
      }}
    >
      {/* Left Column: Brand Hero Banner (Desktop) */}
      <div
        style={{
          flex: '1.1',
          padding: '60px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Background Decorative Circles */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(5, 150, 105, 0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 1 }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Sprout size={28} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Kissan AgriPOS & Inventory
            </h1>
            <p style={{ fontSize: '13px', color: '#a7f3d0' }}>
              فرٹیلائزر، بیج اور زرعی ادویات مینجمنٹ سسٹم
            </p>
          </div>
        </div>

        {/* Center Content */}
        <div style={{ maxWidth: '520px', margin: '40px 0', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '24px',
            }}
          >
            <Sparkles size={16} />
            <span>Pakistani Fertilizer Market ke liye Makhsoos</span>
          </div>

          <h2
            style={{
              fontSize: '38px',
              fontWeight: '800',
              lineHeight: '1.2',
              letterSpacing: '-1px',
              marginBottom: '18px',
            }}
          >
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
          </h2>

          <p style={{ fontSize: '16px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '36px' }}>
            Fast POS counter billing, godown stock tracking, zamindar udhaar khata ledger aur vendor bills ka digital record.
          </p>

          {/* Feature Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Receipt size={22} color="#34d399" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                Instant POS Billing
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Thermal print aur Urdu customer receipt.
              </p>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <BookOpen size={22} color="#fbbf24" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                Udhaar Khata Ledger
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Zamindaron ka ba-aasan hisaab aur limit alerts.
              </p>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <TrendingUp size={22} color="#60a5fa" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                Stock & Expiry Alerts
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Batch number aur godown rack tracking.
              </p>
            </div>

            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <ShieldCheck size={22} color="#a78bfa" style={{ marginBottom: '8px' }} />
              <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>
                Role Based Access
              </h4>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                Malik, Manager, Salesman aur Vendor Portal.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', zIndex: 1 }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span>Cloud Database Active (Supabase Pakistan Region Connected)</span>
        </div>
      </div>

      {/* Right Column: Login Card */}
      <div
        style={{
          flex: '0.9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          background: 'rgba(15, 23, 42, 0.75)',
        }}
      >
        <div
          className="fade-in"
          style={{
            width: '100%',
            maxWidth: '440px',
            background: '#ffffff',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            color: '#0f172a',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#ecfdf5',
                  color: '#065f46',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '12px',
                }}
              >
                <ShieldCheck size={14} />
                <span>{isUrdu ? 'محفوظ پورٹل لاگ ان' : 'SECURE PORTAL LOGIN'}</span>
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '6px', fontFamily: isUrdu ? 'Noto Nastaliq Urdu, sans-serif' : 'inherit' }}>
                {isUrdu ? 'خوش آمدید! 👋' : 'Welcome Back! 👋'}
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
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
                padding: '12px 14px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                <span>Email Address</span>
                <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '12px' }}>رجسٹرڈ ای میل</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="admin@fertilizer.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password-input">
                <span>Password</span>
                <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '12px' }}>پاس ورڈ</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '40px' }}
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
                    color: '#94a3b8',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                margin: '18px 0 24px',
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#475569' }}>
                <input type="checkbox" style={{ accentColor: '#059669' }} defaultChecked />
                <span>Mujhe yaad rakhein (Remember)</span>
              </label>
            </div>

            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '13px', fontSize: '15px' }}
            >
              {loading ? (
                <span>Taseeq ho rahi hai...</span>
              ) : (
                <>
                  <span>Sign In Karein</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill & Register Links */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={handleFillDemo}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '13px', padding: '9px', marginBottom: '16px' }}
            >
              ✨ Auto Fill Demo Admin Credentials
            </button>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
              Nayi dukan ka account banana hai?{' '}
              <Link
                href="/register"
                style={{ color: '#059669', fontWeight: '700', textDecoration: 'none' }}
              >
                Register Shop Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
