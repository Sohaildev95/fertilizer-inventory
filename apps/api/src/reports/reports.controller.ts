import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@fertilizer/shared';
import { ReportsService } from './reports.service.js';
import { QueryReportsDto } from './dto/query-reports.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { OptionalRolesGuard } from '../auth/guards/optional-roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('profit-loss')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get Market Udhar (Farmer Receivables) and Recent Recovery list',
  })
  @ApiResponse({ status: 200, description: 'Market udhar returned' })
  getMarketUdhar() {
    return this.reportsService.getMarketUdhar();
  }

  @Get('per-bag-margins')
  @UseGuards(OptionalJwtAuthGuard, OptionalRolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Get Per-Bag Profit & Margin Analytics (Product-wise, Company-wise, Cash vs Credit)',
  })
  @ApiResponse({ status: 200, description: 'Per-bag profit analytics calculated' })
  getPerBagMargins(@Query() query: QueryReportsDto) {
    return this.reportsService.getPerBagMargins(query);
  }
}

