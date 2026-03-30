import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { api, Religion, Teaching } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

export default function TeachingsListScreen() {
  const router = useRouter();
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { api.getReligions().then(setReligions).catch((err) => { console.error('Load religions failed:', err); }); }, []);

  const fetchData = useCallback(async (religionId?: string) => {
    try {
      const data = await api.getTeachings(religionId || undefined);
      setTeachings(data);
    } catch (err) {
      console.error('Failed to fetch teachings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleFilter = (id: string) => {
    setFilter(id);
    setLoading(true);
    fetchData(id || undefined);
  };

  const religionMap = Object.fromEntries(religions.map(r => [r.id, r]));

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: '祖训', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />

      <FlatList
        data={[{ id: '', name: '全部' }, ...religions.map(r => ({ id: r.id, name: r.name }))]}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterBar}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={[s.chip, filter === item.id && s.chipActive]} onPress={() => handleFilter(item.id)}>
            <Text style={[s.chipText, filter === item.id && s.chipTextActive]}>{item.name}</Text>
          </Pressable>
        )}
      />

      {loading ? <LoadingView /> : teachings.length === 0 ? (
        <View style={s.empty}><Text style={s.emptyText}>暂无祖训</Text></View>
      ) : (
        <FlatList
          data={teachings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(filter || undefined); }} tintColor={colors.gold} />}
          renderItem={({ item }) => {
            const rel = religionMap[item.religionId];
            return (
              <Pressable
                style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
                onPress={() => router.push(`/teachings/${item.id}` as never)}
              >
                <View style={s.cardBody}>
                  <View style={s.cardHeader}>
                    <Text style={s.cardTitle} numberOfLines={1}>{item.name}</Text>
                    {rel && <Text style={s.cardBadge}>{rel.symbol} {rel.name}</Text>}
                  </View>
                  <Text style={s.cardQuote} numberOfLines={3}>
                    "{item.originalText}"
                  </Text>
                  {item.sourceText && (
                    <Text style={s.cardSource} numberOfLines={1}>— {item.sourceText}</Text>
                  )}
                </View>
              </Pressable>
            );
          }}
          ListFooterComponent={<Text style={s.total}>共 {teachings.length} 条祖训</Text>}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filterBar: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.backgroundCardSolid, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { color: colors.textSecondary, fontSize: fontSize.sm },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xxl },
  card: { backgroundColor: colors.backgroundCardSolid, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  cardBody: { padding: spacing.md },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  cardBadge: { fontSize: fontSize.xs, color: colors.gold, backgroundColor: 'rgba(0, 102, 255, 0.08)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  cardQuote: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22, fontStyle: 'italic' },
  cardSource: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'right' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.lg },
  total: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.sm, paddingVertical: spacing.lg },
});
