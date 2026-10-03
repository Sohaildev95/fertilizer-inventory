'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { UserRole } from '@fertilizer/shared';
import {
  Sprout,
  ShieldCheck,
  Lock,
  Mail,
  User,
  Store,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    shopName: 'Al-Razaq Fertilizer & Agri Store',
    email: '',
    phone: '',
    password: '',
    address: 'Multan, Punjab',
    role: UserRole.SUPER_ADMIN,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(formData);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Baraye meharbani details check karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
        padding: '40px 20px',
        color: '#ffffff',
      }}
    >
      <div
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          color: '#0f172a',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)',
              marginBottom: '16px',
            }}
          >
            <Sprout size={30} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Nayi Dukan / Admin Register Karein
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Fertilizer Inventory System mein apni dukan setup karein
          </p>
        </div>

        {/* Error Alert */}
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

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullname-input">
                <span>Apna Naam (Malik / User)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="fullname-input"
                  type="text"
                  required
                  placeholder="Chaudhry Rizwan"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            {/* Shop Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="shopname-input">
                <span>Dukan / Agency Ka Naam</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Store
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="shopname-input"
                  type="text"
                  required
                  placeholder="Kissan Agri Store"
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email-input">
                <span>Email Address</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="reg-email-input"
                  type="email"
                  required
                  placeholder="rizwan@fertilizer.pk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone-input">
                <span>Mobile Phone Number</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Phone
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="phone-input"
                  type="tel"
                  placeholder="0300-1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-pass-input">
                <span>Password (Min 6 chars)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="reg-pass-input"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            {/* Role */}
            <div className="form-group">
              <label className="form-label" htmlFor="role-select">
                <span>Account Role</span>
              </label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck
                  size={18}
                  color="#94a3b8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <select
                  id="role-select"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="form-select"
                  style={{ paddingLeft: '38px' }}
                >
                  <option value={UserRole.SUPER_ADMIN}>Super Admin (Dukan Malik)</option>
                  <option value={UserRole.SHOP_MANAGER}>Shop Manager (Munshi / Manager)</option>
                  <option value={UserRole.SALES_STAFF}>Sales Staff (Counter Billing)</option>
                  <option value={UserRole.VENDOR}>Vendor (Company / Supplier)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label" htmlFor="address-input">
              <span>Dukan / Godown Ka Pata (Address & City)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin
                size={18}
                color="#94a3b8"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="address-input"
                type="text"
                placeholder="G.T Road, Multan, Punjab"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <button
            id="register-submit-button"
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '15px', marginTop: '12px' }}
          >
            {loading ? (
              <span>Account Banaya Ja Raha Hai...</span>
            ) : (
              <>
                <span>Account Banayein Aur Dashboard Par Jayein</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '24px' }}>
          Pehle se account mojood hai?{' '}
          <Link href="/login" style={{ color: '#059669', fontWeight: '700', textDecoration: 'none' }}>
            Yahan Login Karein
          </Link>
        </p>
      </div>
    </div>
  );
}
