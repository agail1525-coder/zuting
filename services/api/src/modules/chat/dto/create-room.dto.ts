import { IsString, IsArray, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Room type: PRIVATE / MERCHANT_INQUIRY / GUIDE_CHAT',
    example: 'PRIVATE',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Participant user IDs (excluding yourself)',
    example: ['clx1abc2d0000ab12cd34ef56'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  participantIds: string[];

  @ApiPropertyOptional({
    description: 'Optional room name',
    example: '关于菩提伽耶行程咨询',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
