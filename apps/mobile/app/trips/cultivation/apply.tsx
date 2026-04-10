import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../../../src/lib/theme';
import { api, type CultivationMineResponse } from '../../../src/lib/api';
import { useAuth } from '../../../src/lib/auth-context';

const TRADITIONS = [
  { value: 'ZEN', label: '禅宗' },
  { value: 'TIBETAN', label: '藏传' },
  { value: 'TAOISM', label: '道家' },
  { value: 'CONFUCIANISM', label: '儒家' },
  { value: 'HINDUISM', label: '印度' },
  { value: 'SIKHISM', label: '锡克' },
  { value: 'CHRISTIANITY', label: '基督' },
  { value: 'JUDAISM', label: '犹太' },
  { value: 'ISLAM', label: '伊斯兰' },
  { value: 'BAHAI', label: '巴哈伊' },
  { value: 'SHINTO', label: '神道' },
  { value: 'INDIGENOUS', label: '原住民' },
];

export default function CultivationApplyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [mine, setMine] = useState<CultivationMineResponse | null>(null);
  const [tab, setTab] = useState<'apply' | 'invite'>('apply');
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [tradition, setTradition] = useState('ZEN');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.getCultivationMine().then(setMine).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (mine?.hasAccess) router.replace('/trips/cultivation' as any);
  }, [mine, router]);

  const onApply = async () => {
    if (motivation.trim().length < 50) {
      Alert.alert('提示', '修行动机至少 50 字');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitCultivationApplication({
        motivation: motivation.trim(),
        experience: experience.trim() || undefined,
        primaryTradition: tradition,
      });
      Alert.alert('成功', '申请已提交，请耐心等待审核');
      api.getCultivationMine().then(setMine);
    } catch (e) {
      Alert.alert('失败', e instanceof Error ? e.message : '提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const onRedeem = async () => {
    if (!code.trim()) {
      Alert.alert('提示', '请输入邀请码');
      return;
    }
    setSubmitting(true);
    try {
      await api.redeemCultivationInvite(code.trim());
      Alert.alert('成功', '兑换成功，即将跳转...');
      setTimeout(() => router.replace('/trips/cultivation' as any), 800);
    } catch (e) {
      Alert.alert('失败', e instanceof Error ? e.message : '兑换失败');
    } finally {
      setSubmitting(false);
    }
  };

  const pending = mine?.application?.status === 'PENDING';
  const rejected = mine?.application?.status === 'REJECTED';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <Text style={styles.icon}>☸</Text>
        <Text style={styles.title}>圆满之路 · 修行圈</Text>
        <Text style={styles.subtitle}>
          管理员授权或导师邀请制。禅宗主线，12 文化融通。
        </Text>
      </View>

      {pending && (
        <View style={styles.statusCard}>
          <Text style={{ color: '#93C5FD', fontWeight: '600' }}>⏳ 申请审核中</Text>
          <Text style={{ color: 'rgba(147,197,253,0.6)', fontSize: 12, marginTop: 4 }}>
            提交于 {new Date(mine!.application!.createdAt).toLocaleDateString()}
          </Text>
        </View>
      )}

      {rejected && (
        <View style={[styles.statusCard, { borderColor: 'rgba(251,113,133,0.4)' }]}>
          <Text style={{ color: '#FDA4AF', fontWeight: '600' }}>申请未通过</Text>
          <Text style={{ color: 'rgba(253,164,175,0.6)', fontSize: 12, marginTop: 4 }}>
            {mine?.application?.rejectionReason || '可在 30 天后重新提交'}
          </Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setTab('apply')}
          disabled={!!pending}
          style={[styles.tab, tab === 'apply' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'apply' && styles.tabTextActive]}>提交申请</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('invite')}
          style={[styles.tab, tab === 'invite' && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === 'invite' && styles.tabTextActive]}>兑换邀请码</Text>
        </Pressable>
      </View>

      {tab === 'apply' && !pending && (
        <View style={styles.form}>
          <Text style={styles.label}>修行动机 *</Text>
          <TextInput
            style={styles.textarea}
            value={motivation}
            onChangeText={setMotivation}
            placeholder="请说明你为什么希望加入修行圈..."
            placeholderTextColor="rgba(212,168,85,0.3)"
            multiline
            maxLength={2000}
          />
          <Text style={styles.counter}>{motivation.length} / 2000</Text>

          <Text style={styles.label}>修行经验 (可选)</Text>
          <TextInput
            style={styles.textarea}
            value={experience}
            onChangeText={setExperience}
            placeholder="例如：禅坐 3 年..."
            placeholderTextColor="rgba(212,168,85,0.3)"
            multiline
            maxLength={2000}
          />

          <Text style={styles.label}>主修文化</Text>
          <View style={styles.tradGrid}>
            {TRADITIONS.map((tr) => (
              <Pressable
                key={tr.value}
                style={[styles.tradChip, tradition === tr.value && styles.tradChipActive]}
                onPress={() => setTradition(tr.value)}
              >
                <Text
                  style={[styles.tradChipText, tradition === tr.value && styles.tradChipTextActive]}
                >
                  {tr.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.submitButton, submitting && { opacity: 0.6 }]}
            onPress={onApply}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>提交申请</Text>
            )}
          </Pressable>
        </View>
      )}

      {tab === 'invite' && (
        <View style={styles.form}>
          <Text style={styles.label}>邀请码</Text>
          <TextInput
            style={[styles.input, { fontFamily: 'monospace', letterSpacing: 4, fontSize: 18 }]}
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            placeholder="ZEN-A1B2C3"
            placeholderTextColor="rgba(212,168,85,0.3)"
            maxLength={32}
          />
          <Text style={styles.hint}>邀请码由导师/祖师生成，每月限 5 张</Text>
          <Pressable
            style={[styles.submitButton, submitting && { opacity: 0.6 }]}
            onPress={onRedeem}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>立即兑换</Text>
            )}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0a06' },
  header: { paddingHorizontal: spacing.lg, paddingTop: 60, paddingBottom: spacing.lg },
  icon: { fontSize: 40, marginBottom: 8 },
  title: { color: '#D4A855', fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: 'rgba(212,168,85,0.6)', fontSize: 14, lineHeight: 20 },
  statusCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.3)',
    backgroundColor: 'rgba(59,130,246,0.1)',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(120,85,40,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.3)',
    padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: borderRadius.md },
  tabActive: { backgroundColor: '#D4A855' },
  tabText: { color: 'rgba(212,168,85,0.5)', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  form: { paddingHorizontal: spacing.lg },
  label: { color: '#D4A855', fontWeight: '600', fontSize: 14, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: 'rgba(120,85,40,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.3)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    color: '#D4A855',
    fontSize: 16,
  },
  textarea: {
    backgroundColor: 'rgba(120,85,40,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.3)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    color: '#D4A855',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  counter: { color: 'rgba(212,168,85,0.3)', fontSize: 11, textAlign: 'right', marginTop: 4 },
  hint: { color: 'rgba(212,168,85,0.4)', fontSize: 12, marginTop: 8, lineHeight: 18 },
  tradGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tradChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(120,85,40,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(120,85,40,0.3)',
  },
  tradChipActive: { backgroundColor: 'rgba(212,168,85,0.25)', borderColor: '#D4A855' },
  tradChipText: { color: 'rgba(212,168,85,0.5)', fontSize: 13, fontWeight: '500' },
  tradChipTextActive: { color: '#D4A855' },
  submitButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    backgroundColor: '#D4A855',
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
