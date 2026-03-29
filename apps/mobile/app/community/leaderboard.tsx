import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { fetchLeaderboard, LeaderboardEntry } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const TYPES = [
  { key: 'guide', label: '游记达人', icon: '📖', unit: '篇' },
  { key: 'review', label: '评价达人', icon: '⭐', unit: '条' },
  { key: 'pilgrim', label: '朝圣达人', icon: '🕌', unit: '个' },
];

const PERIODS = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'all', label: '全部' },
];

const MEDAL_COLORS = ['#D4A855', '#C0C0C0', '#CD7F32'];

export default function LeaderboardScreen() {
  const [type, setType] = useState('guide');
  const [period, setPeriod] = useState('month');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(type, period)
      .then(setEntries)
      .catch(err => console.error('Failed to fetch leaderboard:', err))
      .finally(() => setLoading(false));
  }, [type, period]);

  const currentType = TYPES.find(t => t.key === type) || TYPES[0];

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: '排行榜', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />

      {/* Type tabs */}
      <View style={s.tabRow}>
        {TYPES.map(t => (
          <Pressable key={t.key} style={[s.tab, type === t.key && s.tabActive]} onPress={() => setType(t.key)}>
            <Text style={s.tabEmoji}>{t.icon}</Text>
            <Text style={[s.tabText, type === t.key && s.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Period pills */}
      <View style={s.periodRow}>
        {PERIODS.map(p => (
          <Pressable key={p.key} style={[s.pill, period === p.key && s.pillActive]} onPress={() => setPeriod(p.key)}>
            <Text style={[s.pillText, period === p.key && s.pillTextActive]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? <LoadingView /> : entries.length === 0 ? (
        <View style={s.empty}><Text style={s.emptyText}>暂无排行数据</Text></View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={s.list}
          renderItem={({ item, index }) => (
            <View style={s.row}>
              <View style={s.rankCol}>
                {index < 3 ? (
                  <View style={[s.medal, { backgroundColor: MEDAL_COLORS[index] }]}>
                    <Text style={s.medalText}>{index + 1}</Text>
                  </View>
                ) : (
                  <Text style={s.rankNum}>{item.rank || index + 1}</Text>
                )}
              </View>
              <View style={s.avatarPlaceholder}>
                <Text style={s.avatarInitial}>{(item.nickname || '?')[0]}</Text>
              </View>
              <View style={s.rowBody}>
                <Text style={s.nickname} numberOfLines={1}>{item.nickname}</Text>
              </View>
              <View style={s.countCol}>
                <Text style={s.countValue}>{item.count}</Text>
                <Text style={s.countUnit}>{currentType.unit}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingTop: spacing.md, gap: spacing.sm },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: borderRadius.lg, backgroundColor: colors.backgroundCardSolid, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: 'rgba(212,168,85,0.1)', borderColor: colors.gold },
  tabEmoji: { fontSize: 20, marginBottom: 2 },
  tabText: { fontSize: fontSize.xs, color: colors.textMuted },
  tabTextActive: { color: colors.gold, fontWeight: '700' },
  periodRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  pill: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.backgroundCardSolid, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  pillText: { fontSize: fontSize.sm, color: colors.textSecondary },
  pillTextActive: { color: '#FFFFFF', fontWeight: '700' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundCardSolid, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
  rankCol: { width: 32, alignItems: 'center' },
  medal: { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  medalText: { color: '#FFFFFF', fontSize: fontSize.sm, fontWeight: '800' },
  rankNum: { fontSize: fontSize.md, fontWeight: '700', color: colors.textMuted },
  avatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(212,168,85,0.15)', justifyContent: 'center', alignItems: 'center', marginHorizontal: spacing.sm },
  avatarInitial: { fontSize: fontSize.md, fontWeight: '700', color: colors.gold },
  rowBody: { flex: 1 },
  nickname: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  countCol: { alignItems: 'flex-end' },
  countValue: { fontSize: fontSize.lg, fontWeight: '800', color: colors.gold },
  countUnit: { fontSize: fontSize.xs, color: colors.textMuted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.lg },
});
