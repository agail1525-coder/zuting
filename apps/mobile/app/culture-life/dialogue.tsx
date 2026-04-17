import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  LIFE_QUESTION_CODES,
  LIFE_QUESTION_META,
  submitDialogue,
  type LifePerspective,
  type LifeQuestionCode,
} from '../../src/lib/api-pillars';
import { spacing, borderRadius } from '../../src/lib/theme';

const BLUE = '#3264ff';

export default function DialogueScreen() {
  const [situation, setSituation] = useState('');
  const [questionCode, setQuestionCode] = useState<LifeQuestionCode | ''>('');
  const [reply, setReply] = useState<string | null>(null);
  const [perspectives, setPerspectives] = useState<LifePerspective[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!situation.trim() || situation.length < 10) {
      setError('请至少描述 10 个字的当下情境');
      return;
    }
    setError(null);
    setSubmitting(true);
    setReply(null);
    setPerspectives([]);
    try {
      const res = await submitDialogue(situation.trim(), questionCode || undefined);
      setReply(res.reply || '暂无回应，请稍后重试');
      setPerspectives(Array.isArray(res.citedPerspectives) ? res.citedPerspectives : []);
    } catch (e) {
      setError('对话失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'AI 智者圆桌' }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={s.container} contentContainerStyle={s.content}>
          <View style={s.hero}>
            <Ionicons name="people-circle-outline" size={40} color={BLUE} />
            <Text style={s.heroTitle}>12 位智者 · 一场圆桌</Text>
            <Text style={s.heroSub}>
              把你当下的生命困境说出来，12 大文化传统的智慧将从不同角度给你镜照。{'\n'}
              不给标准答案，只呈现所有答案。
            </Text>
          </View>

          <View style={s.form}>
            <Text style={s.label}>选择命题（可选）</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.codeRow}>
              <Pressable
                style={[s.codeChip, !questionCode && s.codeChipActive]}
                onPress={() => setQuestionCode('')}
              >
                <Text style={[s.codeChipText, !questionCode && s.codeChipTextActive]}>自动识别</Text>
              </Pressable>
              {LIFE_QUESTION_CODES.map((code) => {
                const m = LIFE_QUESTION_META[code];
                const active = code === questionCode;
                return (
                  <Pressable
                    key={code}
                    style={[s.codeChip, active && s.codeChipActive]}
                    onPress={() => setQuestionCode(code)}
                  >
                    <Text style={[s.codeChipText, active && s.codeChipTextActive]}>
                      {m.emoji} {m.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={s.label}>说出你的情境</Text>
            <TextInput
              style={s.input}
              placeholder="譬如：最近连续失眠，担心创业失败，想一走了之却又放不下家人..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              maxLength={2000}
              value={situation}
              onChangeText={setSituation}
              textAlignVertical="top"
            />
            <Text style={s.counter}>{situation.length} / 2000</Text>

            {error && <Text style={s.errText}>{error}</Text>}

            <Pressable
              style={[s.submit, (submitting || !situation.trim()) && s.submitDisabled]}
              disabled={submitting || !situation.trim()}
              onPress={onSubmit}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitText}>开启圆桌对话 →</Text>
              )}
            </Pressable>
          </View>

          {reply && (
            <View style={s.reply}>
              <View style={s.replyHeader}>
                <Ionicons name="sparkles" size={18} color="#FCD34D" />
                <Text style={s.replyTitle}>智者回应</Text>
              </View>
              <Text style={s.replyText}>{reply}</Text>
              {perspectives.length > 0 && (
                <View style={s.citedBox}>
                  <Text style={s.citedLabel}>引用传统</Text>
                  <View style={s.citedRow}>
                    {perspectives.map((p) => (
                      <View
                        key={p.id}
                        style={[s.citedChip, { borderColor: p.religion?.color || BLUE }]}
                      >
                        <Text style={[s.citedText, { color: p.religion?.color || BLUE }]}>
                          {p.religion?.symbol ?? ''} {p.religion?.name ?? ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: spacing.xl },
  hero: { padding: spacing.lg, alignItems: 'center', backgroundColor: '#f8faff' },
  heroTitle: { fontSize: 18, color: '#111827', fontWeight: '700', marginTop: 8 },
  heroSub: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginTop: 6 },
  form: { padding: spacing.lg },
  label: { fontSize: 12, color: '#6b7280', fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginTop: spacing.md },
  codeRow: { gap: 6 },
  codeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.md, backgroundColor: '#f3f4f6' },
  codeChipActive: { backgroundColor: BLUE },
  codeChipText: { fontSize: 12, color: '#374151' },
  codeChipTextActive: { color: '#fff', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: borderRadius.md, padding: 12, fontSize: 14, minHeight: 120, color: '#111827' },
  counter: { fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'right' },
  errText: { color: '#b91c1c', fontSize: 12, marginTop: 8 },
  submit: { backgroundColor: BLUE, padding: 14, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.md },
  submitDisabled: { backgroundColor: '#9ca3af' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  reply: { margin: spacing.lg, padding: spacing.md, backgroundColor: '#0f172a', borderRadius: borderRadius.md },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  replyTitle: { fontSize: 14, color: '#FCD34D', fontWeight: '700', letterSpacing: 1 },
  replyText: { fontSize: 14, color: '#f3f4f6', lineHeight: 22 },
  citedBox: { marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  citedLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 2, marginBottom: 6 },
  citedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  citedChip: { paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderRadius: borderRadius.sm },
  citedText: { fontSize: 11, fontWeight: '600' },
});
