'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language } from '@fertilizer/shared';

interface LanguageContextType {
  language: Language;
  direction: 'rtl' | 'ltr';
  isUrdu: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to Urdu for Pakistani dukandari audience
  const [language, setLanguageState] = useState<Language>('ur');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fertilizer_language') as Language;
      if (saved && (saved === 'ur' || saved === 'en')) {
        setLanguageState(saved);
      }
    } catch (e) {
      console.error('Failed to load language preference', e);
    }
    setMounted(true);
  }, []);

  const direction = language === 'ur' ? 'rtl' : 'ltr';
  const isUrdu = language === 'ur';

  // Update HTML tag dir and lang attributes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = language;
      if (isUrdu) {
        document.documentElement.classList.add('urdu-mode');
      } else {
        document.documentElement.classList.remove('urdu-mode');
      }
    }
  }, [direction, language, isUrdu]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('fertilizer_language', newLang);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ur' ? 'en' : 'ur');
  };

  /**
   * Helper function to get translation by dot-notation (e.g. 'nav.dashboard')
   */
  const t = useCallback(
    (path: string, fallback?: string): string => {
      const parts = path.split('.');
      let current: any = translations;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          return fallback || path;
        }
      }

      if (current && typeof current === 'object' && language in current) {
        return current[language];
      }

      return fallback || path;
    },
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isUrdu,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
