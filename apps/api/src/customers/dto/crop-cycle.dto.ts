import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCropCycleDto {
  @ApiProperty({ example: 'گندم (Wheat 2026)', description: 'Crop display name with year' })
  @IsString()
  @IsNotEmpty()
  cropName: string;

  @ApiProperty({ example: 'wheat', description: 'Standard crop key' })
  @IsString()
  @IsNotEmpty()
  cropKey: string;

  @ApiProperty({ example: 'rabi', enum: ['rabi', 'kharif', 'zaid'] })
  @IsString()
  @IsIn(['rabi', 'kharif', 'zaid'])
  seasonType: 'rabi' | 'kharif' | 'zaid';

  @ApiProperty({ example: 2026, description: 'Season crop year' })
  @IsNumber()
  seasonYear: number;

  @ApiProperty({ example: 25, description: 'Land acreage in Acres (ایکڑ)' })
  @IsNumber()
  @Min(0.5)
  landAcreage: number;

  @ApiPropertyOptional({ example: '2025-11-15', description: 'Sowing date (بجائی)' })
  @IsString()
  @IsOptional()
  sowingDate?: string;

  @ApiProperty({ example: '2026-04-30', description: 'Expected harvest & payment date (متوقع کٹائی و وصولی)' })
  @IsString()
  @IsNotEmpty()
  expectedHarvestDate: string;

  @ApiProperty({ example: 250000, description: 'Expected Fasli Udhaar amount in PKR' })
  @IsNumber()
  @Min(0)
  expectedAmount: number;

  @ApiPropertyOptional({ example: 'کٹائی کے وقت گندم کی بوریوں کی فروخت سے ادائیگی ہوگی', description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
