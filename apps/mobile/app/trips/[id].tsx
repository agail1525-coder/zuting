import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { api, type Trip, type TripStatus } from '../../src/lib/api';
import ReviewSection from '../../src/components/ReviewSection';
import { useTranslation } from '../../src/lib/i18n';

const STATUS_STEP_KEYS: TripStatus[] = ['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94A3B8',
  PLANNING: '#6366F1',
  SUBMITTED: '#8B5CF6',
  CONFIRMED: '#22C55E',
  PAID: '#10B981',
  PREPARING: '#06B6D4',
  IN_PROGRESS: '#F59E0B',
  COMPLETED: '#3264ff',
  REVIEWING: '#A78BFA',
  CANCELLED: '#9CA3AF',
  REFUNDING: '#EF4444',
  REFUNDED: '#9CA3AF',
};

const STATUS_LABEL_KEYS: Record<string, string> = {
  DRAFT: 'trips.status.draft',
  PLANNING: 'trips.status.planning',
  SUBMITTED: 'trips.status.submitted',
  CONFIRMED: 'trips.status.confirmed',
  PAID: 'trips.status.paid',
  PREPARING: 'trips.status.preparing',
  IN_PROGRESS: 'trips.status.inProgress',
  COMPLETED: 'trips.status.completed',
  REVIEWING: 'trips.status.reviewing',
  CANCELLED: 'trips.status.cancelled',
  REFUNDING: 'trips.status.refunding',
  REFUNDED: 'trips.status.refunded',
};

