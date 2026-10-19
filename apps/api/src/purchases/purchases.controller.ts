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
import { PurchasesService } from './purchases.service.js';
import { CreatePurchaseDto } from './dto/create-purchase.dto.js';
import { QueryPurchasesDto } from './dto/query-purchases.dto.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';

@ApiTags('purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get total purchases, paid and payable stats' })
  @ApiResponse({ status: 200, description: 'Summary stats returned' })
  getSummaryStats() {
    return this.purchasesService.getSummaryStats();
  }

  @Get()
  @ApiOperation({ summary: 'List and filter purchase invoices' })
  @ApiResponse({ status: 200, description: 'Purchases list returned successfully' })
  findAll(@Query() query: QueryPurchasesDto) {
    return this.purchasesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single purchase details with vendor and items' })
  @ApiResponse({ status: 200, description: 'Purchase details returned' })
  @ApiResponse({ status: 404, description: 'Purchase not found' })
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record a new purchase stock-in entry (مال خریداری انٹری)' })
  @ApiResponse({ status: 201, description: 'Purchase recorded and stock incremented' })
  create(@Body() dto: CreatePurchaseDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.purchasesService.create(dto, userId);
  }
}
