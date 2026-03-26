// 五系三十印配置
export const SEAL_SERIES = [
  { key: 'CHUYIN', name: '初印系', nameEn: 'Foundation Seals', range: [1, 10], color: '#0EA5E9' },
  { key: 'ZHONGYIN', name: '中印系', nameEn: 'Middle Seals', range: [11, 20], color: '#6366F1' },
  { key: 'YINGUOYIN', name: '印果印', nameEn: 'Fruition Seals', range: [21, 23], color: '#A855F7' },
  { key: 'CHENGDAOYIN', name: '成道印', nameEn: 'Enlightenment Seals', range: [24, 26], color: '#EF4444' },
  { key: 'GUIYUANYIN', name: '归源印', nameEn: 'Return to Origin Seals', range: [27, 30], color: '#F59E0B' },
] as const;

export type SealSeriesKey = typeof SEAL_SERIES[number]['key'];

export function getSealSeriesInfo(key: string) {
  return SEAL_SERIES.find(s => s.key === key);
}

export function getSealSeriesByNumber(sealId: number) {
  return SEAL_SERIES.find(s => sealId >= s.range[0] && sealId <= s.range[1]);
}
