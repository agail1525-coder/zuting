import React, { useEffect, useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, Route } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';

export default function RouteCheckoutScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [persons, setPersons] = useState('2');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!slug) return;
    api.getRouteBySlug(slug)
      .then(setRoute)
      .catch(() => { Alert.alert('提示', '加载路线信息失败'); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingView />;
  if (!route) {
    return (
      <View style={s.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#0066FF" />
        <Text style={s.errorText}>路线不存在</Text>
      </View>
    );
  }

  const totalPrice = (route.priceFrom / 100) * (parseInt(persons) || 1);

  const handleSubmit = async () => {
    if (!contactName.trim()) {
      Alert.alert('提示', '请填写联系人姓名');
      return;
    }
    setSubmitting(true);
    try {
      const token = await (await import('../../src/lib/auth')).getAccessToken();
      if (!token) {
        Alert.alert('提示', '请先登录');
        setSubmitting(false);
        return;
      }
      await api.createTrip({
        title: route.title,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + route.duration * 86400000).toISOString().slice(0, 10),
        persons: parseInt(persons) || 2,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim() || undefined,
        note: note.trim() || undefined,
      }, token);
      Alert.alert('预订成功', '行程已创建，请在"行程"中查看', [
        { text: '查看行程', onPress: () => router.replace('/(tabs)/trips' as never) },
      ]);
    } catch (err) {
      Alert.alert('预订失败', err instanceof Error ? err.message : '请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Route Summary */}
      <View style={s.summaryCard}>
        <Text style={s.summaryTitle}>{route.title}</Text>
        <Text style={s.summarySubtitle}>{route.subtitle}</Text>
        <View style={s.summaryMeta}>
          <Text style={s.metaItem}>📅 {route.duration}天{route.nights}晚</Text>
          <Text style={s.metaItem}>🌤 {route.season}</Text>
        </View>
      </View>

      {/* Form */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>预订信息</Text>

        <Text style={s.label}>出行人数</Text>
        <TextInput
          style={s.input}
          value={persons}
          onChangeText={setPersons}
          keyboardType="number-pad"
          placeholder="2"
        />

        <Text style={s.label}>联系人 *</Text>
        <TextInput
          style={s.input}
          value={contactName}
          onChangeText={setContactName}
          placeholder="请输入联系人姓名"
        />

        <Text style={s.label}>手机号</Text>
        <TextInput
          style={s.input}
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
          placeholder="请输入手机号"
        />

        <Text style={s.label}>备注</Text>
        <TextInput
          style={[s.input, { minHeight: 80, textAlignVertical: 'top' }]}
          value={note}
          onChangeText={setNote}
          placeholder="特殊需求或备注"
          multiline
        />
      </View>

      {/* Price Summary */}
      <View style={s.priceSection}>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>路线价格</Text>
          <Text style={s.priceValue}>¥{(route.priceFrom / 100).toLocaleString()}/人</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>人数</Text>
          <Text style={s.priceValue}>× {parseInt(persons) || 1}</Text>
        </View>
        <View style={[s.priceRow, s.totalRow]}>
          <Text style={s.totalLabel}>合计</Text>
          <Text style={s.totalValue}>¥{totalPrice.toLocaleString()}</Text>
        </View>
      </View>

      {/* Submit */}
      <Pressable
        style={[s.submitBtn, submitting && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={s.submitBtnText}>{submitting ? '提交中...' : '确认预订'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { paddingBottom: 40 },
  errorContainer: { flex: 1, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: '#6B7280', fontSize: 16 },
  summaryCard: {
    backgroundColor: '#FFFFFF', margin: 16, borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  summarySubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  summaryMeta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaItem: { fontSize: 13, color: '#6B7280' },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  label: { fontSize: 13, color: '#6B7280', marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1A1A1A',
  },
  priceSection: {
    backgroundColor: '#FFFFFF', margin: 16, borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#6B7280' },
  priceValue: { fontSize: 14, color: '#374151' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 4, marginBottom: 0 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  totalValue: { fontSize: 20, fontWeight: '800', color: '#EF4444' },
  submitBtn: {
    backgroundColor: '#0066FF', marginHorizontal: 16, marginTop: 8,
    borderRadius: 999, paddingVertical: 14, alignItems: 'center',
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
