import { IsOptional, IsIn, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const VALID_ROLES = ['PILGRIM', 'GUIDE', 'AMBASSADOR', 'ADMIN'] as const;

export class AdminUpdateUserDto {
  @ApiPropertyOptional({
    enum: VALID_ROLES,
    description: 'User role / 用户角色',
  })
  @IsOptional()
  @IsIn([...VALID_ROLES])
  role?: string;

  @ApiPropertyOptional({ description: 'Whether user is active / 是否激活' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
