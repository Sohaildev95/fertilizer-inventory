import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryRecipientsDto {
  @ApiPropertyOptional({
    example: 'all_farmers',
    enum: ['all_farmers', 'debtors_only', 'village', 'crop_farmers', 'custom_selection'],
    description: 'Targeted audience segment',
  })
  @IsOptional()
  @IsString()
  @IsIn(['all_farmers', 'debtors_only', 'village', 'crop_farmers', 'custom_selection'])
  audienceType?: 'all_farmers' | 'debtors_only' | 'village' | 'crop_farmers' | 'custom_selection';

  @ApiPropertyOptional({ example: 'Chak 45/12L', description: 'Filter by village' })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional({ example: 'wheat', description: 'Filter by crop' })
  @IsOptional()
  @IsString()
  crop?: string;

  @ApiPropertyOptional({ example: 'محترم کسان! نیا سٹاک آ گیا ہے۔', description: 'Sample message for WhatsApp link generator' })
  @IsOptional()
  @IsString()
  messageTemplate?: string;
}
