import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  fetchQuestionMatrix,
  LIFE_QUESTION_META,
  type LifePerspective,
  type LifeQuestion,
} from '../../../src/lib/api-pillars';
import { spacing, borderRadius } from '../../../src/lib/theme';

const BLUE = '#3264ff';

export default function QuestionMatrixScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [data, setData] = useState<(LifeQuestion & { perspectives: LifePerspective[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    fetchQuestionMatrix(code)
      .then(setData)
      .catch(() => setError('未找到该命题'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={BLUE} /></View>;
  if (error || !data) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>{error ?? '命题不存在'}</Text>
      </View>
    );
  }

  const meta = LIFE_QUESTION_META[data.code];

  return (
    <>
      <Stack.Screen options={{ title: data.title }} />
      <ScrollView style={s.container}>
        <View style={s.hero}>
          <Text style={s.heroEmoji}>{meta?.emoji ?? '❓'}</Text>
          <Text style={s.heroTitle}>{data.title}</Text>
          <Text style={s.heroEn}>{data.titleEn}</Text>
          <View style={s.questionBox}>
            <Text style={s.questionText}>{data.question}</Text>
          </View>
          {data.philosophicalDepth ? (
            <Text style={s.depth}>{data.philosophicalDepth}</Text>
          ) : null}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>十二文化的回答</Text>
          <Text style={s.sectionSub}>共 {data.perspectives.length} 种视角</Text>
          {data.perspectives.map((p) => (
            <View
              key={p.id}
              style={[s.persCard, { borderLeftColor: p.religion?.color || BLUE }]}
            >
              <View style={s.persHeader}>
                <Text style={s.persReligion}>
                  {p.religion?.symbol ? `${p.religion.symbol} ` : ''}
                  {p.religion?.name ?? '—'}
                </Text>
              </View>
              <Text style={s.persCore}>{p.corePosition}</Text>
              <Text style={s.persElab}>{p.elaboration}</Text>

              {p.scriptureRefs && p.scriptureRefs.length > 0 && (
                <View style={s.scriptBox}>
                  <Text style={s.scriptLabel}>经典引证</Text>
                  {p.scriptureRefs.slice(0, 2).map((r, i) => (
                    <View key={i} style={s.scriptItem}>
                      <Text style={s.scriptQuote}>&ldquo;{r.quote}&rdquo;</Text>
                      <Text style={s.scriptSrc}>
                        ——{r.scripture}{r.chapter ? `·${r.chapter}` : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {p.masterQuotes && p.masterQuotes.length > 0 && (
                <View style={s.masterBox}>
                  <Text style={s.scriptLabel}>大师箴言</Text>
                  {p.masterQuotes.slice(0, 2).map((m, i) => (
                    <View key={i} style={s.scriptItem}>
                      <Text style={s.scriptQuote}>&ldquo;{m.quote}&rdquo;</Text>
                      <Text style={s.scriptSrc}>——{m.master}{m.source ? `·${m.source}` : ''}</Text>
                    </View>
                  ))}
                </View>
              )}

              {p.practiceGuide ? (
                <View style={s.practiceBox}>
                  <Text style={s.practiceLabel}>📿 修行指引</Text>
                  <Text style={s.practiceText}>{p.practiceGuide}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  errorText: { color: '#b91c1c', fontSize: 14 },
  hero: { padding: spacing.lg, backgroundColor: '#0f172a', alignItems: 'center' },
  heroEmoji: { fontSize: 44, marginBottom: 8 },
  heroTitle: { fontSize: 22, color: '#fff', fontWeight: '700' },
  heroEn: { fontSize: 11, color: '#FCD34D', marginTop: 4, letterSpacing: 2 },
  questionBox: { marginTop: spacing.md, padding: spacing.md, backgroundColor: 'rgba(252,211,77,0.1)', borderLeftWidth: 3, borderLeftColor: '#FCD34D', borderRadius: borderRadius.sm },
  questionText: { fontSize: 14, color: 'rgba(255,255,255,0.95)', lineHeight: 22, fontStyle: 'italic' },
  depth: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: spacing.sm, lineHeight: 20, textAlign: 'center' },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 20, color: '#111827', fontWeight: '700' },
  sectionSub: { fontSize: 12, color: '#6b7280', marginTop: 4, marginBottom: spacing.md },
  persCard: { backgroundColor: '#fff', marginBottom: spacing.md, padding: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: '#e5e7eb', borderLeftWidth: 4 },
  persHeader: { marginBottom: 8 },
  persReligion: { fontSize: 15, color: '#111827', fontWeight: '700' },
  persCore: { fontSize: 15, color: '#111827', fontWeight: '600', lineHeight: 22, marginBottom: 8 },
  persElab: { fontSize: 13, color: '#4b5563', lineHeight: 20, marginBottom: spacing.sm },
  scriptBox: { backgroundColor: '#f8faff', padding: spacing.sm, borderRadius: borderRadius.sm, marginTop: 8 },
  masterBox: { backgroundColor: '#fef3c7', padding: spacing.sm, borderRadius: borderRadius.sm, marginTop: 8 },
  scriptLabel: { fontSize: 10, color: '#6b7280', fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  scriptItem: { marginBottom: 6 },
  scriptQuote: { fontSize: 12, color: '#1f2937', lineHeight: 18, fontStyle: 'italic' },
  scriptSrc: { fontSize: 10, color: '#6b7280', marginTop: 3 },
  practiceBox: { backgroundColor: '#ecfdf5', padding: spacing.sm, borderRadius: borderRadius.sm, marginTop: 8 },
  practiceLabel: { fontSize: 10, color: '#065f46', fontWeight: '700', marginBottom: 4 },
  practiceText: { fontSize: 12, color: '#065f46', lineHeight: 18 },
});
