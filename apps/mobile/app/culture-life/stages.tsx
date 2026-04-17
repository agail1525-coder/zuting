import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import {
  fetchStages,
  LIFE_STAGE_META,
  type LifeStage,
  type LifeStageGuide,
} from '../../src/lib/api-pillars';
import { spacing, borderRadius } from '../../src/lib/theme';

const BLUE = '#3264ff';
const STAGE_ORDER: LifeStage[] = ['BIRTH', 'GROWTH', 'MARRIAGE', 'CAREER', 'MIDLIFE', 'AGING', 'DEATH'];

export default function StagesScreen() {
  const [items, setItems] = useState<LifeStageGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<LifeStage>('BIRTH');

  useEffect(() => {
    fetchStages()
      .then((r) => setItems(r.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={BLUE} /></View>;
  }

  const filtered = items.filter((it) => it.stage === activeStage);

  return (
    <>
      <Stack.Screen options={{ title: '七阶段' }} />
      <ScrollView style={s.container} stickyHeaderIndices={[1]}>
        <View style={s.hero}>
          <Text style={s.heroKicker}>LIFE STAGES</Text>
          <Text style={s.heroTitle}>生命七阶段</Text>
          <Text style={s.heroSub}>从诞生到临终 · 12 文化传统对每个阶段的智慧指引</Text>
        </View>

        {/* Sticky tabs */}
        <View style={s.tabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsInner}>
            {STAGE_ORDER.map((code) => {
              const m = LIFE_STAGE_META[code];
              const active = code === activeStage;
              return (
                <Pressable
                  key={code}
                  style={[s.tab, active && s.tabActive]}
                  onPress={() => setActiveStage(code)}
                >
                  <Text style={s.tabEmoji}>{m.emoji}</Text>
                  <Text style={[s.tabName, active && s.tabNameActive]}>{m.title}</Text>
                  <Text style={[s.tabAge, active && s.tabAgeActive]}>{m.age}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={s.content}>
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>此阶段暂无数据</Text>
            </View>
          ) : (
            filtered.map((g) => (
              <View
                key={g.id}
                style={[s.card, { borderLeftColor: g.religion?.color || BLUE }]}
              >
                <Text style={s.cardReligion}>
                  {g.religion?.symbol ? `${g.religion.symbol} ` : ''}
                  {g.religion?.name ?? '—'}
                </Text>
                <Text style={s.cardTitle}>{g.title}</Text>
                <Text style={s.cardWisdom}>{g.keyWisdom}</Text>

                {g.rituals && g.rituals.length > 0 && (
                  <View style={s.block}>
                    <Text style={s.blockLabel}>🕯️ 礼仪</Text>
                    {g.rituals.slice(0, 3).map((r, i) => (
                      <View key={i} style={s.bullet}>
                        <Text style={s.bulletTitle}>{r.name}</Text>
                        {r.purpose ? <Text style={s.bulletSub}>{r.purpose}</Text> : null}
                      </View>
                    ))}
                  </View>
                )}

                {g.challenges && g.challenges.length > 0 && (
                  <View style={s.block}>
                    <Text style={s.blockLabel}>🌊 常见挑战</Text>
                    {g.challenges.slice(0, 3).map((c, i) => (
                      <View key={i} style={s.bullet}>
                        <Text style={s.bulletTitle}>{c.challenge}</Text>
                        <Text style={s.bulletSub}>{c.guidance}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {g.scriptureRef ? (
                  <View style={s.scriptRef}>
                    <Text style={s.scriptRefText}>📖 {g.scriptureRef}</Text>
                  </View>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  hero: { padding: spacing.lg, backgroundColor: '#f8faff' },
  heroKicker: { fontSize: 11, color: BLUE, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  heroTitle: { fontSize: 22, color: '#111827', fontWeight: '700' },
  heroSub: { fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 20 },
  tabs: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabsInner: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.md, backgroundColor: '#f3f4f6', alignItems: 'center', minWidth: 64 },
  tabActive: { backgroundColor: BLUE },
  tabEmoji: { fontSize: 18 },
  tabName: { fontSize: 12, color: '#374151', fontWeight: '700', marginTop: 2 },
  tabNameActive: { color: '#fff' },
  tabAge: { fontSize: 9, color: '#9ca3af', marginTop: 2 },
  tabAgeActive: { color: 'rgba(255,255,255,0.8)' },
  content: { padding: spacing.lg },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { color: '#9ca3af' },
  card: { backgroundColor: '#fff', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#e5e7eb', borderLeftWidth: 4, marginBottom: spacing.md },
  cardReligion: { fontSize: 13, color: '#6b7280', fontWeight: '700' },
  cardTitle: { fontSize: 16, color: '#111827', fontWeight: '700', marginTop: 4 },
  cardWisdom: { fontSize: 13, color: '#4b5563', lineHeight: 20, marginTop: 8 },
  block: { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  blockLabel: { fontSize: 11, color: BLUE, fontWeight: '700', marginBottom: 6, letterSpacing: 1 },
  bullet: { marginBottom: 6 },
  bulletTitle: { fontSize: 13, color: '#1f2937', fontWeight: '600' },
  bulletSub: { fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 16 },
  scriptRef: { marginTop: spacing.sm, padding: 8, backgroundColor: '#fef3c7', borderRadius: borderRadius.sm },
  scriptRefText: { fontSize: 11, color: '#92400e', fontStyle: 'italic' },
});
