import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Product English name', example: 'Sona Urea' })
  @IsString()
  @IsNotEmpty({ message: 'Product name lazmi hai' })
  name: string;

  @ApiPropertyOptional({ description: 'Product Urdu name', example: 'سونا یوریا کھاد' })
  @IsString()
  @IsOptional()
  urduName?: string;

  @ApiPropertyOptional({ description: 'Product SKU code', example: 'FFC-UREA-50' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ description: 'Category UUID' })
  @IsUUID('4', { message: 'Valid category ID hona chahiye' })
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Manufacturing company name', example: 'Fauji Fertilizer (FFC)' })
  @IsString()
  @IsNotEmpty({ message: 'Company name lazmi hai' })
  companyName: string;

  @ApiPropertyOptional({
    description: 'Unit of measurement',
    example: 'bag_50kg',
    default: 'bag_50kg',
  })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ description: 'Purchase cost price in PKR', example: 4200.0 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Cost price number honi chahiye' })
  @Min(0, { message: 'Cost price zero se kam nahi ho sakti' })
  costPrice: number;

  @ApiProperty({ description: 'Retail sale price in PKR', example: 4500.0 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Sale price number honi chahiye' })
  @Min(0, { message: 'Sale price zero se kam nahi ho sakti' })
  salePrice: number;

  @ApiPropertyOptional({ description: 'Minimum allowed sale price in PKR', example: 4350.0 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minSalePrice?: number;

  @ApiPropertyOptional({ description: 'Initial stock quantity', example: 100, default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  initialStock?: number;

  @ApiPropertyOptional({
    description: 'Minimum stock alert threshold',
    example: 20,
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockAlert?: number;

  @ApiPropertyOptional({ description: 'Godown rack or shelf location', example: 'گودام 1 - ریک A' })
  @IsString()
  @IsOptional()
  rackLocation?: string;

  @ApiPropertyOptional({ description: 'Batch number', example: 'BATCH-2026-X' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Expiry date in YYYY-MM-DD format', example: '2028-12-31' })
  @IsDateString({}, { message: 'Valid date format YYYY-MM-DD hona chahiye' })
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Barcode string' })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({ description: 'Product description or usage notes' })
  @IsString()
  @IsOptional()
  description?: string;
}
