import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';

const SEAL_SERIES_VALUES = ['CHUYIN', 'ZHONGYIN', 'YINGUOYIN', 'CHENGDAOYIN', 'GUIYUANYIN'];

export class CreateSealDto {
  @ApiProperty({ example: 1, description: '印序号 (唯一ID)' })
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({ example: '发心印' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'CHUYIN', enum: SEAL_SERIES_VALUES })
  @IsString()
  @IsIn(SEAL_SERIES_VALUES)
  series: string;

  @ApiProperty({ example: '发心向道，初入法门' })
  @IsString()
  poem: string;

  @ApiProperty({ example: '发心是修行的起点' })
  @IsString()
  essence: string;

  @ApiProperty({ example: '每日诵经一遍' })
  @IsString()
  practice: string;

  @ApiProperty({ example: '愿度一切众生' })
  @IsString()
  vow: string;

  @ApiPropertyOptional({ example: '#D4A855' })
  @IsOptional()
  @IsString()
  color?: string;
}
