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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRole } from '@fertilizer/shared';
import { ExpensesService } from './expenses.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';
import { QueryExpensesDto } from './dto/query-expenses.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.SHOP_MANAGER)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('stats/summary')
  @ApiOperation({
    summary:
      'Get real-time expense KPI summary (today, month, palledari, cash outflow, category breakdown)',
  })
  @ApiResponse({ status: 200, description: 'Summary stats returned' })
  getStatsSummary(@Query('date') date?: string) {
    return this.expensesService.getStatsSummary(date);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter expenses with pagination' })
  @ApiResponse({ status: 200, description: 'Expenses returned successfully' })
  findAll(@Query() query: QueryExpensesDto) {
    return this.expensesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single expense details by ID' })
  @ApiResponse({ status: 200, description: 'Expense details returned' })
  @ApiResponse({ status: 404, description: 'Expense not found' })
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Record a new daily shop expense' })
  @ApiResponse({ status: 201, description: 'Expense recorded successfully' })
  create(@Body() dto: CreateExpenseDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.expensesService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing expense entry' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete / cancel an expense entry' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
