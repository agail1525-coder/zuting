import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefundOrderDto {
  @ApiPropertyOptional({
    description: 'Reason for refund request. / 退款原因',
    maxLength: 500,
    example: '行程变更，无法出行 / Trip changed, unable to travel',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
