import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Chaudhry Rizwan Ahmad', description: 'Updated full name' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '03007654321', description: 'Updated phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Al-Madina Fertilizer & Agro Services', description: 'Updated shop name' })
  @IsOptional()
  @IsString()
  shopName?: string;

  @ApiPropertyOptional({ example: 'Railway Road, Khanewal', description: 'Updated address' })
  @IsOptional()
  @IsString()
  address?: string;
}
