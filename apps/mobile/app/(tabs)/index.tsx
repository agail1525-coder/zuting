import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, Religion } from '../../src/lib/api';
import { ReligionCard } from '../../src/components/ReligionCard';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

interface Stats {
  religions: number;
  holySites: number;
  temples: number;
  seals: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const [religions, setReligions] = useState<Religion[]>([]);
  const [stats, setStats] = useState<Stats>({ religions: 0, holySites: 0, temples: 0, seals: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [religionsData, holySites, temples, seals] = await Promise.all([
        api.getReligions(),
        api.getHolySites(),
        api.getTemples(),
        api.getSeals(),
      ]);
      setReligions(religionsData);
      setStats({
        religions: religionsData.length,
        holySites: holySites.length,
        temples: temples.length,
        seals: seals.length,
      });
    } catch (err) {
      console.error('Failed to fetch home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading && religions.length === 0) return <LoadingView />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.gold}
        />
      }
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🙏</Text>
        <Text style={styles.heroTitle}>全球祖庭之旅</Text>
        <Text style={styles.heroSubtitle}>
          帮助100万人走祖庭 · 建立全球宗教文化和平使者网络
        </Text>
      </View>

      {/* Search Entry */}
      <Pressable
        style={({ pressed }) => [
          styles.searchBar,
          pressed && styles.searchBarPressed,
        ]}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>搜索圣地、祖庭、祖师...</Text>
      </Pressable>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatItem value={String(stats.religions)} label="信仰" />
        <StatDivider />
        <StatItem value={String(stats.holySites)} label="圣地" />
        <StatDivider />
        <StatItem value={String(stats.temples)} label="祖庭" />
        <StatDivider />
        <StatItem value={String(stats.seals)} label="印" />
      </View>

      {/* AI Assistant Quick Entry */}
      <Pressable
        style={({ pressed }) => [
          styles.aiCard,
          pressed && styles.aiCardPressed,
        ]}
        onPress={() => router.push('/(tabs)/chat')}
      >
        <View style={styles.aiCardLeft}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🏛</Text>
          </View>
          <View style={styles.aiCardContent}>
            <Text style={styles.aiCardTitle}>小鸿 · AI助手</Text>
            <Text style={styles.aiCardSubtitle}>
              问路线、查圣地、聊修行...
            </Text>
          </View>
        </View>
        <View style={styles.aiCardArrow}>
          <Ionicons name="chatbubble-ellipses" size={20} color={colors.gold} />
        </View>
      </Pressable>

      {/* Religion Grid */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>十二大信仰</Text>
        <Text style={styles.sectionSubtitle}>Twelve World Faiths</Text>
      </View>

      <View style={styles.grid}>
        {religions.map((religion) => (
          <View key={religion.id} style={styles.gridItem}>
            <ReligionCard religion={religion} />
          </View>
        ))}
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaEmoji}>🙏</Text>
        <Text style={styles.ctaTitle}>开始朝圣</Text>
        <Text style={styles.ctaSubtitle}>
          规划您的第一条朝圣路线，踏上心灵之旅
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
          ]}
          onPress={() => router.push('/trips')}
        >
          <Ionicons name="airplane" size={18} color={colors.backgroundDark} />
          <Text style={styles.ctaButtonText}>规划行程</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          世界本来同根生 · 万教归一
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 2,
  },
  heroSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchBarPressed: {
    backgroundColor: 'rgba(30, 41, 59, 1)',
    borderColor: colors.gold,
  },
  searchPlaceholder: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.gold,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  gridItem: {
    width: '50%',
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(212, 168, 85, 0.08)',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 85, 0.2)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  aiCardPressed: {
    opacity: 0.8,
    backgroundColor: 'rgba(212, 168, 85, 0.15)',
  },
  aiCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  aiAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 168, 85, 0.15)',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiAvatarText: {
    fontSize: 22,
  },
  aiCardContent: {
    flex: 1,
  },
  aiCardTitle: {
    color: colors.gold,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  aiCardSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  aiCardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 168, 85, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaSection: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  ctaEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  ctaTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ctaSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  ctaButtonPressed: {
    backgroundColor: colors.goldDark,
  },
  ctaButtonText: {
    color: colors.backgroundDark,
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontStyle: 'italic',
  },
});
