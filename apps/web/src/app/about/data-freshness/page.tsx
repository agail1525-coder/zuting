export const dynamic = "force-dynamic";
export const revalidate = 300;

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数据新鲜度 · 爬虫++ 透明度报告 | 佳绩之旅",
  description: "佳绩之旅 24/7 全球旅行数据采集引擎的数据来源、采集频率与覆盖度透明公示。",
  alternates: { canonical: "https://joinus.com/about/data-freshness" },
};

interface GridCell {
  domain: string;
  channel: string;
  activeCount: number;
  itemsLast24h: number;
  status: string;
}

const DOMAIN_LABEL: Record<string, string> = {
  HOLY_SITE: "文化圣地",
  MERCHANT: "商家(住/食/行)",
  PRICE: "价格/航班",
  GUIDE: "攻略/UGC",
  NEWS: "实时动态",
};
const CHANNEL_LABEL: Record<string, string> = {
  OFFICIAL: "官方权威",
  WIKI: "百科数据",
  OTA: "OTA预订",
  MAP: "地图POI",
  UGC: "社区UGC",
  MEDIA: "自媒体",
};
const STATUS_COLOR: Record<string, string> = {
  HEALTHY: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
  WARNING: "bg-amber-900/40 text-amber-300 border-amber-700",
  CRITICAL: "bg-rose-900/40 text-rose-300 border-rose-700",
  DEAD: "bg-red-900/40 text-red-300 border-red-700",
  EMPTY: "bg-slate-800/40 text-slate-400 border-slate-700",
  DISABLED: "bg-slate-800/40 text-slate-400 border-slate-700",
  UNKNOWN: "bg-slate-800/40 text-slate-500 border-slate-700",
};

async function fetchCoverage(): Promise<{ takenAt: string | null; grids: GridCell[] }> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";
  try {
    const res = await fetch(`${base}/crawlers/public-coverage`, { next: { revalidate: 300 } });
    if (!res.ok) return { takenAt: null, grids: [] };
    return (await res.json()) as { takenAt: string | null; grids: GridCell[] };
  } catch {
    return { takenAt: null, grids: [] };
  }
}

export default async function DataFreshnessPage() {
  const { takenAt, grids } = await fetchCoverage();
  const domains = ["HOLY_SITE", "MERCHANT", "PRICE", "GUIDE", "NEWS"];
  const channels = ["OFFICIAL", "WIKI", "OTA", "MAP", "UGC", "MEDIA"];
  const getCell = (d: string, c: string) => grids.find((g) => g.domain === d && g.channel === c);
  const totalItems = grids.reduce((a, g) => a + g.itemsLast24h, 0);
  const totalActive = grids.reduce((a, g) => a + g.activeCount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-semibold text-amber-300 mb-3">🕸️ 数据新鲜度 · 透明度报告</h1>
        <p className="text-slate-300 leading-relaxed mb-8">
          佳绩之旅运行一套 24/7 全球旅行数据采集引擎 (<span className="text-amber-400">爬虫++</span>),
          从官方权威 · 百科数据 · OTA · 地图 POI · 社区 UGC · 自媒体共 6 大纵向渠道,
          为圣地详情 · 商家 · 价格 · 攻略 · 实时动态共 5 个横向域持续供粮。
          本页实时公示数据来源与健康度,践行数据透明原则。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="text-xs text-slate-400 mb-1">最新快照</div>
            <div className="text-lg text-amber-300">
              {takenAt ? new Date(takenAt).toLocaleString("zh-CN") : "尚未生成"}
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="text-xs text-slate-400 mb-1">活跃数据源</div>
            <div className="text-2xl font-semibold text-emerald-300">{totalActive}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="text-xs text-slate-400 mb-1">过去 24 小时新抓取</div>
            <div className="text-2xl font-semibold text-sky-300">{totalItems} 条</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-800 bg-slate-900/80 p-3 text-left text-amber-300">域 \ 纵层</th>
                {channels.map((c) => (
                  <th key={c} className="border border-slate-800 bg-slate-900/80 p-3 text-center text-slate-300">
                    <div className="text-xs">{CHANNEL_LABEL[c]}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{c}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d}>
                  <td className="border border-slate-800 bg-slate-900/60 p-3 text-amber-300">
                    <div>{DOMAIN_LABEL[d]}</div>
                    <div className="text-[10px] text-slate-500 mt-1">{d}</div>
                  </td>
                  {channels.map((c) => {
                    const cell = getCell(d, c);
                    if (!cell) {
                      return (
                        <td key={c} className="border border-slate-800 p-3 text-center text-slate-600 text-xs">
                          —
                        </td>
                      );
                    }
                    return (
                      <td key={c} className="border border-slate-800 p-3 text-center">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-[10px] ${
                            STATUS_COLOR[cell.status] ?? STATUS_COLOR.UNKNOWN
                          }`}
                        >
                          {cell.status}
                        </span>
                        <div className="mt-2 text-xs text-slate-400">
                          {cell.activeCount > 0 ? `${cell.activeCount} 源` : "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {cell.itemsLast24h > 0 ? `${cell.itemsLast24h} / 24h` : ""}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-12 space-y-4 text-sm text-slate-400 leading-relaxed">
          <h2 className="text-xl text-amber-300 mb-2">我们的数据承诺</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>所有数据来源公开可验证,严格遵守 <code className="text-slate-300">robots.txt</code> 与站点服务条款。</li>
            <li>OTA 价格数据带时间戳与 24 小时有效期标记,仅供参考,请以商家实时报价为准。</li>
            <li>社区 UGC 采集仅涉及公开内容,用户昵称经哈希脱敏。</li>
            <li>图片本地化存储 (<code className="text-slate-300">/static/holy-sites/</code>),不热链第三方。</li>
            <li>连续 3 次抓取失败的数据源自动停用,并进入人工审查队列。</li>
            <li>每日凌晨 04:00 自动生成覆盖快照,周报发布在管理后台。</li>
          </ul>
        </section>

        <p className="mt-10 text-xs text-slate-600">
          技术细节请见: <code>爬虫++ v1.0</code> · 每 5 分钟 CDN 增量刷新 · 本页数据来自公共覆盖快照接口
        </p>
      </div>
    </div>
  );
}
