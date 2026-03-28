import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, Religion, Route } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const CATEGORY_ICONS: { value: string; icon: string; label: string }[] = [
  { value: 'ZEN', icon: '🏯', label: '禅宗' },
  { value: 'BUDDHIST', icon: '☸', label: '佛教' },
  { value: 'TAOIST', icon: '☯', label: '道教' },
  { value: 'CHRISTIAN', icon: '⛪', label: '基督' },
  { value: 'ISLAMIC', icon: '🕌', label: '丝路' },
  { value: 'CROSS_CULTURAL', icon: '🌏', label: '跨文化' },
  { value: 'HINDU', icon: '🕉', label: '印度教' },
  { value: 'CULTURAL_HERITAGE', icon: '📖', label: '遗产' },
];

const HOT_TAGS = ['禅宗路线', '耶路撒冷', '丝绸之路', '朝圣之旅', '文化体验'];

export default function HomeScreen() {
  const router = useRouter();
  const [featuredRoutes, setFeaturedRoutes] = useState<Route[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [routesData, religionsData] = await Promise.all([
        api.getFeaturedRoutes(6),
        api.getReligions(),
      ]);
      setFeaturedRoutes(routesData);
      setReligions(religionsData);
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

  if (loading && featuredRoutes.length === 0) return <LoadingView />;

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
        <Text style={styles.heroTitle}>走祖庭，看世界</Text>
        <Text style={styles.heroSubtitle}>
          探索全球文化圣地 · 深度旅行体验
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
        <Text style={styles.searchPlaceholder}>搜路线、查目的地...</Text>
      </Pressable>

      {/* Hot Tags */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsContainer}
      >
        {HOT_TAGS.map((tag) => (
          <Pressable
            key={tag}
            style={styles.tag}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.tagText}>#{tag}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Category Icons */}
      <View style={styles.categoryGrid}>
        {CATEGORY_ICONS.map((cat) => (
          <Pressable
            key={cat.value}
            style={({ pressed }) => [
              styles.categoryItem,
              pressed && styles.categoryItemPressed,
            ]}
            onPress={() => router.push('/routes' as never)}
          >
            <View style={styles.categoryIcon}>
              <Text style={styles.categoryEmoji}>{cat.icon}</Text>
            </View>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Featured Routes */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>精选路线</Text>
        <Pressable onPress={() => router.push('/routes' as never)}>
          <Text style={styles.sectionMore}>查看全部 &gt;</Text>
        </Pressable>
      </View>

      <FlatList
        data={featuredRoutes}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.routeListContainer}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RouteCard route={item} onPress={() => router.push(`/routes/${item.slug}` as never)} />
        )}
      />

      {/* AI Planner Card */}
      <Pressable
        style={({ pressed }) => [
          styles.aiCard,
          pressed && styles.aiCardPressed,
        ]}
        onPress={() => router.push('/(tabs)/chat')}
      >
        <View style={styles.aiCardLeft}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
          <View style={styles.aiCardContent}>
            <Text style={styles.aiCardTitle}>AI旅行规划师</Text>
            <Text style={styles.aiCardSubtitle}>
              帮你定制专属文化旅行路线
            </Text>
          </View>
        </View>
        <View style={styles.aiCardArrow}>
          <Ionicons name="chatbubble-ellipses" size={20} color={colors.gold} />
        </View>
      </Pressable>

      {/* Cultural Traditions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>文化百科</Text>
        <Pressable onPress={() => router.push('/religions/buddhism' as never)}>
          <Text style={styles.sectionMore}>探索 &gt;</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.religionsContainer}
      >
        {religions.slice(0, 8).map((r) => (
          <Pressable
            key={r.id}
            style={({ pressed }) => [
              styles.religionChip,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.push(`/religions/${r.slug}` as never)}
          >
            <Text style={styles.religionEmoji}>{r.symbol}</Text>
            <Text style={styles.religionName}>{r.nameZh}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatItem value="12" label="文化传统" />
        <StatDivider />
        <StatItem value="60+" label="圣地" />
        <StatDivider />
        <StatItem value="10+" label="路线" />
        <StatDivider />
        <StatItem value="50000+" label="旅行者" />
      </View>

      {/* Bottom CTA */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>开启你的文化之旅</Text>
        <Text style={styles.ctaSubtitle}>
          精选深度路线，探访全球文化圣地
        </Text>
        <View style={styles.ctaButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
            onPress={() => router.push('/routes' as never)}
          >
            <Ionicons name="compass" size={18} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>浏览路线</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.ctaButtonOutline,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color={colors.gold} />
            <Text style={styles.ctaButtonOutlineText}>AI帮你规划</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>走祖庭，看世界</Text>
      </View>
    </ScrollView>
  );
}

function RouteCard({ route, onPress }: { route: Route; onPress: () => void }) {
  const price = (route.priceFrom / 100).toLocaleString();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.routeCard,
        pressed && { opacity: 0.9 },
      ]}
      onPress={onPress}
    >
      <View style={styles.routeCardImage}>
        {route.coverImage ? (
          <Image source={{ uri: route.coverImage }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : (
          <Text style={styles.routeCardEmoji}>
            {route.category === 'ZEN' ? '🏯' : route.category === 'BUDDHIST' ? '☸' : route.category === 'TAOIST' ? '☯' : route.category === 'CHRISTIAN' ? '⛪' : route.category === 'ISLAMIC' ? '🕌' : '🌏'}
          </Text>
        )}
        <View style={styles.routeCardBadge}>
          <Text style={styles.routeCardBadgeText}>{route.duration}天{route.nights}晚</Text>
        </View>
      </View>
      <View style={styles.routeCardBody}>
        <Text style={styles.routeCardTitle} numberOfLines={1}>{route.title}</Text>
        <Text style={styles.routeCardSubtitle} numberOfLines={1}>{route.subtitle}</Text>
        <View style={styles.routeCardFooter}>
          <Text style={styles.routeCardPrice}>¥{price}<Text style={styles.routeCardPriceUnit}>/人</Text></Text>
          {route.rating && (
            <Text style={styles.routeCardRating}>★ {route.rating.toFixed(1)}</Text>
          )}
        </View>
      </View>
    </Pressable>
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
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchBarPressed: {
    borderColor: colors.gold,
  },
  searchPlaceholder: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    flex: 1,
  },
  tagsContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.15)',
  },
  tagText: {
    color: colors.gold,
    fontSize: fontSize.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  categoryItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  categoryItemPressed: {
    opacity: 0.7,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundCardSolid,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionMore: {
    fontSize: fontSize.sm,
    color: colors.gold,
  },
  routeListContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  routeCard: {
    width: 240,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  routeCardImage: {
    height: 120,
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeCardEmoji: {
    fontSize: 40,
    opacity: 0.5,
  },
  routeCardBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  routeCardBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize.xs,
  },
  routeCardBody: {
    padding: spacing.md,
  },
  routeCardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  routeCardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  routeCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  routeCardPrice: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.gold,
  },
  routeCardPriceUnit: {
    fontSize: fontSize.xs,
    fontWeight: '400',
    color: colors.textMuted,
  },
  routeCardRating: {
    fontSize: fontSize.sm,
    color: '#F59E0B',
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 102, 255, 0.15)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  aiCardPressed: {
    opacity: 0.8,
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
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
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
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  religionsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  religionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: spacing.xs,
  },
  religionEmoji: {
    fontSize: 16,
  },
  religionName: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
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
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  ctaSection: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  ctaButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  ctaButtonPressed: {
    backgroundColor: colors.goldDark,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  ctaButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  ctaButtonOutlineText: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
