import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { api } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { getAccessToken } from '../../src/lib/auth';

export default function TripCreateScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [persons, setPersons] = useState('1');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [note, setNote] = useState('');

  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseDate = (str: string): Date | null => {
    const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (!match) return null;
    const d = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
    return isNaN(d.getTime()) ? null : d;
  };

  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);

  const validate = (): string | null => {
    if (!title.trim()) return '请输入行程标题';
    if (!startDate) return '请输入出发日期 (格式: 2026-04-01)';
    if (!endDate) return '请输入返程日期 (格式: 2026-04-05)';
    if (endDate <= startDate) return '返程日期必须晚于出发日期';
    const p = parseInt(persons, 10);
    if (isNaN(p) || p < 1 || p > 20) return '出行人数需在 1-20 之间';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      setError('请先登录');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const trip = await api.createTrip(
        {
          title: title.trim(),
          startDate: startDateStr,
          endDate: endDateStr,
          persons: parseInt(persons, 10),
          contactName: contactName.trim() || undefined,
          contactPhone: contactPhone.trim() || undefined,
          note: note.trim() || undefined,
        },
        token,
      );
      router.replace(`/trips/${trip.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '创建行程失败，请重试';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyText}>请先登录</Text>
        <Text style={styles.emptySubtext}>登录后即可创建朝圣行程</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>创建新行程</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.headerSubtitle}>规划您的祖庭朝圣之旅</Text>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>行程标题 *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="如：东方禅宗祖庭朝圣之旅"
            placeholderTextColor={colors.textMuted}
            maxLength={100}
          />
        </View>

        {/* Start Date */}
        <View style={styles.row}>
          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>出发日期 *</Text>
            <TextInput
              style={styles.input}
              value={startDateStr}
              onChangeText={setStartDateStr}
              placeholder="2026-04-01"
              placeholderTextColor={colors.textMuted}
              maxLength={10}
            />
          </View>
          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>返程日期 *</Text>
            <TextInput
              style={styles.input}
              value={endDateStr}
              onChangeText={setEndDateStr}
              placeholder="2026-04-05"
              placeholderTextColor={colors.textMuted}
              maxLength={10}
            />
          </View>
        </View>

        {/* Persons & Phone */}
        <View style={styles.row}>
          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>出行人数</Text>
            <TextInput
              style={styles.input}
              value={persons}
              onChangeText={(t) => setPersons(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>联系电话</Text>
            <TextInput
              style={styles.input}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="手机号"
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              maxLength={20}
            />
          </View>
        </View>

        {/* Contact Name */}
        <View style={styles.field}>
          <Text style={styles.label}>联系人姓名</Text>
          <TextInput
            style={styles.input}
            value={contactName}
            onChangeText={setContactName}
            placeholder="请输入联系人姓名"
            placeholderTextColor={colors.textMuted}
            maxLength={50}
          />
        </View>

        {/* Note */}
        <View style={styles.field}>
          <Text style={styles.label}>备注</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={note}
            onChangeText={setNote}
            placeholder="特殊需求或注意事项..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={colors.gold} />
          ) : (
            <>
              <Ionicons name="airplane" size={18} color={colors.gold} />
              <Text style={styles.submitText}>创建行程</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.md,
    flex: 1,
  },
  field: {
    marginBottom: spacing.md,
  },
  fieldHalf: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs + 2,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  textArea: {
    minHeight: 80,
    paddingTop: spacing.sm + 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.3)',
  },
  submitButtonPressed: {
    backgroundColor: 'rgba(0, 102, 255, 0.2)',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: colors.gold,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.xl,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
