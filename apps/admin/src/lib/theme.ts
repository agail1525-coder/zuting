import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const adminTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#D4A855',
    colorBgContainer: '#141414',
    colorBgLayout: '#0a0a0a',
    borderRadius: 8,
    fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
  },
  components: {
    Menu: {
      darkItemBg: '#0a0a0a',
      darkSubMenuItemBg: '#0f0f0f',
      darkItemSelectedBg: 'rgba(212, 168, 85, 0.15)',
    },
    Table: {
      headerBg: '#1a1a1a',
      rowHoverBg: 'rgba(212, 168, 85, 0.06)',
    },
    Card: {
      colorBgContainer: '#1a1a1a',
    },
    Layout: {
      siderBg: '#0a0a0a',
      headerBg: '#141414',
      bodyBg: '#0f0f0f',
    },
  },
};

export const CHART_COLORS = [
  '#D4A855', '#E8C97A', '#B8923E', '#8B6914', '#F0D98C',
  '#A07828', '#C49A40', '#DCBE6A', '#967020', '#F5E4A0',
];

export const SERIES_COLORS: Record<string, string> = {
  '初印系': '#D4A855',
  '中印系': '#E87040',
  '印果印': '#52C41A',
  '成道印': '#1890FF',
  '归源印': '#B37FEB',
};
