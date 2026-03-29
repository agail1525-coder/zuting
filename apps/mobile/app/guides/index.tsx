import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { fetchGuides, GuideItem } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const TAGS = [
  { value: '', label: '全部' },
  { value: 'guide', label: '攻略' },
  { value: 'journal', label: '游记' },
  { value: 'culture', label: '文化' },
  { value: 'tips', label: '旅行贴士' },
];

export default function GuidesListScreen() {
  const router = useRouter();
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (t?: string) => {
    try {
      const currentTag = t ?? tag;
      const res = await fetchGuides({ tag: currentTag || undefined, page: 1 });
      setGuides(Array.isArray(res.items) ? res.items : []);
    } catch (err) {
      console.error('Failed to fetch guides:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tag]);

  useEffect(() => { fetchData(); }, []);

  const handleTag = (t: string) => {
    setTag(t);
    setLoading(true);
    fetchData(t);
  };

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: '攻略社区', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold, headerRight: () => (
        <Pressable onPress={() => router.push('/write-guide' as never)} style={{ paddingRight: spacing.md }}>
          <Ionicons name="create-outline" size={22} color={colors.gold} />
        </Pressable>
      )}} />

      <FlatList
        data={TAGS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterBar}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <Pressable style={[s.chip, tag === item.value && s.chipActive]} onPress={() => handleTag(item.value)}>
            <Text style={[s.chipText, tag === item.value && s.chipTextActive]}>{item.label}</Text>
          </Pressable>
        )}
      />

      {loading ? <LoadingView /> : guides.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
          <Text style={s.emptyText}>暂无攻略</Text>
          <Pressable style={s.emptyBtn} onPress={() => router.push('/write-guide' as never)}>
            <Text style={s.emptyBtnText}>写一篇攻略</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={guides}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.gold} />}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
              onPress={() => router.push(`/community/guide/${item.id}` as never)}
            >
              {item.coverImage ? (
                <Image source={{ uri: item.coverImage }} style={s.cardImage} resizeMode="cover" />
              ) : (
                <View style={[s.cardImage, { backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="document-text" size={28} color="#CBD5E1" />
                </View>
              )}
              <View style={s.cardBody}>
                <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={s.cardFooter}>
                  {item.user && <Text style={s.cardAuthor}>{item.user.nickname}</Text>}
                  <View style={s.cardStats}>
                    <Ionicons name="eye-outline" size={12} color={colors.textMuted} />
                    <Text style={s.cardStatText}>{item.viewCount}</Text>
                    <Ionicons name="heart-outline" size={12} color={colors.textMuted} />
                    <Text style={s.cardStatText}>{item.likeCount}</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          )}
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
  cardImage: { width: 110, height: 100 },
  cardBody: { flex: 1, padding: spacing.md, justifyContent: 'space-between' },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  cardAuthor: { fontSize: fontSize.xs, color: colors.gold },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardStatText: { fontSize: fontSize.xs, color: colors.textMuted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingTop: 80 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.lg },
  emptyBtn: { backgroundColor: colors.gold, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: fontSize.md },
});
