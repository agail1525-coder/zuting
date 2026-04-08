import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const TEAM_ORG_TYPES = [
  'ENTERPRISE',
  'EXECUTIVE',
  'FAMILY_OFFICE',
  'SCHOOL',
  'RELIGIOUS',
  'NGO',
  'FAMILY',
  'GOVERNMENT',
  'OTHER',
] as const;

export class CreateTeamDto {
  @ApiProperty({ description: '团队名称' })
  @IsString()
  @MaxLength(80)
  name: string;

  @ApiProperty({ description: '组织类型', enum: TEAM_ORG_TYPES })
  @IsIn(TEAM_ORG_TYPES as unknown as string[])
  orgType: string;

  @ApiPropertyOptional({ description: '行业' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  industry?: string;

  @ApiPropertyOptional({ description: '团队规模', example: 50 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  size?: number;

  @ApiPropertyOptional({ description: '团队简介' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'LogoURL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ description: '封面 URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverUrl?: string;

  @ApiPropertyOptional({ description: '城市' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  city?: string;

  @ApiPropertyOptional({ description: '国家' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  country?: string;
}
