import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ExchangeDto {
  @ApiProperty({ description: '商品ID', example: 'clxxxxxxx' })
  @IsString()
  productId: string;
}
