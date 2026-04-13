import type { CrawlerSource } from '@prisma/client';
import type { CrawlerAdapter } from './types';
import { WikiAdapter } from './wiki-adapter';
import { OfficialAdapter } from './official-adapter';
import { MapAdapter, OTAAdapter, UGCAdapter } from './stub-adapters';

// 顺序敏感: WikiAdapter 先于 OfficialAdapter,避免 channel=WIKI 的源被通用 HTTP 抓
const ADAPTERS: CrawlerAdapter[] = [
  new WikiAdapter(),
  new MapAdapter(),
  new OTAAdapter(),
  new UGCAdapter(),
  new OfficialAdapter(),
];

export function pickAdapter(source: CrawlerSource): CrawlerAdapter | null {
  return ADAPTERS.find((a) => a.canHandle(source)) ?? null;
}

export { CrawlerAdapter } from './types';
