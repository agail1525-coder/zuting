import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';

export class ReviewReportDto {
  @ApiProperty({
    description: '审核操作',
    enum: ['approve', 'dismiss'],
    example: 'approve',
  })
  @IsString()
  @IsIn(['approve', 'dismiss'])
  action: string;
}
