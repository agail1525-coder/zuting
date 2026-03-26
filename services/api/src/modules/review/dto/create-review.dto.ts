import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: '评价目标类型',
    enum: ['TRIP', 'GUIDE', 'SITE'],
    example: 'TRIP',
  })
  @IsString()
  @IsIn(['TRIP', 'GUIDE', 'SITE'])
  targetType: string;

  @ApiProperty({ description: '评价目标ID', example: 'target-cuid-123' })
  @IsString()
  targetId: string;

  @ApiProperty({ description: '评分 1-5', example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: '评价内容', example: '非常棒的朝圣体验！' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: '图片URL列表', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
