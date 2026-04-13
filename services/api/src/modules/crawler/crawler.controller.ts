import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CrawlerService } from './crawler.service';
import {
  AcknowledgeAlertDto,
  CreateCrawlerSourceDto,
  RunMatrixDto,
  UpdateCrawlerSourceDto,
} from './dto/crawler.dto';

class ListSourcesQuery {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean() enabled?: boolean;
  @IsOptional() @IsString() domain?: string;
  @IsOptional() @IsString() channel?: string;
}

class ListRunsQuery {
  @IsOptional() @IsString() sourceId?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}

class ListItemsQuery {
  @IsOptional() @IsString() sourceId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}

class ListAlertsQuery {
  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean() acknowledged?: boolean;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
}

@ApiTags('crawlers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('crawlers')
export class CrawlerController {
  constructor(private readonly service: CrawlerService) {}

  @Get('sources')
  @ApiOperation({ summary: 'Admin: list crawler sources' })
  listSources(@Query() q: ListSourcesQuery) {
    return this.service.listSources({
      enabled: q.enabled,
      domain: q.domain,
      channel: q.channel,
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
  }

  @Get('sources/:id')
  getSource(@Param('id') id: string) {
    return this.service.getSource(id);
  }

  @Post('sources')
  createSource(@CurrentUser('id') userId: string, @Body() dto: CreateCrawlerSourceDto) {
    return this.service.createSource(userId, dto);
  }

  @Patch('sources/:id')
  updateSource(@Param('id') id: string, @Body() dto: UpdateCrawlerSourceDto) {
    return this.service.updateSource(id, dto);
  }

  @Delete('sources/:id')
  deleteSource(@Param('id') id: string) {
    return this.service.deleteSource(id);
  }

  @Post('sources/:id/run')
  @ApiOperation({ summary: 'Admin: manually trigger a crawler run' })
  runSource(@Param('id') id: string) {
    return this.service.runSource(id, 'MANUAL');
  }

  @Post('matrix/run')
  @ApiOperation({ summary: 'Admin: run the full 5×6 matrix (optional domain/channel/minPriority filter)' })
  runMatrix(@Body() dto: RunMatrixDto) {
    return this.service.runMatrix({ domain: dto.domain, channel: dto.channel, minPriority: dto.minPriority }, 'MANUAL');
  }

  @Get('health')
  @ApiOperation({ summary: 'Admin: health scan (7-day per-source stats)' })
  health() {
    return this.service.healthScan();
  }

  @Get('coverage')
  @ApiOperation({ summary: 'Admin: latest 5×6 coverage snapshot' })
  coverage() {
    return this.service.getLatestCoverage();
  }

  @Post('coverage/generate')
  @ApiOperation({ summary: 'Admin: regenerate coverage snapshot now' })
  generateCoverage() {
    return this.service.generateCoverageSnapshot();
  }

  @Get('runs')
  listRuns(@Query() q: ListRunsQuery) {
    return this.service.listRuns({ sourceId: q.sourceId, page: q.page ?? 1, limit: q.limit ?? 20 });
  }

  @Get('items')
  listItems(@Query() q: ListItemsQuery) {
    return this.service.listItems({ sourceId: q.sourceId, status: q.status, page: q.page ?? 1, limit: q.limit ?? 20 });
  }

  @Get('alerts')
  listAlerts(@Query() q: ListAlertsQuery) {
    return this.service.listAlerts({ acknowledged: q.acknowledged, page: q.page ?? 1, limit: q.limit ?? 20 });
  }

  @Patch('alerts/:id/ack')
  ackAlert(@Param('id') id: string, @Body() dto: AcknowledgeAlertDto) {
    return this.service.acknowledgeAlert(id, dto.note);
  }
}
