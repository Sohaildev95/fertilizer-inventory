'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleHomeRoute } from '@fertilizer/shared';
import { useAuth } from '../lib/auth-context';

export default function Home(): React.ReactNode {
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace(getRoleHomeRoute(profile?.role));
      } else {
        router.replace('/login');
      }
    }
  }, [user, profile?.role, isLoading, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#064e3b',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          className="animate-spin"
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255, 255, 255, 0.2)',
            borderTopColor: '#34d399',
            borderRadius: '50%',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ fontSize: '15px', color: '#a7f3d0' }}>Kissan Inventory System load ho raha hai...</p>
      </div>
    </div>
  );
}
