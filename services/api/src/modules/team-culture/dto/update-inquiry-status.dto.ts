import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const TEAM_INQUIRY_STATUSES = [
  'NEW',
  'CONTACTED',
  'QUOTED',
  'SIGNED',
  'DELIVERED',
  'CLOSED',
  'LOST',
] as const;

export class UpdateInquiryStatusDto {
  @ApiProperty({ description: '目标状态', enum: TEAM_INQUIRY_STATUSES })
  @IsIn(TEAM_INQUIRY_STATUSES as unknown as string[])
  toStatus: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;
}
