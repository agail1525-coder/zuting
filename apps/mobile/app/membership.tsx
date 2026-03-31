import React, { useState, useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import {
  fetchMyMembership,
  fetchPointsHistory,
  fetchCheckinCalendar,
  checkin,
  type MembershipData,
  type PointsTransactionItem,
} from '../src/lib/api';

const GOLD = '#D4A855';
const PRIMARY = '#0066FF';

function levelColor(level: string): string {
  switch (level) {
    case 'PLATINUM': return '#8B5CF6';
    case 'GOLD': return GOLD;
    case 'SILVER': return '#9CA3AF';
    default: return '#CD7F32';
  }
}

function levelIcon(level: string): keyof typeof Ionicons.glyphMap {
  switch (level) {
    case 'PLATINUM': return 'diamond';
    case 'GOLD': return 'star';
    case 'SILVER': return 'medal';
    default: return 'ribbon';
  }
}

function levelLabel(level: string): string {
  switch (level) {
    case 'PLATINUM': return '铂金会员';
    case 'GOLD': return '黄金会员';
    case 'SILVER': return '白银会员';
    default: return '青铜会员';
  }
}

export default function MembershipScreen() {
  const router = useRouter();
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [points, setPoints] = useState<PointsTransactionItem[]>([]);
  const [checkedDates, setCheckedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [pointsPage] = useState(1);

  const now = new Date();
  const [calYear] = useState(now.getFullYear());
  const [calMonth] = useState(now.getMonth() + 1);

  const load = useCallback(async () => {
    try {
      const [mem, hist, cal] = await Promise.allSettled([
        fetchMyMembership(),
        fetchPointsHistory(pointsPage),
        fetchCheckinCalendar(calYear, calMonth),
      ]);
      if (mem.status === 'fulfilled') setMembership(mem.value);
      if (hist.status === 'fulfilled') setPoints(hist.value.items);
      if (cal.status === 'fulfilled') setCheckedDates(cal.value.dates);
    } catch {
      // partial failures are handled via allSettled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pointsPage, calYear, calMonth]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  const handleCheckin = async () => {
    setCheckingIn(true);
    try {
      const res = await checkin();
      Alert.alert('签到成功', `获得 ${res.points} 积分，连续签到 ${res.streak} 天！`);
      void load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '签到失败，请稍后重试';
      Alert.alert('签到失败', msg);
    } finally {
      setCheckingIn(false);
    }
  };

  const mem = membership;
  const accent = mem ? levelColor(mem.level) : GOLD;

  const progressPct = useMemo(() => {
    if (mem && mem.nextLevelPoints) {
      return Math.min(100, Math.round((mem.points / mem.nextLevelPoints) * 100));
    }
    return 100;
  }, [mem]);

  // Stats computed from membership data
  const statsData = useMemo(() => ({
    level: mem?.levelName ?? '普通会员',
    points: mem?.points ?? 0,
    streak: mem?.checkinStreak ?? 0,
    totalCheckins: mem?.totalCheckins ?? 0,
    nextLevel: mem?.nextLevel ?? null,
    pointsToNext: mem ? ((mem.nextLevelPoints ?? 0) - mem.points) : 0,
  }), [mem]);

  // Earned points today
  const todayEarned = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return points
      .filter(p => p.createdAt.slice(0, 10) === todayStr && p.amount > 0)
      .reduce((sum, p) => sum + p.amount, 0);
  }, [points]);

  // Build calendar grid for current month
  const calendarData = useMemo(() => {
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();
    const firstDow = new Date(calYear, calMonth - 1, 1).getDay();
    const calCells: (number | null)[] = [
      ...Array(firstDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    return calCells;
  }, [calYear, calMonth]);

  const todayStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const alreadyCheckedIn = checkedDates.includes(todayStr);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hero Banner */}
      <View style={[styles.heroBanner, { backgroundColor: accent }]}>
        <View style={styles.heroRow}>
          <Ionicons name={mem ? levelIcon(mem.level) : 'ribbon'} size={40} color="#FFFFFF" />
          <View style={styles.heroInfo}>
            <Text style={styles.heroLevel}>{mem?.levelName ?? '普通会员'}</Text>
            <Text style={styles.heroPoints}>{(mem?.points ?? 0).toLocaleString()} 积分</Text>
          </View>
          <View style={styles.heroStreakBadge}>
            <Text style={styles.heroStreakNum}>{mem?.checkinStreak ?? 0}</Text>
            <Text style={styles.heroStreakLabel}>连签</Text>
          </View>
        </View>

        {/* Progress bar to next level */}
        {mem?.nextLevel && (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>距 {mem.nextLevel} 还差 {((mem.nextLevelPoints ?? 0) - mem.points).toLocaleString()} 积分</Text>
              <Text style={styles.progressPct}>{progressPct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` as `${number}%` }]} />
            </View>
          </View>
        )}
      </View>

      {/* Stats Overview Card */}
      <View style={styles.statsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statsGridItem}>
            <View style={[styles.statsIconWrap, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
              <Ionicons name="trophy" size={18} color="#6366F1" />
            </View>
            <Text style={styles.statsGridValue}>{levelLabel(mem?.level ?? 'BRONZE')}</Text>
            <Text style={styles.statsGridLabel}>当前等级</Text>
          </View>
          <View style={styles.statsGridItem}>
            <View style={[styles.statsIconWrap, { backgroundColor: 'rgba(212,168,85,0.1)' }]}>
              <Ionicons name="diamond" size={18} color={GOLD} />
            </View>
            <Text style={styles.statsGridValue}>{statsData.points.toLocaleString()}</Text>
            <Text style={styles.statsGridLabel}>可用积分</Text>
          </View>
          <View style={styles.statsGridItem}>
            <View style={[styles.statsIconWrap, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
              <Ionicons name="flame" size={18} color="#22C55E" />
            </View>
            <Text style={styles.statsGridValue}>{statsData.streak}天</Text>
            <Text style={styles.statsGridLabel}>连续签到</Text>
          </View>
          <View style={styles.statsGridItem}>
            <View style={[styles.statsIconWrap, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
              <Ionicons name="sunny" size={18} color="#F59E0B" />
            </View>
            <Text style={styles.statsGridValue}>+{todayEarned}</Text>
            <Text style={styles.statsGridLabel}>今日积分</Text>
          </View>
        </View>
        {statsData.nextLevel && (
          <View style={styles.statsProgressRow}>
            <Ionicons name="arrow-up-circle" size={16} color={accent} />
            <Text style={styles.statsProgressText}>
              再攒 {statsData.pointsToNext.toLocaleString()} 积分升级 {statsData.nextLevel}
            </Text>
            <View style={styles.miniProgressTrack}>
              <View style={[styles.miniProgressFill, { width: `${progressPct}%` as `${number}%`, backgroundColor: accent }]} />
            </View>
            <Text style={styles.miniProgressPct}>{progressPct}%</Text>
          </View>
        )}
      </View>

      {/* Quick Task Buttons */}
      <View style={styles.taskCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="flash" size={20} color="#F59E0B" />
          <Text style={styles.cardTitle}>快速任务</Text>
          <Text style={styles.cardSubtitle}>完成任务赚积分</Text>
        </View>
        <View style={styles.taskGrid}>
          <Pressable
            style={[styles.taskBtn, alreadyCheckedIn && styles.taskBtnDone]}
            onPress={alreadyCheckedIn ? undefined : handleCheckin}
            disabled={alreadyCheckedIn || checkingIn}
          >
            {checkingIn ? (
              <ActivityIndicator size="small" color={accent} />
            ) : (
              <>
                <Ionicons
                  name={alreadyCheckedIn ? 'checkmark-circle' : 'calendar'}
                  size={24}
                  color={alreadyCheckedIn ? '#22C55E' : accent}
                />
                <Text style={[styles.taskBtnLabel, alreadyCheckedIn && styles.taskBtnLabelDone]}>
                  {alreadyCheckedIn ? '已签到' : '签到 +10'}
                </Text>
              </>
            )}
          </Pressable>
          <Pressable
            style={styles.taskBtn}
            onPress={() => router.push('/community' as any)}
          >
            <Ionicons name="share-social" size={24} color="#6366F1" />
            <Text style={styles.taskBtnLabel}>分享 +5</Text>
          </Pressable>
          <Pressable
            style={styles.taskBtn}
            onPress={() => router.push('/write-review' as any)}
          >
            <Ionicons name="star" size={24} color="#EC4899" />
            <Text style={styles.taskBtnLabel}>评价 +20</Text>
          </Pressable>
          <Pressable
            style={styles.taskBtn}
            onPress={() => router.push('/journals/create' as any)}
          >
            <Ionicons name="create" size={24} color="#22C55E" />
            <Text style={styles.taskBtnLabel}>日志 +15</Text>
          </Pressable>
        </View>
      </View>

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <QuickLink icon="gift" label="积分商城" color="#F59E0B" onPress={() => router.push('/points-mall' as any)} />
        <QuickLink icon="people" label="分销中心" color="#22C55E" onPress={() => router.push('/referral' as any)} />
        <QuickLink icon="cube" label="我的套餐" color={PRIMARY} onPress={() => router.push('/packages' as any)} />
        <QuickLink icon="ticket" label="我的优惠券" color="#EC4899" onPress={() => router.push('/coupons' as any)} />
      </View>

      {/* Checkin Card with Calendar */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={20} color={accent} />
          <Text style={styles.cardTitle}>签到日历</Text>
          <Text style={styles.cardSubtitle}>累计 {statsData.totalCheckins} 天</Text>
        </View>

        {/* Calendar grid */}
        <View style={styles.calGrid}>
          {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
            <Text key={d} style={styles.calDow}>{d}</Text>
          ))}
          {calendarData.map((day, idx) => {
            if (day === null) return <View key={`empty-${idx}`} style={styles.calCell} />;
            const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const checked = checkedDates.includes(dateStr);
            const isToday = day === now.getDate();
            return (
              <View
                key={dateStr}
                style={[
                  styles.calCell,
                  checked && styles.calCellChecked,
                  isToday && styles.calCellToday,
                ]}
              >
                <Text style={[styles.calDayText, checked && styles.calDayChecked, isToday && styles.calDayToday]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Points History */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={20} color={accent} />
          <Text style={styles.cardTitle}>积分记录</Text>
        </View>
        {points.length === 0 ? (
          <Text style={styles.emptyText}>暂无积分记录</Text>
        ) : (
          <FlatList
            data={points}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={styles.pointsRow}>
                <View style={styles.pointsLeft}>
                  <Text style={styles.pointsDesc}>{item.description}</Text>
                  <Text style={styles.pointsDate}>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</Text>
                </View>
                <Text style={[styles.pointsAmount, item.amount >= 0 ? styles.pointsPos : styles.pointsNeg]}>
                  {item.amount >= 0 ? '+' : ''}{item.amount}
                </Text>
              </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomCta}>
        <View style={styles.bottomCtaTextWrap}>
          <Ionicons name="gift" size={24} color="#F59E0B" />
          <View style={{ flex: 1 }}>
            <Text style={styles.bottomCtaTitle}>积分商城</Text>
            <Text style={styles.bottomCtaSubtitle}>
              用 {statsData.points.toLocaleString()} 积分兑换精美礼品
            </Text>
          </View>
        </View>
        <Pressable
          style={[styles.bottomCtaBtn, { backgroundColor: accent }]}
          onPress={() => router.push('/points-mall' as any)}
        >
          <Text style={styles.bottomCtaBtnText}>去兑换</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function QuickLink({ icon, label, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickLinkItem} onPress={onPress}>
      <View style={[styles.quickLinkIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickLinkLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  heroBanner: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroInfo: { flex: 1 },
  heroLevel: { color: '#FFFFFF', fontSize: fontSize.xl, fontWeight: '700' },
  heroPoints: { color: 'rgba(255,255,255,0.85)', fontSize: fontSize.md, marginTop: 2 },
  heroStreakBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroStreakNum: { color: '#FFFFFF', fontSize: fontSize.xl, fontWeight: '800' },
  heroStreakLabel: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.xs },

  progressSection: { marginTop: spacing.md },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { color: 'rgba(255,255,255,0.9)', fontSize: fontSize.sm },
  progressPct: { color: '#FFFFFF', fontSize: fontSize.sm, fontWeight: '700' },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: '#FFFFFF', borderRadius: 3 },

  // Stats Overview Card
  statsCard: {
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsGridItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  statsGridValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statsGridLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statsProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statsProgressText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  miniProgressTrack: {
    width: 60,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
  },
  miniProgressFill: {
    height: 4,
    borderRadius: 2,
  },
  miniProgressPct: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },

  // Task Card
  taskCard: {
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  taskGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  taskBtn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  taskBtnDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  taskBtnLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  taskBtnLabelDone: {
    color: '#22C55E',
  },

  quickLinks: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  quickLinkItem: { flex: 1, alignItems: 'center', gap: spacing.xs },
  quickLinkIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  quickLinkLabel: { fontSize: fontSize.xs, color: colors.textSecondary },

  card: {
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  cardSubtitle: { fontSize: fontSize.sm, color: colors.textMuted },

  calGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  calDow: { width: `${100 / 7}%` as `${number}%`, textAlign: 'center', fontSize: fontSize.xs, color: colors.textMuted, paddingVertical: 4 },
  calCell: { width: `${100 / 7}%` as `${number}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  calCellChecked: { backgroundColor: '#D4A85520', borderRadius: borderRadius.full },
  calCellToday: { borderWidth: 1, borderColor: PRIMARY, borderRadius: borderRadius.full },
  calDayText: { fontSize: fontSize.sm, color: colors.textSecondary },
  calDayChecked: { color: GOLD, fontWeight: '700' },
  calDayToday: { color: PRIMARY, fontWeight: '700' },

  pointsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  pointsLeft: { flex: 1 },
  pointsDesc: { fontSize: fontSize.md, color: colors.textPrimary },
  pointsDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  pointsAmount: { fontSize: fontSize.lg, fontWeight: '700' },
  pointsPos: { color: '#22C55E' },
  pointsNeg: { color: colors.error },

  separator: { height: 1, backgroundColor: '#F3F4F6' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', paddingVertical: spacing.lg },

  // Bottom CTA
  bottomCta: {
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  bottomCtaTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  bottomCtaTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bottomCtaSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  bottomCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
  },
  bottomCtaBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
});
