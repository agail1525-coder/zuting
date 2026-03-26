import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({
    description: '目标用户ID列表',
    example: ['user-cuid-001', 'user-cuid-002'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  userIds: string[];

  @ApiProperty({ description: '通知标题', example: '系统公告' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: '通知内容', example: '平台将于今晚22:00进行维护' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '关联链接', example: '/announcements/1' })
  @IsOptional()
  @IsString()
  link?: string;
}
