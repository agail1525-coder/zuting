import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, Collection } from '../../src/lib/api';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const PRIMARY = '#3264ff';

export default function CollectionsScreen() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await api.fetchCollections();
      setCollections(Array.isArray(data) ? data : []);
    } catch {
      setError('加载收藏夹失败，请检查登录状态');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // G4: Stats computed from data
  const stats = useMemo(() => {
    const totalCollections = collections.length;
    const totalItems = collections.reduce((sum, c) => sum + (c._count?.items ?? c.items?.length ?? 0), 0);
    return { totalCollections, totalItems };
  }, [collections]);

  // G4: Client-side search filtering
  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const q = searchQuery.trim().toLowerCase();
    return collections.filter(
      c => c.name.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q)
    );
  }, [collections, searchQuery]);

  const isSearchActive = searchQuery.trim().length > 0;

  const handleCreate = useCallback(() => {
    Alert.prompt(
      '新建收藏夹',
      '输入收藏夹名称',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '创建',
          onPress: async (name) => {
            const trimmed = (name ?? '').trim();
            if (!trimmed) return;
            try {
              await api.createCollection({ name: trimmed });
              load();
            } catch {
              Alert.alert('创建失败', '请检查网络后重试');
            }
          },
        },
      ],
      'plain-text',
      '',
    );
  }, [load]);

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert(
      '删除收藏夹',
      `确定要删除"${name}"？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteCollection(id);
              setCollections((prev) => prev.filter((c) => c.id !== id));
            } catch {
              Alert.alert('删除失败', '请检查网络后重试');
            }
          },
        },
      ],
    );
  }, []);

  const renderItem = useCallback(({ item }: { item: Collection }) => {
    const count = item._count?.items ?? item.items?.length ?? 0;
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={() => router.push(`/collections/${item.id}` as any)}
        onLongPress={() => handleDelete(item.id, item.name)}
      >
        <View style={styles.cardIconWrapper}>
          <Ionicons name="heart" size={28} color="#EF4444" />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
            {item.isPublic && (
              <View style={styles.publicBadge}>
                <Ionicons name="globe-outline" size={10} color={PRIMARY} />
                <Text style={styles.publicBadgeText}>公开</Text>
              </View>
            )}
          </View>
          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
          ) : null}
          <Text style={styles.cardCount}>{count} 个收藏</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    );
  }, [router, handleDelete]);

  const keyExtractor = useCallback((item: Collection) => item.id, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={() => load()}>
          <Text style={styles.retryBtnText}>重试</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredCollections}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />
        }
        ListHeaderComponent={
          collections.length > 0 ? (
            <View>
              {/* G4: Stats Overview */}
              <View style={styles.statsRow}>
                <View style={styles.statsItem}>
                  <Text style={styles.statsValue}>{stats.totalCollections}</Text>
                  <Text style={styles.statsLabel}>收藏夹</Text>
                </View>
                <View style={styles.statsDivider} />
                <View style={styles.statsItem}>
                  <Text style={styles.statsValue}>{stats.totalItems}</Text>
                  <Text style={styles.statsLabel}>总收藏</Text>
                </View>
              </View>

              {/* G4: Search TextInput */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="搜索收藏夹..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isSearchActive ? (
            /* G4: Search-empty state */
            <View style={styles.empty}>
              <Ionicons name="search" size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>未找到匹配的收藏夹</Text>
              <Text style={styles.emptySubtitle}>试试其他关键词，或清除搜索条件</Text>
              <Pressable style={styles.ctaBtn} onPress={() => setSearchQuery('')}>
                <Text style={styles.ctaBtnText}>清除搜索</Text>
              </Pressable>
            </View>
          ) : (
            /* G4: Data-empty state */
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>还没有收藏夹</Text>
              <Text style={styles.emptySubtitle}>点击右下角"+"创建第一个收藏夹</Text>
            </View>
          )
        }
        ListFooterComponent={
          filteredCollections.length > 0 ? (
            /* G4: Bottom CTA */
            <View style={styles.bottomCta}>
              <Text style={styles.bottomCtaText}>发现更多值得收藏的圣地</Text>
              <Pressable
                style={styles.ctaBtn}
                onPress={() => router.push('/holy-sites' as any)}
              >
                <Ionicons name="compass-outline" size={18} color="#FFFFFF" />
                <Text style={styles.ctaBtnText}>探索圣地</Text>
              </Pressable>
            </View>
          ) : null
        }
      />

      {/* FAB */}
      <Pressable style={styles.fab} onPress={handleCreate}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },

  // G4: Stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  statsItem: {
    flex: 1,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: PRIMARY,
  },
  statsLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    alignSelf: 'stretch',
  },

  // G4: Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    padding: 0,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.85,
    borderColor: PRIMARY,
  },
  cardIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  publicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
  },
  publicBadgeText: {
    fontSize: fontSize.xs,
    color: PRIMARY,
    fontWeight: '500',
  },
  cardDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  cardCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  retryBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  retryBtnText: {
    color: colors.gold,
    fontWeight: '600',
    fontSize: fontSize.md,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },

  // G4: Bottom CTA
  bottomCta: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: spacing.md,
  },
  bottomCtaText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: PRIMARY,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
  },
  ctaBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },

  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});
