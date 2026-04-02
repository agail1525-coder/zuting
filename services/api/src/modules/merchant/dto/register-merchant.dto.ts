import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsIn,
  IsEmail,
  MaxLength,
} from 'class-validator';

export class RegisterMerchantDto {
  @ApiProperty({
    description: '商家类型',
    enum: ['RESTAURANT', 'HOTEL', 'GUIDE', 'TRANSPORT', 'TEMPLE_SERVICE', 'SHOPPING', 'PHOTOGRAPHY', 'WELLNESS', 'CULTURAL_EXPERIENCE'],
    example: 'RESTAURANT',
  })
  @IsIn(['RESTAURANT', 'HOTEL', 'GUIDE', 'TRANSPORT', 'TEMPLE_SERVICE', 'SHOPPING', 'PHOTOGRAPHY', 'WELLNESS', 'CULTURAL_EXPERIENCE'])
  type: string;

  @ApiProperty({ description: '商家名称', example: '少林寺文旅服务中心' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '商家简介' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ description: '营业执照/资质证书URL' })
  @IsOptional()
  @IsString()
  license?: string;

  @ApiPropertyOptional({ description: '联系电话', example: '13800138000' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: '联系邮箱', example: 'contact@temple.com' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: '详细地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '省份', example: '河南省' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: '城市', example: '郑州市' })
  @IsOptional()
  @IsString()
  city?: string;
}
