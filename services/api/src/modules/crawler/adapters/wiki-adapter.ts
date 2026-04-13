import type { CrawlerSource } from '@prisma/client';
import type { CrawlerAdapter, ExtractedItem, RawFetchResult } from './types';
import { fetchText } from './http-util';

export class WikiAdapter implements CrawlerAdapter {
  readonly name = 'wiki';

  canHandle(source: CrawlerSource): boolean {
    return source.channel === 'WIKI' && (source.parser === 'wiki-rest' || source.parser === 'wikidata-sparql' || source.parser === 'commons-api');
  }

  async fetch(source: CrawlerSource): Promise<RawFetchResult> {
    const url = source.parser === 'wikidata-sparql'
      ? buildWikidataQueryUrl(source.baseUrl)
      : source.baseUrl;
    const { body, statusCode, finalUrl } = await fetchText(url, { acceptJson: true, timeoutMs: 20000 });
    return { mimeType: 'application/json', body, statusCode, finalUrl };
  }

  extract(raw: RawFetchResult, source: CrawlerSource): ExtractedItem[] {
    let json: unknown;
    try {
      json = JSON.parse(raw.body);
    } catch {
      return [];
    }

    if (source.parser === 'wiki-rest') {
      const obj = json as Record<string, unknown>;
      if (!obj || typeof obj !== 'object') return [];
      const title = (obj.title as string) ?? '';
      const extract = (obj.extract as string) ?? '';
      const thumb = (obj.thumbnail as Record<string, string> | undefined)?.source;
      const pageUrl =
        ((obj.content_urls as Record<string, Record<string, string>> | undefined)?.desktop?.page) ?? raw.finalUrl;
      if (!title) return [];
      return [{ externalUrl: pageUrl, title, description: extract, imageUrls: thumb ? [thumb] : [], raw: obj }];
    }

    if (source.parser === 'wikidata-sparql') {
      const obj = json as { results?: { bindings?: Array<Record<string, { value: string }>> } };
      const bindings = obj?.results?.bindings ?? [];
      return bindings
        .map((b) => ({
          externalUrl: b.item?.value ?? '',
          title: b.itemLabel?.value ?? b.item?.value ?? 'unknown',
          imageUrls: b.image?.value ? [b.image.value] : [],
          raw: b as Record<string, unknown>,
        }))
        .filter((x) => x.externalUrl);
    }

    if (source.parser === 'commons-api') {
      const obj = json as { query?: { pages?: Record<string, Record<string, unknown>> } };
      const pages = obj?.query?.pages ?? {};
      return Object.values(pages).map((p) => ({
        externalUrl: (p.canonicalurl as string) ?? '',
        title: (p.title as string) ?? '',
        imageUrls: extractImageInfo(p),
        raw: p,
      })).filter((x) => x.externalUrl);
    }

    return [];
  }
}

function extractImageInfo(p: Record<string, unknown>): string[] {
  const info = p.imageinfo as Array<{ url?: string }> | undefined;
  if (!info || !Array.isArray(info)) return [];
  return info.map((i) => i.url).filter((u): u is string => Boolean(u));
}

function buildWikidataQueryUrl(base: string): string {
  // 示例查询: 取带 P18 (image) 的圣地类目。实际查询可由 source.selector.query 覆盖。
  const query = `SELECT ?item ?itemLabel ?image WHERE {
    ?item wdt:P31/wdt:P279* wd:Q839954 .
    ?item wdt:P18 ?image .
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en,zh" }
  } LIMIT 50`;
  return `${base}?format=json&query=${encodeURIComponent(query)}`;
}
