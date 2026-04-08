import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Injectable()
export class AiCommunityLlmService {
  private readonly logger = new Logger(AiCommunityLlmService.name);
  private readonly llmBaseUrl: string;
  private readonly llmApiKey: string;
  private readonly llmModel: string;

  constructor(private readonly config: ConfigService) {
    this.llmBaseUrl = this.config.get<string>('LLM_BASE_URL', '');
    this.llmApiKey = this.config.get<string>('LLM_API_KEY', '');
    this.llmModel = this.config.get<string>('LLM_MODEL', '');
  }

  get isEnabled(): boolean {
    return !!this.llmBaseUrl;
  }

  /**
   * 调用LLM生成内容（非流式）
   * 复用xiaohong的OpenAI-compatible模式
   */
  async generate(systemPrompt: string, userMessage?: string): Promise<string> {
    if (!this.isEnabled) {
      this.logger.warn('LLM not enabled — skipping generation');
      return '';
    }

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
    ];
    if (userMessage) {
      messages.push({ role: 'user', content: userMessage });
    }

    const response = await fetch(`${this.llmBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.llmApiKey ? { Authorization: `Bearer ${this.llmApiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.llmModel,
        messages,
        max_tokens: 2048,
        temperature: 0.8,
        stream: false,
        chat_template_kwargs: { enable_thinking: false },
      }),
      signal: AbortSignal.timeout(180_000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`LLM API ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content ?? '';
    return this.stripThinkingPrefix(raw);
  }

  /** 移除Qwen thinking标签 */
  private stripThinkingPrefix(text: string): string {
    return text
      .replace(/<think>[\s\S]*?<\/think>\s*/g, '')
      .replace(/^<\|im_start\|>assistant\n?/i, '')
      .trim();
  }
}
