import { IsNotEmpty, IsNumber, IsString, IsIn, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdjustStockDto {
  @ApiProperty({
    description: 'Quantity change (positive to increase, negative to decrease)',
    example: -2,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'Quantity number honi chahiye' })
  @IsNotEmpty({ message: 'Quantity lazmi hai' })
  quantity: number;

  @ApiProperty({
    description: 'Type of movement',
    enum: ['adjustment', 'damage', 'return_in', 'return_out'],
    example: 'damage',
  })
  @IsString()
  @IsIn(['adjustment', 'damage', 'return_in', 'return_out'], {
    message: 'Movement type adjustment, damage, return_in ya return_out mein se hona chahiye',
  })
  movementType: 'adjustment' | 'damage' | 'return_in' | 'return_out';

  @ApiPropertyOptional({
    description: 'Reason or note for adjustment',
    example: 'گودام میں بوری پھٹ گئی، 2 بوریاں ضائع',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
