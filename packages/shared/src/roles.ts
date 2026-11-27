import { UserRole } from './types.js';

/**
 * Default landing route after sign-in / registration for each role.
 */
export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: '/dashboard',
  [UserRole.SHOP_MANAGER]: '/dashboard',
  [UserRole.SALES_STAFF]: '/dashboard/pos',
  [UserRole.VENDOR]: '/dashboard/vendors/portal',
};

/**
 * Allowed dashboard navigation routes per role (explicit exact/prefix list).
 */
export const ROLE_ALLOWED_ROUTES: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    '/dashboard',
    '/dashboard/pos',
    '/dashboard/products',
    '/dashboard/barcodes',
    '/dashboard/purchases',
    '/dashboard/purchases/new',
    '/dashboard/customers',
    '/dashboard/broadcast',
    '/dashboard/vendors',
    '/dashboard/vendors/portal',
    '/dashboard/expenses',
    '/dashboard/reports',
    '/dashboard/guide',
  ],
  [UserRole.SHOP_MANAGER]: [
    '/dashboard',
    '/dashboard/pos',
    '/dashboard/products',
    '/dashboard/barcodes',
    '/dashboard/purchases',
    '/dashboard/purchases/new',
    '/dashboard/customers',
    '/dashboard/broadcast',
    '/dashboard/vendors',
    '/dashboard/expenses',
    '/dashboard/guide',
  ],
  [UserRole.SALES_STAFF]: [
    '/dashboard/pos',
    '/dashboard/products',
    '/dashboard/barcodes',
    '/dashboard/customers',
    '/dashboard/guide',
  ],
  [UserRole.VENDOR]: [
    '/dashboard/vendors/portal',
    '/dashboard/guide',
  ],
};

function normalizeUserRole(role?: string | null): UserRole {
  switch (role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.SHOP_MANAGER:
    case UserRole.SALES_STAFF:
    case UserRole.VENDOR:
      return role;
    default:
      return UserRole.SALES_STAFF;
  }
}

export function getRoleHomeRoute(role?: string | null): string {
  const normalized = normalizeUserRole(role);
  return ROLE_HOME_ROUTES[normalized];
}

export function canRoleAccessRoute(role?: string | null, pathname?: string | null): boolean {
  if (!pathname) return false;
  const cleanPath = pathname.split('?')[0]?.replace(/\/+$/, '') || '/dashboard';
  const normalized = normalizeUserRole(role);
  const allowed = ROLE_ALLOWED_ROUTES[normalized];

  // Exact match or explicitly permitted subpath (prevent '/dashboard' or '/dashboard/vendors' broad prefix leaks)
  return allowed.some((route) => {
    if (cleanPath === route) return true;
    if (route === '/dashboard' || route === '/dashboard/vendors') return false;
    return cleanPath.startsWith(`${route}/`);
  });
}

export function canEditInventory(role?: string | null): boolean {
  const normalized = normalizeUserRole(role);
  return normalized === UserRole.SUPER_ADMIN || normalized === UserRole.SHOP_MANAGER;
}

export function canViewCostAndReports(role?: string | null): boolean {
  return normalizeUserRole(role) === UserRole.SUPER_ADMIN;
}
