import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 50000, description: 'Amount paid / received in PKR' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ example: 'cash', enum: ['cash', 'bank_transfer', 'cheque', 'easypaisa', 'jazzcash'] })
  @IsString()
  @IsIn(['cash', 'bank_transfer', 'cheque', 'easypaisa', 'jazzcash'])
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'easypaisa' | 'jazzcash';

  @ApiPropertyOptional({ example: 'CHQ-890123', description: 'Cheque number if payment by cheque' })
  @IsString()
  @IsOptional()
  chequeNumber?: string;

  @ApiPropertyOptional({ example: '2026-11-15', description: 'Cheque clearing date' })
  @IsString()
  @IsOptional()
  chequeDate?: string;

  @ApiPropertyOptional({ example: 'منشی خرم نے کاؤنٹر پر وصول کیے', description: 'Payment voucher notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
