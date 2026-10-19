import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 10, description: 'Quantity (number of bags or units)' })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ example: 4450, description: 'Unit selling price agreed upon in PKR' })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 0, description: 'Discount applied to this specific line item' })
  @IsNumber()
  @IsOptional()
  discount?: number;
}

export class CreateSaleDto {
  @ApiPropertyOptional({ description: 'Registered Customer / Farmer UUID (null for walk-in)' })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ example: 'registered', enum: ['registered', 'walk_in'] })
  @IsString()
  @IsIn(['registered', 'walk_in'])
  customerType: 'registered' | 'walk_in';

  @ApiPropertyOptional({ example: 'عام کسان (نقد)', description: 'Name of walk-in customer' })
  @IsString()
  @IsOptional()
  walkInName?: string;

  @ApiPropertyOptional({ example: '2026-10-16', description: 'Sale date (defaults to today)' })
  @IsString()
  @IsOptional()
  saleDate?: string;

  @ApiProperty({ type: [CreateSaleItemDto], description: 'Items in the cart' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiPropertyOptional({ example: 500, description: 'Total overall invoice discount in PKR' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: 44500, description: 'Amount paid by customer at counter in PKR' })
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @ApiProperty({ example: 'cash', enum: ['cash', 'bank_transfer', 'cheque', 'easypaisa', 'jazzcash'] })
  @IsString()
  @IsIn(['cash', 'bank_transfer', 'cheque', 'easypaisa', 'jazzcash'])
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'easypaisa' | 'jazzcash';

  @ApiPropertyOptional({ example: 'مال گودام 1 سے نکالا گیا', description: 'Additional invoice notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
