/**
 * 爬虫++ 污染清洗流水线 (CW-QG)
 *
 * 输入: 原始 title + content + imageUrls
 * 输出: cleaned title + cleaned content + cleaned imageUrls + 清洗日志
 *
 * 阶段:
 *  1. HTML 白名单 (sanitize-html) — 去脚本/style/onclick/iframe
 *  2. 微信/小红书专用 strip — 二维码/关注话术/名片卡
 *  3. 广告短语 strip — AD_PHRASES + BOILERPLATE_PATTERNS
 *  4. URL 参数 strip — 去 tracking params + 黑名单域名
 *  5. 段落去重 — 同一段 >= 3 次 => 保留 1 份
 */
import sanitizeHtml from 'sanitize-html';
import {
  AD_PHRASES,
  BOILERPLATE_PATTERNS,
  EXTERNAL_DOMAIN_BLACKLIST,
  TRACKING_PARAMS,
} from './ad-blacklist';

export interface SanitizeInput {
  title: string;
  content: string;
  imageUrls: string[];
  isHtml?: boolean;
}

export interface SanitizeResult {
  title: string;
  content: string;
  imageUrls: string[];
  removed: {
    adPhrases: string[];
    boilerplate: number;
    dedupedParagraphs: number;
    blockedImages: string[];
    strippedParams: number;
  };
}

const HTML_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'b', 'i',
    'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption',
  ],
  allowedAttributes: {
    a: ['href'],
    img: ['src', 'alt'],
  },
  disallowedTagsMode: 'discard',
  allowedSchemes: ['http', 'https'],
  transformTags: {
    a: (_tag: string, attribs: Record<string, string>) => ({
      tagName: 'a',
      attribs: { href: stripTrackingParams(attribs.href || '').url },
    }),
  },
};

function stripTrackingParams(rawUrl: string): { url: string; strippedCount: number } {
  if (!rawUrl) return { url: '', strippedCount: 0 };
  try {
    const u = new URL(rawUrl);
    let count = 0;
    for (const p of TRACKING_PARAMS) {
      if (u.searchParams.has(p)) {
        u.searchParams.delete(p);
        count++;
      }
    }
    return { url: u.toString(), strippedCount: count };
  } catch {
    return { url: rawUrl, strippedCount: 0 };
  }
}

function isBlockedImageUrl(url: string): boolean {
  if (!url) return true;
  try {
    const u = new URL(url);
    // 微信公众号二维码 (qrcode) 和名片图常见 URL 模式
    if (/qrcode|qr_code|bizcard|business_card/i.test(url)) return true;
    // 可疑跟踪像素
    if (/(?:^|[?&])(pixel|beacon)=/i.test(url)) return true;
    if (EXTERNAL_DOMAIN_BLACKLIST.some((d) => u.hostname.endsWith(d))) return true;
    return false;
  } catch {
    return true;
  }
}

export function sanitize(input: SanitizeInput): SanitizeResult {
  const removed: SanitizeResult['removed'] = {
    adPhrases: [],
    boilerplate: 0,
    dedupedParagraphs: 0,
    blockedImages: [],
    strippedParams: 0,
  };

  // 标题
  let title = (input.title || '').trim().slice(0, 200);
  for (const phrase of AD_PHRASES) {
    if (title.includes(phrase)) {
      removed.adPhrases.push(`title:${phrase}`);
      title = title.split(phrase).join('');
    }
  }

  // 正文: HTML 情况先过 sanitize-html, 再按段落处理
  let content = input.content || '';
  if (input.isHtml) {
    content = sanitizeHtml(content, HTML_OPTS);
  }

  // 段落拆分 (按空行或 </p>)
  const rawParas = content
    .replace(/<\/p>/g, '\n\n')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .split(/\n{2,}|\r\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Boilerplate strip
  const paras1 = rawParas.map((p) => {
    let out = p;
    for (const pat of BOILERPLATE_PATTERNS) {
      if (pat.test(out)) {
        out = out.replace(pat, '');
        removed.boilerplate++;
      }
    }
    for (const phrase of AD_PHRASES) {
      if (out.includes(phrase)) {
        removed.adPhrases.push(`body:${phrase}`);
        out = out.split(phrase).join('');
      }
    }
    return out.trim();
  });

  // 段落去重 (出现 >= 3 次 的保留 1 份)
  const freq = new Map<string, number>();
  for (const p of paras1) {
    if (p.length < 10) continue;
    freq.set(p, (freq.get(p) || 0) + 1);
  }
  const seen = new Set<string>();
  const paras2: string[] = [];
  for (const p of paras1) {
    if (!p) continue;
    const count = freq.get(p) || 0;
    if (count >= 3) {
      if (seen.has(p)) {
        removed.dedupedParagraphs++;
        continue;
      }
      seen.add(p);
    }
    paras2.push(p);
  }

  const cleanedContent = paras2.join('\n\n').trim();

  // 图片黑名单
  const cleanedImages: string[] = [];
  for (const url of input.imageUrls || []) {
    if (isBlockedImageUrl(url)) {
      removed.blockedImages.push(url);
      continue;
    }
    const { url: stripped, strippedCount } = stripTrackingParams(url);
    cleanedImages.push(stripped);
    removed.strippedParams += strippedCount;
  }

  return { title: title.trim(), content: cleanedContent, imageUrls: cleanedImages, removed };
}
