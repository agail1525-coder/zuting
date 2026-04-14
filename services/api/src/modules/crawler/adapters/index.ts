import type { CrawlerSource } from '@prisma/client';
import type { CrawlerAdapter } from './types';
import { WikiAdapter } from './wiki-adapter';
import { OfficialAdapter } from './official-adapter';
import { WechatMpAdapter } from './wechat-mp-adapter';
import { YoutubeRssAdapter } from './youtube-rss-adapter';
import { MapAdapter, OTAAdapter, UGCAdapter } from './stub-adapters';

// 顺序敏感: 精确匹配(Wiki/WechatMp/Youtube)先于通用 Stub/Official
const ADAPTERS: CrawlerAdapter[] = [
  new WikiAdapter(),
  new WechatMpAdapter(),
  new YoutubeRssAdapter(),
  new MapAdapter(),
  new OTAAdapter(),
  new UGCAdapter(),
  new OfficialAdapter(),
];

export function pickAdapter(source: CrawlerSource): CrawlerAdapter | null {
  return ADAPTERS.find((a) => a.canHandle(source)) ?? null;
}

export { CrawlerAdapter } from './types';
