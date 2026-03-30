import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  fetchQuestion,
  addAnswer,
  voteAnswer,
  QuestionDetail,
  AnswerItem,
} from '../../../src/lib/api';
import { colors, fontSize, spacing, borderRadius } from '../../../src/lib/theme';

export default function QuestionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [votedAnswers, setVotedAnswers] = useState<Set<string>>(new Set());
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchQuestion(id)
      .then(data => setQuestion(data))
      .catch(() => setQuestion(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitAnswer = async () => {
    if (!id || !answerText.trim()) return;
    setSubmitting(true);
    try {
      const newAnswer = await addAnswer(id, answerText.trim());
      setQuestion(prev =>
        prev ? { ...prev, answers: [...(prev.answers ?? []), newAnswer], answerCount: (prev.answerCount ?? 0) + 1 } : prev
      );
      setAnswerText('');
    } catch { Alert.alert('提示', '操作失败'); } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (answerId: string) => {
    if (!id || votedAnswers.has(answerId)) return;
    try {
      await voteAnswer(id, answerId);
      setVotedAnswers(prev => new Set(prev).add(answerId));
      setQuestion(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          answers: prev.answers.map(a =>
            a.id === answerId ? { ...a, voteCount: (a.voteCount ?? 0) + 1 } : a
          ),
        };
      });
    } catch { Alert.alert('提示', '操作失败'); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color={colors.gold} />
      </SafeAreaView>
    );
  }

  if (!question) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>问题不存在</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>返回</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const answers: AnswerItem[] = Array.isArray(question.answers) ? question.answers : [];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>问题详情</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.contentPad}>
            {/* Question */}
            <View style={styles.questionCard}>
              <View style={styles.questionIconRow}>
                <Ionicons name="help-circle" size={20} color={colors.gold} />
                <Text style={styles.questionLabel}>问题</Text>
                <View style={{ flex: 1 }} />
                <Text style={styles.questionDate}>
                  {new Date(question.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
              <Text style={styles.questionTitle}>{question.title}</Text>
              <Text style={styles.questionBody}>{question.content}</Text>
              {question.tags.length > 0 && (
                <View style={styles.tagRow}>
                  {question.tags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.questionStats}>
                <Ionicons name="eye-outline" size={13} color="#9CA3AF" />
                <Text style={styles.statsText}>{question.viewCount ?? 0} 浏览</Text>
                <Ionicons name="chatbubble-outline" size={13} color="#9CA3AF" />
                <Text style={styles.statsText}>{question.answerCount ?? 0} 回答</Text>
              </View>
            </View>

            {/* Answers */}
            <Text style={styles.answersTitle}>{answers.length} 个回答</Text>

            {answers.length === 0 ? (
              <View style={styles.emptyAnswers}>
                <Ionicons name="chatbubble-ellipses-outline" size={36} color={colors.textMuted} />
                <Text style={styles.emptyText}>还没有回答，来第一个解答吧</Text>
              </View>
            ) : (
              answers.map((answer, idx) => (
                <View key={answer.id} style={[styles.answerCard, answer.isAccepted && styles.answerAccepted]}>
                  {answer.isAccepted && (
                    <View style={styles.acceptedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                      <Text style={styles.acceptedText}>最佳答案</Text>
                    </View>
                  )}
                  <View style={styles.answerHeader}>
                    <View style={styles.answerAvatar}>
                      <Text style={styles.answerAvatarText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.answerDate}>
                      {new Date(answer.createdAt).toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                  <Text style={styles.answerContent}>{answer.content}</Text>
                  <Pressable
                    style={[styles.voteBtn, votedAnswers.has(answer.id) && styles.voteBtnActive]}
                    onPress={() => handleVote(answer.id)}
                  >
                    <Ionicons
                      name={votedAnswers.has(answer.id) ? 'thumbs-up' : 'thumbs-up-outline'}
                      size={16}
                      color={votedAnswers.has(answer.id) ? colors.gold : '#6b7280'}
                    />
                    <Text style={[styles.voteText, votedAnswers.has(answer.id) && styles.voteTextActive]}>
                      {(answer.voteCount ?? 0)} 赞
                    </Text>
                  </Pressable>
                </View>
              ))
            )}
            <View style={{ height: 80 }} />
          </View>
        </ScrollView>

        {/* Answer Input */}
        <View style={styles.inputBar}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={answerText}
            onChangeText={setAnswerText}
            placeholder="写下你的回答..."
            placeholderTextColor="#9CA3AF"
            multiline
          />
          <Pressable
            style={[styles.sendBtn, (!answerText.trim() || submitting) && styles.sendBtnDisabled]}
            onPress={handleSubmitAnswer}
            disabled={!answerText.trim() || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.sendBtnText}>回答</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: { flex: 1, fontSize: fontSize.lg, fontWeight: '600', color: '#111827', textAlign: 'center' },
  scroll: { flex: 1 },
  contentPad: { padding: spacing.md },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  questionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  questionLabel: { fontSize: fontSize.sm, color: colors.gold, fontWeight: '600' },
  questionDate: { fontSize: fontSize.xs, color: '#9CA3AF' },
  questionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: spacing.sm, lineHeight: 28 },
  questionBody: { fontSize: fontSize.md, color: '#374151', lineHeight: 22, marginBottom: spacing.sm },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: spacing.sm },
  tag: {
    backgroundColor: 'rgba(0,102,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: { fontSize: fontSize.xs, color: colors.gold },
  questionStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsText: { fontSize: fontSize.xs, color: '#9CA3AF', marginRight: 8 },
  answersTitle: { fontSize: fontSize.lg, fontWeight: '700', color: '#111827', marginBottom: spacing.md },
  emptyAnswers: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted },
  answerCard: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  answerAccepted: {
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.sm,
  },
  acceptedText: { fontSize: fontSize.xs, color: '#22C55E', fontWeight: '600' },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  answerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,102,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerAvatarText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.gold },
  answerDate: { fontSize: fontSize.xs, color: '#9CA3AF' },
  answerContent: { fontSize: fontSize.md, color: '#374151', lineHeight: 22, marginBottom: spacing.sm },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  voteBtnActive: { backgroundColor: 'rgba(0,102,255,0.08)' },
  voteText: { fontSize: fontSize.sm, color: '#6b7280' },
  voteTextActive: { color: colors.gold },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: fontSize.md,
    color: '#111827',
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#CBD5E1' },
  sendBtnText: { color: '#ffffff', fontSize: fontSize.md, fontWeight: '600' },
  errorState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  errorText: { fontSize: fontSize.lg, color: colors.textMuted },
  backBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  backBtnText: { color: '#ffffff', fontSize: fontSize.md, fontWeight: '600' },
});
