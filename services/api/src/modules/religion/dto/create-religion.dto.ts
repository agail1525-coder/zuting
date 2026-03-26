import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateReligionDto {
  @ApiProperty({
    description: 'Chinese name of the religion. / 宗教中文名称',
    example: '佛教',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'English name of the religion. / 宗教英文名称',
    example: 'Buddhism',
  })
  @IsString()
  nameEn: string;

  @ApiProperty({
    description: 'URL-friendly unique slug. Used in routing and API queries. / URL友好的唯一标识符，用于路由和API查询',
    example: 'buddhism',
  })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'Unicode symbol or emoji representing this religion. / 代表该宗教的Unicode符号或表情',
    example: '☸',
  })
  @IsOptional()
  @IsString()
  symbol?: string;

  @ApiPropertyOptional({
    description: 'Theme color as hex code for UI display. / 用于UI展示的主题色（十六进制）',
    example: '#FFD700',
    pattern: '^#[0-9A-Fa-f]{6}$',
  })
  @IsOptional()
  @IsString()
  color?: string;
}
