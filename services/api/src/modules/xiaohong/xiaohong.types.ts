import type {
  Religion,
  HolySite,
  Temple,
  Patriarch,
  Teaching,
  Seal,
} from '@prisma/client';

// ── Related data types returned by fetchRelatedData ──

export interface ReligionWithRelations extends Religion {
  holySites: HolySite[];
  temples: Temple[];
  patriarchs: Patriarch[];
}

export interface HolySiteWithReligion extends HolySite {
  religion: Religion;
}

export interface TempleWithReligion extends Temple {
  religion: Religion;
}

export interface PatriarchWithReligion extends Patriarch {
  religion: Religion;
}

export interface TeachingWithReligion extends Teaching {
  religion: Religion;
}

export type RelatedData =
  | Religion[]
  | ReligionWithRelations
  | HolySiteWithReligion[]
  | TempleWithReligion[]
  | PatriarchWithReligion[]
  | TeachingWithReligion[]
  | Seal[]
  | null;

export interface SummarizedItem {
  id: string | number;
  name: string;
  nameEn?: string;
  country?: string;
  series?: string;
}

export interface SummarizedDetail {
  id: string;
  name: string;
  nameEn: string;
  holySites?: number;
  temples?: number;
  patriarchs?: number;
}

export type SummarizedData = SummarizedItem[] | SummarizedDetail;

export enum ChatIntent {
  RELIGION_INFO = 'RELIGION_INFO',
  HOLY_SITE_INFO = 'HOLY_SITE_INFO',
  TEMPLE_INFO = 'TEMPLE_INFO',
  PATRIARCH_INFO = 'PATRIARCH_INFO',
  TEACHING_INFO = 'TEACHING_INFO',
  SEAL_INFO = 'SEAL_INFO',
  TRIP_PLANNING = 'TRIP_PLANNING',
  PRACTICE_GUIDE = 'PRACTICE_GUIDE',
  GENERAL = 'GENERAL',
}

export interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
  intent: ChatIntent;
  conversationId?: string;
  relatedData?: SummarizedData;
  timestamp: string;
}

export const INTENT_KEYWORDS: Record<ChatIntent, string[]> = {
  [ChatIntent.RELIGION_INFO]: [
    '佛教', '道教', '基督教', '伊斯兰', '印度教', '犹太教',
    '儒教', '锡克', '神道', '藏传', '原住民', '巴哈伊',
    '信仰', '宗教', 'Buddhism', 'Christianity', 'Islam', 'religion',
    'Hinduism', 'Judaism', 'Confucianism', 'Sikhism', 'Shinto',
  ],
  [ChatIntent.HOLY_SITE_INFO]: [
    '圣地', '菩提伽耶', '耶路撒冷', '麦加', '恒河',
    'holy site', 'sacred', '圣城', '圣山',
  ],
  [ChatIntent.TEMPLE_INFO]: [
    '祖庭', '寺庙', '寺院', '少林', '白马寺',
    'temple', 'monastery', '道观', '教堂', '清真寺',
  ],
  [ChatIntent.PATRIARCH_INFO]: [
    '祖师', '释迦', '老子', '耶稣', '穆罕默德', '孔子',
    'patriarch', 'founder', '创始人', '大师',
  ],
  [ChatIntent.TEACHING_INFO]: [
    '祖训', '教义', '经文', '教导', 'teaching', 'scripture',
    '教理', '法语', '圣训',
  ],
  [ChatIntent.SEAL_INFO]: [
    '印', '修炼', '修行', '曹溪', '愿命', 'seal', 'practice',
    '三十印', '初印', '中印', '印果', '成道', '归源',
  ],
  [ChatIntent.TRIP_PLANNING]: [
    '路线', '行程', '旅行', '规划', '朝圣', 'trip', 'plan',
    'pilgrimage', '旅游', '出发', '签证', '机票',
  ],
  [ChatIntent.PRACTICE_GUIDE]: [
    '冥想', '打坐', '禅修', '修行方法', 'meditation', 'practice',
    '静坐', '念佛', '持咒', '诵经', '呼吸',
  ],
  [ChatIntent.GENERAL]: [],
};
