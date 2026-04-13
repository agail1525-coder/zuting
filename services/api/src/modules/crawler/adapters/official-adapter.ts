import * as cheerio from 'cheerio';
import type { CrawlerSource } from '@prisma/client';
import type { CrawlerAdapter, ExtractedItem, RawFetchResult } from './types';
import { fetchText } from './http-util';

export class OfficialAdapter implements CrawlerAdapter {
  readonly name = 'official';

  canHandle(source: CrawlerSource): boolean {
    return source.strategy === 'HTTP' && source.channel !== 'WIKI';
  }

  async fetch(source: CrawlerSource): Promise<RawFetchResult> {
    const { body, statusCode, finalUrl } = await fetchText(source.baseUrl, { timeoutMs: 15000 });
    return { mimeType: 'text/html', body, statusCode, finalUrl };
  }

  extract(raw: RawFetchResult, source: CrawlerSource): ExtractedItem[] {
    const selector = (source.selector as Record<string, string> | null) ?? {};
    const listSel = selector.list;
    if (!listSel) return [];
    const $ = cheerio.load(raw.body);
    const items: ExtractedItem[] = [];
    $(listSel).each((_, el) => {
      const node = $(el);
      const row: Record<string, string> = {};
      for (const [key, css] of Object.entries(selector)) {
        if (key === 'list') continue;
        const selected = parseSel(node, css);
        row[key] = selected;
      }
      const title = (row.title || '').trim();
      const urlRaw = (row.url || '').trim();
      if (!title) return;
      const externalUrl = absoluteUrl(source.baseUrl, urlRaw) || raw.finalUrl;
      items.push({
        externalUrl,
        title,
        description: row.description,
        imageUrls: row.images ? [absoluteUrl(source.baseUrl, row.images) || row.images] : [],
        raw: row as Record<string, unknown>,
      });
    });
    return items;
  }
}

type CheerioNode = ReturnType<ReturnType<typeof cheerio.load>>;
function parseSel(node: CheerioNode, css: string): string {
  const m = /^(.+?)@(\w+)$/.exec(css);
  if (m) return (node.find(m[1]).first().attr(m[2]) || '').trim();
  const n = node.find(css).first();
  return (n.text() || n.attr('href') || n.attr('src') || '').trim();
}

function absoluteUrl(base: string, maybe: string): string {
  if (!maybe) return '';
  try {
    return new URL(maybe, base).toString();
  } catch {
    return '';
  }
}
