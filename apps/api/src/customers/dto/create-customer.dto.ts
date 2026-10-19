import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'چوہدری نذیر احمد وٹو', description: 'Customer or Farmer Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '0300-7654321', description: 'Primary Mobile Phone Number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: '0300-1122334', description: 'Alternate Mobile Phone Number' })
  @IsString()
  @IsOptional()
  altPhone?: string;

  @ApiPropertyOptional({ example: '36502-1234567-1', description: 'Pakistani CNIC Number' })
  @IsString()
  @IsOptional()
  cnic?: string;

  @ApiPropertyOptional({ example: 'چک نمبر 45/12L', description: 'Village or Chak Name' })
  @IsString()
  @IsOptional()
  village?: string;

  @ApiPropertyOptional({ example: 'ڈیرہ چوہدری نذیر، چیچہ وطنی روڈ', description: 'Full Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 500000, description: 'Maximum Credit / Udhaar Limit in PKR' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Starting / Previous Outstanding Balance in PKR' })
  @IsNumber()
  @IsOptional()
  currentBalance?: number;

  @ApiPropertyOptional({ example: '80 ایکڑ رقبہ گندم و مکئی', description: 'Special notes or crop details' })
  @IsString()
  @IsOptional()
  notes?: string;
}
