import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service.js';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return true; // Allow guest/counter without blocking
    }

    const token = authHeader.split(' ')[1];

    try {
      const {
        data: { user },
      } = await this.supabaseService.getClient().auth.getUser(token);

      if (user) {
        const { data: profile } = await this.supabaseService
          .getAdminClient()
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile && profile.is_active) {
          request.user = {
            ...profile,
            email: user.email,
          };
        }
      }
    } catch {
      // Proceed as guest if token fails
    }

    return true;
  }
}
