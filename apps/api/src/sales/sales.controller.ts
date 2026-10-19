import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { QuerySalesDto } from './dto/query-sales.dto.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('stats/today')
  @ApiOperation({ summary: "Get today's POS sales summary stats" })
  @ApiResponse({ status: 200, description: 'Stats returned successfully' })
  getTodayStats() {
    return this.salesService.getTodayStats();
  }

  @Get()
  @ApiOperation({ summary: 'List and filter sales invoices' })
  @ApiResponse({ status: 200, description: 'Sales list returned' })
  findAll(@Query() query: QuerySalesDto) {
    return this.salesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single sale invoice details with items' })
  @ApiResponse({ status: 200, description: 'Sale invoice returned' })
  @ApiResponse({ status: 404, description: 'Sale not found' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new sale invoice at POS Counter' })
  @ApiResponse({ status: 201, description: 'Sale created and stock deducted' })
  create(@Body() dto: CreateSaleDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.salesService.create(dto, userId);
  }
}
