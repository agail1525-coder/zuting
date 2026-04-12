import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { CultureLifeService } from './culture-life.service';
import { DialogueDto, LIFE_QUESTION_CODES, LIFE_STAGES } from './dto/dialogue.dto';

@Controller('culture-life')
export class CultureLifeController {
  constructor(private service: CultureLifeService) {}

  @Public()
  @Get('questions')
  listQuestions() {
    return this.service.listQuestions();
  }

  @Public()
  @Get('questions/:code')
  getQuestion(@Param('code') code: string) {
    if (!(LIFE_QUESTION_CODES as readonly string[]).includes(code)) {
      throw new BadRequestException(`Invalid question code: ${code}`);
    }
    return this.service.getQuestionMatrix(code);
  }

  @Public()
  @Get('perspectives/:religionSlug')
  getPerspectives(@Param('religionSlug') slug: string) {
    return this.service.getReligionPerspectives(slug);
  }

  @Public()
  @Get('stages')
  listStages() {
    return this.service.listStages();
  }

  @Public()
  @Get('stages/:stage')
  getStage(@Param('stage') stage: string) {
    if (!(LIFE_STAGES as readonly string[]).includes(stage)) {
      throw new BadRequestException(`Invalid stage: ${stage}`);
    }
    return this.service.getStageMatrix(stage);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('dialogue')
  dialogue(@Body() dto: DialogueDto) {
    return this.service.dialoguePlaceholder(dto.situation, dto.questionCode);
  }
}
