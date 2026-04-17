import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchFaithQuestions,
  submitFaithAssessment,
  type FaithMode,
  type FaithQuestion,
  type FaithAssessmentResult,
} from '../src/lib/api-pillars';
import { spacing, borderRadius } from '../src/lib/theme';

const BLUE = '#3264ff';

const MODE_META: Record<FaithMode, { title: string; desc: string; color: string; emoji: string }> = {
  PERSONAL:   { title: '个人模式', desc: '个人成长 · 觉察自我', color: '#8B6914', emoji: '🌱' },
  FAMILY:     { title: '家庭模式', desc: '家庭和谐 · 代际连接', color: '#2D8B6F', emoji: '🏡' },
  ENTERPRISE: { title: '企业模式', desc: '团队文化 · 领导修为', color: BLUE,      emoji: '🏛️' },
};

const DIMENSION_META: Record<string, { label: string; color: string }> = {
  AWARENESS:  { label: '觉察力', color: '#8B6914' },
  RESILIENCE: { label: '定力',   color: '#2D8B6F' },
  VISION:     { label: '格局力', color: BLUE },
  CONNECTION: { label: '连接力', color: '#7C3AED' },
  LEGACY:     { label: '传承力', color: '#B91C1C' },
};

export default function FaithAssessmentScreen() {
  const [mode, setMode] = useState<FaithMode | null>(null);
  const [questions, setQuestions] = useState<FaithQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<FaithAssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mode) return;
    setLoading(true);
    setError(null);
    fetchFaithQuestions(mode)
      .then((r) => setQuestions(r.items || []))
      .catch(() => setError('题目加载失败，请返回重选模式'))
      .finally(() => setLoading(false));
  }, [mode]);

  const answered = useMemo(() => Object.keys(answers).length, [answers]);
  const total = questions.length;
  const progress = total ? Math.round((answered / total) * 100) : 0;

  const onSelect = (qid: string, key: string) => {
    setAnswers((a) => ({ ...a, [qid]: key }));
    if (current < total - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 150);
    }
  };

  const onSubmit = async () => {
    if (!mode) return;
    if (answered < total) {
      setError(`还有 ${total - answered} 题未答`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));
      const r = await submitFaithAssessment(mode, payload);
      setResult(r);
    } catch (e) {
      setError('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Mode picker ────────────────────────────────────
  if (!mode) {
    return (
      <>
        <Stack.Screen options={{ title: '信仰力评估' }} />
        <ScrollView style={s.container}>
          <LinearGradient colors={['#0f172a', '#1e293b']} style={s.hero}>
            <Text style={s.heroKicker}>FAITH ASSESSMENT · M36</Text>
            <Text style={s.heroTitle}>信仰力五维评估</Text>
            <Text style={s.heroSub}>
              觉察力 · 定力 · 格局力 · 连接力 · 传承力{'\n'}
              60题，15分钟，获取你的信仰力画像
            </Text>
          </LinearGradient>

          <View style={s.section}>
            <Text style={s.sectionTitle}>选择评估模式</Text>
            <Text style={s.sectionSub}>三种视角 · 映射三部曲</Text>
            {(Object.keys(MODE_META) as FaithMode[]).map((m) => {
              const meta = MODE_META[m];
              return (
                <Pressable
                  key={m}
                  style={[s.modeCard, { borderLeftColor: meta.color }]}
                  onPress={() => setMode(m)}
                >
                  <Text style={s.modeEmoji}>{meta.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.modeTitle}>{meta.title}</Text>
                    <Text style={s.modeDesc}>{meta.desc}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={meta.color} />
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </>
    );
  }

  // ── Loading ────────────────────────────────────────
  if (loading) {
    return <View style={s.center}><ActivityIndicator size="large" color={BLUE} /></View>;
  }

  // ── Result ─────────────────────────────────────────
  if (result) {
    const dims: Array<[string, number]> = [
      ['AWARENESS', result.scores.awareness],
      ['RESILIENCE', result.scores.resilience],
      ['VISION', result.scores.vision],
      ['CONNECTION', result.scores.connection],
      ['LEGACY', result.scores.legacy],
    ];
    return (
      <>
        <Stack.Screen options={{ title: '评估结果' }} />
        <ScrollView style={s.container}>
          <LinearGradient colors={[result.levelColor || '#0f172a', '#0f172a']} style={s.hero}>
            <Text style={s.heroKicker}>YOUR FAITH LEVEL</Text>
            <Text style={s.resultLevel}>{result.level}</Text>
            <Text style={s.resultScore}>{result.totalScore} / 100</Text>
            <Text style={s.heroSub}>
              最强：{DIMENSION_META[result.strongestDimension]?.label ?? result.strongestDimension}
              {'   '}
              待修：{DIMENSION_META[result.weakestDimension]?.label ?? result.weakestDimension}
            </Text>
          </LinearGradient>

          <View style={s.section}>
            <Text style={s.sectionTitle}>五维画像</Text>
            {dims.map(([code, val]) => {
              const meta = DIMENSION_META[code];
              const pct = Math.min(100, Math.round((val / 20) * 100));
              return (
                <View key={code} style={s.dimRow}>
                  <View style={s.dimHead}>
                    <Text style={[s.dimLabel, { color: meta.color }]}>{meta.label}</Text>
                    <Text style={s.dimVal}>{val} / 20</Text>
                  </View>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct}%`, backgroundColor: meta.color }]} />
                  </View>
                </View>
              );
            })}
          </View>

          {result.recommendedThemes && result.recommendedThemes.length > 0 && (
            <View style={s.section}>
              <Text style={s.sectionTitle}>推荐修行主题</Text>
              <View style={s.chipRow}>
                {result.recommendedThemes.map((t, i) => (
                  <View key={i} style={s.chip}><Text style={s.chipText}>{t}</Text></View>
                ))}
              </View>
            </View>
          )}

          <View style={s.section}>
            <View style={s.pointsBox}>
              <Ionicons name="gift-outline" size={28} color="#FCD34D" />
              <Text style={s.pointsTitle}>本次获得积分</Text>
              <Text style={s.pointsVal}>+{result.pointsEarned}</Text>
            </View>
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </>
    );
  }

  // ── Question flow ──────────────────────────────────
  const q = questions[current];
  if (!q) {
    return (
      <View style={s.center}>
        <Text style={s.errText}>{error ?? '题目不存在'}</Text>
      </View>
    );
  }
  const selected = answers[q.id];

  return (
    <>
      <Stack.Screen options={{ title: `${MODE_META[mode].title} · ${current + 1}/${total}` }} />
      <View style={s.container}>
        <View style={s.progressWrap}>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={s.progressText}>{answered} / {total}</Text>
        </View>

        <ScrollView contentContainerStyle={s.qContent}>
          <Text style={s.qKicker}>
            {DIMENSION_META[q.dimension]?.label ?? q.dimension} · 第 {current + 1} 题
          </Text>
          <Text style={s.qText}>{q.questionText}</Text>

          <View style={{ marginTop: spacing.md }}>
            {q.options.map((opt) => {
              const active = selected === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[s.opt, active && s.optActive]}
                  onPress={() => onSelect(q.id, opt.key)}
                >
                  <View style={[s.optKey, active && s.optKeyActive]}>
                    <Text style={[s.optKeyText, active && { color: '#fff' }]}>{opt.key}</Text>
                  </View>
                  <Text style={[s.optText, active && s.optTextActive]}>{opt.text}</Text>
                </Pressable>
              );
            })}
          </View>

          {error && <Text style={s.errText}>{error}</Text>}

          <View style={s.navRow}>
            <Pressable
              style={[s.navBtn, current === 0 && s.navBtnDisabled]}
              disabled={current === 0}
              onPress={() => setCurrent((c) => Math.max(0, c - 1))}
            >
              <Text style={s.navBtnText}>上一题</Text>
            </Pressable>
            {current < total - 1 ? (
              <Pressable
                style={[s.navBtn, s.navBtnPrimary]}
                onPress={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              >
                <Text style={[s.navBtnText, { color: '#fff' }]}>下一题</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[s.navBtn, s.navBtnPrimary, submitting && s.navBtnDisabled]}
                disabled={submitting}
                onPress={onSubmit}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[s.navBtnText, { color: '#fff' }]}>提交评估</Text>
                )}
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  hero: { padding: spacing.lg, alignItems: 'center' },
  heroKicker: { fontSize: 11, color: '#FCD34D', letterSpacing: 2, fontWeight: '700' },
  heroTitle: { fontSize: 26, color: '#fff', fontWeight: '700', marginTop: 8 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginTop: 10, textAlign: 'center' },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 18, color: '#111827', fontWeight: '700' },
  sectionSub: { fontSize: 13, color: '#6b7280', marginTop: 4, marginBottom: spacing.md },
  modeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8faff', padding: spacing.md, borderRadius: borderRadius.md, borderLeftWidth: 4, marginBottom: spacing.sm, borderWidth: 1, borderColor: '#e5e7eb' },
  modeEmoji: { fontSize: 32, marginRight: 12 },
  modeTitle: { fontSize: 16, color: '#111827', fontWeight: '700' },
  modeDesc: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  progressWrap: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  progressBg: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: BLUE },
  progressText: { fontSize: 11, color: '#6b7280', marginTop: 6, textAlign: 'right' },
  qContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  qKicker: { fontSize: 11, color: BLUE, letterSpacing: 2, fontWeight: '700' },
  qText: { fontSize: 17, color: '#111827', lineHeight: 26, marginTop: 10, fontWeight: '600' },
  opt: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, backgroundColor: '#f9fafb', borderRadius: borderRadius.md, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  optActive: { backgroundColor: '#eff6ff', borderColor: BLUE },
  optKey: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optKeyActive: { backgroundColor: BLUE },
  optKeyText: { fontSize: 12, color: '#374151', fontWeight: '700' },
  optText: { fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },
  optTextActive: { color: '#111827', fontWeight: '600' },
  navRow: { flexDirection: 'row', gap: 12, marginTop: spacing.lg },
  navBtn: { flex: 1, padding: 14, borderRadius: borderRadius.md, alignItems: 'center', backgroundColor: '#f3f4f6' },
  navBtnPrimary: { backgroundColor: BLUE },
  navBtnDisabled: { opacity: 0.5 },
  navBtnText: { fontSize: 14, color: '#374151', fontWeight: '700' },
  errText: { color: '#b91c1c', fontSize: 13, marginTop: 10 },
  resultLevel: { fontSize: 32, color: '#fff', fontWeight: '700', marginTop: 12 },
  resultScore: { fontSize: 16, color: '#FCD34D', fontWeight: '700', marginTop: 4 },
  dimRow: { marginBottom: spacing.md },
  dimHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  dimLabel: { fontSize: 14, fontWeight: '700' },
  dimVal: { fontSize: 13, color: '#6b7280' },
  barBg: { height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#eff6ff', borderRadius: borderRadius.md },
  chipText: { fontSize: 12, color: BLUE, fontWeight: '600' },
  pointsBox: { backgroundColor: '#0f172a', padding: spacing.lg, borderRadius: borderRadius.md, alignItems: 'center' },
  pointsTitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8, letterSpacing: 1 },
  pointsVal: { fontSize: 28, color: '#FCD34D', fontWeight: '700', marginTop: 4 },
});
