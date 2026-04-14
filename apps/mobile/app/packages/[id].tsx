import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { fetchPackage, bookPackage, type PackageDetail } from '../../src/lib/api';

const PRIMARY = '#3264ff';
const GOLD = '#D4A855';

const INCLUDE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  '住宿': 'bed',
  '餐饮': 'restaurant',
  '交通': 'bus',
  '导游': 'person',
  '门票': 'ticket',
  '保险': 'shield-checkmark',
  '签证': 'document',
};

function includeIcon(text: string): keyof typeof Ionicons.glyphMap {
  for (const [key, icon] of Object.entries(INCLUDE_ICONS)) {
    if (text.includes(key)) return icon;
  }
  return 'checkmark-circle';
}

export default function PackageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // Booking form state
  const [startDate, setStartDate] = useState('');
  const [persons, setPersons] = useState('2');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [note, setNote] = useState('');
  const [showForm, setShowForm] = useState(false);

  React.useEffect(() => {
    if (!id) return;
    fetchPackage(id)
      .then(setPkg)
      .catch(() => Alert.alert('加载失败', '无法获取套餐详情'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!pkg) return;
    if (!startDate.trim()) { Alert.alert('请填写出发日期'); return; }
    if (!contactName.trim()) { Alert.alert('请填写联系人姓名'); return; }
    if (!contactPhone.trim()) { Alert.alert('请填写联系电话'); return; }

    const personsNum = parseInt(persons, 10);
    if (isNaN(personsNum) || personsNum < 1) { Alert.alert('人数不正确'); return; }

    setBooking(true);
    try {
      await bookPackage({
        packageId: pkg.id,
        startDate,
        persons: personsNum,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        note: note.trim() || undefined,
      });
      Alert.alert(
        '预订成功',
        '您的套餐预订已提交，工作人员将在24小时内联系您确认行程。',
        [{ text: '确定', onPress: () => router.back() }]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '预订失败，请稍后重试';
      Alert.alert('预订失败', msg);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (!pkg) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
        <Text style={styles.errorText}>套餐不存在</Text>
      </View>
    );
  }

  const totalAmount = pkg.priceFrom * (parseInt(persons, 10) || 1);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cover */}
        {pkg.coverImage ? (
          <Image source={{ uri: pkg.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.coverPlaceholder]}>
            <Ionicons name="cube" size={56} color={GOLD} />
          </View>
        )}

        {/* Title & Price */}
        <View style={styles.section}>
          <View style={styles.badgeRow}>
            {pkg.religion && (
              <View style={[styles.badge, { backgroundColor: `${pkg.religion.color ?? PRIMARY}20` }]}>
                <Text style={[styles.badgeText, { color: pkg.religion.color ?? PRIMARY }]}>{pkg.religion.name}</Text>
              </View>
            )}
            <View style={styles.badgeGray}>
              <Text style={styles.badgeGrayText}>{pkg.type}</Text>
            </View>
          </View>
          <Text style={styles.title}>{pkg.title}</Text>
          {pkg.subtitle && <Text style={styles.subtitle}>{pkg.subtitle}</Text>}

          <View style={styles.metaRow}>
            <MetaChip icon="time-outline" text={`${pkg.duration}天${pkg.nights}晚`} />
            {pkg.rating !== null && (
              <MetaChip icon="star" text={`${pkg.rating.toFixed(1)} (${pkg.reviewCount}条评价)`} iconColor={GOLD} />
            )}
            <MetaChip icon="people-outline" text={`${pkg.bookCount}人已预订`} />
          </View>

          <View style={styles.priceRow}>
            {pkg.originalPrice && pkg.originalPrice > pkg.priceFrom && (
              <Text style={styles.originalPrice}>原价 ¥{pkg.originalPrice.toLocaleString()}</Text>
            )}
            <Text style={styles.price}>¥{pkg.priceFrom.toLocaleString()}<Text style={styles.priceSuffix}> 起/人</Text></Text>
          </View>
        </View>

        {/* Highlights */}
        {pkg.highlights.length > 0 && (
          <View style={styles.section}>
            <SectionTitle icon="sparkles" title="行程亮点" />
            <View style={styles.highlightsList}>
              {pkg.highlights.map((h, i) => (
                <View key={i} style={styles.highlightItem}>
                  <Ionicons name="checkmark-circle" size={16} color={PRIMARY} />
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Description */}
        {pkg.description && (
          <View style={styles.section}>
            <SectionTitle icon="document-text" title="行程介绍" />
            <Text style={styles.description}>{pkg.description}</Text>
          </View>
        )}

        {/* Includes */}
        {pkg.includes.length > 0 && (
          <View style={styles.section}>
            <SectionTitle icon="checkbox" title="费用包含" />
            <View style={styles.includeGrid}>
              {pkg.includes.map((inc, i) => (
                <View key={i} style={styles.includeItem}>
                  <Ionicons name={includeIcon(inc)} size={20} color={PRIMARY} />
                  <Text style={styles.includeText}>{inc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Excluded */}
        {pkg.excluded.length > 0 && (
          <View style={styles.section}>
            <SectionTitle icon="close-circle" title="费用不含" iconColor={colors.error} />
            {pkg.excluded.map((ex, i) => (
              <View key={i} style={styles.excludeItem}>
                <Ionicons name="close" size={14} color={colors.error} />
                <Text style={styles.excludeText}>{ex}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Itinerary */}
        {pkg.itinerary.length > 0 && (
          <View style={styles.section}>
            <SectionTitle icon="map" title="行程安排" />
            {pkg.itinerary.map((day) => (
              <View key={day.day} style={styles.itineraryDay}>
                <View style={styles.itineraryDayHeader}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>D{day.day}</Text>
                  </View>
                  <Text style={styles.itineraryDayTitle}>{day.title}</Text>
                </View>
                {day.activities.map((a, i) => (
                  <View key={i} style={styles.activityItem}>
                    <View style={styles.activityDot} />
                    <Text style={styles.activityText}>{a}</Text>
                  </View>
                ))}
                <View style={styles.itineraryFooter}>
                  {day.meals.length > 0 && (
                    <View style={styles.mealBadge}>
                      <Ionicons name="restaurant" size={12} color={colors.textMuted} />
                      <Text style={styles.mealText}>{day.meals.join('/')}</Text>
                    </View>
                  )}
                  {day.accommodation && (
                    <View style={styles.mealBadge}>
                      <Ionicons name="bed" size={12} color={colors.textMuted} />
                      <Text style={styles.mealText}>{day.accommodation}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Tips */}
        {pkg.tips.length > 0 && (
          <View style={styles.section}>
            <SectionTitle icon="bulb" title="温馨提示" iconColor="#F59E0B" />
            {pkg.tips.map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <Ionicons name="information-circle" size={14} color="#F59E0B" />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Booking Form */}
        <View style={styles.section}>
          <Pressable
            style={styles.toggleFormBtn}
            onPress={() => setShowForm(!showForm)}
          >
            <Ionicons name="calendar-outline" size={20} color={PRIMARY} />
            <Text style={styles.toggleFormText}>{showForm ? '收起预订表单' : '立即预订此套餐'}</Text>
            <Ionicons name={showForm ? 'chevron-up' : 'chevron-down'} size={18} color={PRIMARY} />
          </Pressable>

          {showForm && (
            <View style={styles.bookingForm}>
              <FormField
                label="出发日期 *"
                value={startDate}
                onChangeText={setStartDate}
                placeholder="如: 2026-05-01"
              />
              <FormField
                label="出行人数 *"
                value={persons}
                onChangeText={setPersons}
                placeholder="人数"
                keyboardType="numeric"
              />
              <FormField
                label="联系人姓名 *"
                value={contactName}
                onChangeText={setContactName}
                placeholder="请输入真实姓名"
              />
              <FormField
                label="联系电话 *"
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="请输入手机号"
                keyboardType="phone-pad"
              />
              <FormField
                label="备注"
                value={note}
                onChangeText={setNote}
                placeholder="如有特殊要求请说明"
                multiline
              />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>预估费用</Text>
                <Text style={styles.totalAmount}>¥{totalAmount.toLocaleString()}</Text>
              </View>

              <Pressable
                style={[styles.bookBtn, booking && styles.bookBtnDisabled]}
                onPress={handleBook}
                disabled={booking}
              >
                {booking ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.bookBtnText}>确认预订</Text>
                )}
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom CTA */}
      {!showForm && (
        <View style={styles.stickyBottom}>
          <View>
            <Text style={styles.stickyPrice}>¥{pkg.priceFrom.toLocaleString()}<Text style={styles.stickyPriceSuffix}>/人起</Text></Text>
          </View>
          <Pressable style={styles.stickyBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.stickyBtnText}>立即预订</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function SectionTitle({ icon, title, iconColor = PRIMARY }: { icon: keyof typeof Ionicons.glyphMap; title: string; iconColor?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );
}

function MetaChip({ icon, text, iconColor = colors.textMuted }: { icon: keyof typeof Ionicons.glyphMap; text: string; iconColor?: string }) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon} size={13} color={iconColor} />
      <Text style={styles.metaChipText}>{text}</Text>
    </View>
  );
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>{label}</Text>
      <TextInput
        style={[styles.formInput, multiline && styles.formInputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 80 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  errorText: { fontSize: fontSize.lg, color: colors.textMuted },

  coverImage: { width: '100%', height: 260, backgroundColor: '#F9FAFB' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },

  section: {
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
  },

  badgeRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  badgeText: { fontSize: fontSize.xs, fontWeight: '600' },
  badgeGray: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm, backgroundColor: '#F3F4F6' },
  badgeGrayText: { fontSize: fontSize.xs, color: colors.textMuted },

  title: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: fontSize.md, color: colors.textSecondary },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F9FAFB', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.full },
  metaChipText: { fontSize: fontSize.xs, color: colors.textSecondary },

  priceRow: { gap: 2 },
  originalPrice: { fontSize: fontSize.sm, color: colors.textMuted, textDecorationLine: 'line-through' },
  price: { fontSize: 28, fontWeight: '800', color: colors.error },
  priceSuffix: { fontSize: fontSize.sm, fontWeight: '400', color: colors.textMuted },

  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitleText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },

  highlightsList: { gap: spacing.xs },
  highlightItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  highlightText: { fontSize: fontSize.md, color: colors.textPrimary, flex: 1, lineHeight: 22 },

  description: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 24 },

  includeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  includeItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, width: '47%' },
  includeText: { fontSize: fontSize.sm, color: colors.textPrimary, flex: 1 },

  excludeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  excludeText: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1, lineHeight: 20 },

  itineraryDay: {
    borderLeftWidth: 2,
    borderLeftColor: `${PRIMARY}40`,
    paddingLeft: spacing.md,
    marginBottom: spacing.md,
  },
  itineraryDayHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  dayBadge: { backgroundColor: PRIMARY, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  dayBadgeText: { color: '#FFFFFF', fontSize: fontSize.sm, fontWeight: '700' },
  itineraryDayTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.xs },
  activityDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: PRIMARY, marginTop: 7 },
  activityText: { fontSize: fontSize.md, color: colors.textSecondary, flex: 1, lineHeight: 22 },
  itineraryFooter: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, flexWrap: 'wrap' },
  mealBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  mealText: { fontSize: fontSize.xs, color: colors.textMuted },

  tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  tipText: { fontSize: fontSize.sm, color: colors.textSecondary, flex: 1, lineHeight: 20 },

  toggleFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${PRIMARY}10`,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  toggleFormText: { flex: 1, fontSize: fontSize.lg, fontWeight: '700', color: PRIMARY },

  bookingForm: { gap: spacing.md, paddingTop: spacing.sm },
  formField: { gap: spacing.xs },
  formLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textPrimary },
  formInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: '#F9FAFB',
  },
  formInputMulti: { height: 80, textAlignVertical: 'top' },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  totalLabel: { fontSize: fontSize.lg, color: colors.textSecondary },
  totalAmount: { fontSize: fontSize.xl, fontWeight: '800', color: colors.error },

  bookBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
  },
  bookBtnDisabled: { opacity: 0.7 },
  bookBtnText: { color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: '700' },

  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  stickyPrice: { fontSize: fontSize.xl, fontWeight: '800', color: colors.error },
  stickyPriceSuffix: { fontSize: fontSize.sm, fontWeight: '400', color: colors.textMuted },
  stickyBtn: {
    backgroundColor: PRIMARY,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
  },
  stickyBtnText: { color: '#FFFFFF', fontSize: fontSize.lg, fontWeight: '700' },
});
