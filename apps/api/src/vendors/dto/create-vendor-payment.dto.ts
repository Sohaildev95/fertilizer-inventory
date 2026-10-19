import { IsNumber, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorPaymentDto {
  @ApiProperty({ example: 250000, description: 'Payment amount sent to vendor in PKR' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({
    example: 'bank_transfer',
    enum: ['cash', 'bank_transfer', 'cheque', 'online'],
    description: 'Payment method',
  })
  @IsString()
  @IsOptional()
  paymentMethod?: 'cash' | 'bank_transfer' | 'cheque' | 'online';

  @ApiPropertyOptional({ example: 'CHQ-889921', description: 'Bank cheque number if paying via cheque' })
  @IsString()
  @IsOptional()
  chequeNumber?: string;

  @ApiPropertyOptional({ example: '2026-11-15', description: 'Cheque clearing date' })
  @IsString()
  @IsOptional()
  chequeDate?: string;

  @ApiPropertyOptional({ example: 'ادائیگی بذریعہ حبیب بینک آن لائن ٹرانسفر', description: 'Payment memo or notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
