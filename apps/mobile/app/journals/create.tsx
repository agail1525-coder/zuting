import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { api, Trip } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';

const MOOD_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: '平静', label: '平静', color: '#6366F1' },
  { value: '感动', label: '感动', color: '#EC4899' },
  { value: '感悟', label: '感悟', color: '#F59E0B' },
  { value: '宁静', label: '宁静', color: '#22C55E' },
  { value: '震撼', label: '震撼', color: '#EF4444' },
];

export default function JournalCreateScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [tripId, setTripId] = useState<string | null>(null);
  const [trips, setTrips] = useState<Pick<Trip, 'id' | 'title'>[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setTripsLoading(true);
      api
        .getTrips({ limit: '50' })
        .then((res) => {
          if (!cancelled) {
            const items = Array.isArray(res.data) ? res.data : [];
            setTrips(items.map((t) => ({ id: t.id, title: t.title })));
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setTripsLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleSubmit = async () => {
    setError(null);

    if (!title.trim()) {
      setError('请输入日记标题');
      return;
    }
    if (!content.trim()) {
      setError('请输入日记内容');
      return;
    }

    if (!user) {
      Alert.alert('请先登录', '创建日记需要登录账号', [
        { text: '取消', style: 'cancel' },
        { text: '去登录', onPress: () => router.push('/(tabs)/profile') },
      ]);
      return;
    }

    setSubmitting(true);
    try {
      const body: {
        title: string;
        content: string;
        mood?: string;
        isPublic?: boolean;
        tripId?: string;
      } = {
        title: title.trim(),
        content: content.trim(),
        isPublic,
      };
      if (mood) body.mood = mood;
      if (tripId) body.tripId = tripId;

      await api.createJournal(body);
      router.back();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '创建日记失败，请重试';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

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
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>写朝圣日记</Text>
          <View style={styles.backButton} />
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Title Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>标题 *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="如：菩提树下的觉悟"
            placeholderTextColor={colors.textMuted}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Content Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>内容 *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={content}
            onChangeText={setContent}
            placeholder="写下您的朝圣感悟..."
            placeholderTextColor={colors.textMuted}
            maxLength={5000}
            multiline
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length}/5000</Text>
        </View>

        {/* Mood Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>心情</Text>
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((m) => {
              const selected = mood === m.value;
              return (
                <Pressable
                  key={m.value}
                  onPress={() => setMood(selected ? null : m.value)}
                  style={[
                    styles.moodChip,
                    {
                      backgroundColor: selected ? `${m.color}30` : colors.backgroundCardSolid,
                      borderColor: selected ? m.color : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.moodChipText,
                      { color: selected ? m.color : colors.textSecondary },
                    ]}
                  >
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Public Toggle */}
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>公开日记</Text>
            <Text style={styles.toggleHint}>公开后其他朝圣者可以看到</Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: colors.backgroundCardSolid, true: `${colors.gold}40` }}
            thumbColor={isPublic ? colors.gold : colors.textMuted}
          />
        </View>

        {/* Trip Selection */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>关联行程（可选）</Text>
          {tripsLoading ? (
            <ActivityIndicator size="small" color={colors.gold} />
          ) : trips.length === 0 ? (
            <Text style={styles.noTripsText}>暂无可关联的行程</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tripChipsRow}
            >
              <Pressable
                onPress={() => setTripId(null)}
                style={[
                  styles.tripChip,
                  !tripId && styles.tripChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.tripChipText,
                    !tripId && styles.tripChipTextSelected,
                  ]}
                >
                  不关联
                </Text>
              </Pressable>
              {trips.map((t) => {
                const selected = tripId === t.id;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => setTripId(selected ? null : t.id)}
                    style={[
                      styles.tripChip,
                      selected && styles.tripChipSelected,
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={selected ? colors.gold : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.tripChipText,
                        selected && styles.tripChipTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {t.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Submit Button */}
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
            <ActivityIndicator size="small" color={colors.backgroundDark} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={colors.backgroundDark} />
              <Text style={styles.submitButtonText}>发布日记</Text>
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
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.sm + 4,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    flex: 1,
  },
  fieldGroup: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
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
    minHeight: 160,
    paddingTop: spacing.sm + 4,
  },
  charCount: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textAlign: 'right',
    marginTop: 4,
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  moodChipText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  toggleHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  noTripsText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  tripChipsRow: {
    gap: spacing.sm,
    paddingVertical: 2,
  },
  tripChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCardSolid,
    maxWidth: 180,
  },
  tripChipSelected: {
    borderColor: colors.gold,
    backgroundColor: `${colors.gold}15`,
  },
  tripChipText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  tripChipTextSelected: {
    color: colors.gold,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.gold,
    borderRadius: borderRadius.lg,
  },
  submitButtonPressed: {
    backgroundColor: colors.goldDark,
    transform: [{ scale: 0.98 }],
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
});
