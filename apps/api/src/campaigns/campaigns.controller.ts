import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { CampaignsService } from './campaigns.service.js';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { QueryRecipientsDto } from './dto/query-recipients.dto.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('templates')
  @ApiOperation({ summary: 'Get predefined broadcast message templates for Pakistani fertilizer dealers' })
  @ApiResponse({ status: 200, description: 'Templates returned' })
  getTemplates() {
    return this.campaignsService.getTemplates();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get broadcast and audience summary statistics' })
  @ApiResponse({ status: 200, description: 'Stats returned' })
  getStats() {
    return this.campaignsService.getStats();
  }

  @Get('recipients')
  @ApiOperation({ summary: 'Calculate audience recipient list with WhatsApp links and personalized text' })
  @ApiResponse({ status: 200, description: 'Recipients list returned' })
  getRecipients(@Query() query: QueryRecipientsDto) {
    return this.campaignsService.getRecipients(query);
  }

  @Get('export-csv')
  @ApiOperation({ summary: 'Export recipients to CSV for Jazz/Zong/Telenor Bulk SMS web portal' })
  async exportCsv(@Query() query: QueryRecipientsDto, @Res() res: Response) {
    const csvData = await this.campaignsService.exportCsv(query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="farmers_broadcast_list.csv"');
    // Prepend UTF-8 BOM so Excel opens Urdu text correctly
    res.send('\uFEFF' + csvData);
  }

  @Get()
  @ApiOperation({ summary: 'List all past broadcast campaigns' })
  @ApiResponse({ status: 200, description: 'Campaigns returned' })
  listCampaigns() {
    return this.campaignsService.listCampaigns();
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Save and record a new broadcast campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  createCampaign(@Body() dto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(dto);
  }
}

