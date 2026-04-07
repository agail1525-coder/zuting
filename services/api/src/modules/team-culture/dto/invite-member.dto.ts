import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class InviteMemberDto {
  @ApiPropertyOptional({ description: '角色', enum: ['ADMIN', 'MEMBER', 'GUEST'] })
  @IsOptional()
  @IsIn(['ADMIN', 'MEMBER', 'GUEST'])
  role?: string;
}
