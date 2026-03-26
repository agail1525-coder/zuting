import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

@Injectable()
export class UploadService {
  private readonly uploadDir: string;

  constructor(private readonly prisma: PrismaService) {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /** Save an image file locally and track in DB */
  async uploadImage(
    userId: string,
    file: Express.Multer.File,
  ) {
    this.validateFile(file, MAX_IMAGE_SIZE);

    const ext = this.getExtension(file.mimetype);
    const storedName = `${randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, storedName);

    fs.writeFileSync(filePath, file.buffer);

    const upload = await this.prisma.upload.create({
      data: {
        userId,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${storedName}`,
        provider: 'local',
      },
    });

    return {
      id: upload.id,
      url: upload.url,
      filename: upload.filename,
      mimetype: upload.mimetype,
      size: upload.size,
    };
  }

  /** Upload avatar — smaller size limit */
  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ) {
    this.validateFile(file, MAX_AVATAR_SIZE);

    const ext = this.getExtension(file.mimetype);
    const storedName = `avatar_${randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, storedName);

    fs.writeFileSync(filePath, file.buffer);

    const upload = await this.prisma.upload.create({
      data: {
        userId,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/uploads/${storedName}`,
        provider: 'local',
      },
    });

    return {
      id: upload.id,
      url: upload.url,
      filename: upload.filename,
      mimetype: upload.mimetype,
      size: upload.size,
    };
  }

  /** Get upload info by ID */
  async findOne(id: string) {
    const upload = await this.prisma.upload.findUnique({ where: { id } });
    if (!upload) throw new NotFoundException(`Upload ${id} not found`);
    return {
      id: upload.id,
      url: upload.url,
      filename: upload.filename,
      mimetype: upload.mimetype,
      size: upload.size,
      userId: upload.userId,
      provider: upload.provider,
      createdAt: upload.createdAt,
    };
  }

  /** Delete upload — owner or admin */
  async remove(id: string, userId: string, isAdmin: boolean) {
    const upload = await this.prisma.upload.findUnique({ where: { id } });
    if (!upload) throw new NotFoundException(`Upload ${id} not found`);
    if (!isAdmin && upload.userId !== userId) {
      throw new ForbiddenException('You can only delete your own uploads');
    }

    // Remove physical file
    const storedName = upload.url.replace('/uploads/', '');
    const filePath = path.join(this.uploadDir, storedName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return this.prisma.upload.delete({ where: { id } });
  }

  private validateFile(file: Express.Multer.File, maxSize: number) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!ALLOWED_MIMETYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed: ${ALLOWED_MIMETYPES.join(', ')}`,
      );
    }
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File too large: ${file.size} bytes. Max: ${maxSize} bytes`,
      );
    }
  }

  private getExtension(mimetype: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    return map[mimetype] ?? '.bin';
  }
}
