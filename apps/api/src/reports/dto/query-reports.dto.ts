import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryReportsDto {
  @ApiPropertyOptional({
    example: 'this_month',
    enum: ['today', 'this_week', 'this_month', 'season', 'custom'],
    description: 'Predefined time range filter',
  })
  @IsOptional()
  @IsIn(['today', 'this_week', 'this_month', 'season', 'custom'])
  timeRange?: string = 'this_month';

  @ApiPropertyOptional({
    example: '2026-10-01',
    description: 'Start date for custom range (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-10-31',
    description: 'End date for custom range (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    example: '2026-10-19',
    description: 'Single date filter for daily Roznamcha (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  date?: string;
}
