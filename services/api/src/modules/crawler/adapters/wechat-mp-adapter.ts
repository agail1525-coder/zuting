import * as cheerio from 'cheerio';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CrawlerSource } from '@prisma/client';
import type { CrawlerAdapter, ExtractedItem, RawFetchResult } from './types';
import { fetchText } from './http-util';

const FEED_CANDIDATES = [
  resolve(__dirname, '../../../../../scripts/crawler/feeds/wechat/urls.txt'),
  resolve(__dirname, '../../../../scripts/crawler/feeds/wechat/urls.txt'),
  '/opt/zuting/scripts/crawler/feeds/wechat/urls.txt',
];

export class WechatMpAdapter implements CrawlerAdapter {
  readonly name = 'wechat-mp';

  canHandle(source: CrawlerSource): boolean {
    return source.key === 'wechat-mp-urls-feed';
  }

  async fetch(source: CrawlerSource): Promise<RawFetchResult> {
    const feed = FEED_CANDIDATES.find((p) => existsSync(p));
    const urls = feed
      ? readFileSync(feed, 'utf8')
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith('#') && l.includes('mp.weixin.qq.com/s'))
      : [];
    const pages: Array<{ url: string; body: string; statusCode: number }> = [];
    for (const u of urls.slice(0, 50)) {
      try {
        const { body, statusCode } = await fetchText(u, { timeoutMs: 12000 });
        pages.push({ url: u, body, statusCode });
        await new Promise((r) => setTimeout(r, source.rateLimitMs || 3000));
      } catch {
        // CW-10 单条失败不阻断批次
      }
    }
    return {
      mimeType: 'application/json',
      body: JSON.stringify(pages),
      statusCode: 200,
      finalUrl: source.baseUrl,
    };
  }

  extract(raw: RawFetchResult): ExtractedItem[] {
    let pages: Array<{ url: string; body: string; statusCode: number }> = [];
    try {
      pages = JSON.parse(raw.body);
    } catch {
      return [];
    }
    const items: ExtractedItem[] = [];
    for (const p of pages) {
      if (p.statusCode !== 200 || !p.body) continue;
      const $ = cheerio.load(p.body);
      const title =
        $('#activity-name').text().trim() ||
        $('meta[property="og:title"]').attr('content')?.trim() ||
        '';
      if (!title) continue;
      const description =
        $('#js_content').text().replace(/\s+/g, ' ').slice(0, 400).trim() ||
        $('meta[property="og:description"]').attr('content')?.trim() ||
        '';
      const cover = $('meta[property="og:image"]').attr('content') || '';
      const author = $('#js_name').text().trim() || $('#profileBt a').text().trim();
      const publishDate = $('#publish_time').text().trim();
      items.push({
        externalUrl: p.url,
        title,
        description,
        imageUrls: cover ? [cover] : [],
        raw: { author, publishDate, source: 'wechat-mp' },
      });
    }
    return items;
  }
}
