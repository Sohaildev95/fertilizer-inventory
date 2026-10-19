import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({
    example: '250 Boriyan Sona Urea Palledari',
    description: 'Title or short description of the expense / خرچہ کی تفصیل',
  })
  @IsString()
  @IsNotEmpty({ message: 'خرچے کی تفصیل لکھنا لازمی ہے' })
  title: string;

  @ApiProperty({
    example: 'palledari',
    description:
      'Category: palledari (پلے داری), transport (کرایہ), refreshment (چائے پانی), rent (کرایہ دکان/گودام), utilities (بجلی/بل), salary (تنخواہ), fuel (پیٹرول), misc (متفرق)',
  })
  @IsString()
  @IsNotEmpty({ message: 'کیٹیگری منتخب کرنا لازمی ہے' })
  category: string;

  @ApiProperty({
    example: 3750,
    description: 'Expense amount in PKR (روپے)',
  })
  @IsNumber()
  @Min(1, { message: 'رقم کم از کم 1 روپیہ ہونی چاہیے' })
  amount: number;

  @ApiPropertyOptional({
    example: 'cash',
    enum: ['cash', 'bank_transfer', 'cheque'],
    description: 'Payment method used for the expense',
  })
  @IsOptional()
  @IsIn(['cash', 'bank_transfer', 'cheque'])
  paymentMethod?: 'cash' | 'bank_transfer' | 'cheque';

  @ApiPropertyOptional({
    example: '2026-10-19',
    description: 'Expense date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  expenseDate?: string;

  @ApiPropertyOptional({
    example: 'منشی خرم',
    description: 'Staff member or person who disbursed the cash',
  })
  @IsOptional()
  @IsString()
  paidBy?: string;

  @ApiPropertyOptional({
    example: 'Rs. 15 fee bori rate mazdoor Latif ko ada kia',
    description: 'Additional notes or remarks / اضافی نوٹ',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
