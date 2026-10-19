import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service.js';
import { QueryReportsDto } from './dto/query-reports.dto.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('profit-loss')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get comprehensive Profit & Loss report (Revenue, COGS, Gross Profit, Operating Expenses, Net Profit)',
  })
  @ApiResponse({ status: 200, description: 'P&L report calculated' })
  getProfitAndLoss(@Query() query: QueryReportsDto) {
    return this.reportsService.getProfitAndLoss(query);
  }

  @Get('roznamcha')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get Daily Munshi Roznamcha (Cash Book) with Inflows, Outflows, and Net Closing Cash',
  })
  @ApiResponse({ status: 200, description: 'Daily Roznamcha calculated' })
  getRoznamcha(@Query('date') date?: string) {
    return this.reportsService.getRoznamcha(date);
  }

  @Get('stock-valuation')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get Godown Stock Valuation report (Total bags, Cost value, Retail value, Potential profit)',
  })
  @ApiResponse({ status: 200, description: 'Stock valuation returned' })
  getStockValuation() {
    return this.reportsService.getStockValuation();
  }

  @Get('market-udhar')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Market Udhar (Farmer Receivables) and Recent Recovery list',
  })
  @ApiResponse({ status: 200, description: 'Market udhar returned' })
  getMarketUdhar() {
    return this.reportsService.getMarketUdhar();
  }
}
