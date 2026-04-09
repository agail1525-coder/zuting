import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { api, Religion } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius, religionEmojis, religionGradients } from '../../src/lib/theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReligionsListScreen() {
  const router = useRouter();
  const [religions, setReligions] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await api.getReligions();
      setReligions(data);
    } catch (err) {
      console.error('Failed to fetch religions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingView />;

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: '十二大文化传统', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />
      <FlatList
        data={religions}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
        renderItem={({ item }) => {
          const gradient = religionGradients[item.slug] || ['#6366F1', '#4F46E5'];
          const emoji = religionEmojis[item.slug] || item.symbol || '🌐';
          return (
            <Pressable
              style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
              onPress={() => router.push(`/religions/${item.slug}` as never)}
            >
              <LinearGradient colors={gradient} style={s.cardGradient}>
                <Text style={s.cardEmoji}>{emoji}</Text>
              </LinearGradient>
              <View style={s.cardBody}>
                <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.cardNameEn} numberOfLines={1}>{item.nameEn}</Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={s.empty}><Text style={s.emptyText}>暂无数据</Text></View>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  row: { gap: spacing.md },
  card: {
    flex: 1,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardGradient: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: { fontSize: 36 },
  cardBody: { padding: spacing.md },
  cardName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  cardNameEn: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { color: colors.textMuted, fontSize: fontSize.lg },
});
