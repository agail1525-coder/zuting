import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchLifeQuestions,
  fetchStages,
  LIFE_QUESTION_META,
  LIFE_STAGE_META,
  type LifeQuestion,
  type LifeStageGuide,
} from '../../src/lib/api-pillars';
import { spacing, borderRadius } from '../../src/lib/theme';

const BLUE = '#3264ff';

export default function CultureLifeLanding() {
  const router = useRouter();
  const [questions, setQuestions] = useState<LifeQuestion[]>([]);
  const [stages, setStages] = useState<LifeStageGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [q, s] = await Promise.all([fetchLifeQuestions(), fetchStages()]);
        setQuestions(q.items || []);
        setStages(s.items || []);
      } catch (e) {
        setError('加载失败，请下拉重试');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: '文化与生命' }} />
      <ScrollView style={s.container}>
        {/* Hero */}
        <LinearGradient colors={['#0f172a', '#1e293b']} style={s.hero}>
          <Text style={s.kicker}>M40 · CULTURE & LIFE</Text>
          <Text style={s.heroTitle}>
            生命的十二问 <Text style={s.heroAccent}>×</Text> 十二文化
          </Text>
          <Text style={s.heroSub}>
            我们不给标准答案，只呈现所有答案。{'\n'}
            从佛陀到耶稣，从老子到穆罕默德——{'\n'}
            12 大文化传统如何回答人类最深的 12 个命题？
          </Text>
          <View style={s.ctaRow}>
            <Pressable style={s.ctaPrimary} onPress={() => router.push('/culture-life/questions' as never)}>
              <Text style={s.ctaPrimaryText}>探索十二命题 →</Text>
            </Pressable>
            <Pressable style={s.ctaSecondary} onPress={() => router.push('/culture-life/dialogue' as never)}>
              <Text style={s.ctaSecondaryText}>AI 智者圆桌</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}

        {/* 十二命题 */}
        <View style={s.section}>
          <Text style={s.sectionKicker}>十二命题</Text>
          <Text style={s.sectionTitle}>生命的十二问</Text>
          <Text style={s.sectionSub}>每一问 · 12 文化传统的深度对照</Text>
          <View style={s.grid}>
            {questions.map((q) => {
              const meta = LIFE_QUESTION_META[q.code];
              return (
                <Pressable
                  key={q.id}
                  style={s.card}
                  onPress={() => router.push(`/culture-life/questions/${q.code}` as never)}
                >
                  <Text style={s.cardEmoji}>{meta?.emoji ?? '❓'}</Text>
                  <Text style={s.cardTitle}>{q.title}</Text>
                  <Text style={s.cardSub} numberOfLines={2}>{q.question}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 七阶段 */}
        <View style={s.section}>
          <Text style={s.sectionKicker}>七阶段</Text>
          <Text style={s.sectionTitle}>生命的七个阶段</Text>
          <Text style={s.sectionSub}>从诞生到临终 · 每一步皆有文化智慧相伴</Text>
          <Pressable style={s.stagesRow} onPress={() => router.push('/culture-life/stages' as never)}>
            {(['BIRTH', 'GROWTH', 'MARRIAGE', 'CAREER', 'MIDLIFE', 'AGING', 'DEATH'] as const).map((code) => {
              const m = LIFE_STAGE_META[code];
              return (
                <View key={code} style={s.stageChip}>
                  <Text style={s.stageEmoji}>{m.emoji}</Text>
                  <Text style={s.stageName}>{m.title}</Text>
                  <Text style={s.stageAge}>{m.age}</Text>
                </View>
              );
            })}
          </Pressable>
          <Pressable style={s.seeAll} onPress={() => router.push('/culture-life/stages' as never)}>
            <Text style={s.seeAllText}>查看阶段智慧详情 →</Text>
          </Pressable>
        </View>

        {/* 对话 */}
        <View style={s.section}>
          <View style={s.dialogueCard}>
            <Ionicons name="chatbubbles-outline" size={32} color={BLUE} />
            <Text style={s.dialogueTitle}>AI 智者圆桌</Text>
            <Text style={s.dialogueSub}>
              把你当下的生命困境说出来，让 12 大传统的智慧给你镜照与指引
            </Text>
            <Pressable style={s.dialogueCta} onPress={() => router.push('/culture-life/dialogue' as never)}>
              <Text style={s.dialogueCtaText}>开启对话 →</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  hero: { padding: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  kicker: { fontSize: 11, color: '#FCD34D', letterSpacing: 2, marginBottom: 10, fontWeight: '700' },
  heroTitle: { fontSize: 28, color: '#fff', fontWeight: '700', lineHeight: 38, marginBottom: 12 },
  heroAccent: { color: '#FCD34D' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 22, marginBottom: spacing.lg },
  ctaRow: { flexDirection: 'row', gap: 10 },
  ctaPrimary: { backgroundColor: '#FCD34D', paddingHorizontal: 18, paddingVertical: 12, borderRadius: borderRadius.md },
  ctaPrimaryText: { color: '#0f172a', fontWeight: '700', fontSize: 14 },
  ctaSecondary: { borderWidth: 1, borderColor: 'rgba(252,211,77,0.5)', paddingHorizontal: 18, paddingVertical: 12, borderRadius: borderRadius.md },
  ctaSecondaryText: { color: '#FCD34D', fontWeight: '600', fontSize: 14 },
  errorBox: { margin: spacing.md, padding: spacing.md, backgroundColor: '#fef2f2', borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { color: '#b91c1c', fontSize: 13 },
  section: { padding: spacing.lg },
  sectionKicker: { fontSize: 11, color: BLUE, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  sectionTitle: { fontSize: 22, color: '#111827', fontWeight: '700', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#6b7280', marginBottom: spacing.md, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: -4 },
  card: { width: '47%', backgroundColor: '#f8faff', padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#e5e7eb', marginHorizontal: '1.5%' },
  cardEmoji: { fontSize: 28, marginBottom: 6 },
  cardTitle: { fontSize: 14, color: '#111827', fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 11, color: '#6b7280', lineHeight: 16 },
  stagesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stageChip: { backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: borderRadius.md, alignItems: 'center', minWidth: 60 },
  stageEmoji: { fontSize: 20 },
  stageName: { fontSize: 12, color: '#1e40af', fontWeight: '700', marginTop: 2 },
  stageAge: { fontSize: 9, color: '#6b7280', marginTop: 1 },
  seeAll: { marginTop: spacing.md },
  seeAllText: { color: BLUE, fontSize: 13, fontWeight: '600' },
  dialogueCard: { backgroundColor: '#f8faff', padding: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: '#dbeafe' },
  dialogueTitle: { fontSize: 18, color: '#111827', fontWeight: '700', marginTop: 10 },
  dialogueSub: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: spacing.md },
  dialogueCta: { backgroundColor: BLUE, paddingHorizontal: 22, paddingVertical: 10, borderRadius: borderRadius.md },
  dialogueCtaText: { color: '#fff', fontWeight: '700' },
});
