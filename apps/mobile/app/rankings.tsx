import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fetchRankings, type RankingEntry } from '../src/lib/api-pillars';
import { spacing, borderRadius } from '../src/lib/theme';

const BLUE = '#3264ff';

type RankType = 'guide' | 'review' | 'trip' | 'journal';
type Period = 'week' | 'month' | 'all';

const TYPE_META: Record<RankType, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string; unit: string }> = {
  guide:   { label: '攻略王',   icon: 'document-text-outline', color: '#8B6914', unit: '篇' },
  review:  { label: '评价达人', icon: 'star-outline',          color: '#B91C1C', unit: '条' },
  trip:    { label: '行程达人', icon: 'airplane-outline',      color: BLUE,      unit: '程' },
  journal: { label: '日记作家', icon: 'book-outline',          color: '#2D8B6F', unit: '篇' },
};

const PERIOD_META: Record<Period, string> = {
  week:  '本周',
  month: '本月',
  all:   '总榜',
};

export default function RankingsScreen() {
  const router = useRouter();
  const [type, setType] = useState<RankType>('guide');
  const [period, setPeriod] = useState<Period>('month');
  const [items, setItems] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRankings(type, period)
      .then((r) => {
        if (!cancelled) setItems(r);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type, period]);

  const meta = TYPE_META[type];
  const top3 = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <>
      <Stack.Screen options={{ title: '排行榜' }} />
      <ScrollView style={s.container}>
        <LinearGradient colors={['#0f172a', meta.color]} style={s.hero}>
          <Text style={s.heroKicker}>COMMUNITY LEADERBOARD</Text>
          <Text style={s.heroTitle}>{meta.label}榜</Text>
          <Text style={s.heroSub}>{PERIOD_META[period]} · 热度最高</Text>
        </LinearGradient>

        {/* Type tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabs}>
          {(Object.keys(TYPE_META) as RankType[]).map((t) => {
            const m = TYPE_META[t];
            const active = t === type;
            return (
              <Pressable
                key={t}
                style={[s.tab, active && { backgroundColor: m.color }]}
                onPress={() => setType(t)}
              >
                <Ionicons name={m.icon} size={14} color={active ? '#fff' : m.color} />
                <Text style={[s.tabText, active && { color: '#fff' }]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Period picker */}
        <View style={s.periodRow}>
          {(['week', 'month', 'all'] as Period[]).map((p) => {
            const active = p === period;
            return (
              <Pressable
                key={p}
                style={[s.periodChip, active && s.periodChipActive]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[s.periodText, active && s.periodTextActive]}>{PERIOD_META[p]}</Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={s.loadingBox}><ActivityIndicator size="large" color={meta.color} /></View>
        ) : items.length === 0 ? (
          <View style={s.emptyBox}>
            <Ionicons name="trophy-outline" size={48} color="#d1d5db" />
            <Text style={s.emptyText}>暂无数据</Text>
          </View>
        ) : (
          <>
            {/* Top 3 podium */}
            {top3.length > 0 && (
              <View style={s.podium}>
                {top3.map((u) => (
                  <Pressable
                    key={u.userId}
                    style={[s.podiumCard, u.rank === 1 && s.podiumGold, u.rank === 2 && s.podiumSilver, u.rank === 3 && s.podiumBronze]}
                    onPress={() => router.push(`/users/${u.userId}` as never)}
                  >
                    <Text style={s.podiumMedal}>{u.rank === 1 ? '🥇' : u.rank === 2 ? '🥈' : '🥉'}</Text>
                    {u.avatar ? (
                      <Image source={{ uri: u.avatar }} style={s.podiumAvatar} />
                    ) : (
                      <View style={[s.podiumAvatar, { backgroundColor: meta.color, alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{u.nickname.slice(0, 1)}</Text>
                      </View>
                    )}
                    <Text style={s.podiumName} numberOfLines={1}>{u.nickname}</Text>
                    <Text style={[s.podiumCount, { color: meta.color }]}>
                      {u.count} {meta.unit}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Remaining list */}
            {rest.map((u) => (
              <Pressable
                key={u.userId}
                style={s.row}
                onPress={() => router.push(`/users/${u.userId}` as never)}
              >
                <Text style={s.rank}>{u.rank}</Text>
                {u.avatar ? (
                  <Image source={{ uri: u.avatar }} style={s.avatar} />
                ) : (
                  <View style={[s.avatar, { backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: '700' }}>{u.nickname.slice(0, 1)}</Text>
                  </View>
                )}
                <Text style={s.name} numberOfLines={1}>{u.nickname}</Text>
                <Text style={[s.count, { color: meta.color }]}>
                  {u.count} {meta.unit}
                </Text>
              </Pressable>
            ))}
          </>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  hero: { padding: spacing.lg, alignItems: 'center' },
  heroKicker: { fontSize: 11, color: '#FCD34D', letterSpacing: 2, fontWeight: '700' },
  heroTitle: { fontSize: 28, color: '#fff', fontWeight: '700', marginTop: 8 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  tabs: { padding: spacing.md, gap: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: borderRadius.md, backgroundColor: '#f3f4f6' },
  tabText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  periodRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  periodChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: borderRadius.md, backgroundColor: '#f3f4f6' },
  periodChipActive: { backgroundColor: '#111827' },
  periodText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  periodTextActive: { color: '#fff' },
  loadingBox: { padding: spacing.xxl, alignItems: 'center' },
  emptyBox: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { color: '#9ca3af', marginTop: 10 },
  podium: { flexDirection: 'row', gap: 10, padding: spacing.md, alignItems: 'flex-end' },
  podiumCard: { flex: 1, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#fff' },
  podiumGold: { backgroundColor: '#fef3c7', borderColor: '#fcd34d' },
  podiumSilver: { backgroundColor: '#f3f4f6', borderColor: '#d1d5db' },
  podiumBronze: { backgroundColor: '#fed7aa', borderColor: '#fdba74' },
  podiumMedal: { fontSize: 28 },
  podiumAvatar: { width: 48, height: 48, borderRadius: 24, marginTop: 6 },
  podiumName: { fontSize: 12, color: '#111827', fontWeight: '700', marginTop: 6, textAlign: 'center' },
  podiumCount: { fontSize: 14, fontWeight: '700', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rank: { width: 32, fontSize: 14, color: '#6b7280', fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  name: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '600' },
  count: { fontSize: 13, fontWeight: '700' },
});
