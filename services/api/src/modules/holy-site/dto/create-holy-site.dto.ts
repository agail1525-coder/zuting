import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateHolySiteDto {
  @ApiProperty({
    description: 'Chinese name of the holy site. / 圣地中文名称',
    example: '菩提伽耶',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'English name of the holy site. / 圣地英文名称',
    example: 'Bodh Gaya',
  })
  @IsString()
  nameEn: string;

  @ApiProperty({
    description: 'Country where the holy site is located. / 圣地所在国家',
    example: 'India',
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: 'GPS latitude coordinate (WGS84). / GPS纬度坐标',
    example: 24.6961,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'GPS longitude coordinate (WGS84). / GPS经度坐标',
    example: 84.9911,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    description: 'UTC timezone offset in hours (e.g., 5.5 for IST, 8 for CST). / UTC时区偏移（小时）',
    example: 5.5,
  })
  @IsNumber()
  @Min(-12)
  @Max(14)
  utcOffset: number;

  @ApiProperty({
    description: 'Detailed description of the holy site and its spiritual significance. / 圣地详细描述及其精神意义',
    example: 'The place where Siddhartha Gautama attained enlightenment under the Bodhi tree, becoming the Buddha.',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'URL of the holy site cover image. / 圣地封面图片URL',
    example: 'https://images.zuting.org/sites/bodh-gaya.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'URL of ambient sound effect for immersive experience. / 沉浸式体验的环境音效URL',
    example: 'https://audio.zuting.org/sites/bodh-gaya-ambient.mp3',
  })
  @IsOptional()
  @IsString()
  soundEffect?: string;

  @ApiProperty({
    description: 'ID of the associated religion. / 关联宗教ID',
    example: 'clx1abc2d0000ab12cd34ef56',
  })
  @IsString()
  religionId: string;
}
