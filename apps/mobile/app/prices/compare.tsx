import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { fetchCheapestRoutes, PriceCompareItem } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const LEVEL_COLORS: Record<string, string> = {
  cheap: '#10B981',
  normal: '#F59E0B',
  expensive: '#EF4444',
};

const LEVEL_LABELS: Record<string, string> = {
  cheap: '低价',
  normal: '适中',
  expensive: '高价',
};

export default function PriceCompareScreen() {
  const router = useRouter();
  const [items, setItems] = useState<PriceCompareItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheapestRoutes(20)
      .then(setItems)
      .catch(err => console.error('Failed to fetch price compare:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: '价格比价', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />

      {loading ? <LoadingView /> : items.length === 0 ? (
        <View style={s.empty}><Text style={s.emptyText}>暂无比价数据</Text></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.routeId}
          contentContainerStyle={s.list}
          renderItem={({ item, index }) => {
            const levelColor = LEVEL_COLORS[item.priceLevel] || colors.textMuted;
            return (
              <Pressable
                style={({ pressed }) => [s.card, pressed && { opacity: 0.9 }]}
                onPress={() => router.push(`/routes/${item.routeId}` as never)}
              >
                <View style={s.rank}>
                  <Text style={[s.rankText, index < 3 && { color: colors.gold, fontWeight: '800' }]}>#{index + 1}</Text>
                </View>
                <View style={s.cardBody}>
                  <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={s.priceRow}>
                    <Text style={s.currentPrice}>¥{item.currentPrice}</Text>
                    {item.basePrice > item.currentPrice && (
                      <Text style={s.basePrice}>¥{item.basePrice}</Text>
                    )}
                    {item.discount != null && item.discount > 0 && (
                      <View style={[s.discountBadge, { backgroundColor: levelColor + '20' }]}>
                        <Text style={[s.discountText, { color: levelColor }]}>-{Math.round(item.discount * 100)}%</Text>
                      </View>
                    )}
                  </View>
                  <View style={s.metaRow}>
                    <Text style={[s.levelTag, { color: levelColor }]}>{LEVEL_LABELS[item.priceLevel] || item.priceLevel}</Text>
                    <Text style={s.duration}>{item.duration}天</Text>
                    {item.rating != null && (
                      <>
                        <Ionicons name="star" size={10} color="#F59E0B" />
                        <Text style={s.rating}>{item.rating.toFixed(1)}</Text>
                      </>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, paddingBottom: spacing.xxl },
  card: { flexDirection: 'row', backgroundColor: colors.backgroundCardSolid, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: 'hidden' },
  rank: { width: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(212,168,85,0.06)' },
  rankText: { fontSize: fontSize.md, fontWeight: '700', color: colors.textMuted },
  cardBody: { flex: 1, padding: spacing.md },
  cardTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  currentPrice: { fontSize: fontSize.lg, fontWeight: '800', color: colors.gold },
  basePrice: { fontSize: fontSize.sm, color: colors.textMuted, textDecorationLine: 'line-through' },
  discountBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: borderRadius.sm },
  discountText: { fontSize: fontSize.xs, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelTag: { fontSize: fontSize.xs, fontWeight: '600' },
  duration: { fontSize: fontSize.xs, color: colors.textMuted },
  rating: { fontSize: fontSize.xs, color: colors.textMuted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.lg },
});
