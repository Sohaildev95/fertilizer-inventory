import { IsString, IsNotEmpty, IsOptional, IsIn, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Sona Urea Stock Arrival Alert', description: 'Campaign title or subject' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'whatsapp', enum: ['whatsapp', 'sms', 'both'], description: 'Broadcast delivery channel' })
  @IsString()
  @IsIn(['whatsapp', 'sms', 'both'])
  channel: 'whatsapp' | 'sms' | 'both';

  @ApiProperty({
    example: 'all_farmers',
    enum: ['all_farmers', 'debtors_only', 'village', 'crop_farmers', 'custom_selection'],
    description: 'Targeted audience segment',
  })
  @IsString()
  @IsIn(['all_farmers', 'debtors_only', 'village', 'crop_farmers', 'custom_selection'])
  audienceType: 'all_farmers' | 'debtors_only' | 'village' | 'crop_farmers' | 'custom_selection';

  @ApiPropertyOptional({ example: 'Chak 45/12L', description: 'Filter by village if audienceType is village' })
  @IsOptional()
  @IsString()
  filterVillage?: string;

  @ApiPropertyOptional({ example: 'wheat', description: 'Filter by crop if audienceType is crop_farmers' })
  @IsOptional()
  @IsString()
  filterCrop?: string;

  @ApiProperty({ example: 'محترم کسان بھائی! نیا سٹاک پہنچ چکا ہے۔', description: 'Broadcast message body' })
  @IsString()
  @IsNotEmpty()
  messageText: string;

  @ApiPropertyOptional({ example: ['cst-1', 'cst-2'], description: 'Specific recipient IDs if custom' })
  @IsOptional()
  @IsArray()
  recipientIds?: string[];
}
