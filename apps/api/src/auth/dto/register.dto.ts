import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@fertilizer/shared';

export class RegisterDto {
  @ApiProperty({ example: 'admin@fertilizer.pk', description: 'User email address' })
  @IsEmail({}, { message: 'Valid email address darj karein' })
  email!: string;

  @ApiProperty({ example: 'AdminPass123!', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6, { message: 'Password kam az kam 6 characters ka hona chahiye' })
  password!: string;

  @ApiProperty({ example: 'Chaudhry Rizwan', description: 'Full name' })
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({ example: '03001234567', description: 'Mobile phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.SALES_STAFF,
    description: 'User role in shop',
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Must be a valid user role' })
  role?: UserRole;

  @ApiPropertyOptional({ example: 'Kissan Fertilizer & Pesticides Store', description: 'Shop/Business name' })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiPropertyOptional({ example: 'Chowk Nag Shah, Multan', description: 'Shop or user address' })
  @IsOptional()
  @IsString()
  address?: string;
}
