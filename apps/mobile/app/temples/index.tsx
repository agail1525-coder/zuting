import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { api, Religion, Temple } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

export default function TemplesListScreen() {
  const router = useRouter();
  const [temples, setTemples] = useState<Temple[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    api.getReligions().then(setReligions).catch((err) => { console.error('Load religions failed:', err); });
  }, []);

  const fetchData = useCallback(async (religionId?: string) => {
    try {
      const data = await api.getTemples(religionId || undefined);
      setTemples(data);
    } catch (err) {
      console.error('Failed to fetch temples:', err);
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
      <Stack.Screen options={{ title: '祖庭', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />

      {/* Filter */}
      <FlatList
        data={[{ id: '', name: '全部' }, ...religions.map(r => ({ id: r.id, name: r.name }))]}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterBar}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[s.chip, filter === item.id && s.chipActive]}
            onPress={() => handleFilter(item.id)}
          >
            <Text style={[s.chipText, filter === item.id && s.chipTextActive]}>{item.name}</Text>
          </Pressable>
        )}
      />

      {loading ? <LoadingView /> : temples.length === 0 ? (
        <View style={s.empty}><Text style={s.emptyText}>暂无祖庭</Text></View>
      ) : (
        <FlatList
          data={temples}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(filter || undefined); }} tintColor={colors.gold} />}
          renderItem={({ item }) => {
            const rel = religionMap[item.religionId];
            return (
              <Pressable
                style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
                onPress={() => router.push(`/temples/${item.id}` as never)}
              >
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={s.cardImage} resizeMode="cover" />
                ) : (
                  <View style={[s.cardImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="business" size={28} color="#CBD5E1" />
                  </View>
                )}
                <View style={s.cardBody}>
                  <Text style={s.cardTitle} numberOfLines={1}>{item.name}</Text>
                  {item.nameEn && <Text style={s.cardSubtitle} numberOfLines={1}>{item.nameEn}</Text>}
                  <View style={s.cardMeta}>
                    <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                    <Text style={s.cardMetaText}>{item.country}</Text>
                    {rel && (
                      <>
                        <Text style={s.cardMetaDot}>·</Text>
                        <Text style={s.cardMetaText}>{rel.symbol} {rel.name}</Text>
                      </>
                    )}
                  </View>
                  {item.foundingDate && (
                    <Text style={s.cardDate}>建于 {item.foundingDate}</Text>
                  )}
                </View>
              </Pressable>
            );
          }}
          ListFooterComponent={<Text style={s.total}>共 {temples.length} 座祖庭</Text>}
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
  card: { flexDirection: 'row', backgroundColor: colors.backgroundCardSolid, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.md },
  cardImage: { width: 100, height: 90 },
  cardBody: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  cardSubtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 1 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  cardMetaText: { fontSize: fontSize.xs, color: colors.textMuted },
  cardMetaDot: { fontSize: fontSize.xs, color: colors.textMuted },
  cardDate: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.lg },
  total: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.sm, paddingVertical: spacing.lg },
});
