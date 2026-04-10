import React, { useState, useEffect } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { spacing, borderRadius } from '../../../src/lib/theme';
import { api, type DailySealResponse } from '../../../src/lib/api';

export default function DailySealScreen() {
  const [session, setSession] = useState<'MORNING' | 'EVENING'>('MORNING');
  const [data, setData] = useState<DailySealResponse | null>(null);
  const [audioSec, setAudioSec] = useState(0);
  const [reflection, setReflection] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () =>
    api
      .getTodaySeal(session)
      .then((d) => {
        setData(d);
        setAudioSec(d.practice?.audioListenedSec ?? 0);
        setReflection(d.practice?.reflection ?? '');
      })
      .catch(() => {});

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const onSubmit = async () => {
    if (!data) return;
    if (audioSec < 60) {
      Alert.alert('提示', '音频至少听满 60 秒');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitSealPractice({
        sealId: data.recommendedSealId,
        session,
        audioListenedSec: audioSec,
        reflection: reflection.trim() || undefined,
      });
      load();
    } catch (e) {
      Alert.alert('失败', e instanceof Error ? e.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>
      <Text style={s.title}>每日一印</Text>
      <Text style={s.subtitle}>三十印 × 12 文化主修</Text>

      <View style={s.tabs}>
        {(['MORNING', 'EVENING'] as const).map((ss) => (
          <Pressable
            key={ss}
            style={[s.tab, session === ss && s.tabActive]}
            onPress={() => setSession(ss)}
          >
            <Text style={[s.tabText, session === ss && s.tabTextActive]}>
              {ss === 'MORNING' ? '🌅 晨课' : '🌙 晚课'}
            </Text>
          </Pressable>
        ))}
      </View>

      {data && (
        <View style={s.form}>
          <Text style={s.label}>推荐印：{data.recommendedSealId}</Text>
          <Text style={[s.label, { marginTop: 16 }]}>音频听课时长 (秒) *</Text>
          <TextInput
            style={s.input}
            value={String(audioSec)}
            onChangeText={(t) => setAudioSec(parseInt(t || '0', 10))}
            keyboardType="number-pad"
          />
          <Text style={s.hint}>至少 60 秒方可打卡</Text>

          <Text style={[s.label, { marginTop: 16 }]}>修行心得 (可选)</Text>
          <TextInput
            style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
            value={reflection}
            onChangeText={setReflection}
            multiline
            maxLength={1000}
          />

          {data.practice?.status === 'DONE' && (
            <View style={s.done}>
              <Text style={{ color: '#22C55E', fontWeight: '600' }}>
                ✓ 今日{session === 'MORNING' ? '晨' : '晚'}课已完成
              </Text>
            </View>
          )}

          <Pressable style={[s.btn, submitting && { opacity: 0.6 }]} onPress={onSubmit} disabled={submitting}>
            <Text style={s.btnText}>{submitting ? '提交中...' : '完成打卡'}</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0a06' },
  title: { color: '#D4A855', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: 'rgba(212,168,85,0.5)', fontSize: 14, marginBottom: 20 },
  tabs: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(120,85,40,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.3)',
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: borderRadius.md },
  tabActive: { backgroundColor: '#D4A855' },
  tabText: { color: 'rgba(212,168,85,0.5)', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  form: {},
  label: { color: '#D4A855', fontWeight: '600', fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(120,85,40,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.3)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    color: '#D4A855',
    fontSize: 16,
  },
  hint: { color: 'rgba(212,168,85,0.3)', fontSize: 12, marginTop: 4 },
  done: {
    marginTop: 16,
    padding: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  btn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: '#D4A855',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
