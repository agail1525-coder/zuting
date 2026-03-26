import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { api, Journal } from '../../src/lib/api';

const MOOD_COLORS: Record<string, string> = {
  '平静': '#6366F1',
  '感动': '#EC4899',
  '感悟': '#F59E0B',
  '宁静': '#22C55E',
  '震撼': '#EF4444',
};

export default function JournalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let cancelled = false;
      setLoading(true);
      setError(null);
      api.getJournalById(id)
        .then((res) => {
          if (!cancelled) setJournal(res);
        })
        .catch((err: Error) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => { cancelled = true; };
    }, [id])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>加载日志中...</Text>
      </View>
    );
  }

  if (error || !journal) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>加载失败</Text>
        <Text style={styles.errorDetail}>{error ?? '日志不存在'}</Text>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </Pressable>
      </View>
    );
  }

  const moodColor = (journal.mood && MOOD_COLORS[journal.mood]) || colors.gold;
  const dateStr = journal.createdAt ? new Date(journal.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>日志详情</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Title & Meta */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>{journal.title}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{dateStr}</Text>
          {journal.mood && (
            <View style={[styles.moodTag, { backgroundColor: `${moodColor}20` }]}>
              <Text style={[styles.moodText, { color: moodColor }]}>{journal.mood}</Text>
            </View>
          )}
        </View>
        {journal.trip && (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{journal.trip.title}</Text>
          </View>
        )}
        {journal.user && (
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{journal.user.nickname}</Text>
          </View>
        )}
      </View>

      {/* Images */}
      {Array.isArray(journal.images) && journal.images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
          contentContainerStyle={styles.imageScrollContent}
        >
          {journal.images.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.image} resizeMode="cover" />
          ))}
        </ScrollView>
      )}

      {/* Content */}
      <View style={styles.contentSection}>
        <Text style={styles.content}>{journal.content}</Text>
      </View>

      {/* Footer stats */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{journal.content?.length ?? 0} 字</Text>
        {journal.isPublic && (
          <View style={styles.publicTag}>
            <Ionicons name="globe-outline" size={12} color={colors.gold} />
            <Text style={styles.publicText}>公开</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  errorText: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  errorDetail: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  backButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.backgroundCardSolid,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backButtonText: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: '600',
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
  headerTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  titleSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    color: colors.gold,
    fontSize: fontSize.xxl,
    fontWeight: '800',
    lineHeight: 36,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  moodTag: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  moodText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  imageScroll: {
    marginTop: spacing.lg,
  },
  imageScrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  image: {
    width: 240,
    height: 180,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundCardSolid,
  },
  contentSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  content: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    lineHeight: 28,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  publicTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  publicText: {
    color: colors.gold,
    fontSize: fontSize.sm,
  },
});
