import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  UserRole,
  getRoleHomeRoute,
  canRoleAccessRoute,
  canEditInventory,
  canViewCostAndReports,
  getPortalForRole,
  isRoleAllowedInPortal,
} from '@fertilizer/shared';
import { RolesGuard } from './roles.guard.js';
import { OptionalRolesGuard } from './optional-roles.guard.js';

function createMockContext(user?: { role?: string }): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard & OptionalRolesGuard', () => {
  it('allows any request when no @Roles metadata is set', () => {
    const reflector = {
      getAllAndOverride: () => undefined,
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(createMockContext(undefined))).toBe(true);
  });

  it('throws ForbiddenException when @Roles is required and user is missing', () => {
    const reflector = {
      getAllAndOverride: () => [UserRole.SHOP_MANAGER],
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(createMockContext(undefined))).toThrow(ForbiddenException);
  });

  it('always allows SUPER_ADMIN regardless of required route roles', () => {
    const reflector = {
      getAllAndOverride: () => [UserRole.VENDOR],
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(createMockContext({ role: UserRole.SUPER_ADMIN }))).toBe(true);
  });

  it('blocks VENDOR and SALES_STAFF from SHOP_MANAGER/SUPER_ADMIN routes', () => {
    const reflector = {
      getAllAndOverride: () => [UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER],
    } as unknown as Reflector;

    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(createMockContext({ role: UserRole.SHOP_MANAGER }))).toBe(true);
    expect(() => guard.canActivate(createMockContext({ role: UserRole.SALES_STAFF }))).toThrow(
      ForbiddenException,
    );
    expect(() => guard.canActivate(createMockContext({ role: UserRole.VENDOR }))).toThrow(
      ForbiddenException,
    );
  });

  it('OptionalRolesGuard allows unauthenticated calls (mobile sync) but blocks unauthorized authenticated roles', () => {
    const reflector = {
      getAllAndOverride: () => [UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER, UserRole.SALES_STAFF],
    } as unknown as Reflector;

    const optionalGuard = new OptionalRolesGuard(reflector);
    expect(optionalGuard.canActivate(createMockContext(undefined))).toBe(true);
    expect(optionalGuard.canActivate(createMockContext({ role: UserRole.SALES_STAFF }))).toBe(true);
    expect(() => optionalGuard.canActivate(createMockContext({ role: UserRole.VENDOR }))).toThrow(
      ForbiddenException,
    );
  });
});

