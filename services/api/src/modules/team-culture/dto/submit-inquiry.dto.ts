import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SubmitInquiryDto {
  @ApiPropertyOptional({ description: '主题包 slug 或 ID' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  themeId?: string;

  @ApiProperty({ description: '联系人姓名' })
  @IsString()
  @MaxLength(50)
  contactName: string;

  @ApiPropertyOptional({ description: '联系人职务' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactRole?: string;

  @ApiProperty({ description: '联系电话', example: '13800138000' })
  @IsString()
  @Matches(/^\+?\d{6,20}$/, { message: 'phone format invalid' })
  phone: string;

  @ApiPropertyOptional({ description: '联系邮箱' })
  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @ApiProperty({ description: '组织名称' })
  @IsString()
  @MaxLength(120)
  orgName: string;

  @ApiProperty({ description: '团队人数', example: 30 })
  @IsInt()
  @Min(1)
  @Max(10000)
  headcount: number;

  @ApiPropertyOptional({ description: '预算 (分)', example: 5000000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000_000)
  budget?: number;

  @ApiPropertyOptional({ description: '期望出行日期 ISO8601' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  preferredAt?: string;

  @ApiPropertyOptional({ description: '留言备注' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional({ description: '渠道 / utm' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;
}
