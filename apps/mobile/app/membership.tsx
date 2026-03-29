import React, { useState, useCallback } from 'react';
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  const mem = membership;
  const accent = mem ? levelColor(mem.level) : GOLD;
  const progressPct = mem && mem.nextLevelPoints
    ? Math.min(100, Math.round((mem.points / mem.nextLevelPoints) * 100))
    : 100;

  // Build calendar grid for current month
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDow = new Date(calYear, calMonth - 1, 1).getDay();
  const calCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const alreadyCheckedIn = checkedDates.includes(todayStr);

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

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <QuickLink icon="gift" label="积分商城" color="#F59E0B" onPress={() => router.push('/points-mall' as never)} />
        <QuickLink icon="people" label="分销中心" color="#22C55E" onPress={() => router.push('/referral' as never)} />
        <QuickLink icon="cube" label="我的套餐" color={PRIMARY} onPress={() => router.push('/packages' as never)} />
        <QuickLink icon="ticket" label="我的优惠券" color="#EC4899" onPress={() => router.push('/coupons' as never)} />
      </View>

      {/* Checkin Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={20} color={accent} />
          <Text style={styles.cardTitle}>每日签到</Text>
          <Text style={styles.cardSubtitle}>累计签到 {mem?.totalCheckins ?? 0} 天</Text>
        </View>

        {/* Calendar grid */}
        <View style={styles.calGrid}>
          {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
            <Text key={d} style={styles.calDow}>{d}</Text>
          ))}
          {calCells.map((day, idx) => {
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

        <Pressable
          style={[styles.checkinBtn, { backgroundColor: alreadyCheckedIn ? '#E5E7EB' : accent }, checkingIn && styles.btnDisabled]}
          onPress={alreadyCheckedIn ? undefined : handleCheckin}
          disabled={alreadyCheckedIn || checkingIn}
        >
          {checkingIn ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.checkinBtnText, alreadyCheckedIn && styles.checkinBtnTextDone]}>
              {alreadyCheckedIn ? '今日已签到' : '立即签到 +10积分'}
            </Text>
          )}
        </Pressable>
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

  checkinBtn: {
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  checkinBtnText: { color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: '700' },
  checkinBtnTextDone: { color: colors.textMuted },

  pointsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  pointsLeft: { flex: 1 },
  pointsDesc: { fontSize: fontSize.md, color: colors.textPrimary },
  pointsDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  pointsAmount: { fontSize: fontSize.lg, fontWeight: '700' },
  pointsPos: { color: '#22C55E' },
  pointsNeg: { color: colors.error },

  separator: { height: 1, backgroundColor: '#F3F4F6' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.md, textAlign: 'center', paddingVertical: spacing.lg },
});
