import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { CollectionEntityType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AddCollectionItemDto } from './dto/add-collection-item.dto';

@Injectable()
export class CollectionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const collections = await this.prisma.collection.findMany({
      where: { userId },
      include: {
        _count: { select: { items: true } },
        items: {
          take: 4,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return collections.map(({ _count, ...rest }) => ({
      ...rest,
      itemCount: _count.items,
    }));
  }

  async create(userId: string, dto: CreateCollectionDto) {
    return this.prisma.collection.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        coverImage: dto.coverImage,
        isPublic: dto.isPublic ?? false,
      },
    });
  }

  async findOne(id: string, userId?: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        _count: { select: { items: true } },
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection ${id} not found`);
    }

    // Non-public collections require ownership
    if (!collection.isPublic && collection.userId !== userId) {
      throw new ForbiddenException('You do not have access to this collection');
    }

    const { _count: countFindOne, ...collectionRest } = collection;
    return { ...collectionRest, itemCount: countFindOne.items };
  }

  async update(id: string, userId: string, dto: UpdateCollectionDto) {
    const collection = await this.prisma.collection.findUnique({ where: { id } });
    if (!collection) throw new NotFoundException(`Collection ${id} not found`);
    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only update your own collections');
    }

    return this.prisma.collection.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({ where: { id } });
    if (!collection) throw new NotFoundException(`Collection ${id} not found`);
    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only delete your own collections');
    }
    if (collection.name === '默认收藏夹') {
      throw new ForbiddenException('Cannot delete the default collection');
    }

    return this.prisma.collection.delete({ where: { id } });
  }

  async addItem(collectionId: string, userId: string, dto: AddCollectionItemDto) {
    const collection = await this.prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException(`Collection ${collectionId} not found`);
    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only add items to your own collections');
    }

    const entityType = dto.entityType as CollectionEntityType;

    // Check for existing item (unique constraint)
    const existing = await this.prisma.collectionItem.findUnique({
      where: {
        collectionId_entityType_entityId: {
          collectionId,
          entityType,
          entityId: dto.entityId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('This item is already in the collection');
    }

    const item = await this.prisma.collectionItem.create({
      data: {
        collectionId,
        entityType,
        entityId: dto.entityId,
        note: dto.note,
      },
    });

    // Touch updatedAt on parent collection
    await this.prisma.collection.update({
      where: { id: collectionId },
      data: { updatedAt: new Date() },
    });

    return item;
  }

  async removeItem(collectionId: string, itemId: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new NotFoundException(`Collection ${collectionId} not found`);
    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only remove items from your own collections');
    }

    const item = await this.prisma.collectionItem.findUnique({ where: { id: itemId } });
    if (!item || item.collectionId !== collectionId) {
      throw new NotFoundException(`Item ${itemId} not found in collection ${collectionId}`);
    }

    return this.prisma.collectionItem.delete({ where: { id: itemId } });
  }

  async quickSave(userId: string, entityType: string, entityId: string) {
    // Get or create default collection
    let defaultCollection = await this.prisma.collection.findFirst({
      where: { userId, name: '默认收藏夹' },
    });

    if (!defaultCollection) {
      defaultCollection = await this.prisma.collection.create({
        data: { userId, name: '默认收藏夹' },
      });
    }

    const entityTypeEnum = entityType as CollectionEntityType;

    // Upsert: if already exists, return existing; otherwise create
    const existing = await this.prisma.collectionItem.findUnique({
      where: {
        collectionId_entityType_entityId: {
          collectionId: defaultCollection.id,
          entityType: entityTypeEnum,
          entityId,
        },
      },
    });

    if (existing) {
      return { item: existing, collection: defaultCollection, alreadySaved: true };
    }

    const item = await this.prisma.collectionItem.create({
      data: {
        collectionId: defaultCollection.id,
        entityType: entityTypeEnum,
        entityId,
      },
    });

    await this.prisma.collection.update({
      where: { id: defaultCollection.id },
      data: { updatedAt: new Date() },
    });

    return { item, collection: defaultCollection, alreadySaved: false };
  }

  async checkSaved(userId: string, entityType: string, entityId: string) {
    const entityTypeEnum = entityType as CollectionEntityType;

    const item = await this.prisma.collectionItem.findFirst({
      where: {
        entityType: entityTypeEnum,
        entityId,
        collection: { userId },
      },
      include: {
        collection: { select: { id: true, name: true } },
      },
    });

    return {
      isSaved: !!item,
      item: item ?? null,
    };
  }

  async generateShareToken(id: string, userId: string) {
    const collection = await this.prisma.collection.findUnique({ where: { id } });
    if (!collection) throw new NotFoundException(`Collection ${id} not found`);
    if (collection.userId !== userId) {
      throw new ForbiddenException('You can only share your own collections');
    }

    const shareToken = crypto.randomBytes(16).toString('hex');

    return this.prisma.collection.update({
      where: { id },
      data: { shareToken, isPublic: true },
    });
  }

  async findByShareToken(token: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { shareToken: token },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        _count: { select: { items: true } },
      },
    });

    if (!collection || !collection.isPublic) {
      throw new NotFoundException('Shared collection not found or no longer public');
    }

    const { _count: countByToken, ...collectionByToken } = collection;
    return { ...collectionByToken, itemCount: countByToken.items };
  }
}
