import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VendorPriceUpdateDto {
  @ApiProperty({ description: 'Product ID being revised' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'New wholesale/cost price per bag' })
  @IsNumber()
  @Min(0)
  newCostPrice: number;

  @ApiPropertyOptional({ description: 'Suggested new retail price per bag' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  suggestedSalePrice?: number;

  @ApiPropertyOptional({ description: 'Effective date for new price' })
  @IsString()
  @IsOptional()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Official company circular or notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class VendorDispatchNoticeDto {
  @ApiProperty({ description: 'Truck registration number' })
  @IsString()
  @IsNotEmpty()
  truckNumber: string;

  @ApiPropertyOptional({ description: 'Bilty or consignment tracking number' })
  @IsString()
  @IsOptional()
  biltyNumber?: string;

  @ApiPropertyOptional({ description: 'Driver name and mobile number' })
  @IsString()
  @IsOptional()
  driverContact?: string;

  @ApiProperty({ description: 'Product name or ID' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: 'Total bag quantity dispatched' })
  @IsNumber()
  @Min(1)
  bagsQuantity: number;

  @ApiPropertyOptional({ description: 'Expected date and time of arrival at dealership' })
  @IsString()
  @IsOptional()
  expectedArrival?: string;

  @ApiPropertyOptional({ description: 'Special instructions or notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
