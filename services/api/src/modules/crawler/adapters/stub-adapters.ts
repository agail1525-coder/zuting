import type { CrawlerSource } from '@prisma/client';
import type { CrawlerAdapter, ExtractedItem, RawFetchResult } from './types';

// CW-48: Map/OTA/UGC/Media 适配器骨架。V1.5+启用时实现 extract。
// 目前 canHandle 仅在显式策略标记时匹配,默认不参与路由(避免误抓)。

export class MapAdapter implements CrawlerAdapter {
  readonly name = 'map';
  canHandle(s: CrawlerSource) {
    return s.channel === 'MAP' && s.strategy === 'API' && s.enabled;
  }
  async fetch(): Promise<RawFetchResult> {
    throw new Error('MapAdapter: V1.5 启用,需 AMAP_KEY/GOOGLE_PLACES_KEY');
  }
  extract(): ExtractedItem[] {
    return [];
  }
}

export class OTAAdapter implements CrawlerAdapter {
  readonly name = 'ota';
  canHandle(s: CrawlerSource) {
    return s.channel === 'OTA' && s.enabled;
  }
  async fetch(): Promise<RawFetchResult> {
    throw new Error('OTAAdapter: V1.5 启用,需代理池 + robots.txt 合规审');
  }
  extract(): ExtractedItem[] {
    return [];
  }
}

export class UGCAdapter implements CrawlerAdapter {
  readonly name = 'ugc';
  canHandle(s: CrawlerSource) {
    return s.channel === 'UGC' && s.enabled;
  }
  async fetch(): Promise<RawFetchResult> {
    throw new Error('UGCAdapter: V1.5 启用, CW-27 urls.txt 投喂模式');
  }
  extract(): ExtractedItem[] {
    return [];
  }
}
