import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fetchPgTheme, type PersonalGrowthTheme } from '../../../src/lib/api-pillars';
import { spacing, borderRadius } from '../../../src/lib/theme';

const GOLD = '#8B6914';
const GOLD_LIGHT = '#D4A855';

export default function PgThemeDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [data, setData] = useState<PersonalGrowthTheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchPgTheme(slug)
      .then(setData)
      .catch(() => setError('主题不存在'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={GOLD} /></View>;
  if (error || !data) return <View style={s.center}><Text style={s.err}>{error ?? '未找到'}</Text></View>;

  const rc = data.richContent;

  return (
    <>
      <Stack.Screen options={{ title: data.title }} />
      <ScrollView style={s.container}>
        {data.coverUrl ? (
          <Image source={{ uri: data.coverUrl }} style={s.cover} resizeMode="cover" />
        ) : null}
        <LinearGradient colors={['#1A1200', '#3D2E12']} style={s.hero}>
          {rc?.dimension ? (
            <Text style={s.kicker}>{rc.dimension.kicker} · {rc.dimension.label}</Text>
          ) : (
            <Text style={s.kicker}>PERSONAL GROWTH</Text>
          )}
          <Text style={s.title}>{data.title}</Text>
          {data.subtitle ? <Text style={s.subtitle}>{data.subtitle}</Text> : null}
          <Text style={s.desc}>{data.description}</Text>
          <View style={s.metaRow}>
            {data.durationDays ? <View style={s.metaChip}><Text style={s.metaText}>⏱ {data.durationDays}天</Text></View> : null}
            {data.priceFrom ? <View style={s.metaChip}><Text style={s.metaText}>￥{data.priceFrom.toLocaleString()}起</Text></View> : null}
            {data.holySites?.length ? <View style={s.metaChip}><Text style={s.metaText}>🏛️ {data.holySites.length}圣地</Text></View> : null}
          </View>
        </LinearGradient>

        {rc?.entrepreneurPainPoint && (
          <View style={s.section}>
            <Text style={s.sectionKicker}>企业家痛点</Text>
            <Text style={s.sectionTitle}>{rc.entrepreneurPainPoint.title}</Text>
            <Text style={s.para}>{rc.entrepreneurPainPoint.body}</Text>
            {rc.entrepreneurPainPoint.signs && rc.entrepreneurPainPoint.signs.length > 0 && (
              <View style={s.signBox}>
                {rc.entrepreneurPainPoint.signs.map((sig, i) => (
                  <Text key={i} style={s.signItem}>✦ {sig}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {rc?.philosophy && (
          <View style={[s.section, { backgroundColor: '#fefbf5' }]}>
            <Text style={s.sectionKicker}>哲学根基</Text>
            <Text style={s.sectionTitle}>{rc.philosophy.title}</Text>
            <Text style={s.para}>{rc.philosophy.body}</Text>
            {rc.philosophy.quotes?.map((q, i) => (
              <View key={i} style={s.quoteBox}>
                <Text style={s.quoteText}>&ldquo;{q.text}&rdquo;</Text>
                {q.translation ? <Text style={s.quoteTrans}>{q.translation}</Text> : null}
                <Text style={s.quoteSrc}>——{q.source}</Text>
              </View>
            ))}
          </View>
        )}

        {rc?.dailyItinerary && rc.dailyItinerary.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionKicker}>每日行程</Text>
            <Text style={s.sectionTitle}>{data.durationDays ?? rc.dailyItinerary.length}天修行路径</Text>
            {rc.dailyItinerary.map((d, i) => (
              <View key={i} style={s.dayCard}>
                <View style={s.dayHead}>
                  <Text style={s.dayNum}>Day {d.day}</Text>
                  <Text style={s.dayLoc}>📍 {d.location}</Text>
                </View>
                <Text style={s.dayTitle}>{d.title}</Text>
                {d.dawn ? <Text style={s.dayItem}>🌅 拂晓 · {d.dawn}</Text> : null}
                {d.morning ? <Text style={s.dayItem}>☀️ 上午 · {d.morning}</Text> : null}
                {d.afternoon ? <Text style={s.dayItem}>🏔️ 下午 · {d.afternoon}</Text> : null}
                {d.evening ? <Text style={s.dayItem}>🌙 傍晚 · {d.evening}</Text> : null}
                {d.soloTime ? <Text style={s.dayItem}>🧘 独修 · {d.soloTime}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {rc?.mentorProfile && (
          <View style={[s.section, { backgroundColor: '#0f172a' }]}>
            <Text style={[s.sectionKicker, { color: GOLD_LIGHT }]}>首席导师</Text>
            <Text style={[s.sectionTitle, { color: '#fff' }]}>{rc.mentorProfile.name}</Text>
            <Text style={[s.mentorTitle, { color: GOLD_LIGHT }]}>{rc.mentorProfile.title}</Text>
            <Text style={[s.para, { color: 'rgba(255,255,255,0.85)' }]}>{rc.mentorProfile.bio}</Text>
            {rc.mentorProfile.philosophy ? (
              <View style={s.mentorPhilosophy}>
                <Text style={[s.quoteText, { color: GOLD_LIGHT }]}>&ldquo;{rc.mentorProfile.philosophy}&rdquo;</Text>
              </View>
            ) : null}
          </View>
        )}

        {rc?.testimonials && rc.testimonials.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionKicker}>蜕变见证</Text>
            <Text style={s.sectionTitle}>他们这样重生</Text>
            {rc.testimonials.map((t, i) => (
              <View key={i} style={s.testCard}>
                <Text style={s.testQuote}>&ldquo;{t.quote}&rdquo;</Text>
                <View style={s.testBA}>
                  <View style={s.testBefore}>
                    <Text style={s.testBALabel}>修行前</Text>
                    <Text style={s.testBAText}>{t.before}</Text>
                  </View>
                  <View style={s.testAfter}>
                    <Text style={[s.testBALabel, { color: GOLD }]}>修行后</Text>
                    <Text style={s.testBAText}>{t.after}</Text>
                  </View>
                </View>
                <Text style={s.testName}>——{t.name} · {t.role} · {t.company}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.ctaWrap}>
          <Pressable style={s.cta} onPress={() => router.push('/personal-growth' as never)}>
            <Text style={s.ctaText}>查看全部主题 →</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  err: { color: '#b91c1c' },
  cover: { width: '100%', height: 200 },
  hero: { padding: spacing.lg },
  kicker: { fontSize: 11, color: GOLD_LIGHT, letterSpacing: 2, fontWeight: '700', marginBottom: 6 },
  title: { fontSize: 26, color: '#fff', fontWeight: '700' },
  subtitle: { fontSize: 14, color: GOLD_LIGHT, marginTop: 4 },
  desc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 22, marginTop: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.md },
  metaChip: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(212,168,85,0.15)', borderRadius: borderRadius.sm, borderWidth: 1, borderColor: 'rgba(212,168,85,0.4)' },
  metaText: { fontSize: 11, color: GOLD_LIGHT, fontWeight: '600' },
  section: { padding: spacing.lg },
  sectionKicker: { fontSize: 11, color: GOLD, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  sectionTitle: { fontSize: 20, color: '#111827', fontWeight: '700', marginBottom: spacing.sm },
  para: { fontSize: 14, color: '#4b5563', lineHeight: 24 },
  signBox: { marginTop: spacing.md, padding: spacing.md, backgroundColor: '#fef3c7', borderRadius: borderRadius.md },
  signItem: { fontSize: 13, color: '#92400e', lineHeight: 22 },
  quoteBox: { marginTop: spacing.md, paddingLeft: spacing.md, borderLeftWidth: 3, borderLeftColor: GOLD },
  quoteText: { fontSize: 15, color: '#1f2937', lineHeight: 24, fontStyle: 'italic' },
  quoteTrans: { fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 20 },
  quoteSrc: { fontSize: 11, color: GOLD, marginTop: 6, fontWeight: '700' },
  dayCard: { padding: spacing.md, backgroundColor: '#fefbf5', borderRadius: borderRadius.md, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: GOLD },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  dayNum: { fontSize: 13, color: GOLD, fontWeight: '700', letterSpacing: 1 },
  dayLoc: { fontSize: 11, color: '#6b7280' },
  dayTitle: { fontSize: 15, color: '#111827', fontWeight: '700', marginBottom: 6 },
  dayItem: { fontSize: 12, color: '#4b5563', lineHeight: 20, marginTop: 2 },
  mentorTitle: { fontSize: 13, marginTop: 4, letterSpacing: 1, marginBottom: spacing.sm },
  mentorPhilosophy: { marginTop: spacing.md, padding: spacing.md, backgroundColor: 'rgba(212,168,85,0.1)', borderLeftWidth: 2, borderLeftColor: GOLD_LIGHT },
  testCard: { padding: spacing.md, backgroundColor: '#fefbf5', borderRadius: borderRadius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: '#f3e8d0' },
  testQuote: { fontSize: 15, color: '#1f2937', lineHeight: 24, fontStyle: 'italic', marginBottom: spacing.md },
  testBA: { flexDirection: 'row', gap: 10, marginBottom: spacing.sm },
  testBefore: { flex: 1, padding: 10, backgroundColor: '#f3f4f6', borderRadius: borderRadius.sm },
  testAfter: { flex: 1, padding: 10, backgroundColor: '#fef3c7', borderRadius: borderRadius.sm },
  testBALabel: { fontSize: 10, color: '#6b7280', fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  testBAText: { fontSize: 12, color: '#374151', lineHeight: 18 },
  testName: { fontSize: 11, color: GOLD, fontWeight: '700', textAlign: 'right' },
  ctaWrap: { padding: spacing.lg },
  cta: { backgroundColor: GOLD, padding: 14, borderRadius: borderRadius.md, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
