/**
 * 爬虫++ YouTube RSS 适配器 (CW-YT)
 *
 * 投喂: `scripts/crawler/feeds/youtube/channel-ids.txt` 每行一个 UCxxxx
 * 抓取: `https://www.youtube.com/feeds/videos.xml?channel_id=UCxxxx` (每频道最新 15 条)
 * 合规: 官方公开 RSS, 无鉴权, 不违 ToS (CW-01/CW-27)
 * 路由: GUIDE/MEDIA, 小轻需 OUTBOUND_PROXY 覆盖 youtube.com (隧道已通 → 扩域即可)
 */
import * as cheerio from 'cheerio';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { CrawlerSource } from '@prisma/client';
import type { CrawlerAdapter, ExtractedItem, RawFetchResult } from './types';
import { fetchText } from './http-util';

const FEED_CANDIDATES = [
  resolve(__dirname, '../../../../../scripts/crawler/feeds/youtube/channel-ids.txt'),
  resolve(__dirname, '../../../../scripts/crawler/feeds/youtube/channel-ids.txt'),
  '/opt/zuting/scripts/crawler/feeds/youtube/channel-ids.txt',
];

const CHANNEL_ID_RE = /^UC[A-Za-z0-9_-]{22}$/;

export class YoutubeRssAdapter implements CrawlerAdapter {
  readonly name = 'youtube-rss';

  canHandle(source: CrawlerSource): boolean {
    return source.key === 'youtube-rss-feed';
  }

  async fetch(source: CrawlerSource): Promise<RawFetchResult> {
    const feed = FEED_CANDIDATES.find((p) => existsSync(p));
    const channelIds = feed
      ? readFileSync(feed, 'utf8')
          .split('\n')
          .map((l) => l.trim().split('#')[0].trim())
          .filter((l) => CHANNEL_ID_RE.test(l))
      : [];

    const pages: Array<{ channelId: string; body: string; statusCode: number }> = [];
    // CW-43: 同站串行 + 速率限制; 单批上限 50 频道
    for (const cid of channelIds.slice(0, 50)) {
      const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${cid}`;
      try {
        const { body, statusCode } = await fetchText(url, {
          timeoutMs: 15000,
          extraHeaders: { Accept: 'application/atom+xml,application/xml' },
        });
        pages.push({ channelId: cid, body, statusCode });
        await new Promise((r) => setTimeout(r, source.rateLimitMs || 2000));
      } catch {
        // CW-10 单频道失败不阻断批次
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
    let pages: Array<{ channelId: string; body: string; statusCode: number }> = [];
    try {
      pages = JSON.parse(raw.body);
    } catch {
      return [];
    }

    const items: ExtractedItem[] = [];
    for (const p of pages) {
      if (p.statusCode !== 200 || !p.body) continue;
      const $ = cheerio.load(p.body, { xmlMode: true });
      const channelTitle = $('author > name').first().text().trim();
      $('entry').each((_, el) => {
        const $el = $(el);
        const videoId = $el.find('yt\\:videoId, videoId').first().text().trim();
        const title = $el.find('title').first().text().trim();
        const link = $el.find('link').attr('href') || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : '');
        if (!title || !link) return;
        const published = $el.find('published').first().text().trim();
        const description = $el.find('media\\:description, description').first().text().trim().slice(0, 800);
        const thumb = $el.find('media\\:thumbnail, thumbnail').attr('url') || '';
        const viewsRaw = $el.find('media\\:community media\\:statistics, statistics').attr('views');
        items.push({
          externalUrl: link,
          title,
          description,
          imageUrls: thumb ? [thumb] : [],
          raw: {
            channelId: p.channelId,
            channelTitle,
            videoId,
            published,
            views: viewsRaw ? Number(viewsRaw) : undefined,
            source: 'youtube-rss',
          },
        });
      });
    }
    return items;
  }
}
