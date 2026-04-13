import * as http from 'http';
import * as https from 'https';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ssrfFilter = require('ssrf-req-filter') as (url: string) => http.Agent;

const UA_POOL = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'JoinusBot/1.0 (+https://joinus.com/bot)',
];

export function pickUA(seed?: string) {
  const idx = seed ? seed.charCodeAt(0) % UA_POOL.length : Math.floor(Math.random() * UA_POOL.length);
  return UA_POOL[idx];
}

export interface FetchOpts {
  timeoutMs?: number;
  maxBytes?: number;
  acceptJson?: boolean;
  extraHeaders?: Record<string, string>;
}

export function fetchText(url: string, opts: FetchOpts = {}): Promise<{ body: string; statusCode: number; finalUrl: string }> {
  const timeoutMs = opts.timeoutMs ?? 15000;
  const maxBytes = opts.maxBytes ?? 5 * 1024 * 1024;
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) return reject(new Error('CW-41: non-http(s)'));
    const lib = u.protocol === 'https:' ? https : http;
    const agent = ssrfFilter(url);
    const req = lib.request(
      url,
      {
        method: 'GET',
        agent,
        timeout: timeoutMs,
        headers: {
          'User-Agent': pickUA(url),
          Accept: opts.acceptJson ? 'application/json' : 'text/html,application/xhtml+xml',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          ...opts.extraHeaders,
        },
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        let total = 0;
        res.on('data', (c: Buffer) => {
          total += c.length;
          if (total > maxBytes) {
            req.destroy(new Error('CW-42: response >max'));
            return;
          }
          chunks.push(c);
        });
        res.on('end', () =>
          resolve({
            body: Buffer.concat(chunks).toString('utf8'),
            statusCode: res.statusCode ?? 200,
            finalUrl: url,
          }),
        );
        res.on('error', reject);
      },
    );
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end();
  });
}

export function sha256(input: string): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = require('crypto') as typeof import('crypto');
  return createHash('sha256').update(input).digest('hex');
}

export function titleNormalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 200);
}
