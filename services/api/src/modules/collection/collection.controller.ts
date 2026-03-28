import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CollectionService } from './collection.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { AddCollectionItemDto } from './dto/add-collection-item.dto';
import { QuickSaveDto } from './dto/quick-save.dto';
import { CheckSavedQueryDto } from './dto/check-saved-query.dto';

@ApiTags('collections')
@Controller('collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  // ──────────────── Static routes FIRST (before :id) ────────────────

  @Get('check')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Check if an entity is saved in any user collection',
    description:
      '检查某个实体是否已被当前用户收藏（在任意收藏夹中）。\n\n' +
      'Check whether a specific entity is saved in any of the current user\'s collections.',
  })
  @ApiQuery({ name: 'entityType', required: true, description: 'Entity type: HOLY_SITE | TEMPLE | PATRIARCH | TRIP', example: 'HOLY_SITE' })
  @ApiQuery({ name: 'entityId', required: true, description: 'Entity ID. / 实体ID', example: 'clx2xyz9f0001ab12cd34ef56' })
  @ApiResponse({
    status: 200,
    description: 'Check result returned. / 返回是否已收藏。',
    schema: {
      type: 'object',
      properties: {
        isSaved: { type: 'boolean', example: true },
        item: {
          nullable: true,
          type: 'object',
          properties: {
            id: { type: 'string' },
            collectionId: { type: 'string' },
            entityType: { type: 'string' },
            entityId: { type: 'string' },
            collection: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  checkSaved(
    @Query() query: CheckSavedQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionService.checkSaved(userId, query.entityType, query.entityId);
  }

  @Post('quick-save')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Quick save an entity to the default collection',
    description:
      '一键收藏：将实体快速保存到"默认收藏夹"，若不存在则自动创建。若已收藏则返回现有记录。\n\n' +
      'Quick-save an entity to the default collection. Creates default collection if it doesn\'t exist. Returns existing if already saved.',
  })
  @ApiBody({ type: QuickSaveDto })
  @ApiResponse({
    status: 201,
    description: 'Entity quick-saved to default collection. / 已一键收藏到默认收藏夹。',
    schema: {
      type: 'object',
      properties: {
        item: { type: 'object' },
        collection: { type: 'object' },
        alreadySaved: { type: 'boolean', example: false },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  quickSave(
    @Body() dto: QuickSaveDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionService.quickSave(userId, dto.entityType, dto.entityId);
  }

  @Public()
  @Get('shared/:shareToken')
  @ApiOperation({
    summary: 'View a publicly shared collection by share token',
    description:
      '通过分享Token查看公开的收藏夹，无需登录。\n\n' +
      'View a publicly shared collection using the share token. No authentication required.',
  })
  @ApiParam({ name: 'shareToken', description: 'Share token (hex string). / 分享Token', example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4' })
  @ApiResponse({ status: 200, description: 'Shared collection returned. / 返回共享收藏夹。' })
  @ApiResponse({ status: 404, description: 'Shared collection not found or not public. / 共享收藏夹不存在或已取消公开。' })
  findByShareToken(@Param('shareToken') shareToken: string) {
    return this.collectionService.findByShareToken(shareToken);
  }

  // ──────────────── Collection CRUD ────────────────

  @Get()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: "List the current user's collections",
    description:
      '获取当前用户的所有收藏夹，包含每个收藏夹的收藏数量和最近收藏的4条预览。\n\n' +
      "Retrieve all of the current user's collections with item counts and a preview of the 4 most recent items.",
  })
  @ApiResponse({
    status: 200,
    description: "User's collections returned. / 返回用户收藏夹列表。",
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: '我的佛教圣地收藏' },
          description: { type: 'string', nullable: true },
          coverImage: { type: 'string', nullable: true },
          isPublic: { type: 'boolean' },
          shareToken: { type: 'string', nullable: true },
          itemCount: { type: 'number', example: 12 },
          items: { type: 'array', items: { type: 'object' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  findAll(@CurrentUser('id') userId: string) {
    return this.collectionService.findAll(userId);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Create a new collection',
    description:
      '创建一个新的收藏夹，可设置名称、描述、封面图和是否公开。\n\n' +
      'Create a new collection with name, description, cover image, and public visibility.',
  })
  @ApiBody({ type: CreateCollectionDto })
  @ApiResponse({ status: 201, description: 'Collection created successfully. / 收藏夹创建成功。' })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  create(
    @Body() dto: CreateCollectionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionService.create(userId, dto);
  }

  @Get(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Get collection detail with all items',
    description:
      '获取收藏夹详情，包含所有收藏项（最多100条）。私密收藏夹仅本人可访问。\n\n' +
      'Get collection details including all items (up to 100). Private collections are only accessible by the owner.',
  })
  @ApiParam({ name: 'id', description: 'Collection ID (CUID). / 收藏夹ID', example: 'clx5col0001ab12cd34ef56' })
  @ApiResponse({ status: 200, description: 'Collection detail returned. / 返回收藏夹详情。' })
  @ApiResponse({ status: 403, description: 'Forbidden — private collection of another user. / 权限不足——他人私密收藏夹。' })
  @ApiResponse({ status: 404, description: 'Collection not found. / 收藏夹不存在。' })
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Update a collection',
    description:
      '更新收藏夹信息（名称/描述/封面图/公开状态）。仅收藏夹所有者可操作。\n\n' +
      'Update collection details. Only the collection owner can update.',
  })
  @ApiParam({ name: 'id', description: 'Collection ID (CUID). / 收藏夹ID', example: 'clx5col0001ab12cd34ef56' })
  @ApiBody({ type: UpdateCollectionDto })
  @ApiResponse({ status: 200, description: 'Collection updated successfully. / 收藏夹更新成功。' })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the owner. / 权限不足——非收藏夹所有者。' })
  @ApiResponse({ status: 404, description: 'Collection not found. / 收藏夹不存在。' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete a collection',
    description:
      '删除收藏夹及其所有收藏项。不可逆操作。不允许删除"默认收藏夹"。\n\n' +
      'Delete a collection and all its items. Irreversible. The default collection cannot be deleted.',
  })
  @ApiParam({ name: 'id', description: 'Collection ID (CUID). / 收藏夹ID', example: 'clx5col0001ab12cd34ef56' })
  @ApiResponse({ status: 200, description: 'Collection deleted successfully. / 收藏夹删除成功。' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the owner or default collection. / 权限不足或为默认收藏夹。' })
  @ApiResponse({ status: 404, description: 'Collection not found. / 收藏夹不存在。' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionService.remove(id, userId);
  }

  // ──────────────── Collection Items ────────────────

  @Post(':id/items')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Add an item to a collection',
    description:
      '向指定收藏夹添加一条收藏项。同一收藏夹内同一实体不允许重复添加（返回409）。\n\n' +
      'Add an item to a specific collection. Duplicate items within the same collection return 409.',
  })
  @ApiParam({ name: 'id', description: 'Collection ID (CUID). / 收藏夹ID', example: 'clx5col0001ab12cd34ef56' })
  @ApiBody({ type: AddCollectionItemDto })
  @ApiResponse({ status: 201, description: 'Item added to collection. / 收藏项添加成功。' })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the owner. / 权限不足——非收藏夹所有者。' })
  @ApiResponse({ status: 404, description: 'Collection not found. / 收藏夹不存在。' })
  @ApiResponse({ status: 409, description: 'Conflict — item already in collection. / 该实体已在收藏夹中。' })
  addItem(
    @Param('id') collectionId: string,
    @Body() dto: AddCollectionItemDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionService.addItem(collectionId, userId, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Remove an item from a collection',
    description:
      '从收藏夹中删除指定收藏项。仅收藏夹所有者可操作。\n\n' +
      'Remove a specific item from a collection. Only the collection owner can remove items.',
  })
  @ApiParam({ name: 'id', description: 'Collection ID (CUID). / 收藏夹ID', example: 'clx5col0001ab12cd34ef56' })
  @ApiParam({ name: 'itemId', description: 'Collection item ID (CUID). / 收藏项ID', example: 'clx5item001ab12cd34ef56' })
  @ApiResponse({ status: 200, description: 'Item removed from collection. / 收藏项删除成功。' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the owner. / 权限不足——非收藏夹所有者。' })
  @ApiResponse({ status: 404, description: 'Item or collection not found. / 收藏项或收藏夹不存在。' })
  removeItem(
    @Param('id') collectionId: string,
    @Param('itemId') itemId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionService.removeItem(collectionId, itemId, userId);
  }

  @Post(':id/share')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Generate a share token for a collection',
    description:
      '为收藏夹生成分享Token，并自动设为公开。生成的链接可分享给任何人。\n\n' +
      'Generate a share token for a collection and set it as public. The resulting link can be shared with anyone.',
  })
  @ApiParam({ name: 'id', description: 'Collection ID (CUID). / 收藏夹ID', example: 'clx5col0001ab12cd34ef56' })
  @ApiResponse({
    status: 201,
    description: 'Share token generated. Collection is now public. / 分享Token已生成，收藏夹已设为公开。',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        shareToken: { type: 'string', example: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4' },
        isPublic: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden — not the owner. / 权限不足——非收藏夹所有者。' })
  @ApiResponse({ status: 404, description: 'Collection not found. / 收藏夹不存在。' })
  generateShareToken(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.collectionService.generateShareToken(id, userId);
  }
}
