'use client';

import React from 'react';
import { useLanguage } from '../lib/language-context';
import { Languages } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  variant?: 'light' | 'dark';
}

export function LanguageToggle({ className = '', variant = 'light' }: LanguageToggleProps) {
  const { language, toggleLanguage, isUrdu } = useLanguage();

  const isDark = variant === 'dark';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      title={isUrdu ? 'Switch to English' : 'اردو میں تبدیل کریں'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: '999px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
        color: isDark ? '#ffffff' : '#0f172a',
        boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
      }}
      className={className}
    >
      <Languages size={16} color={isDark ? '#34d399' : '#059669'} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span
          style={{
            color: isUrdu ? (isDark ? '#34d399' : '#059669') : '#94a3b8',
            fontWeight: isUrdu ? '800' : '500',
            fontFamily: isUrdu ? 'Noto Nastaliq Urdu, serif' : 'inherit',
            fontSize: isUrdu ? '13px' : '12px',
          }}
        >
          اردو
        </span>
        <span style={{ color: '#94a3b8', fontSize: '11px' }}>|</span>
        <span
          style={{
            color: !isUrdu ? (isDark ? '#34d399' : '#059669') : '#94a3b8',
            fontWeight: !isUrdu ? '800' : '500',
            fontSize: '12px',
          }}
        >
          ENG
        </span>
      </div>
    </button>
  );
}
