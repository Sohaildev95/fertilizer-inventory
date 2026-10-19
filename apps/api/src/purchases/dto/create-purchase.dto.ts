import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PurchaseItemDto {
  @ApiProperty({ example: 'prd-uuid', description: 'Product ID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 100, description: 'Quantity (bags / units) received' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 4200, description: 'Purchase cost price per bag / unit in PKR' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 'BCH-2026-X1', description: 'Manufacturer batch number' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiPropertyOptional({ example: '2028-10-01', description: 'Product expiry date' })
  @IsString()
  @IsOptional()
  expiryDate?: string;
}

export class CreatePurchaseDto {
  @ApiProperty({ example: 'vendor-uuid', description: 'Vendor / Supplier ID' })
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @ApiPropertyOptional({ example: 'PUR-20261019-1001', description: 'Supplier bill or invoice number' })
  @IsString()
  @IsOptional()
  invoiceNo?: string;

  @ApiPropertyOptional({ example: '2026-10-19', description: 'Purchase invoice date' })
  @IsString()
  @IsOptional()
  purchaseDate?: string;

  @ApiProperty({ type: [PurchaseItemDto], description: 'List of fertilizer/agri items received' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemDto)
  items: PurchaseItemDto[];

  @ApiPropertyOptional({ example: 5000, description: 'Special supplier discount in PKR' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number = 0;

  @ApiPropertyOptional({ example: 400000, description: 'Amount paid immediately in cash or bank transfer' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number = 0;

  @ApiPropertyOptional({
    example: 'bank_transfer',
    enum: ['cash', 'bank_transfer', 'cheque'],
    description: 'Payment method for the paid amount',
  })
  @IsString()
  @IsOptional()
  paymentMethod?: 'cash' | 'bank_transfer' | 'cheque' = 'cash';

  @ApiPropertyOptional({ example: 'TK-7842 (ملتان گڈز ٹرانسپورٹ)', description: 'Truck or vehicle registration number' })
  @IsString()
  @IsOptional()
  vehicleNo?: string;

  @ApiPropertyOptional({ example: 'BL-9921', description: 'Transport Bilty / Goods Receipt number' })
  @IsString()
  @IsOptional()
  biltyNo?: string;

  @ApiPropertyOptional({ example: 'گودام نمبر 1 میں مال اتارا گیا', description: 'Receiving remarks or godown destination' })
  @IsString()
  @IsOptional()
  notes?: string;
}
