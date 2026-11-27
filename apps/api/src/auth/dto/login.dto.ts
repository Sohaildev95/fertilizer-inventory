import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { LoginPortal } from '@fertilizer/shared';

export class LoginDto {
  @ApiProperty({ example: 'admin@fertilizer.pk', description: 'Registered email address' })
  @IsEmail({}, { message: 'Durust email address darj karein' })
  email!: string;

  @ApiProperty({ example: 'AdminPass123!', description: 'Account password' })
  @IsString()
  @MinLength(6, { message: 'Password kam az kam 6 characters ka hona chahiye' })
  password!: string;

  @ApiPropertyOptional({
    enum: ['shop', 'pos', 'vendor'],
    description: 'Selected login portal tab',
  })
  @IsOptional()
  @IsIn(['shop', 'pos', 'vendor'], { message: 'Invalid portal selection' })
  portal?: LoginPortal;
}
