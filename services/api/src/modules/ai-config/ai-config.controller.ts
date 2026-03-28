import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AiConfigService } from './ai-config.service';
import { UpdateAiConfigDto } from './dto/update-ai-config.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('ai-config')
@Controller('ai-config')
export class AiConfigController {
  constructor(private readonly aiConfigService: AiConfigService) {}

  @Roles('ADMIN')
  @Get()
  @ApiOperation({
    summary: '获取所有AI配置 / Get all AI configs',
    description: '管理员获取小鸿AI助手的全部配置项',
  })
  getAll() {
    return this.aiConfigService.getAll();
  }

  @Roles('ADMIN')
  @Put(':key')
  @ApiOperation({
    summary: '更新AI配置 / Update an AI config',
    description: '管理员更新指定的AI配置项',
  })
  @ApiParam({ name: 'key', description: '配置键名', example: 'system_prompt' })
  update(@Param('key') key: string, @Body() dto: UpdateAiConfigDto) {
    return this.aiConfigService.update(key, dto.value);
  }
}
