import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class IssueCertificateDto {
  @ApiProperty({ description: '团队ID' })
  @IsString()
  @MaxLength(40)
  teamId: string;

  @ApiProperty({ description: '证书标题' })
  @IsString()
  @MaxLength(120)
  title: string;

  @ApiPropertyOptional({ description: '关联行程ID' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  tripId?: string;

  @ApiPropertyOptional({ description: '关联主题ID' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  themeId?: string;

  @ApiPropertyOptional({ description: 'PDF URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pdfUrl?: string;

  @ApiPropertyOptional({ description: '图片 URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;
}
