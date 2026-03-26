import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items (数据列表)' })
  data: T[];

  @ApiProperty({ description: 'Total number of items (总数)', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page number (当前页码)', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page (每页数量)', example: 20 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages (总页数)', example: 5 })
  totalPages: number;
}

export class ApiErrorResponseDto {
  @ApiProperty({ description: 'HTTP status code (状态码)', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Error message(s) (错误信息)', example: 'Bad Request' })
  message: string | string[];

  @ApiProperty({ description: 'Timestamp (时间戳)', example: '2026-03-25T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ description: 'Request path (请求路径)', example: '/api/temples' })
  path: string;
}
