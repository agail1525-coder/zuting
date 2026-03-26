import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

type TripStatus = 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

interface TripSite {
  id: string;
  nameZh: string;
  nameEn: string;
  country: string;
  emoji: string;
  order: number;
  visited: boolean;
}

interface StatusEvent {
  status: string;
  date: string;
  note: string;
}

interface TripDetail {
  id: string;
  title: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  description: string;
  coverEmoji: string;
  sites: TripSite[];
  statusHistory: StatusEvent[];
}

const STATUS_STEPS: { key: TripStatus; label: string }[] = [
  { key: 'planning', label: '计划中' },
  { key: 'confirmed', label: '已确认' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
];

const STATUS_COLORS: Record<TripStatus, string> = {
  planning: '#6366F1',
  confirmed: '#22C55E',
  in_progress: '#F59E0B',
  completed: '#D4A855',
  cancelled: '#64748B',
};

const MOCK_TRIP_DETAILS: Record<string, TripDetail> = {
  '1': {
    id: '1',
    title: '东亚佛教朝圣之旅',
    status: 'in_progress',
    startDate: '2026-04-01',
    endDate: '2026-04-14',
    description: '从洛阳白马寺出发，途经少林寺，探访中国佛教祖庭，最终到达日本奈良东大寺，感受佛教东传的历史脉络。',
    coverEmoji: '☸️',
    sites: [
      { id: 's1', nameZh: '白马寺', nameEn: 'White Horse Temple', country: '中国', emoji: '🏛', order: 1, visited: true },
      { id: 's2', nameZh: '少林寺', nameEn: 'Shaolin Temple', country: '中国', emoji: '🥋', order: 2, visited: true },
      { id: 's3', nameZh: '灵隐寺', nameEn: 'Lingyin Temple', country: '中国', emoji: '⛰️', order: 3, visited: false },
      { id: 's4', nameZh: '法隆寺', nameEn: 'Horyu-ji', country: '日本', emoji: '🇯🇵', order: 4, visited: false },
      { id: 's5', nameZh: '东大寺', nameEn: 'Todai-ji', country: '日本', emoji: '🦌', order: 5, visited: false },
    ],
    statusHistory: [
      { status: '创建行程', date: '2026-03-15', note: '开始规划东亚佛教朝圣路线' },
      { status: '确认行程', date: '2026-03-25', note: '预订机票和住宿完成' },
      { status: '开始旅程', date: '2026-04-01', note: '从洛阳白马寺启程' },
    ],
  },
  '2': {
    id: '2',
    title: '中东三教圣地巡礼',
    status: 'planning',
    startDate: '2026-06-15',
    endDate: '2026-06-25',
    description: '探访犹太教、基督教、伊斯兰教三大宗教的圣地，感受不同信仰的和谐共存。',
    coverEmoji: '🕌',
    sites: [
      { id: 's6', nameZh: '圣墓教堂', nameEn: 'Church of the Holy Sepulchre', country: '以色列', emoji: '✝️', order: 1, visited: false },
      { id: 's7', nameZh: '西墙', nameEn: 'Western Wall', country: '以色列', emoji: '✡️', order: 2, visited: false },
      { id: 's8', nameZh: '圆顶清真寺', nameEn: 'Dome of the Rock', country: '以色列', emoji: '☪️', order: 3, visited: false },
      { id: 's9', nameZh: '圣诞教堂', nameEn: 'Church of the Nativity', country: '巴勒斯坦', emoji: '⭐', order: 4, visited: false },
    ],
    statusHistory: [
      { status: '创建行程', date: '2026-03-20', note: '开始规划中东朝圣路线' },
    ],
  },
  '3': {
    id: '3',
    title: '印度灵性觉醒之旅',
    status: 'completed',
    startDate: '2026-01-10',
    endDate: '2026-01-22',
    description: '菩提伽耶禅修、瓦拉纳西恒河朝圣、阿姆利则金庙参访，深度体验印度灵性文化。',
    coverEmoji: '🕉️',
    sites: [
      { id: 's10', nameZh: '菩提伽耶', nameEn: 'Bodh Gaya', country: '印度', emoji: '🧘', order: 1, visited: true },
      { id: 's11', nameZh: '鹿野苑', nameEn: 'Sarnath', country: '印度', emoji: '🦌', order: 2, visited: true },
      { id: 's12', nameZh: '恒河', nameEn: 'Ganges', country: '印度', emoji: '🌊', order: 3, visited: true },
      { id: 's13', nameZh: '金庙', nameEn: 'Golden Temple', country: '印度', emoji: '🪯', order: 4, visited: true },
      { id: 's14', nameZh: '瑞诗凯诗', nameEn: 'Rishikesh', country: '印度', emoji: '🕉️', order: 5, visited: true },
      { id: 's15', nameZh: '泰姬陵', nameEn: 'Taj Mahal', country: '印度', emoji: '🕌', order: 6, visited: true },
    ],
    statusHistory: [
      { status: '创建行程', date: '2025-12-01', note: '规划印度灵性之旅' },
      { status: '确认行程', date: '2025-12-20', note: '签证办理完成，机票已预订' },
      { status: '开始旅程', date: '2026-01-10', note: '抵达菩提伽耶' },
      { status: '完成旅程', date: '2026-01-22', note: '圆满完成所有圣地朝圣' },
    ],
  },
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const trip = MOCK_TRIP_DETAILS[id || '1'];

  if (!trip) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>行程不存在</Text>
      </View>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === trip.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <Text style={styles.headerEmoji}>{trip.coverEmoji}</Text>
        <Text style={styles.headerTitle}>{trip.title}</Text>
        <Text style={styles.headerDate}>
          {trip.startDate} ~ {trip.endDate}
        </Text>
        <Text style={styles.headerDescription}>{trip.description}</Text>
      </Animated.View>

      {/* Status step indicator */}
      <Animated.View entering={FadeInDown.duration(300).delay(100)} style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>行程状态</Text>
        <View style={styles.steps}>
          {STATUS_STEPS.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const stepColor = isActive ? STATUS_COLORS[step.key] : colors.textMuted;
            return (
              <View key={step.key} style={styles.stepRow}>
                <View style={styles.stepIndicator}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: isActive ? stepColor : 'transparent',
                        borderColor: stepColor,
                      },
                      isCurrent && styles.stepDotCurrent,
                    ]}
                  >
                    {isActive && (
                      <Ionicons name="checkmark" size={12} color={colors.white} />
                    )}
                  </View>
                  {index < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor: index < currentStepIndex
                            ? STATUS_COLORS[STATUS_STEPS[index + 1].key]
                            : colors.border,
                        },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && { color: stepColor },
                    isCurrent && { fontWeight: '700' },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Sites list */}
      <Animated.View entering={FadeInDown.duration(300).delay(200)} style={styles.sitesSection}>
        <Text style={styles.sectionTitle}>朝圣路线 ({trip.sites.length} 站)</Text>
        {trip.sites.map((site, index) => (
          <Animated.View
            key={site.id}
            entering={FadeInRight.duration(300).delay(300 + index * 80)}
          >
            <View style={styles.siteCard}>
              <View style={styles.siteOrder}>
                <Text style={styles.siteOrderText}>{site.order}</Text>
                {index < trip.sites.length - 1 && <View style={styles.siteConnector} />}
              </View>
              <View style={styles.siteContent}>
                <View style={styles.siteHeader}>
                  <Text style={styles.siteEmoji}>{site.emoji}</Text>
                  <View style={styles.siteInfo}>
                    <Text style={styles.siteName}>{site.nameZh}</Text>
                    <Text style={styles.siteNameEn}>{site.nameEn}</Text>
                  </View>
                  {site.visited && (
                    <View style={styles.visitedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={styles.visitedText}>已到访</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.siteCountry}>{site.country}</Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Action buttons */}
      <Animated.View entering={FadeInDown.duration(300).delay(400)} style={styles.actions}>
        {trip.status === 'planning' && (
          <>
            <Pressable style={styles.primaryButton}>
              <Ionicons name="checkmark-circle" size={20} color={colors.backgroundDark} />
              <Text style={styles.primaryButtonText}>确认行程</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton}>
              <Ionicons name="create" size={20} color={colors.gold} />
              <Text style={styles.secondaryButtonText}>编辑行程</Text>
            </Pressable>
          </>
        )}
        {trip.status === 'confirmed' && (
          <Pressable style={styles.primaryButton}>
            <Ionicons name="walk" size={20} color={colors.backgroundDark} />
            <Text style={styles.primaryButtonText}>开始旅程</Text>
          </Pressable>
        )}
        {trip.status === 'in_progress' && (
          <>
            <Pressable style={styles.primaryButton}>
              <Ionicons name="location" size={20} color={colors.backgroundDark} />
              <Text style={styles.primaryButtonText}>打卡签到</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton}>
              <Ionicons name="create" size={20} color={colors.gold} />
              <Text style={styles.secondaryButtonText}>写朝圣日记</Text>
            </Pressable>
          </>
        )}
        {trip.status === 'completed' && (
          <Pressable style={styles.secondaryButton}>
            <Ionicons name="share-social" size={20} color={colors.gold} />
            <Text style={styles.secondaryButtonText}>分享朝圣经历</Text>
          </Pressable>
        )}
      </Animated.View>

      {/* Status timeline */}
      <Animated.View entering={FadeInDown.duration(300).delay(500)} style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>状态记录</Text>
        {trip.statusHistory.map((event, index) => (
          <View key={index} style={styles.timelineItem}>
            <View style={styles.timelineDot}>
              <View
                style={[
                  styles.timelineDotInner,
                  index === trip.statusHistory.length - 1 && styles.timelineDotActive,
                ]}
              />
              {index < trip.statusHistory.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineStatus}>{event.status}</Text>
              <Text style={styles.timelineNote}>{event.note}</Text>
              <Text style={styles.timelineDate}>{event.date}</Text>
            </View>
          </View>
        ))}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.gold,
    textAlign: 'center',
  },
  headerDate: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  headerDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  stepsContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepRow: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepDotCurrent: {
    shadowColor: '#D4A855',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  stepLine: {
    position: 'absolute',
    height: 2,
    left: '50%',
    right: '-50%',
    top: 13,
  },
  stepLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  sitesSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  siteCard: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  siteOrder: {
    alignItems: 'center',
    width: 36,
    marginRight: spacing.md,
  },
  siteOrderText: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 168, 85, 0.15)',
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.gold,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
    overflow: 'hidden',
  },
  siteConnector: {
    width: 2,
    height: 32,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  siteContent: {
    flex: 1,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  siteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  siteEmoji: {
    fontSize: 24,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  siteNameEn: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  visitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  visitedText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  siteCountry: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginLeft: 32 + spacing.sm,
  },
  actions: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 168, 85, 0.1)',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.gold,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  timelineSection: {
    marginHorizontal: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  timelineDot: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.md,
  },
  timelineDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textMuted,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  timelineStatus: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  timelineNote: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: 2,
  },
  timelineDate: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 4,
  },
});
