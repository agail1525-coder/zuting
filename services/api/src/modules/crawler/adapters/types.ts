import type { CrawlerSource } from '@prisma/client';

export interface RawFetchResult {
  mimeType: 'text/html' | 'application/json' | 'application/xml';
  body: string;
  statusCode: number;
  finalUrl: string;
}

export interface ExtractedItem {
  externalUrl: string;
  title: string;
  description?: string;
  imageUrls?: string[];
  raw: Record<string, unknown>;
}

export interface CrawlerAdapter {
  readonly name: string;
  canHandle(source: CrawlerSource): boolean;
  fetch(source: CrawlerSource): Promise<RawFetchResult>;
  extract(raw: RawFetchResult, source: CrawlerSource): ExtractedItem[];
}
