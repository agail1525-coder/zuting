import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { fetchQuestions, QuestionItem } from '../../src/lib/api';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

type SortKey = 'latest' | 'hot' | 'unanswered';

const SORT_LABELS: Record<SortKey, string> = {
  latest: '最新',
  hot: '最热',
  unanswered: '未回答',
};

export default function QuestionsScreen() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortKey>('latest');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchQuestions({ sort });
      setQuestions(Array.isArray(res?.items) ? res.items : []);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>朝圣问答</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        {(Object.keys(SORT_LABELS) as SortKey[]).map(s => (
          <Pressable
            key={s}
            style={[styles.sortBtn, sort === s && styles.sortBtnActive]}
            onPress={() => setSort(s)}
          >
            <Text style={[styles.sortBtnText, sort === s && styles.sortBtnTextActive]}>
              {SORT_LABELS[s]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.gold} />
      ) : questions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="help-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>暂无问题</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/community/question/${item.id}` as never)}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.answerCount}>{item.answerCount ?? 0}</Text>
                <Text style={styles.answerLabel}>回答</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.cardExcerpt} numberOfLines={1}>{item.content}</Text>
                <View style={styles.cardMeta}>
                  {item.tags.slice(0, 2).map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                  <Text style={styles.cardDate}>
                    {new Date(item.createdAt).toLocaleDateString('zh-CN')}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: fontSize.xl, fontWeight: '700', color: '#111827', textAlign: 'center' },
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#ffffff',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    backgroundColor: '#F3F4F6',
  },
  sortBtnActive: { backgroundColor: colors.gold },
  sortBtnText: { fontSize: fontSize.sm, color: '#6b7280', fontWeight: '500' },
  sortBtnTextActive: { color: '#ffffff', fontWeight: '600' },
  listContent: { padding: spacing.md, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeft: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,102,255,0.06)',
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
  },
  answerCount: { fontSize: fontSize.lg, fontWeight: '700', color: colors.gold },
  answerLabel: { fontSize: fontSize.xs, color: '#6b7280' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: fontSize.md, fontWeight: '600', color: '#111827', marginBottom: 4 },
  cardExcerpt: { fontSize: fontSize.sm, color: '#6b7280', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: 'rgba(0,102,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: { fontSize: fontSize.xs, color: colors.gold },
  cardDate: { fontSize: fontSize.xs, color: '#9CA3AF' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted },
});
