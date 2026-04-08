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

export class SubmitPersonalInquiryDto {
  @ApiPropertyOptional({ description: '主题包 slug 或 ID' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  themeId?: string;

  @ApiProperty({ description: '姓名' })
  @IsString()
  @MaxLength(50)
  contactName: string;

  @ApiPropertyOptional({ description: '当前职务/角色', example: 'CEO / 创始人' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
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

  @ApiPropertyOptional({ description: '公司/组织名称' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  orgName?: string;

  @ApiPropertyOptional({ description: '参与人数 (个人默认1)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  headcount?: number;

  @ApiPropertyOptional({ description: '预算 (分)' })
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

  @ApiPropertyOptional({ description: '最大挑战/留言' })
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
