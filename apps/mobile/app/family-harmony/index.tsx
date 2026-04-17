import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchFhThemes,
  fetchFhCases,
  type FamilyHarmonyTheme,
  type FamilyHarmonyCase,
} from '../../src/lib/api-pillars';
import { spacing, borderRadius } from '../../src/lib/theme';

const JADE = '#2D8B6F';
const JADE_LIGHT = '#6DB895';

export default function FamilyHarmonyLanding() {
  const router = useRouter();
  const [themes, setThemes] = useState<FamilyHarmonyTheme[]>([]);
  const [cases, setCases] = useState<FamilyHarmonyCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchFhThemes(1, 12), fetchFhCases(1, 6)])
      .then(([t, c]) => {
        setThemes(t.items || []);
        setCases(c.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={JADE} /></View>;

  return (
    <>
      <Stack.Screen options={{ title: '家庭幸福' }} />
      <ScrollView style={s.container}>
        <LinearGradient colors={['#0A2418', '#1B4A36']} style={s.hero}>
          <Text style={s.heroKicker}>M35 · FAMILY HARMONY</Text>
          <Text style={s.heroTitle}>
            家庭<Text style={{ color: JADE_LIGHT }}>幸福</Text>
          </Text>
          <Text style={s.heroSub}>
            家庭的六条归根路 · 六主题深度疗愈{'\n'}
            同心 · 传家 · 和解 · 感恩 · 守护 · 归根
          </Text>
        </LinearGradient>

        <View style={s.section}>
          <Text style={s.sectionKicker}>六大主题</Text>
          <Text style={s.sectionTitle}>家庭六境</Text>
          <Text style={s.sectionSub}>每一主题 · 一次代际和解</Text>
          <View style={s.grid}>
            {themes.map((t) => (
              <Pressable
                key={t.id}
                style={[s.themeCard, { borderLeftColor: t.color || JADE }]}
                onPress={() => router.push(`/family-harmony/themes/${t.slug}` as never)}
              >
                {t.coverUrl ? (
                  <Image source={{ uri: t.coverUrl }} style={s.themeCover} resizeMode="cover" />
                ) : (
                  <View style={[s.themeCover, { backgroundColor: t.color || JADE, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 40 }}>{t.icon ?? '🏡'}</Text>
                  </View>
                )}
                <View style={s.themeBody}>
                  <Text style={s.themeTitle}>{t.title}</Text>
                  {t.subtitle ? <Text style={s.themeSub}>{t.subtitle}</Text> : null}
                  <Text style={s.themeDesc} numberOfLines={2}>{t.description}</Text>
                  <View style={s.themeMeta}>
                    {t.durationDays ? (
                      <Text style={s.metaItem}>⏱ {t.durationDays}天</Text>
                    ) : null}
                    {t.priceFrom ? (
                      <Text style={[s.metaItem, { color: JADE }]}>￥{t.priceFrom.toLocaleString()}起</Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {cases.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionKicker}>家庭案例</Text>
            <Text style={s.sectionTitle}>他们这样和解</Text>
            {cases.map((c) => (
              <Pressable
                key={c.id}
                style={s.caseCard}
                onPress={() => router.push(`/family-harmony/cases/${c.slug}` as never)}
              >
                <View style={s.caseHead}>
                  <View style={s.caseBadge}>
                    <Ionicons name="home-outline" size={14} color={JADE} />
                    <Text style={s.caseBadgeText}>{c.orgType}</Text>
                  </View>
                  {c.theme && (
                    <View style={[s.caseTag, { backgroundColor: (c.theme.color || JADE) + '22' }]}>
                      <Text style={[s.caseTagText, { color: c.theme.color || JADE }]}>{c.theme.title}</Text>
                    </View>
                  )}
                </View>
                <Text style={s.caseName}>{c.teamName}</Text>
                <Text style={s.caseStory} numberOfLines={3}>{c.story}</Text>
                {c.highlights && c.highlights.length > 0 && (
                  <View style={s.highlightRow}>
                    {c.highlights.slice(0, 3).map((h, i) => (
                      <View key={i} style={s.highlightChip}>
                        <Text style={s.highlightText}>✓ {h}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  hero: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  heroKicker: { fontSize: 11, color: JADE_LIGHT, letterSpacing: 2, fontWeight: '700', marginBottom: 10 },
  heroTitle: { fontSize: 30, color: '#fff', fontWeight: '700', lineHeight: 40, marginBottom: 12 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 22 },
  section: { padding: spacing.lg },
  sectionKicker: { fontSize: 11, color: JADE, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  sectionTitle: { fontSize: 22, color: '#111827', fontWeight: '700', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#6b7280', marginBottom: spacing.md, lineHeight: 20 },
  grid: { gap: spacing.md },
  themeCard: { backgroundColor: '#fff', borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#e5e7eb', borderLeftWidth: 4, overflow: 'hidden', marginBottom: spacing.sm },
  themeCover: { width: '100%', height: 140 },
  themeBody: { padding: spacing.md },
  themeTitle: { fontSize: 17, color: '#111827', fontWeight: '700' },
  themeSub: { fontSize: 12, color: JADE, marginTop: 2, letterSpacing: 1 },
  themeDesc: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginTop: 8 },
  themeMeta: { flexDirection: 'row', gap: 14, marginTop: 10 },
  metaItem: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  caseCard: { backgroundColor: '#f0fdf4', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#bbf7d0', marginBottom: spacing.md },
  caseHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  caseBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  caseBadgeText: { fontSize: 11, color: JADE, fontWeight: '700' },
  caseTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
  caseTagText: { fontSize: 11, fontWeight: '700' },
  caseName: { fontSize: 16, color: '#111827', fontWeight: '700' },
  caseStory: { fontSize: 13, color: '#4b5563', lineHeight: 20, marginTop: 6 },
  highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  highlightChip: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#fff', borderRadius: borderRadius.sm, borderWidth: 1, borderColor: '#bbf7d0' },
  highlightText: { fontSize: 11, color: JADE },
});