const TRANSITION_ACTIONS: Partial<Record<TripStatus, { action: string; labelKey: string; icon: 'arrow-forward' | 'send' | 'close-circle' | 'checkmark-done' }[]>> = {
  DRAFT: [
    { action: 'start_planning', labelKey: 'trips.action.startPlanning', icon: 'arrow-forward' },
  ],
  PLANNING: [
    { action: 'submit', labelKey: 'trips.action.submit', icon: 'send' },
    { action: 'save_draft', labelKey: 'trips.action.saveDraft', icon: 'arrow-forward' },
  ],
  SUBMITTED: [
    { action: 'user_cancel', labelKey: 'trips.action.cancel', icon: 'close-circle' },
  ],
  CONFIRMED: [
    { action: 'user_cancel', labelKey: 'trips.action.cancel', icon: 'close-circle' },
  ],
  IN_PROGRESS: [
    { action: 'complete_trip', labelKey: 'trips.action.complete', icon: 'checkmark-done' },
  ],
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const fetchTrip = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTripById(id);
      setTrip(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trips.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleTransition = useCallback(async (action: string) => {
    if (!id || transitioning) return;
    setTransitioning(true);
    try {
      const updated = await api.transitionTrip(id, action);
      setTrip(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('trips.actionFailed'));
    } finally {
      setTransitioning(false);
    }
  }, [id, transitioning]);

  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={[styles.emptyText, { marginTop: spacing.md }]}>{t('trips.loading')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="cloud-offline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { marginTop: spacing.md }]}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchTrip}>
          <Ionicons name="refresh" size={18} color={colors.gold} />
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="map-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.emptyText, { marginTop: spacing.md }]}>{t('trips.notFound')}</Text>
        <Pressable style={styles.retryButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={colors.gold} />
          <Text style={styles.retryButtonText}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  const sites = Array.isArray(trip.sites) ? trip.sites : [];
  const currentStepIndex = STATUS_STEP_KEYS.findIndex((s) => s === trip.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <Text style={styles.headerEmoji}>{'🧭'}</Text>
        <Text style={styles.headerTitle}>{trip.title}</Text>
        {(trip.startDate || trip.endDate) && (
          <Text style={styles.headerDate}>
            {trip.startDate ?? t('trips.tbd')} ~ {trip.endDate ?? t('trips.tbd')}
          </Text>
        )}
        {trip.note ? (
          <Text style={styles.headerDescription}>{trip.note}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{trip.persons ?? 0} {t('trips.travelers')}</Text>
          {trip.totalBudget != null && (
            <Text style={styles.metaText}>{t('trips.budget')} ¥{trip.totalBudget}</Text>
          )}
        </View>
      </Animated.View>

      {/* Status step indicator */}
      <Animated.View entering={FadeInDown.duration(300).delay(100)} style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>{t('trips.tripStatus')}</Text>
        <View style={styles.steps}>
          {STATUS_STEP_KEYS.map((stepKey, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const stepColor = isActive ? (STATUS_COLORS[stepKey] ?? colors.textMuted) : colors.textMuted;
            return (
              <View key={stepKey} style={styles.stepRow}>
                <View style={styles.stepIndicator}>
                  <View
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: isActive ? stepColor : 'transparent',
                        borderColor: stepColor,
                      },
                      isCurrent && styles.stepDotCurrent,
                    ]}
                  >
                    {isActive && (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    )}
                  </View>
                  {index < STATUS_STEP_KEYS.length - 1 && (
                    <View
                      style={[
                        styles.stepLine,
                        {
                          backgroundColor: index < currentStepIndex
                            ? STATUS_COLORS[STATUS_STEP_KEYS[index + 1]]
                            : '#E5E7EB',
                        },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isActive && { color: stepColor },
                    isCurrent && { fontWeight: '700' },
                  ]}
                >
                  {t(STATUS_LABEL_KEYS[stepKey] ?? 'trips.status.draft')}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Sites list */}
      <Animated.View entering={FadeInDown.duration(300).delay(200)} style={styles.sitesSection}>
        <Text style={styles.sectionTitle}>{t('trips.pilgrimageRoute')} ({sites.length} {t('trips.stops')})</Text>
        {sites.length === 0 ? (
          <Text style={styles.emptyText}>{t('trips.noStops')}</Text>
        ) : (
          sites.map((tripSite, index) => (
            <Animated.View
              key={tripSite.id}
              entering={FadeInRight.duration(300).delay(300 + index * 80)}
            >
              <View style={styles.siteCard}>
                <View style={styles.siteOrder}>
                  <Text style={styles.siteOrderText}>{tripSite.order}</Text>
                  {index < sites.length - 1 && <View style={styles.siteConnector} />}
                </View>
                <View style={styles.siteContent}>
                  <View style={styles.siteHeader}>
                    <Text style={styles.siteEmoji}>{'📍'}</Text>
                    <View style={styles.siteInfo}>
                      <Text style={styles.siteName}>{tripSite.site.name}</Text>
                      <Text style={styles.siteNameEn}>{tripSite.site.nameEn}</Text>
                    </View>
                    {tripSite.visitDate && (
                      <View style={styles.visitedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <Text style={styles.visitedText}>{t('trips.visited')}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.siteCountry}>{tripSite.site.country}</Text>
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </Animated.View>

      {/* Action buttons */}
      {(TRANSITION_ACTIONS[trip.status]?.length ?? 0) > 0 && (
        <Animated.View entering={FadeInDown.duration(300).delay(400)} style={styles.actions}>
          {TRANSITION_ACTIONS[trip.status]?.map((ta, idx) => {
            const isPrimary = idx === 0;
            return (
              <Pressable
                key={ta.action}
                style={isPrimary ? styles.primaryButton : styles.secondaryButton}
                onPress={() => handleTransition(ta.action)}
                disabled={transitioning}
              >
                {transitioning ? (
                  <ActivityIndicator size="small" color={isPrimary ? '#FFFFFF' : colors.gold} />
                ) : (
                  <Ionicons name={ta.icon} size={20} color={isPrimary ? '#FFFFFF' : colors.gold} />
                )}
                <Text style={isPrimary ? styles.primaryButtonText : styles.secondaryButtonText}>
                  {t(ta.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      )}

      {/* Reviews */}
      <View style={{ marginHorizontal: spacing.md, marginBottom: spacing.lg }}>
        <ReviewSection targetType="TRIP" targetId={id!} />
      </View>

      {/* Trip info */}
      <Animated.View entering={FadeInDown.duration(300).delay(500)} style={styles.timelineSection}>
        <Text style={styles.sectionTitle}>{t('trips.tripInfo')}</Text>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDot}>
            <View style={styles.timelineDotInner} />
            <View style={styles.timelineLine} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineStatus}>{t('trips.createdAt')}</Text>
            <Text style={styles.timelineDate}>{new Date(trip.createdAt).toLocaleDateString(locale)}</Text>
          </View>
        </View>
        <View style={styles.timelineItem}>
          <View style={styles.timelineDot}>
            <View style={[styles.timelineDotInner, styles.timelineDotActive]} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineStatus}>{t('trips.currentStatus')}</Text>
            <Text style={styles.timelineNote}>{t(STATUS_LABEL_KEYS[trip.status] ?? 'trips.status.draft')}</Text>
            <Text style={styles.timelineDate}>{new Date(trip.updatedAt).toLocaleDateString(locale)}</Text>
          </View>
        </View>
        {trip.contactName && (
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>{t('trips.contactName')}: {trip.contactName}</Text>
            {trip.contactPhone && (
              <Text style={styles.contactLabel}>{t('trips.contactPhone')}: {trip.contactPhone}</Text>
            )}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gold,
    gap: spacing.xs,
  },
  retryButtonText: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.gold,
    textAlign: 'center',
  },
  headerDate: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  headerDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  stepsContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepRow: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepDotCurrent: {
    shadowColor: '#3264ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  stepLine: {
    position: 'absolute',
    height: 2,
    left: '50%',
    right: '-50%',
    top: 13,
  },
  stepLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  sitesSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  siteCard: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  siteOrder: {
    alignItems: 'center',
    width: 36,
    marginRight: spacing.md,
  },
  siteOrderText: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: colors.gold,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
    overflow: 'hidden',
  },
  siteConnector: {
    width: 2,
    height: 32,
    backgroundColor: '#E5E7EB',
    marginVertical: 2,
  },
  siteContent: {
    flex: 1,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  siteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  siteEmoji: {
    fontSize: 24,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  siteNameEn: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  visitedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  visitedText: {
    color: colors.success,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  siteCountry: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    marginLeft: 32 + spacing.sm,
  },
  actions: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 102, 255, 0.06)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.gold,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  timelineSection: {
    marginHorizontal: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  timelineDot: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.md,
  },
  timelineDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.textMuted,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  timelineStatus: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  timelineNote: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: 2,
  },
  timelineDate: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  contactInfo: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  contactLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
});
