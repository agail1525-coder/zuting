/**
 * 价格工具默认值 — /prices 页面预算测算组件的常量
 *
 * W3.0.3 从 PriceBudgetEstimator 组件内联常量抽出,避免"参考值"散落前端。
 * 未来接入 Admin PriceConfig 表后,此文件退化为 fallback。
 *
 * 单位约定:
 * - DAILY_BASE_YUAN — 每人每日基准参考价,单位 元 (不含机票)
 * - STYLE_MULTIPLIERS — 风格乘数 (经济/舒适/豪华),作用于 DAILY_BASE
 */

export const DAILY_BASE_YUAN = {
  hotel: 280,
  meals: 120,
  transport: 80,
  misc: 60,
} as const;

export const STYLE_MULTIPLIERS = {
  eco: 1.0,
  comfort: 1.5,
  lux: 2.5,
} as const;

export type BudgetStyle = keyof typeof STYLE_MULTIPLIERS;

/** 风格中文/英文标签,给 UI select */
export const BUDGET_STYLE_LABELS: Record<BudgetStyle, { zh: string; en: string }> = {
  eco: { zh: '经济', en: 'Eco' },
  comfort: { zh: '舒适', en: 'Comfort' },
  lux: { zh: '豪华', en: 'Luxury' },
};

/** 写入 @zuting/config 时的版本号,PriceConfig 表若覆盖应 ≥ 此版本 */
export const PRICE_DEFAULTS_VERSION = 1;
