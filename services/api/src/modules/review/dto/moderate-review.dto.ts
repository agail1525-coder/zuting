import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class ModerateReviewDto {
  @ApiProperty({
    description: '审核状态 / Moderation status',
    enum: ['APPROVED', 'REJECTED', 'HIDDEN'],
    example: 'APPROVED',
  })
  @IsString()
  @IsIn(['APPROVED', 'REJECTED', 'HIDDEN'])
  status: string;
}
