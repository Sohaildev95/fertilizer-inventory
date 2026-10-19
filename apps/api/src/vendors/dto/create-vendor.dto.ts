import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'Fauji Fertilizer Company (FFC)', description: 'Vendor or Company Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'FFC Limited', description: 'Brand or Parent Corporation' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Zahid Khan (Regional Manager)', description: 'Contact Person or Sales Officer' })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ example: '0300-1234567', description: 'Primary Mobile / Phone Number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: '0321-7654321', description: 'Alternate Contact Phone' })
  @IsString()
  @IsOptional()
  altPhone?: string;

  @ApiPropertyOptional({ example: 'sales@ffc.com.pk', description: 'Official Email' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '36502-1234567-9', description: 'CNIC or NTN Number' })
  @IsString()
  @IsOptional()
  cnic?: string;

  @ApiPropertyOptional({ example: 'Industrial Area, Multan Road, Lahore', description: 'Depot or Head Office Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Multan', description: 'City or Supply Station' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 0, description: 'Starting / Payable Balance owed to Vendor in PKR' })
  @IsNumber()
  @IsOptional()
  currentBalance?: number;

  @ApiPropertyOptional({ example: 'active', description: 'Vendor Status (active, inactive, blocked)' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'Direct factory quota dealer account', description: 'Additional supplier terms or memo' })
  @IsString()
  @IsOptional()
  notes?: string;
}
