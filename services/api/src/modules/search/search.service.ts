import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type SearchType =
  | 'all'
  | 'religion'
  | 'holy-site'
  | 'temple'
  | 'patriarch'
  | 'teaching'
  | 'seal';

export interface SearchResultItem {
  type: string;
  id: string | number;
  slug?: string;
  title: string;
  subtitle: string | null;
  descriptionSnippet: string | null;
  image: string | null;
  religion: { name: string; symbol: string | null; color: string | null } | null;
}

export interface SearchResponse {
  query: string;
  type: SearchType;
  page: number;
  limit: number;
  total: number;
  results: SearchResultItem[];
}

const PER_TYPE_LIMIT = 20;
const SNIPPET_LENGTH = 120;

function snippet(text: string | null | undefined, maxLen = SNIPPET_LENGTH): string | null {
  if (!text) return null;
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(
    q: string,
    type: SearchType = 'all',
    page = 1,
    limit = 20,
  ): Promise<SearchResponse> {
    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const searchTypes =
      type === 'all'
        ? ['religion', 'holy-site', 'temple', 'patriarch', 'teaching', 'seal']
        : [type];

    const promises = searchTypes.map((t) => this.searchByType(t, q, PER_TYPE_LIMIT));
    const allArrays = await Promise.all(promises);
    const allResults = allArrays.flat();

    const total = allResults.length;
    const results = allResults.slice(skip, skip + safeLimit);

    return { query: q, type, page, limit: safeLimit, total, results };
  }

  private async searchByType(
    type: string,
    q: string,
    take: number,
  ): Promise<SearchResultItem[]> {
    switch (type) {
      case 'religion':
        return this.searchReligions(q, take);
      case 'holy-site':
        return this.searchHolySites(q, take);
      case 'temple':
        return this.searchTemples(q, take);
      case 'patriarch':
        return this.searchPatriarchs(q, take);
      case 'teaching':
        return this.searchTeachings(q, take);
      case 'seal':
        return this.searchSeals(q, take);
      default:
        return [];
    }
  }

  private async searchReligions(q: string, take: number): Promise<SearchResultItem[]> {
    const results = await this.prisma.religion.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { nameEn: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
    });

    return results.map((r) => ({
      type: 'religion',
      id: r.id,
      slug: r.slug,
      title: r.name,
      subtitle: r.nameEn,
      descriptionSnippet: null,
      image: null,
      religion: { name: r.name, symbol: r.symbol, color: r.color },
    }));
  }

  private async searchHolySites(q: string, take: number): Promise<SearchResultItem[]> {
    const results = await this.prisma.holySite.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { nameEn: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { country: { contains: q, mode: 'insensitive' } },
          { religion: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { religion: true },
      take,
    });

    return results.map((s) => ({
      type: 'holy-site',
      id: s.id,
      title: s.name,
      subtitle: `${s.nameEn} - ${s.country}`,
      descriptionSnippet: snippet(s.description),
      image: s.imageUrl,
      religion: {
        name: s.religion.name,
        symbol: s.religion.symbol,
        color: s.religion.color,
      },
    }));
  }

  private async searchTemples(q: string, take: number): Promise<SearchResultItem[]> {
    const results = await this.prisma.temple.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { nameEn: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { country: { contains: q, mode: 'insensitive' } },
          { religion: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { religion: true },
      take,
    });

    return results.map((t) => ({
      type: 'temple',
      id: t.id,
      title: t.name,
      subtitle: `${t.nameEn ?? ''} - ${t.country}`,
      descriptionSnippet: snippet(t.description),
      image: t.imageUrl,
      religion: {
        name: t.religion.name,
        symbol: t.religion.symbol,
        color: t.religion.color,
      },
    }));
  }

  private async searchPatriarchs(q: string, take: number): Promise<SearchResultItem[]> {
    const results = await this.prisma.patriarch.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { nameEn: { contains: q, mode: 'insensitive' } },
          { biography: { contains: q, mode: 'insensitive' } },
          { coreTeaching: { contains: q, mode: 'insensitive' } },
          { title: { contains: q, mode: 'insensitive' } },
          { religion: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { religion: true },
      take,
    });

    return results.map((p) => ({
      type: 'patriarch',
      id: p.id,
      title: p.name,
      subtitle: p.title ?? p.nameEn,
      descriptionSnippet: snippet(p.biography),
      image: p.imageUrl,
      religion: {
        name: p.religion.name,
        symbol: p.religion.symbol,
        color: p.religion.color,
      },
    }));
  }

  private async searchTeachings(q: string, take: number): Promise<SearchResultItem[]> {
    const results = await this.prisma.teaching.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { originalText: { contains: q, mode: 'insensitive' } },
          { sourceText: { contains: q, mode: 'insensitive' } },
          { translationCn: { contains: q, mode: 'insensitive' } },
          { religion: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      include: { religion: true },
      take,
    });

    return results.map((t) => ({
      type: 'teaching',
      id: t.id,
      title: t.name,
      subtitle: t.sourceText,
      descriptionSnippet: snippet(t.originalText),
      image: null,
      religion: {
        name: t.religion.name,
        symbol: t.religion.symbol,
        color: t.religion.color,
      },
    }));
  }

  private async searchSeals(q: string, take: number): Promise<SearchResultItem[]> {
    const results = await this.prisma.seal.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { poem: { contains: q, mode: 'insensitive' } },
          { essence: { contains: q, mode: 'insensitive' } },
          { practice: { contains: q, mode: 'insensitive' } },
          { vow: { contains: q, mode: 'insensitive' } },
        ],
      },
      take,
    });

    return results.map((s) => ({
      type: 'seal',
      id: s.id,
      title: `第${s.id}印 · ${s.name}`,
      subtitle: s.series,
      descriptionSnippet: snippet(s.essence),
      image: null,
      religion: null,
    }));
  }
}
