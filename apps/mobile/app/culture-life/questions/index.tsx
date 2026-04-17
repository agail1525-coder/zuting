import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  fetchLifeQuestions,
  LIFE_QUESTION_META,
  type LifeQuestion,
} from '../../../src/lib/api-pillars';
import { spacing, borderRadius } from '../../../src/lib/theme';

const BLUE = '#3264ff';

export default function QuestionsListScreen() {
  const router = useRouter();
  const [items, setItems] = useState<LifeQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLifeQuestions()
      .then((res) => setItems(res.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
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
      <Stack.Screen options={{ title: '十二命题' }} />
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.header}>
          <Text style={s.headerKicker}>LIFE QUESTIONS</Text>
          <Text style={s.headerTitle}>生命的十二问</Text>
          <Text style={s.headerSub}>点击任一命题 · 查看 12 大文化传统的深度对照</Text>
        </View>
        {items.map((q, i) => {
          const meta = LIFE_QUESTION_META[q.code];
          return (
            <Pressable
              key={q.id}
              style={s.row}
              onPress={() => router.push(`/culture-life/questions/${q.code}` as never)}
            >
              <View style={s.rowLeft}>
                <Text style={s.rowIdx}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={s.rowEmoji}>{meta?.emoji ?? '❓'}</Text>
              </View>
              <View style={s.rowBody}>
                <Text style={s.rowTitle}>{q.title}</Text>
                <Text style={s.rowEn}>{q.titleEn}</Text>
                <Text style={s.rowQ} numberOfLines={2}>{q.question}</Text>
              </View>
              <Text style={s.rowArrow}>›</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { padding: spacing.lg, backgroundColor: '#f8faff' },
  headerKicker: { fontSize: 11, color: BLUE, letterSpacing: 2, fontWeight: '700', marginBottom: 4 },
  headerTitle: { fontSize: 22, color: '#111827', fontWeight: '700' },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  rowLeft: { width: 64, alignItems: 'center' },
  rowIdx: { fontSize: 11, color: '#9ca3af', fontWeight: '700' },
  rowEmoji: { fontSize: 28, marginTop: 2 },
  rowBody: { flex: 1, marginLeft: spacing.sm },
  rowTitle: { fontSize: 15, color: '#111827', fontWeight: '700' },
  rowEn: { fontSize: 10, color: '#9ca3af', marginTop: 2 },
  rowQ: { fontSize: 12, color: '#6b7280', marginTop: 6, lineHeight: 18 },
  rowArrow: { fontSize: 28, color: '#d1d5db', marginLeft: spacing.sm },
});
