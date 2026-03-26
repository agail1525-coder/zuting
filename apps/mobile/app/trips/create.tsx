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
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { api } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { getAccessToken } from '../../src/lib/auth';

export default function TripCreateScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [persons, setPersons] = useState('1');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [note, setNote] = useState('');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const handleStartDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (date) setStartDate(date);
  };

  const handleEndDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (date) setEndDate(date);
  };

  const validate = (): string | null => {
    if (!title.trim()) return '请输入行程标题';
    if (!startDate) return '请选择出发日期';
    if (!endDate) return '请选择返程日期';
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
          startDate: formatDate(startDate!),
          endDate: formatDate(endDate!),
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
            <Pressable style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
              <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
              <Text style={startDate ? styles.dateText : styles.datePlaceholder}>
                {startDate ? formatDate(startDate) : '选择日期'}
              </Text>
            </Pressable>
          </View>
          <View style={[styles.field, styles.fieldHalf]}>
            <Text style={styles.label}>返程日期 *</Text>
            <Pressable style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
              <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
              <Text style={endDate ? styles.dateText : styles.datePlaceholder}>
                {endDate ? formatDate(endDate) : '选择日期'}
              </Text>
            </Pressable>
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate ?? new Date()}
            mode="date"
            minimumDate={new Date()}
            onChange={handleStartDateChange}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate ?? startDate ?? new Date()}
            mode="date"
            minimumDate={startDate ?? new Date()}
            onChange={handleEndDateChange}
          />
        )}

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
    borderColor: colors.border,
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
  },
  dateText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  datePlaceholder: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(212, 168, 85, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 85, 0.4)',
  },
  submitButtonPressed: {
    backgroundColor: 'rgba(212, 168, 85, 0.25)',
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
