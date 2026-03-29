import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { api, fetchPriceTrend, PriceTrendResponse } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const PERIODS = [
  { days: 7, label: '7天' },
  { days: 30, label: '30天' },
  { days: 90, label: '90天' },
];

const BAR_HEIGHT = 140;

function TrendBars({ trend }: { trend: PriceTrendResponse }) {
  const points = trend.trend;
  if (points.length < 2) return null;

  const prices = points.map(p => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;

  // Sample to max 15 bars for readability
  const step = Math.max(1, Math.floor(points.length / 15));
  const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);

  return (
    <View style={s.chartContainer}>
      <View style={s.yAxis}>
        <Text style={s.yLabel}>¥{maxP}</Text>
        <Text style={s.yLabel}>¥{Math.round((maxP + minP) / 2)}</Text>
        <Text style={s.yLabel}>¥{minP}</Text>
      </View>
      <View style={s.barsArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.barsRow}>
          {sampled.map((p, i) => {
            const h = Math.max(4, ((p.price - minP) / range) * BAR_HEIGHT);
            return (
              <View key={i} style={s.barCol}>
                <View style={[s.bar, { height: h }]} />
                <Text style={s.barLabel}>{p.date.slice(5)}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export default function PriceTrendScreen() {
  const [routeId, setRouteId] = useState('');
  const [routes, setRoutes] = useState<{ id: string; title: string }[]>([]);
  const [days, setDays] = useState(30);
  const [data, setData] = useState<PriceTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRoutes().then(res => {
      const list = res.items || [];
      setRoutes(list.map(r => ({ id: r.id, title: r.title })));
      if (list.length > 0) setRouteId(list[0].id);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!routeId) return;
    setLoading(true);
    fetchPriceTrend(routeId, days)
      .then(setData)
      .catch(err => console.error('Failed to fetch trend:', err))
      .finally(() => setLoading(false));
  }, [routeId, days]);

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: '价格趋势', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />

      <ScrollView contentContainerStyle={s.content}>
        {/* Route selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterBar}>
          {routes.map(r => (
            <Pressable key={r.id} style={[s.chip, routeId === r.id && s.chipActive]} onPress={() => setRouteId(r.id)}>
              <Text style={[s.chipText, routeId === r.id && s.chipTextActive]} numberOfLines={1}>{r.title}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Period selector */}
        <View style={s.periodRow}>
          {PERIODS.map(p => (
            <Pressable key={p.days} style={[s.periodBtn, days === p.days && s.periodBtnActive]} onPress={() => setDays(p.days)}>
              <Text style={[s.periodText, days === p.days && s.periodTextActive]}>{p.label}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? <LoadingView /> : !data ? (
          <View style={s.empty}><Text style={s.emptyText}>暂无趋势数据</Text></View>
        ) : (
          <>
            <TrendBars trend={data} />

            {/* Stats */}
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Text style={s.statLabel}>最低价</Text>
                <Text style={[s.statValue, { color: '#10B981' }]}>¥{data.minPrice}</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statLabel}>平均价</Text>
                <Text style={s.statValue}>¥{Math.round(data.avgPrice)}</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statLabel}>最高价</Text>
                <Text style={[s.statValue, { color: '#EF4444' }]}>¥{data.maxPrice}</Text>
              </View>
            </View>

            {data.recommendation && (
              <View style={s.recCard}>
                <Ionicons name="bulb-outline" size={16} color={colors.gold} />
                <Text style={s.recText}>{data.recommendation}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  filterBar: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.backgroundCardSolid, borderWidth: 1, borderColor: colors.border, maxWidth: 140 },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  periodRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm, marginVertical: spacing.sm },
  periodBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm, backgroundColor: colors.backgroundCardSolid, borderWidth: 1, borderColor: colors.border },
  periodBtnActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  periodText: { fontSize: fontSize.sm, color: colors.textSecondary },
  periodTextActive: { color: '#FFFFFF', fontWeight: '700' },
  chartContainer: { flexDirection: 'row', marginHorizontal: spacing.md, marginVertical: spacing.md, backgroundColor: colors.backgroundCardSolid, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  yAxis: { width: 46, justifyContent: 'space-between', height: BAR_HEIGHT, paddingVertical: 2 },
  yLabel: { fontSize: 9, color: colors.textMuted, textAlign: 'right' },
  barsArea: { flex: 1 },
  barsRow: { alignItems: 'flex-end', gap: 6, paddingRight: spacing.sm },
  barCol: { alignItems: 'center', width: 20 },
  bar: { width: 12, backgroundColor: colors.gold, borderRadius: 3 },
  barLabel: { fontSize: 8, color: colors.textMuted, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.sm },
  statCard: { flex: 1, backgroundColor: colors.backgroundCardSolid, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center' },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, marginBottom: 4 },
  statValue: { fontSize: fontSize.lg, fontWeight: '800', color: colors.textPrimary },
  recCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginHorizontal: spacing.md, marginTop: spacing.md, padding: spacing.md, backgroundColor: 'rgba(212,168,85,0.08)', borderRadius: borderRadius.lg },
  recText: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.lg },
});
