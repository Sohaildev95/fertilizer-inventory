import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header (Bearer token) zaroori hai');
    }

    const token = authHeader.split(' ')[1];

    try {
      // 1. Verify token with Supabase Auth
      const {
        data: { user },
        error,
      } = await this.supabaseService.getClient().auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Invalid ya expired token');
      }

      // 2. Fetch user profile from database
      const { data: profile, error: profileError } = await this.supabaseService
        .getAdminClient()
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        throw new UnauthorizedException('User profile daryaft nahi ho saki');
      }

      if (!profile.is_active) {
        throw new UnauthorizedException('Yeh account filhaal ghair fuaal (inactive) hai. Admin se rabta karein.');
      }

      // 3. Attach user & profile to request
      request.user = {
        ...profile,
        email: user.email,
      };

      return true;
    } catch (err: unknown) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Authentication verify karne mein masla pesh aya');
    }
  }
}
