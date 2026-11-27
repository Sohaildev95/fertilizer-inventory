import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@fertilizer/shared';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { QueryProductsDto } from './dto/query-products.dto.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { OptionalRolesGuard } from '../auth/guards/optional-roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('stats')
  @UseGuards(OptionalJwtAuthGuard, OptionalRolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER, UserRole.SALES_STAFF)
  @ApiOperation({ summary: 'Get inventory stats (total bags, low stock alerts, valuation)' })
  @ApiResponse({ status: 200, description: 'Inventory statistics returned successfully' })
  getStats() {
    return this.productsService.getStats();
  }

  @Get('categories')
  @UseGuards(OptionalJwtAuthGuard, OptionalRolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER, UserRole.SALES_STAFF)
  @ApiOperation({ summary: 'List all active fertilizer & pesticide categories' })
  @ApiResponse({ status: 200, description: 'Categories returned successfully' })
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard, OptionalRolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER, UserRole.SALES_STAFF)
  @ApiOperation({ summary: 'List products with search, category filter, and pagination' })
  @ApiResponse({ status: 200, description: 'Products list returned successfully' })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard, OptionalRolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER, UserRole.SALES_STAFF)
  @ApiOperation({ summary: 'Get single product details with recent stock movements' })
  @ApiResponse({ status: 200, description: 'Product returned successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new fertilizer product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(@Body() dto: CreateProductDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.productsService.create(dto, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate / soft-delete a product' })
  @ApiResponse({ status: 200, description: 'Product deactivated successfully' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/adjust-stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Adjust stock (damaged bags, audit correction, return)' })
  @ApiResponse({ status: 200, description: 'Stock adjusted and audit logged' })
  adjustStock(
    @Param('id') id: string,
    @Body() dto: AdjustStockDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.productsService.adjustStock(id, dto, userId);
  }

  @Get(':id/movements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get stock movement audit history for product' })
  @ApiResponse({ status: 200, description: 'Movements returned successfully' })
  getMovements(@Param('id') id: string) {
    return this.productsService.getMovements(id);
  }
}
