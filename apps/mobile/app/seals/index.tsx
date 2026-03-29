import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { api, Seal } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const SERIES = [
  { value: '', label: '全部' },
  { value: '初印系', label: '初印系' },
  { value: '中印系', label: '中印系' },
  { value: '印果印', label: '印果印' },
  { value: '成道印', label: '成道印' },
  { value: '归源印', label: '归源印' },
];

const seriesColors: Record<string, string> = {
  '初印系': '#06B6D4',
  '中印系': '#3B82F6',
  '印果印': '#8B5CF6',
  '成道印': '#EF4444',
  '归源印': '#D4A855',
};

export default function SealsListScreen() {
  const router = useRouter();
  const [seals, setSeals] = useState<Seal[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (series?: string) => {
    try {
      const data = await api.getSeals(series || undefined);
      setSeals(data);
    } catch (err) {
      console.error('Failed to fetch seals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleFilter = (s: string) => {
    setFilter(s);
    setLoading(true);
    fetchData(s || undefined);
  };

  return (
    <View style={st.container}>
      <Stack.Screen options={{ title: '三十印', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />

      <FlatList
        data={SERIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={st.filterBar}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <Pressable style={[st.chip, filter === item.value && st.chipActive]} onPress={() => handleFilter(item.value)}>
            <Text style={[st.chipText, filter === item.value && st.chipTextActive]}>{item.label}</Text>
          </Pressable>
        )}
      />

      {loading ? <LoadingView /> : seals.length === 0 ? (
        <View style={st.empty}><Text style={st.emptyText}>暂无印</Text></View>
      ) : (
        <FlatList
          data={seals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={st.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(filter || undefined); }} tintColor={colors.gold} />}
          renderItem={({ item }) => {
            const sColor = seriesColors[item.series] || colors.gold;
            return (
              <Pressable
                style={({ pressed }) => [st.card, pressed && { opacity: 0.9 }]}
                onPress={() => router.push(`/seals/${item.id}` as never)}
              >
                <View style={[st.numberBadge, { backgroundColor: sColor }]}>
                  <Text style={st.numberText}>{item.number}</Text>
                </View>
                <View style={st.cardBody}>
                  <View style={st.cardHeader}>
                    <Text style={st.cardTitle} numberOfLines={1}>{item.name}</Text>
                    <Text style={[st.cardSeries, { color: sColor }]}>{item.series}</Text>
                  </View>
                  <Text style={st.cardPoem} numberOfLines={2}>{item.poem}</Text>
                </View>
              </Pressable>
            );
          }}
          ListFooterComponent={<Text style={st.total}>共 {seals.length} 印</Text>}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterBar: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.backgroundCardSolid, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  card: { flexDirection: 'row', backgroundColor: colors.backgroundCardSolid, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.md },
  numberBadge: { width: 50, justifyContent: 'center', alignItems: 'center' },
  numberText: { color: '#FFFFFF', fontSize: fontSize.xl, fontWeight: '800' },
  cardBody: { flex: 1, padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  cardSeries: { fontSize: fontSize.xs, fontWeight: '600' },
  cardPoem: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, fontStyle: 'italic' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.lg },
  total: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.sm, paddingVertical: spacing.lg },
});
