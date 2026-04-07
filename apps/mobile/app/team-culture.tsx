import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import {
  fetchTeamCultureThemes,
  fetchTeamCases,
  type TeamCultureTheme,
  type TeamCase,
} from '../src/lib/api';

const GOLD = '#D4A855';

export default function TeamCultureScreen() {
  const [themes, setThemes] = useState<TeamCultureTheme[]>([]);
  const [cases, setCases] = useState<TeamCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [t, c] = await Promise.allSettled([fetchTeamCultureThemes(), fetchTeamCases()]);
      setThemes(t.status === 'fulfilled' ? t.value : []);
      setCases(c.status === 'fulfilled' ? c.value : []);
      if (t.status === 'rejected' && c.status === 'rejected') {
        setError('加载失败,请稍后重试');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={GOLD} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: '团队文化', headerTintColor: GOLD }} />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>团队文化打造</Text>
          <Text style={styles.heroSub}>以祖庭文化为载体,深度凝聚团队精神</Text>
          <View style={styles.tagsRow}>
            {['企业', '学校', '宗教组织', 'NGO', '家族', '政府'].map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Themes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主题方案</Text>
          <Text style={styles.sectionSub}>共 {themes.length} 个文化主题</Text>
          {themes.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={48} color={GOLD} />
              <Text style={styles.emptyText}>暂无主题</Text>
            </View>
          ) : (
            themes.map((theme) => (
              <View key={theme.id} style={[styles.themeCard, { borderLeftColor: theme.color || GOLD }]}>
                {theme.coverUrl ? (
                  <Image source={{ uri: theme.coverUrl }} style={styles.themeCover} resizeMode="cover" />
                ) : null}
                <View style={styles.themeBody}>
                  <Text style={styles.themeTitle}>
                    {theme.icon ? `${theme.icon} ` : ''}
                    {theme.title}
                  </Text>
                  {theme.subtitle ? <Text style={styles.themeSub}>{theme.subtitle}</Text> : null}
                  <Text style={styles.themeDesc} numberOfLines={3}>
                    {theme.description}
                  </Text>
                  <View style={styles.keywordRow}>
                    {(theme.keywords || []).slice(0, 4).map((k) => (
                      <View key={k} style={styles.keyword}>
                        <Text style={styles.keywordText}>{k}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.themeMeta}>
                    {theme.priceFrom != null && (
                      <Text style={styles.price}>¥{theme.priceFrom}/人 起</Text>
                    )}
                    {theme.durationDays != null && (
                      <Text style={styles.metaText}>{theme.durationDays} 天</Text>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Cases */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>案例实拍</Text>
          <Text style={styles.sectionSub}>真实团队的朝圣故事</Text>
          {cases.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={GOLD} />
              <Text style={styles.emptyText}>暂无案例</Text>
            </View>
          ) : (
            cases.map((c) => (
              <View key={c.id} style={styles.caseCard}>
                {c.photos?.[0] ? (
                  <Image source={{ uri: c.photos[0] }} style={styles.caseCover} resizeMode="cover" />
                ) : null}
                <View style={styles.caseBody}>
                  <Text style={styles.caseTitle}>{c.teamName}</Text>
                  <Text style={styles.caseMeta}>
                    {c.orgType} · {c.headcount}人{c.industry ? ` · ${c.industry}` : ''}
                  </Text>
                  <Text style={styles.caseStory} numberOfLines={4}>
                    {c.story}
                  </Text>
                  {c.testimonial ? (
                    <Text style={styles.testimonial}>"{c.testimonial}"</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.cta}>
          <Text style={styles.ctaText}>需要定制方案?</Text>
          <Text style={styles.ctaSub}>请前往 PC 端 joinus.com/team-culture 提交咨询</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  hero: {
    padding: spacing.lg,
    backgroundColor: '#1a1410',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2418',
  },
  heroTitle: { fontSize: fontSize.xl + 4, color: GOLD, fontWeight: '700', marginBottom: 6 },
  heroSub: { fontSize: fontSize.md, color: '#bbb', marginBottom: spacing.md },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: GOLD,
  },
  tagText: { color: GOLD, fontSize: fontSize.sm },
  errorBox: { padding: spacing.md, backgroundColor: '#3a1818', margin: spacing.md, borderRadius: borderRadius.md },
  errorText: { color: '#f88', fontSize: fontSize.sm },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, color: '#fff', fontWeight: '700', marginBottom: 4 },
  sectionSub: { fontSize: fontSize.sm, color: '#888', marginBottom: spacing.md },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyText: { color: '#666', marginTop: spacing.sm },
  themeCard: {
    backgroundColor: '#1a1814',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderLeftWidth: 4,
  },
  themeCover: { width: '100%', height: 140 },
  themeBody: { padding: spacing.md },
  themeTitle: { fontSize: fontSize.lg, color: '#fff', fontWeight: '600' },
  themeSub: { fontSize: fontSize.sm, color: GOLD, marginTop: 2 },
  themeDesc: { fontSize: fontSize.sm, color: '#bbb', marginTop: 8, lineHeight: 20 },
  keywordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  keyword: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#2a2418', borderRadius: borderRadius.sm },
  keywordText: { color: GOLD, fontSize: fontSize.xs },
  themeMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  price: { color: GOLD, fontSize: fontSize.md, fontWeight: '600' },
  metaText: { color: '#888', fontSize: fontSize.sm },
  caseCard: {
    backgroundColor: '#1a1814',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  caseCover: { width: '100%', height: 160 },
  caseBody: { padding: spacing.md },
  caseTitle: { fontSize: fontSize.lg, color: '#fff', fontWeight: '600' },
  caseMeta: { fontSize: fontSize.xs, color: '#888', marginTop: 2 },
  caseStory: { fontSize: fontSize.sm, color: '#bbb', marginTop: 8, lineHeight: 20 },
  testimonial: { fontSize: fontSize.sm, color: GOLD, marginTop: 8, fontStyle: 'italic' },
  cta: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#1a1410',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: GOLD,
    alignItems: 'center',
  },
  ctaText: { color: GOLD, fontSize: fontSize.lg, fontWeight: '600' },
  ctaSub: { color: '#888', fontSize: fontSize.sm, marginTop: 6, textAlign: 'center' },
});
