import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../src/lib/theme';
import {
  fetchTeamCultureThemes,
  fetchTeamCases,
  type TeamCultureTheme,
  type TeamCase,
} from '../src/lib/api';

const BLUE = '#3264ff';

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
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: '团队文化',
          headerStyle: { backgroundColor: BLUE },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BLUE} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroKicker}>B2B 旗舰 · 企业与高管团队文化打造</Text>
          <Text style={styles.heroTitle}>把祖庭变成团队的精神高地</Text>
          <Text style={styles.heroSub}>
            为企业、高管圈层与家族办公室定制深度文化探访
          </Text>
          <View style={styles.tagsRow}>
            {['企业团队', '高管团队', '家族办公室', '公益组织', '政府机关'].map((t) => (
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

        {/* 五步法 Methodology */}
        <View style={styles.methodologySection}>
          <Text style={styles.methodologyKicker}>⚡ ZUTING 文化探访五步法</Text>
          <Text style={styles.methodologyTitle}>把一次文化之旅 · 变成企业的百年文化</Text>
          <Text style={styles.methodologySub}>
            五步沉淀,百年传承。我们帮企业铸造可被代际继承的文化基因。
          </Text>
          {[
            { n: '01', icon: '🔍', title: '文化诊断', sub: 'CEO/HR 访谈 + 40 维测评 → 母题报告' },
            { n: '02', icon: '🗺️', title: '文化探访定制', sub: '12 文化传统 × 60 圣地匹配 → 专属方案书' },
            { n: '03', icon: '🏛️', title: '共修体验', sub: '5-7 天浸润 + 高管闭门会 + 集体宣誓' },
            { n: '04', icon: '📜', title: '沉淀转化', sub: '影像档案 + 团队证书 + 文化手册 v1.0' },
            { n: '05', icon: '♾️', title: '长效飞轮', sub: '年度复盘 + 接班人传承 + 全球网络' },
          ].map((step) => (
            <View key={step.n} style={styles.stepCard}>
              <View style={styles.stepLeft}>
                <Text style={styles.stepNumber}>{step.n}</Text>
                <Text style={styles.stepIcon}>{step.icon}</Text>
              </View>
              <View style={styles.stepRight}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepSub}>{step.sub}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Themes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主题方案</Text>
          <Text style={styles.sectionSub}>共 {themes.length} 个文化主题</Text>
          {themes.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={48} color={BLUE} />
              <Text style={styles.emptyText}>暂无主题</Text>
            </View>
          ) : (
            themes.map((theme) => (
              <View key={theme.id} style={[styles.themeCard, { borderLeftColor: theme.color || BLUE }]}>
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
          <Text style={styles.sectionSub}>真实团队的文化之旅故事</Text>
          {cases.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={BLUE} />
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
                    <Text style={styles.testimonial}>&ldquo;{c.testimonial}&rdquo;</Text>
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
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  hero: {
    padding: spacing.lg,
    backgroundColor: BLUE,
  },
  heroKicker: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 6, fontWeight: '600' },
  heroTitle: { fontSize: 24, color: '#fff', fontWeight: '700', marginBottom: 8 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.md, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  tagText: { color: '#fff', fontSize: 12 },
  errorBox: { padding: spacing.md, backgroundColor: '#fef2f2', margin: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { color: '#b91c1c', fontSize: 13 },
  methodologySection: { padding: spacing.lg, backgroundColor: '#f8faff' },
  methodologyKicker: { fontSize: 12, color: BLUE, fontWeight: '700', marginBottom: 6 },
  methodologyTitle: { fontSize: 20, color: '#111827', fontWeight: '700', marginBottom: 6, lineHeight: 28 },
  methodologySub: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: spacing.md },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  stepLeft: { width: 56, alignItems: 'center', marginRight: spacing.md },
  stepNumber: { fontSize: 22, fontWeight: '900', color: BLUE, lineHeight: 24 },
  stepIcon: { fontSize: 20, marginTop: 4 },
  stepRight: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  stepSub: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 18, color: '#111827', fontWeight: '700', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#6b7280', marginBottom: spacing.md },
  empty: { alignItems: 'center', padding: spacing.xl },
  emptyText: { color: '#9ca3af', marginTop: spacing.sm },
  themeCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  themeCover: { width: '100%', height: 140 },
  themeBody: { padding: spacing.md },
  themeTitle: { fontSize: 16, color: '#111827', fontWeight: '600' },
  themeSub: { fontSize: 13, color: BLUE, marginTop: 2 },
  themeDesc: { fontSize: 13, color: '#6b7280', marginTop: 8, lineHeight: 20 },
  keywordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm },
  keyword: { paddingHorizontal: 8, paddingVertical: 2, backgroundColor: '#eff6ff', borderRadius: borderRadius.sm },
  keywordText: { color: BLUE, fontSize: 11, fontWeight: '600' },
  themeMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  price: { color: BLUE, fontSize: 14, fontWeight: '700' },
  metaText: { color: '#6b7280', fontSize: 13 },
  caseCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  caseCover: { width: '100%', height: 160 },
  caseBody: { padding: spacing.md },
  caseTitle: { fontSize: 16, color: '#111827', fontWeight: '600' },
  caseMeta: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  caseStory: { fontSize: 13, color: '#4b5563', marginTop: 8, lineHeight: 20 },
  testimonial: {
    fontSize: 13,
    color: '#1e40af',
    marginTop: 10,
    fontStyle: 'italic',
    backgroundColor: '#eff6ff',
    borderLeftWidth: 4,
    borderLeftColor: BLUE,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cta: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: BLUE,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ctaSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 6, textAlign: 'center' },
});
