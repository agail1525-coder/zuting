import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CommandDto,
  ContentGenDto,
  InsightDto,
  ModerateDto,
  PromptLabRunDto,
  SeoDto,
  SupportedLang,
  TranslateDto,
} from './dto/admin-ai.dto';

interface TraceInput {
  scenario: string;
  model: string;
  prompt: string;
  output?: string;
  adminId: string;
  resource?: string;
  resourceId?: string;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
}

@Injectable()
export class AdminAiService {
  constructor(private readonly prisma: PrismaService) {}

  private async trace(input: TraceInput) {
    return this.prisma.aiOperationTrace.create({
      data: {
        scenario: input.scenario,
        model: input.model,
        prompt: input.prompt,
        output: input.output,
        adminId: input.adminId,
        resource: input.resource,
        resourceId: input.resourceId,
        latencyMs: input.latencyMs,
        tokensIn: input.tokensIn,
        tokensOut: input.tokensOut,
        approved: false,
      },
    });
  }

  // NOTE: AI 调用走小鸿网关占位。生产接入在 W5 统一 ai-gateway provider 注入。
  private async callModel(model: string, prompt: string): Promise<{ output: string; latencyMs: number; tokensIn: number; tokensOut: number }> {
    const start = Date.now();
    // Placeholder: echo + length. 实际调用 Qwen/Claude 由 W5 AI Gateway 模块接入。
    const output = `[AI:${model}] ${prompt.slice(0, 500)}`;
    return {
      output,
      latencyMs: Date.now() - start,
      tokensIn: prompt.length,
      tokensOut: output.length,
    };
  }

  async translate(dto: TranslateDto, adminId: string) {
    const results: Record<string, string> = {};
    const traces: string[] = [];
    for (const lang of dto.targetLangs) {
      const prompt = `Translate the following text to ${lang}:\n${dto.text}`;
      const r = await this.callModel('qwen3.5-35b', prompt);
      results[lang] = r.output;
      const t = await this.trace({
        scenario: 'TRANSLATE',
        model: 'qwen3.5-35b',
        prompt,
        output: r.output,
        adminId,
        latencyMs: r.latencyMs,
        tokensIn: r.tokensIn,
        tokensOut: r.tokensOut,
      });
      traces.push(t.id);
    }
    return { results, traceIds: traces };
  }

  async contentGenerate(dto: ContentGenDto, adminId: string) {
    const prompt = `Generate ${dto.fieldName} for ${dto.resource}${dto.context ? `\nContext: ${dto.context}` : ''}${dto.style ? `\nStyle: ${dto.style}` : ''}${dto.language ? `\nLanguage: ${dto.language}` : ''}`;
    const r = await this.callModel('qwen3.5-35b', prompt);
    const t = await this.trace({ scenario: 'CONTENT_GEN', model: 'qwen3.5-35b', prompt, output: r.output, adminId, resource: dto.resource });
    return { output: r.output, traceId: t.id };
  }

  async seo(dto: SeoDto, adminId: string) {
    const prompt = `Generate SEO meta (title/description/keywords) for ${dto.resource}:${dto.id} in ${dto.language ?? 'zh'}`;
    const r = await this.callModel('claude-haiku-4-5', prompt);
    const t = await this.trace({ scenario: 'SEO', model: 'claude-haiku-4-5', prompt, output: r.output, adminId, resource: dto.resource, resourceId: dto.id });
    return { output: r.output, traceId: t.id };
  }

  async moderate(dto: ModerateDto, adminId: string) {
    const prompt = `Moderate content. Text: ${dto.text ?? '(none)'} Image: ${dto.imageUrl ?? '(none)'}`;
    const r = await this.callModel('moderator-v1', prompt);
    const t = await this.trace({ scenario: 'MODERATE', model: 'moderator-v1', prompt, output: r.output, adminId });
    return { label: 'SAFE', score: 0.95, output: r.output, traceId: t.id };
  }

  async insight(dto: InsightDto, adminId: string) {
    const prompt = `Business insight question: ${dto.question}`;
    const r = await this.callModel('claude-opus-4-6', prompt);
    const t = await this.trace({ scenario: 'INSIGHT', model: 'claude-opus-4-6', prompt, output: r.output, adminId });
    return { answer: r.output, traceId: t.id };
  }

  async command(dto: CommandDto, adminId: string) {
    const prompt = `Parse admin command: ${dto.utterance}`;
    const r = await this.callModel('claude-haiku-4-5', prompt);
    const t = await this.trace({ scenario: 'COMMAND', model: 'claude-haiku-4-5', prompt, output: r.output, adminId });
    return {
      parsed: { action: 'unknown', confirmed: false },
      output: r.output,
      traceId: t.id,
      requiresConfirmation: true,
    };
  }

  async promptLabRun(dto: PromptLabRunDto, adminId: string) {
    const r = await this.callModel(dto.model, dto.prompt);
    const t = await this.trace({
      scenario: 'PROMPT_LAB',
      model: dto.model,
      prompt: dto.prompt,
      output: r.output,
      adminId,
      latencyMs: r.latencyMs,
      tokensIn: r.tokensIn,
      tokensOut: r.tokensOut,
    });
    return { ...r, traceId: t.id };
  }

  async listTraces(params: { scenario?: string; adminId?: string; page?: number; pageSize?: number }) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
    const where = {
      ...(params.scenario ? { scenario: params.scenario } : {}),
      ...(params.adminId ? { adminId: params.adminId } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.aiOperationTrace.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.aiOperationTrace.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async approve(id: string, adminId: string) {
    const t = await this.prisma.aiOperationTrace.findUnique({ where: { id } });
    if (!t) throw new NotFoundException(`Trace ${id} not found`);
    return this.prisma.aiOperationTrace.update({
      where: { id },
      data: { approved: true, approvedBy: adminId },
    });
  }
}

// re-export lang list for external use
export { SUPPORTED_LANGS } from './dto/admin-ai.dto';
export type { SupportedLang };
