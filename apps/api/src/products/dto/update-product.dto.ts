import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto.js';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ description: 'Active status of the product', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
