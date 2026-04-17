import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchTpPackages, TP_TIER_META, type TpPackageItem, type TpTier } from '../lib/api-pillars';
import { spacing, borderRadius } from '../lib/theme';

const TIERS: TpTier[] = ['LUXURY', 'BUSINESS', 'STANDARD', 'BUDGET'];

type Props = { holySiteId: string };

export function TpPackages({ holySiteId }: Props) {
  const [tier, setTier] = useState<TpTier>('STANDARD');
  const [items, setItems] = useState<TpPackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchTpPackages(holySiteId, tier)
      .then((r) => {
        if (!cancelled) setItems(r);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [holySiteId, tier]);

  const tierMeta = TP_TIER_META[tier];

  return (
    <View style={s.section}>
      <View style={s.head}>
        <Ionicons name="pricetags-outline" size={18} color={tierMeta.color} />
        <Text style={s.title}>旅游配套</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tierRow}>
        {TIERS.map((tn) => {
          const m = TP_TIER_META[tn];
          const active = tn === tier;
          return (
            <Pressable
              key={tn}
              style={[s.tierChip, active && { backgroundColor: m.color }]}
              onPress={() => setTier(tn)}
            >
              <Text style={[s.tierText, active && { color: '#fff' }]}>
                {m.icon} {m.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={s.placeholder}><Text style={s.placeholderText}>加载中…</Text></View>
      ) : items.length === 0 ? (
        <View style={s.placeholder}><Text style={s.placeholderText}>该档位暂无配套</Text></View>
      ) : (
        <View style={s.list}>
          {items.slice(0, 6).map((it) => (
            <View key={it.id} style={[s.card, { borderLeftColor: tierMeta.color }]}>
              {it.coverImage ? (
                <Image source={{ uri: it.coverImage }} style={s.cardImg} resizeMode="cover" />
              ) : (
                <View style={[s.cardImg, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="image-outline" size={28} color="#9ca3af" />
                </View>
              )}
              <View style={s.cardBody}>
                <View style={s.cardCat}>
                  <Text style={[s.cardCatText, { color: tierMeta.color }]}>{it.category}</Text>
                  {it.rating ? (
                    <View style={s.rating}>
                      <Ionicons name="star" size={10} color="#FCD34D" />
                      <Text style={s.ratingText}>{it.rating.toFixed(1)}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={s.cardTitle} numberOfLines={1}>{it.name}</Text>
                {it.description ? <Text style={s.cardDesc} numberOfLines={2}>{it.description}</Text> : null}
                <Text style={[s.price, { color: tierMeta.color }]}>
                  {it.currency === 'CNY' ? '￥' : it.currency} {it.priceFrom.toLocaleString()}起
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  section: { padding: spacing.md, backgroundColor: '#fff' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
  title: { fontSize: 16, color: '#111827', fontWeight: '700' },
  tierRow: { gap: 8, paddingHorizontal: spacing.sm, marginBottom: spacing.md },
  tierChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: borderRadius.md, backgroundColor: '#f3f4f6' },
  tierText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  placeholder: { padding: spacing.lg, alignItems: 'center' },
  placeholderText: { color: '#9ca3af', fontSize: 12 },
  list: { gap: 10, paddingHorizontal: spacing.sm },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderLeftWidth: 4, borderRadius: borderRadius.md, overflow: 'hidden', marginBottom: 8 },
  cardImg: { width: 96, height: 96 },
  cardBody: { flex: 1, padding: 10, justifyContent: 'space-between' },
  cardCat: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardCatText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, color: '#6b7280' },
  cardTitle: { fontSize: 14, color: '#111827', fontWeight: '600', marginTop: 4 },
  cardDesc: { fontSize: 11, color: '#6b7280', lineHeight: 16, marginTop: 2 },
  price: { fontSize: 14, fontWeight: '700', marginTop: 4 },
});
