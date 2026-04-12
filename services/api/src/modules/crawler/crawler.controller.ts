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
  UpdateCrawlerSourceDto,
} from './dto/crawler.dto';

class ListSourcesQuery {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number;
  @IsOptional() @Transform(({ value }) => value === 'true' || value === true) @IsBoolean() enabled?: boolean;
}

class ListRunsQuery {
  @IsOptional() @IsString() sourceId?: string;
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

  @Get('runs')
  listRuns(@Query() q: ListRunsQuery) {
    return this.service.listRuns({
      sourceId: q.sourceId,
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
  }

  @Get('alerts')
  listAlerts(@Query() q: ListAlertsQuery) {
    return this.service.listAlerts({
      acknowledged: q.acknowledged,
      page: q.page ?? 1,
      limit: q.limit ?? 20,
    });
  }

  @Patch('alerts/:id/ack')
  ackAlert(@Param('id') id: string, @Body() dto: AcknowledgeAlertDto) {
    return this.service.acknowledgeAlert(id, dto.note);
  }
}
