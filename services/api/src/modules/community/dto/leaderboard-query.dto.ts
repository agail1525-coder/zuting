import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class LeaderboardQueryDto {
  @ApiPropertyOptional({
    description: 'Leaderboard type / 排行榜类型',
    enum: ['guides', 'reviews', 'trips'],
    default: 'guides',
  })
  @IsOptional()
  @IsIn(['guides', 'reviews', 'trips'])
  type?: 'guides' | 'reviews' | 'trips' = 'guides';

  @ApiPropertyOptional({
    description: 'Time period / 时间周期',
    enum: ['week', 'month', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['week', 'month', 'all'])
  period?: 'week' | 'month' | 'all' = 'all';
}
