import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';

interface ToolCard {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  badge?: string;
  route: string;
  accentColor: string;
}

const TOOLS: ToolCard[] = [
  {
    icon: 'calendar',
    title: '价格日历',
    subtitle: '查看全月价格趋势，选最低价出行',
    badge: '热门',
    route: '/price-calendar',
    accentColor: '#0066FF',
  },
  {
    icon: 'swap-horizontal',
    title: '路线比价',
    subtitle: '多条路线横向对比，找到最高性价比',
    route: '/price-compare',
    accentColor: '#8B5CF6',
  },
  {
    icon: 'trending-up',
    title: '价格趋势',
    subtitle: '30天历史价格走势，把握最佳时机',
    route: '/price-trend',
    accentColor: '#F59E0B',
  },
  {
    icon: 'notifications',
    title: '价格提醒',
    subtitle: '设置目标价，降价时即时推送通知',
    badge: '推荐',
    route: '/price-alerts',
    accentColor: '#22C55E',
  },
];

export default function PricesScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <Text style={styles.headerTitle}>价格工具</Text>
        <Text style={styles.headerSubtitle}>智能分析 · 对比省钱 · 价格提醒</Text>
      </Animated.View>

      {/* Highlight Banner */}
      <Animated.View entering={FadeInDown.duration(300).delay(80)} style={styles.banner}>
        <Ionicons name="flash" size={22} color="#FFFFFF" />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>今日最低价路线</Text>
          <Text style={styles.bannerSub}>共发现 6 条路线价格下降，点击查看</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.8)" />
      </Animated.View>

      {/* Tool Cards */}
      <Animated.View entering={FadeInDown.duration(300).delay(160)} style={styles.grid}>
        {TOOLS.map((tool, idx) => (
          <Pressable
            key={tool.route}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => router.push(tool.route as never)}
          >
            <View style={[styles.cardIcon, { backgroundColor: `${tool.accentColor}15` }]}>
              <Ionicons name={tool.icon} size={28} color={tool.accentColor} />
            </View>
            {tool.badge && (
              <View style={[styles.badge, { backgroundColor: tool.accentColor }]}>
                <Text style={styles.badgeText}>{tool.badge}</Text>
              </View>
            )}
            <Text style={styles.cardTitle}>{tool.title}</Text>
            <Text style={styles.cardSubtitle}>{tool.subtitle}</Text>
            <View style={styles.cardArrow}>
              <Ionicons name="arrow-forward" size={16} color={tool.accentColor} />
            </View>
          </Pressable>
        ))}
      </Animated.View>

      {/* Tip Section */}
      <Animated.View entering={FadeInDown.duration(300).delay(240)} style={styles.tip}>
        <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
        <Text style={styles.tipText}>
          小贴士：提前 15–30 天预订通常可节省 20%–40% 费用
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0066FF',
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    width: '48%',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 160,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  cardArrow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-end',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#92400E',
    lineHeight: 20,
  },
});
