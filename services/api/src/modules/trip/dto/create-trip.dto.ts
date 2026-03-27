import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateTripDto {
  @ApiProperty({
    description: 'Trip title / name for display. / 行程标题/显示名称',
    example: '佛教四大圣地朝圣之旅',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Planned departure date (ISO 8601 date format). / 计划出发日期（ISO 8601格式）',
    example: '2026-06-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Planned return date (ISO 8601 date format). / 计划返回日期（ISO 8601格式）',
    example: '2026-06-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Total trip budget in cents (e.g., 1500000 = 15,000.00 CNY). / 行程总预算，单位：分（例如 1500000 = 15000.00元）',
    example: 1500000,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalBudget?: number;

  @ApiPropertyOptional({
    description: 'Number of travelers in the group. / 出行人数',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  persons?: number;

  @ApiPropertyOptional({
    description: 'Primary contact person name. / 联系人姓名',
    example: '张三',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactName?: string;

  @ApiPropertyOptional({
    description: 'Contact phone number. / 联系电话',
    example: '13800138000',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Additional notes or special requirements. / 额外备注或特殊要求',
    example: '需要素食餐安排 / Vegetarian meals required',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
