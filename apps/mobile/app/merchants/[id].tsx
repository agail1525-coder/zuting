import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { Merchant, fetchMerchantDetail } from '../../src/lib/api';

const TYPE_LABELS: Record<string, string> = {
  TEMPLE: '寺庙',
  GUIDE: '导游',
  HOTEL: '住宿',
  TRANSPORT: '交通',
};

export default function MerchantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setError(null);
        const data = await fetchMerchantDetail(id);
        setMerchant(data);
        navigation.setOptions({ title: data.name });
      } catch (err) {
        console.error('Failed to fetch merchant:', err);
        setError('加载商家详情失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  const handleShare = async () => {
    if (!merchant) return;
    try {
      await Share.share({
        title: merchant.name,
        message: `查看合作商家「${merchant.name}」— 全球祖庭旅行平台`,
      });
    } catch {
      // user cancelled
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (error || !merchant) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.gold} />
        <Text style={styles.errorText}>{error ?? '商家不存在'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="storefront" size={40} color={colors.gold} />
        </View>
        <Text style={styles.name}>{merchant.name}</Text>
        <View style={styles.headerMeta}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{TYPE_LABELS[merchant.type] ?? merchant.type}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>{merchant.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.orderCount}>{merchant.totalOrders} 单</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusBadge,
            merchant.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive,
          ]}>
            <Text style={[
              styles.statusText,
              merchant.status === 'ACTIVE' ? styles.statusTextActive : styles.statusTextInactive,
            ]}>
              {merchant.status === 'ACTIVE' ? '营业中' : merchant.status === 'PENDING' ? '审核中' : '已暂停'}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Description */}
      {merchant.description && (
        <Animated.View entering={FadeInDown.duration(300).delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>商家简介</Text>
          <Text style={styles.description}>{merchant.description}</Text>
        </Animated.View>
      )}

      {/* Services */}
      {Array.isArray(merchant.services) && merchant.services.length > 0 && (
        <Animated.View entering={FadeInDown.duration(300).delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>服务项目</Text>
          {merchant.services.map(svc => (
            <View key={svc.id} style={styles.serviceItem}>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{svc.name}</Text>
                {svc.duration != null && (
                  <Text style={styles.serviceDuration}>{svc.duration}分钟</Text>
                )}
              </View>
              <Text style={styles.servicePrice}>¥{svc.price}</Text>
            </View>
          ))}
        </Animated.View>
      )}

      {/* Contact Info */}
      <Animated.View entering={FadeInDown.duration(300).delay(300)} style={styles.section}>
        <Text style={styles.sectionTitle}>联系方式</Text>
        {merchant.contactPhone && (
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.contactText}>{merchant.contactPhone}</Text>
          </View>
        )}
        {merchant.contactEmail && (
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.contactText}>{merchant.contactEmail}</Text>
          </View>
        )}
        {merchant.address && (
          <View style={styles.contactRow}>
            <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.contactText}>{merchant.address}</Text>
          </View>
        )}
        {!merchant.contactPhone && !merchant.contactEmail && !merchant.address && (
          <Text style={styles.noContact}>暂无联系方式</Text>
        )}
      </Animated.View>

      {/* Share Button */}
      <Animated.View entering={FadeInDown.duration(300).delay(400)} style={styles.section}>
        <Pressable
          style={({ pressed }) => [styles.shareButton, pressed && { opacity: 0.8 }]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>分享商家</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundCardSolid,
    marginBottom: spacing.sm,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  typeBadge: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  typeBadgeText: {
    fontSize: fontSize.sm,
    color: colors.gold,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  orderCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statusRow: {
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextInactive: {
    color: colors.error,
  },
  section: {
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  serviceDuration: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: fontSize.lg,
    color: colors.gold,
    fontWeight: '700',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  contactText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    flex: 1,
  },
  noContact: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
