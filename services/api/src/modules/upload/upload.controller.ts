import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('uploads')
@Controller('uploads')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload image (max 5MB)',
    description:
      '上传图片文件，支持JPEG、PNG、WebP、GIF格式，最大5MB。\n\n' +
      'Upload an image file. Supports JPEG, PNG, WebP, and GIF formats. Maximum file size is 5MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Image file (jpeg/png/webp/gif)' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully / 图片上传成功' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size exceeded / 文件类型无效或超过大小限制' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadService.uploadImage(userId, file);
  }

  @Post('avatar')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Upload avatar (max 2MB)',
    description:
      '上传用户头像，支持JPEG、PNG、WebP、GIF格式，最大2MB。上传后自动更新用户头像。\n\n' +
      'Upload a user avatar. Supports JPEG, PNG, WebP, and GIF formats. Maximum 2MB. Automatically updates the user profile avatar.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Avatar image (jpeg/png/webp/gif)' },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully / 头像上传成功' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size exceeded / 文件类型无效或超过大小限制' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadService.uploadAvatar(userId, file);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get upload info',
    description:
      '获取上传文件的详细信息，包括文件名、大小、MIME类型等。\n\n' +
      'Get detailed information about an uploaded file, including filename, size, MIME type, etc.',
  })
  @ApiParam({ name: 'id', description: 'Upload ID (上传记录ID)' })
  @ApiResponse({ status: 200, description: 'Upload info returned / 上传信息返回成功' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  @ApiResponse({ status: 403, description: 'Forbidden — not owner or admin / 无权查看' })
  @ApiResponse({ status: 404, description: 'Upload not found / 上传记录不存在' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.uploadService.findOne(id, user.id, user.role === 'ADMIN');
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete upload',
    description:
      '删除上传的文件。文件所有者或管理员可以执行此操作。\n\n' +
      'Delete an uploaded file. Can be performed by the file owner or an admin.',
  })
  @ApiParam({ name: 'id', description: 'Upload ID (上传记录ID)' })
  @ApiResponse({ status: 200, description: 'Upload deleted successfully / 上传记录删除成功' })
  @ApiResponse({ status: 401, description: 'Unauthorized — valid JWT required / 未授权' })
  @ApiResponse({ status: 403, description: 'Forbidden — not owner or admin / 无权删除' })
  @ApiResponse({ status: 404, description: 'Upload not found / 上传记录不存在' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.uploadService.remove(id, user.id, user.role === 'ADMIN');
  }
}
