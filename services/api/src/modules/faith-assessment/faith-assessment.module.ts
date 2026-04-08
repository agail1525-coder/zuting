import { Module } from '@nestjs/common';
import { FaithAssessmentController } from './faith-assessment.controller';
import { FaithAssessmentService } from './faith-assessment.service';

@Module({
  controllers: [FaithAssessmentController],
  providers: [FaithAssessmentService],
  exports: [FaithAssessmentService],
})
export class FaithAssessmentModule {}
