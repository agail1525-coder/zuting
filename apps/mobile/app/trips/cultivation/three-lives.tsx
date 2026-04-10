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
import { api, type ThreeLifeVision } from '../../../src/lib/api';

const FIELDS = [
  { key: 'personalGoal' as const, icon: '🧘', label: '个人圆满', color: '#6366F1', ph: '心性、修为、健康...' },
  { key: 'familyGoal' as const, icon: '👨‍👩‍👧', label: '家庭幸福', color: '#F43F5E', ph: '亲密关系、传承...' },
  { key: 'businessGoal' as const, icon: '🏢', label: '事业兴旺', color: '#10B981', ph: '事业、布施...' },
];

export default function ThreeLivesScreen() {
  const [personalGoal, setPersonalGoal] = useState('');
  const [familyGoal, setFamilyGoal] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  const [saving, setSaving] = useState(false);

  const vals: Record<string, string> = { personalGoal, familyGoal, businessGoal };
  const sets: Record<string, (v: string) => void> = {
    personalGoal: setPersonalGoal,
    familyGoal: setFamilyGoal,
    businessGoal: setBusinessGoal,
  };

  useEffect(() => {
    api.getThreeLives().then((v) => {
      setPersonalGoal(v.personalGoal ?? '');
      setFamilyGoal(v.familyGoal ?? '');
      setBusinessGoal(v.businessGoal ?? '');
    }).catch(() => {});
  }, []);

  const onSave = async () => {
    setSaving(true);
    try {
      await api.updateThreeLives({ personalGoal, familyGoal, businessGoal });
      Alert.alert('已保存');
    } catch (e) {
      Alert.alert('失败', e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>
      <Text style={s.title}>三生愿景</Text>
      <Text style={s.subtitle}>起大愿 · 发大财 · 布施众生</Text>

      {FIELDS.map((f) => (
        <View key={f.key} style={s.card}>
          <View style={s.cardHeader}>
            <Text style={{ fontSize: 24 }}>{f.icon}</Text>
            <Text style={[s.cardLabel, { color: f.color }]}>{f.label}</Text>
          </View>
          <TextInput
            style={s.textarea}
            value={vals[f.key]}
            onChangeText={sets[f.key]}
            placeholder={f.ph}
            placeholderTextColor="rgba(212,168,85,0.3)"
            multiline
            maxLength={1000}
          />
          <Text style={s.counter}>{(vals[f.key] || '').length} / 1000</Text>
        </View>
      ))}

      <Pressable style={[s.btn, saving && { opacity: 0.6 }]} onPress={onSave} disabled={saving}>
        <Text style={s.btnText}>{saving ? '保存中...' : '保存三生愿景'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0a06' },
  title: { color: '#D4A855', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: 'rgba(212,168,85,0.5)', fontSize: 14, marginBottom: 20 },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(120,85,40,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.2)',
    marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  cardLabel: { fontWeight: '700', fontSize: 16 },
  textarea: {
    backgroundColor: 'rgba(120,85,40,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: '#D4A855',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  counter: { color: 'rgba(212,168,85,0.3)', fontSize: 11, textAlign: 'right', marginTop: 4 },
  btn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: '#D4A855',
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
