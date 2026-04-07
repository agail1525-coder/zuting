import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination.dto';

export class OrderQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by trip ID / 按行程ID筛选' })
  @IsOptional()
  @IsString()
  tripId?: string;

  @ApiPropertyOptional({
    description: 'Filter by order status / 按订单状态筛选',
    enum: ['PENDING', 'PAID', 'CANCELLED', 'REFUNDING', 'REFUNDED'],
  })
  @IsOptional()
  @IsString()
  status?: string;
}

export class OrderAdminQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by order status / 按订单状态筛选',
    enum: ['PENDING', 'PAID', 'CANCELLED', 'REFUNDING', 'REFUNDED'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Search by order number, user name, or trip title / 按订单号、用户名或行程标题搜索' })
  @IsOptional()
  @IsString()
  search?: string;
}
