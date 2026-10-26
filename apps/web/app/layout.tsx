import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { LanguageProvider } from '../lib/language-context';
import { DomGuardian } from '../components/dom-guardian';

export const metadata: Metadata = {
  title: 'Kissan Fertilizer & Pesticides Inventory System',
  description: 'Complete Fertilizer Shop Inventory, POS Billing, Purchases, Khata Ledger & Vendor Management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <html lang="ur" dir="rtl" className="notranslate" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="notranslate" translate="no" suppressHydrationWarning>
        <DomGuardian />
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
