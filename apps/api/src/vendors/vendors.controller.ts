import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VendorsService } from './vendors.service.js';
import { CreateVendorDto } from './dto/create-vendor.dto.js';
import { QueryVendorsDto } from './dto/query-vendors.dto.js';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get('stats/summary')
  @ApiOperation({ summary: 'Get total payable, advance, and vendor summary stats' })
  @ApiResponse({ status: 200, description: 'Summary stats returned' })
  getSummaryStats() {
    return this.vendorsService.getSummaryStats();
  }

  @Get()
  @ApiOperation({ summary: 'List and search vendors / suppliers' })
  @ApiResponse({ status: 200, description: 'Vendors list returned successfully' })
  findAll(@Query() query: QueryVendorsDto) {
    return this.vendorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single vendor details with recent purchases and payments' })
  @ApiResponse({ status: 200, description: 'Vendor details returned' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(id);
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new vendor / supplier' })
  @ApiResponse({ status: 201, description: 'Vendor registered successfully' })
  create(@Body() dto: CreateVendorDto) {
    return this.vendorsService.create(dto);
  }

  @Put(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vendor details' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateVendorDto>) {
    return this.vendorsService.update(id, dto);
  }

  @Get(':id/ledger')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor running Khata ledger statement' })
  @ApiResponse({ status: 200, description: 'Vendor ledger returned' })
  getLedger(@Param('id') id: string) {
    return this.vendorsService.getLedger(id);
  }

  @Post(':id/payments')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record payment sent to vendor (ادائیگی کا اندراج)' })
  @ApiResponse({ status: 201, description: 'Payment recorded and payable balance updated' })
  recordPayment(
    @Param('id') id: string,
    @Body() dto: CreateVendorPaymentDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.vendorsService.recordPayment(id, dto, userId);
  }
}
