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
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuestionService } from './question.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionQueryDto } from './dto/question-query.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';

@ApiTags('questions')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'List questions with filters and pagination',
    description:
      '获取问题列表，支持按标签、状态、排序方式筛选。\n\n' +
      'Retrieve questions with optional tag/status filtering and sorting (latest/hot/unanswered).',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated questions list. / 分页问题列表。',
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { type: 'object' } },
        total: { type: 'number', example: 42 },
        page: { type: 'number', example: 1 },
        pageSize: { type: 'number', example: 20 },
      },
    },
  })
  findAll(@Query() query: QuestionQueryDto) {
    return this.questionService.findAll(query);
  }

  @Post()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Ask a new question',
    description:
      '发布一个新问题，可关联宗教实体（圣地/祖庭等）并添加标签。\n\n' +
      'Post a new question. Optionally link to a religious entity (holy site, temple, etc.) and add tags.',
  })
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 201, description: 'Question created successfully. / 问题创建成功。' })
  @ApiResponse({ status: 400, description: 'Validation failed. / 数据校验失败。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  create(@Body() dto: CreateQuestionDto, @CurrentUser('id') userId: string) {
    return this.questionService.create(userId, dto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Get question detail with answers',
    description:
      '获取问题详情及所有回答，同时增加浏览次数。回答按"已采纳→高票→最早"排序。\n\n' +
      'Retrieve question detail with all answers. Increments view count. Answers ordered by accepted → voteCount → createdAt.',
  })
  @ApiParam({
    name: 'id',
    description: 'Question ID (CUID). / 问题ID',
    example: 'clx5abc0001ab12cd34ef56',
  })
  @ApiResponse({ status: 200, description: 'Question detail returned. / 问题详情返回成功。' })
  @ApiResponse({ status: 404, description: 'Question not found. / 问题不存在。' })
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Edit own question',
    description:
      '编辑自己的问题（仅问题作者可操作）。可更新标题、内容、标签。\n\n' +
      'Edit your own question. Only the question author can perform this action. Title, content, and tags can be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Question ID (CUID). / 问题ID',
    example: 'clx5abc0001ab12cd34ef56',
  })
  @ApiBody({ type: UpdateQuestionDto })
  @ApiResponse({ status: 200, description: 'Question updated successfully. / 问题更新成功。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the question author. / 权限不足——非问题作者。' })
  @ApiResponse({ status: 404, description: 'Question not found. / 问题不存在。' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionService.update(id, userId, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Delete own question (or admin)',
    description:
      '删除自己的问题（仅问题作者或管理员可操作）。同时删除该问题下的所有回答。\n\n' +
      'Delete your own question, or any question if you are an admin. All answers under the question will also be deleted.',
  })
  @ApiParam({
    name: 'id',
    description: 'Question ID (CUID). / 问题ID',
    example: 'clx5abc0001ab12cd34ef56',
  })
  @ApiResponse({ status: 200, description: 'Question deleted successfully. / 问题删除成功。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the question author or admin. / 权限不足。' })
  @ApiResponse({ status: 404, description: 'Question not found. / 问题不存在。' })
  remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.questionService.remove(id, userId, userRole);
  }

  @Post(':id/answers')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Answer a question',
    description:
      '为指定问题提交一个回答，同时更新问题的回答数和状态。\n\n' +
      'Submit an answer to a question. Updates answerCount and sets question status to ANSWERED on first answer.',
  })
  @ApiParam({
    name: 'id',
    description: 'Question ID. / 问题ID',
    example: 'clx5abc0001ab12cd34ef56',
  })
  @ApiBody({ type: CreateAnswerDto })
  @ApiResponse({ status: 201, description: 'Answer created successfully. / 回答创建成功。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Question not found. / 问题不存在。' })
  addAnswer(
    @Param('id') questionId: string,
    @Body() dto: CreateAnswerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionService.addAnswer(questionId, userId, dto);
  }

  @Post(':id/answers/:answerId/accept')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Accept an answer as the best answer',
    description:
      '采纳某回答为最佳答案（仅问题作者可操作）。若之前有采纳的答案，将自动取消采纳。\n\n' +
      'Mark an answer as the best/accepted answer. Only the question author can do this. Automatically unaccepts any previously accepted answer.',
  })
  @ApiParam({ name: 'id', description: 'Question ID. / 问题ID' })
  @ApiParam({ name: 'answerId', description: 'Answer ID to accept. / 要采纳的回答ID' })
  @ApiResponse({ status: 200, description: 'Answer accepted. / 回答已采纳。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 403, description: 'Forbidden — not the question author. / 权限不足——非问题作者。' })
  @ApiResponse({ status: 404, description: 'Question or answer not found. / 问题或回答不存在。' })
  acceptAnswer(
    @Param('id') questionId: string,
    @Param('answerId') answerId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionService.acceptAnswer(questionId, answerId, userId);
  }

  @Post(':id/answers/:answerId/vote')
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: 'Upvote an answer',
    description:
      '为回答点赞。MVP阶段每次调用均+1，后续版本将加入重复防护机制。\n\n' +
      'Upvote an answer. MVP: each call increments by 1. Duplicate prevention will be added in a future iteration.',
  })
  @ApiParam({ name: 'id', description: 'Question ID. / 问题ID' })
  @ApiParam({ name: 'answerId', description: 'Answer ID to vote. / 要点赞的回答ID' })
  @ApiResponse({ status: 200, description: 'Vote recorded. / 点赞成功。' })
  @ApiResponse({ status: 401, description: 'Unauthorized. / 未授权。' })
  @ApiResponse({ status: 404, description: 'Answer not found. / 回答不存在。' })
  voteAnswer(
    @Param('answerId') answerId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.questionService.voteAnswer(answerId, userId);
  }
}
