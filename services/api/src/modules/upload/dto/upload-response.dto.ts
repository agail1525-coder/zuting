import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ description: 'Upload record ID', example: 'upload-cuid-123' })
  id: string;

  @ApiProperty({ description: 'File access URL', example: '/uploads/abc123.jpg' })
  url: string;

  @ApiProperty({ description: 'Original filename', example: 'photo.jpg' })
  filename: string;

  @ApiProperty({ description: 'MIME type', example: 'image/jpeg' })
  mimetype: string;

  @ApiProperty({ description: 'File size in bytes', example: 102400 })
  size: number;
}
