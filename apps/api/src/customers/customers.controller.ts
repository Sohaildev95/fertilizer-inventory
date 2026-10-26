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
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { QueryCustomersDto } from './dto/query-customers.dto.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';
import { AddCropCycleDto } from './dto/crop-cycle.dto.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get total market udhaar, recovery and customer stats' })
  @ApiResponse({ status: 200, description: 'Summary stats returned' })
  getSummaryStats() {
    return this.customersService.getSummaryStats();
  }

  @Get('fasli-udhaar/forecast')
  @ApiOperation({ summary: 'Get seasonal Fasli Udhaar harvest recovery forecast' })
  @ApiResponse({ status: 200, description: 'Harvest forecast returned' })
  getFasliForecast() {
    return this.customersService.getFasliForecast();
  }

  @Get()
  @ApiOperation({ summary: 'List and search customers / farmers' })
  @ApiResponse({ status: 200, description: 'Customers list returned successfully' })
  findAll(@Query() query: QueryCustomersDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single customer details with recent sales and payments' })
  @ApiResponse({ status: 200, description: 'Customer details returned' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new farmer / customer with credit limit' })
  @ApiResponse({ status: 201, description: 'Customer registered successfully' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Put(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update customer details' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateCustomerDto>) {
    return this.customersService.update(id, dto);
  }

  @Get(':id/ledger')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer running Khata ledger statement' })
  @ApiResponse({ status: 200, description: 'Customer ledger returned' })
  getLedger(@Param('id') id: string) {
    return this.customersService.getLedger(id);
  }

  @Post(':id/payments')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record cash or cheque recovery payment received from farmer' })
  @ApiResponse({ status: 201, description: 'Payment recorded and balance deducted' })
  recordPayment(
    @Param('id') id: string,
    @Body() dto: CreatePaymentDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.customersService.recordPayment(id, dto, userId);
  }

  @Get(':id/crop-cycles')
  @ApiOperation({ summary: 'Get all crop cycles for a specific farmer' })
  @ApiResponse({ status: 200, description: 'Farmer crop cycles returned' })
  getFarmerCropCycles(@Param('id') id: string) {
    return this.customersService.getFarmerCropCycles(id);
  }

  @Post(':id/crop-cycles')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update crop season cycle for a farmer' })
  @ApiResponse({ status: 201, description: 'Crop season cycle added successfully' })
  addFarmerCropCycle(
    @Param('id') id: string,
    @Body() dto: AddCropCycleDto,
  ) {
    return this.customersService.addFarmerCropCycle(id, dto);
  }

  @Delete(':id/crop-cycles/:cycleId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a crop cycle for a farmer' })
  @ApiResponse({ status: 200, description: 'Crop cycle removed' })
  deleteFarmerCropCycle(
    @Param('id') id: string,
    @Param('cycleId') cycleId: string,
  ) {
    return this.customersService.deleteFarmerCropCycle(id, cycleId);
  }
}
