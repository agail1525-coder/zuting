import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';
import { useAuth } from '../../src/lib/auth-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  const counts = user?._count;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar Section */}
      <Animated.View entering={FadeInDown.duration(300)} style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={colors.gold} />
        </View>
        {user ? (
          <>
            <Text style={styles.userName}>{user.nickname}</Text>
            {user.phone && (
              <Text style={styles.userPhone}>{user.phone}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={styles.loginPrompt}>登录以开始朝圣之旅</Text>
            <Pressable
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>登录 / 注册</Text>
            </Pressable>
          </>
        )}
      </Animated.View>

      {/* Stats Row */}
      <Animated.View entering={FadeInDown.duration(300).delay(100)} style={styles.statsRow}>
        <StatItem value={String(counts?.trips ?? 0)} label="行程" />
        <StatDivider />
        <StatItem value={String(counts?.journals ?? 0)} label="日记" />
        <StatDivider />
        <StatItem value={String(counts?.practices ?? 0)} label="印" />
        <StatDivider />
        <StatItem value={String(counts?.orders ?? 0)} label="订单" />
      </Animated.View>

      {/* Pilgrimage Menu */}
      <Animated.View entering={FadeInDown.duration(300).delay(200)} style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>我的朝圣</Text>
        <MenuItem
          icon="airplane"
          label="我的行程"
          subtitle={`${counts?.trips ?? 0} 个行程`}
          onPress={() => router.push('/trips')}
        />
        <MenuItem
          icon="book"
          label="朝圣日记"
          subtitle={`${counts?.journals ?? 0} 篇日记`}
          onPress={() => router.push('/journals')}
        />
        <MenuItem
          icon="flower"
          label="修行记录"
          subtitle={`已完成 ${counts?.practices ?? 0} 印`}
          onPress={() => router.push('/(tabs)/seals')}
        />
        <MenuItem
          icon="footsteps"
          label="我的足迹"
          onPress={() => router.push('/trips')}
        />
        <MenuItem
          icon="heart"
          label="我的收藏"
          subtitle="收藏的圣地、祖庭、祖师"
          onPress={() => router.push('/collections' as never)}
        />
        <MenuItem
          icon="newspaper"
          label="攻略社区"
          subtitle="游记 · 问答 · 排行"
          onPress={() => router.push('/community' as never)}
        />
        <MenuItem
          icon="pricetag"
          label="优惠券"
          subtitle="领取并使用优惠券"
          onPress={() => router.push('/coupons' as never)}
        />
        <MenuItem
          icon="gift"
          label="促销活动"
          subtitle="闪购 · 早鸟价 · 限时折扣"
          onPress={() => router.push('/promotions' as never)}
        />
      </Animated.View>

      {/* Membership & Packages */}
      <Animated.View entering={FadeInDown.duration(300).delay(250)} style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>会员中心</Text>
        <MenuItem
          icon="diamond"
          label="会员中心"
          subtitle="等级 · 积分 · 签到"
          onPress={() => router.push('/membership' as never)}
        />
        <MenuItem
          icon="storefront"
          label="积分商城"
          subtitle="用积分兑换精美礼品"
          onPress={() => router.push('/points-mall' as never)}
        />
        <MenuItem
          icon="people"
          label="分销中心"
          subtitle="邀请好友 · 赚取积分"
          onPress={() => router.push('/referral' as never)}
        />
        <MenuItem
          icon="cube"
          label="我的套餐"
          subtitle="查看已预订套餐"
          onPress={() => router.push('/packages' as never)}
        />
      </Animated.View>

      {/* About */}
      <Animated.View entering={FadeInDown.duration(300).delay(300)} style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>关于</Text>
        <MenuItem icon="information-circle" label="关于祖庭之旅" onPress={() => Alert.alert('关于', '全球祖庭旅行平台 v0.2.0\n帮助100万人走祖庭')} />
        <MenuItem icon="document-text" label="用户协议" onPress={() => Linking.openURL('https://zuting.com/terms')} />
        <MenuItem icon="shield-checkmark" label="隐私政策" onPress={() => Linking.openURL('https://zuting.com/privacy')} />
      </Animated.View>

      {/* Logout */}
      {user && (
        <Animated.View entering={FadeInDown.duration(300).delay(400)} style={styles.menuSection}>
          <Pressable
            style={styles.logoutButton}
            onPress={async () => {
              await logout();
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={styles.logoutText}>退出登录</Text>
          </Pressable>
        </Animated.View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>全球祖庭旅行平台 v0.2.0</Text>
        <Text style={styles.footerSubtext}>
          帮助100万人走祖庭
        </Text>
      </View>
    </ScrollView>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatDivider() {
  return <View style={styles.statDivider} />;
}

function MenuItem({
  icon,
  label,
  subtitle,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && !disabled && styles.menuItemPressed,
        disabled && styles.menuItemDisabled,
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={disabled ? colors.textMuted : colors.gold}
      />
      <View style={styles.menuItemContent}>
        <Text
          style={[styles.menuItemLabel, disabled && styles.menuItemLabelDisabled]}
        >
          {label}
        </Text>
        {subtitle && (
          <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  userPhone: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  loginPrompt: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginBottom: spacing.md,
  },
  loginButton: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  logoutText: {
    color: colors.error,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.gold,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
  menuSection: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  menuSectionTitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  menuItemPressed: {
    opacity: 0.8,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '500',
  },
  menuItemLabelDisabled: {
    color: colors.textMuted,
  },
  menuItemSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  footerSubtext: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 4,
  },
});
