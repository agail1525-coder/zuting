/** 五系修炼体系 */
export type SealSeries =
  | 'CHUYIN'       // 初印系 1-10
  | 'ZHONGYIN'     // 中印系 11-20
  | 'YINGUOYIN'    // 印果印 21-23
  | 'CHENGDAOYIN'  // 成道印 24-26
  | 'GUIYUANYIN';  // 归源印 27-30

/** 曹溪愿命三十印 */
export interface Seal {
  id: number;         // 1-30
  name: string;       // "一众之誓印"
  series: SealSeries;
  poem: string;       // 偈语
  essence: string;    // 印义
  practice: string;   // 修行法
  vow: string;        // 愿文
  color?: string;     // 系列色
}

/** 系列颜色映射 */
export const SEAL_SERIES_COLORS: Record<SealSeries, { primary: string; name: string }> = {
  CHUYIN:      { primary: '#D4A574', name: '金色' },
  ZHONGYIN:    { primary: '#4CAF50', name: '翠绿' },
  YINGUOYIN:   { primary: '#E91E63', name: '莲粉' },
  CHENGDAOYIN: { primary: '#FFC107', name: '金黄' },
  GUIYUANYIN:  { primary: '#9C27B0', name: '法紫' },
};

/** 根据印号获取所属系列 */
export function getSealSeries(sealId: number): SealSeries {
  if (sealId <= 10) return 'CHUYIN';
  if (sealId <= 20) return 'ZHONGYIN';
  if (sealId <= 23) return 'YINGUOYIN';
  if (sealId <= 26) return 'CHENGDAOYIN';
  return 'GUIYUANYIN';
}
