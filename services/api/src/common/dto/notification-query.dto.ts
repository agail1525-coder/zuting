import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class NotificationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Show only unread notifications / 仅显示未读通知' })
  @IsOptional()
  @IsString()
  unreadOnly?: string;
}
