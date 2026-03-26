import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsInt, Min, MaxLength } from 'class-validator';

export class UpdateTripDto {
  @ApiPropertyOptional({
    description: 'Updated trip title. / 更新行程标题',
    example: '丝绸之路佛教圣地朝圣',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated departure date (ISO 8601). / 更新出发日期',
    example: '2026-07-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Updated return date (ISO 8601). / 更新返回日期',
    example: '2026-07-20',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Updated budget in cents. / 更新预算（分）',
    example: 2000000,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalBudget?: number;

  @ApiPropertyOptional({
    description: 'Updated number of travelers. / 更新出行人数',
    example: 4,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  persons?: number;

  @ApiPropertyOptional({
    description: 'Updated contact person name. / 更新联系人姓名',
    example: '李四',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactName?: string;

  @ApiPropertyOptional({
    description: 'Updated contact phone number. / 更新联系电话',
    example: '13900139000',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Updated notes or special requirements. / 更新备注',
    example: '增加导游服务 / Add tour guide service',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
