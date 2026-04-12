import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

// Joinus 佳绩之旅 品牌色板
// 主色 #3264ff (亮蓝) — 与 Web Header/品牌一致
// 点缀 #D4A855 (暖金) — 仅用于 ADMIN 徽章 / Crown / 奖杯类 accent
export const BRAND = {
  primary: '#3264ff',
  primaryHover: '#4d7bff',
  primaryActive: '#2050e8',
  accent: '#D4A855',
  bgBase: '#f5f6fa',
  bgSurface: '#ffffff',
  bgHeader: '#3264ff',
  textOnPrimary: '#ffffff',
  borderSubtle: '#e4e7ed',
};

export const adminTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: BRAND.primary,
    colorInfo: BRAND.primary,
    colorBgContainer: BRAND.bgSurface,
    colorBgLayout: BRAND.bgBase,
    colorBorderSecondary: BRAND.borderSubtle,
    borderRadius: 8,
    fontFamily: '"PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  components: {
    Menu: {
      itemSelectedBg: 'rgba(50, 100, 255, 0.1)',
      itemSelectedColor: BRAND.primary,
      itemHoverBg: 'rgba(50, 100, 255, 0.06)',
      itemHoverColor: BRAND.primary,
      darkItemBg: BRAND.bgSurface,
      darkSubMenuItemBg: '#fafbff',
      darkItemSelectedBg: 'rgba(50, 100, 255, 0.12)',
      darkItemSelectedColor: BRAND.primary,
      darkItemColor: '#333',
      darkItemHoverColor: BRAND.primary,
    },
    Table: {
      headerBg: '#fafbff',
      headerColor: '#1a1a1a',
      rowHoverBg: 'rgba(50, 100, 255, 0.04)',
    },
    Card: {
      colorBgContainer: BRAND.bgSurface,
      boxShadowTertiary: '0 1px 2px rgba(0,0,0,0.04)',
    },
    Layout: {
      siderBg: BRAND.bgSurface,
      headerBg: BRAND.bgHeader,
      bodyBg: BRAND.bgBase,
      headerColor: BRAND.textOnPrimary,
    },
    Button: {
      primaryShadow: '0 2px 4px rgba(50, 100, 255, 0.2)',
    },
    Tag: {
      colorPrimary: BRAND.primary,
    },
  },
};

// 图表配色: 主蓝+辅助色阶
export const CHART_COLORS = [
  '#3264ff', '#4d7bff', '#2050e8', '#7a9fff', '#1a3fc7',
  '#D4A855', '#E8C97A', '#B8923E', '#8B6914', '#F0D98C',
];

// 系列色: 印章传承五系 (保留业务语义,仅单点使用)
export const SERIES_COLORS: Record<string, string> = {
  '初印系': '#3264ff',
  '中印系': '#E87040',
  '印果印': '#52C41A',
  '成道印': '#D4A855',
  '归源印': '#B37FEB',
};
