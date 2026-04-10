import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SubmitApplicationDto {
  @ApiProperty({ description: '申请动机', minLength: 10, maxLength: 1000 })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  motivation!: string;

  @ApiPropertyOptional({ description: '主修意向 (12文化代号)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tradition?: string;

  @ApiPropertyOptional({ description: '修行经验', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  experience?: string;

  @ApiPropertyOptional({ description: '邀请码 (如有)' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  inviteCode?: string;
}

export class GenerateInviteDto {
  @ApiProperty({ description: '生成数量 1-5', minimum: 1, maximum: 5 })
  count!: number;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

export class RedeemInviteDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  code!: string;
}

export class GrantAccessDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiProperty({ enum: ['SEEKER', 'PRACTITIONER', 'MENTOR', 'MASTER'] })
  @IsString()
  role!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class RevokeAccessDto {
  @ApiProperty()
  @IsString()
  userId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ReviewApplicationDto {
  @ApiPropertyOptional({ enum: ['PRACTITIONER', 'MENTOR'] })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class RejectApplicationDto {
  @ApiProperty({ maxLength: 500 })
  @IsString()
  @MaxLength(500)
  reason!: string;
}
