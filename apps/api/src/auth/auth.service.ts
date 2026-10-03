import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { UserRole } from '@fertilizer/shared';
import { SupabaseService } from '../supabase/supabase.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Register a new user (with auto-created profile)
   */
  async register(dto: RegisterDto) {
    const adminClient = this.supabaseService.getAdminClient();
    const assignedRole = dto.role ?? UserRole.SALES_STAFF;
    const shopName = dto.shopName ?? 'Fertilizer & Agri Store';

    // 1. Create user in Supabase Auth (auto-confirmed email)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        full_name: dto.fullName,
        role: assignedRole,
        shop_name: shopName,
      },
    });

    if (authError || !authData.user) {
      this.logger.error(`Registration failed for ${dto.email}: ${authError?.message}`);
      throw new BadRequestException(
        authError?.message ?? 'User registration mein masla pesh aya. Dobara koshish karein.',
      );
    }

    const userId = authData.user.id;

    // 2. Upsert profile with full details
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: userId,
        full_name: dto.fullName,
        phone: dto.phone ?? null,
        role: assignedRole,
        shop_name: shopName,
        address: dto.address ?? null,
        is_active: true,
      })
      .select('*')
      .single();

    if (profileError) {
      this.logger.error(`Profile creation failed for ${userId}: ${profileError.message}`);
    }

    // 3. Automatically sign in the user to obtain an active session
    const { data: sessionData } = await this.supabaseService.getClient().auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    return {
      success: true,
      message: 'Account kamyabi se register ho gaya hai',
      data: {
        user: {
          id: userId,
          email: dto.email,
        },
        profile: profile ?? {
          id: userId,
          full_name: dto.fullName,
          role: assignedRole,
          shop_name: shopName,
        },
        accessToken: sessionData.session?.access_token,
        refreshToken: sessionData.session?.refresh_token,
      },
    };
  }

  /**
   * Log in user with email & password
   */
  async login(dto: LoginDto) {
    const client = this.supabaseService.getClient();

    const { data, error } = await client.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.user || !data.session) {
      throw new UnauthorizedException('Email ya password ghalat hai. Dobara check karein.');
    }

    // Fetch user profile from DB
    const adminClient = this.supabaseService.getAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      throw new NotFoundException('User profile daryaft nahi ho saki');
    }

    if (!profile.is_active) {
      throw new UnauthorizedException('Yeh account ghair-fuaal hai. Baraye meharbani admin se rabta karein.');
    }

    return {
      success: true,
      message: 'Khush Amdeed! Login kamyab raha',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        profile,
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      },
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: profile, error } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      throw new NotFoundException('Profile daryaft nahi ho saki');
    }

    return {
      success: true,
      data: profile,
    };
  }

  /**
   * Update current user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const adminClient = this.supabaseService.getAdminClient();

    const updateData: Record<string, unknown> = {};
    if (dto.fullName !== undefined) updateData.full_name = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.shopName !== undefined) updateData.shop_name = dto.shopName;
    if (dto.address !== undefined) updateData.address = dto.address;

    const { data: profile, error } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single();

    if (error || !profile) {
      throw new BadRequestException('Profile update karne mein masla pesh aya');
    }

    return {
      success: true,
      message: 'Profile kamyabi se update ho gayi',
      data: profile,
    };
  }

  /**
   * Refresh session token
   */
  async refreshSession(refreshToken: string) {
    const client = this.supabaseService.getClient();

    const { data, error } = await client.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Session refresh nahi ho saka. Dobara login karein.');
    }

    return {
      success: true,
      data: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      },
    };
  }
}
