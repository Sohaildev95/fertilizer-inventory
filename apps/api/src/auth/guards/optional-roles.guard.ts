import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@fertilizer/shared';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

/**
 * Enforces @Roles(...) whenever an authenticated JWT user is present on the request,
 * while preserving unauthenticated mobile offline-sync compatibility.
 */
@Injectable()
export class OptionalRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Unauthenticated guest / mobile sync (handled when endpoint intentionally allows anonymous)
    if (!user) {
      return true;
    }

    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    if (!user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Aapko yeh amal anjaam dene ki ijazat nahi hai. Required role: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
