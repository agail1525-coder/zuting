import React from 'react';
import {
  ActivityIndicator,
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
          subtitle="3 个行程"
          onPress={() => router.push('/trips')}
        />
        <MenuItem
          icon="book"
          label="朝圣日记"
          subtitle="8 篇日记"
          onPress={() => router.push('/journals')}
        />
        <MenuItem
          icon="flower"
          label="修行记录"
          subtitle="已完成 5 印"
          onPress={() => router.push('/(tabs)/seals')}
        />
        <MenuItem
          icon="footsteps"
          label="我的足迹"
          subtitle="12 个圣地已到访"
        />
        <MenuItem
          icon="bookmark"
          label="收藏的圣地"
          subtitle="6 个收藏"
        />
      </Animated.View>

      {/* Settings */}
      <Animated.View entering={FadeInDown.duration(300).delay(300)} style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>设置</Text>
        <MenuItem icon="language" label="语言 / Language" subtitle="中文" />
        <MenuItem icon="moon" label="深色模式" subtitle="已开启" />
        <MenuItem icon="notifications" label="通知设置" />
      </Animated.View>

      {/* About */}
      <Animated.View entering={FadeInDown.duration(300).delay(400)} style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>关于</Text>
        <MenuItem icon="information-circle" label="关于祖庭之旅" />
        <MenuItem icon="document-text" label="用户协议" />
        <MenuItem icon="shield-checkmark" label="隐私政策" />
      </Animated.View>

      {/* Logout */}
      {user && (
        <Animated.View entering={FadeInDown.duration(300).delay(500)} style={styles.menuSection}>
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
    backgroundColor: colors.backgroundCard,
    borderWidth: 2,
    borderColor: colors.border,
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
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCard,
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
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
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
    backgroundColor: colors.border,
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
    backgroundColor: colors.backgroundCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: spacing.md,
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