describe('Shared RBAC Route & Feature Permissions', () => {
  it('returns role-specific home landing routes', () => {
    expect(getRoleHomeRoute(UserRole.SUPER_ADMIN)).toBe('/dashboard');
    expect(getRoleHomeRoute(UserRole.SHOP_MANAGER)).toBe('/dashboard');
    expect(getRoleHomeRoute(UserRole.SALES_STAFF)).toBe('/dashboard/pos');
    expect(getRoleHomeRoute(UserRole.VENDOR)).toBe('/dashboard/vendors/portal');
    expect(getRoleHomeRoute(undefined)).toBe('/dashboard/pos');
  });

  it('enforces exact dashboard route boundaries without prefix leaks', () => {
    // Sales staff gets POS, Products, Barcodes, Customers, Guide — never Overview, Reports, Purchases, Vendors
    expect(canRoleAccessRoute(UserRole.SALES_STAFF, '/dashboard/pos')).toBe(true);
    expect(canRoleAccessRoute(UserRole.SALES_STAFF, '/dashboard/products')).toBe(true);
    expect(canRoleAccessRoute(UserRole.SALES_STAFF, '/dashboard/customers')).toBe(true);
    expect(canRoleAccessRoute(UserRole.SALES_STAFF, '/dashboard')).toBe(false);
    expect(canRoleAccessRoute(UserRole.SALES_STAFF, '/dashboard/reports')).toBe(false);
    expect(canRoleAccessRoute(UserRole.SALES_STAFF, '/dashboard/expenses')).toBe(false);
    expect(canRoleAccessRoute(UserRole.SALES_STAFF, '/dashboard/purchases/new')).toBe(false);

    // Vendor gets Vendor Portal & Guide ONLY — never internal Vendors Management or Shop POS
    expect(canRoleAccessRoute(UserRole.VENDOR, '/dashboard/vendors/portal')).toBe(true);
    expect(canRoleAccessRoute(UserRole.VENDOR, '/dashboard/guide')).toBe(true);
    expect(canRoleAccessRoute(UserRole.VENDOR, '/dashboard/vendors')).toBe(false);
    expect(canRoleAccessRoute(UserRole.VENDOR, '/dashboard')).toBe(false);
    expect(canRoleAccessRoute(UserRole.VENDOR, '/dashboard/pos')).toBe(false);

    // Shop Manager gets operational pages + purchases/new, NOT owner profit reports or vendor portal
    expect(canRoleAccessRoute(UserRole.SHOP_MANAGER, '/dashboard')).toBe(true);
    expect(canRoleAccessRoute(UserRole.SHOP_MANAGER, '/dashboard/purchases/new')).toBe(true);
    expect(canRoleAccessRoute(UserRole.SHOP_MANAGER, '/dashboard/expenses')).toBe(true);
    expect(canRoleAccessRoute(UserRole.SHOP_MANAGER, '/dashboard/vendors')).toBe(true);
    expect(canRoleAccessRoute(UserRole.SHOP_MANAGER, '/dashboard/reports')).toBe(false);
    expect(canRoleAccessRoute(UserRole.SHOP_MANAGER, '/dashboard/vendors/portal')).toBe(false);

    // Super Admin gets everything
    expect(canRoleAccessRoute(UserRole.SUPER_ADMIN, '/dashboard/reports')).toBe(true);
    expect(canRoleAccessRoute(UserRole.SUPER_ADMIN, '/dashboard/vendors/portal')).toBe(true);
  });

  it('computes inventory and report permissions cleanly', () => {
    expect(canEditInventory(UserRole.SUPER_ADMIN)).toBe(true);
    expect(canEditInventory(UserRole.SHOP_MANAGER)).toBe(true);
    expect(canEditInventory(UserRole.SALES_STAFF)).toBe(false);
    expect(canEditInventory(UserRole.VENDOR)).toBe(false);

    expect(canViewCostAndReports(UserRole.SUPER_ADMIN)).toBe(true);
    expect(canViewCostAndReports(UserRole.SHOP_MANAGER)).toBe(false);
  });

  it('validates login portal tab against account role cleanly', () => {
    expect(getPortalForRole(UserRole.SUPER_ADMIN)).toBe('shop');
    expect(getPortalForRole(UserRole.SHOP_MANAGER)).toBe('shop');
    expect(getPortalForRole(UserRole.SALES_STAFF)).toBe('pos');
    expect(getPortalForRole(UserRole.VENDOR)).toBe('vendor');

    expect(isRoleAllowedInPortal(UserRole.SUPER_ADMIN, 'shop')).toBe(true);
    expect(isRoleAllowedInPortal(UserRole.SHOP_MANAGER, 'shop')).toBe(true);
    expect(isRoleAllowedInPortal(UserRole.VENDOR, 'shop')).toBe(false);
    expect(isRoleAllowedInPortal(UserRole.SALES_STAFF, 'shop')).toBe(false);

    expect(isRoleAllowedInPortal(UserRole.SALES_STAFF, 'pos')).toBe(true);
    expect(isRoleAllowedInPortal(UserRole.SUPER_ADMIN, 'pos')).toBe(false);

    expect(isRoleAllowedInPortal(UserRole.VENDOR, 'vendor')).toBe(true);
    expect(isRoleAllowedInPortal(UserRole.SUPER_ADMIN, 'vendor')).toBe(false);
  });
});
