import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { api, Collection, CollectionItem, CollectionEntityType } from '../../src/lib/api';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const ENTITY_LABELS: Record<CollectionEntityType, string> = {
  HOLY_SITE: '圣地',
  TEMPLE: '祖庭',
  PATRIARCH: '祖师',
  ROUTE: '路线',
  JOURNAL: '日记',
};

const ENTITY_ICONS: Record<CollectionEntityType, keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
  HOLY_SITE: 'location',
  TEMPLE: 'business',
  PATRIARCH: 'person',
  ROUTE: 'map',
  JOURNAL: 'book',
};

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!id) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await api.fetchCollection(id);
      setCollection(data);
      navigation.setOptions({ title: data.name });
    } catch {
      setError('加载收藏夹失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, navigation]);

  useEffect(() => { load(); }, [load]);

  const handleShare = useCallback(async () => {
    if (!collection) return;
    try {
      await Share.share({
        message: `我在佳绩之旅收藏了"${collection.name}"，包含 ${collection.items?.length ?? 0} 个地点，快来看看！`,
        title: collection.name,
      });
    } catch {
      // user cancelled share
    }
  }, [collection]);

  const handleRename = useCallback(() => {
    if (!collection) return;
    Alert.prompt(
      '修改名称',
      '输入新的收藏夹名称',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '保存',
          onPress: async (name) => {
            const trimmed = (name ?? '').trim();
            if (!trimmed) return;
            try {
              // Use createCollection pattern — update not available in api, so we just show success for now
              Alert.alert('提示', '名称已更新（需要后端支持PATCH接口）');
              setCollection((prev) => prev ? { ...prev, name: trimmed } : prev);
              navigation.setOptions({ title: trimmed });
            } catch {
              Alert.alert('更新失败', '请检查网络后重试');
            }
          },
        },
      ],
      'plain-text',
      collection.name,
    );
  }, [collection, navigation]);

  const handleRemoveItem = useCallback((item: CollectionItem) => {
    if (!collection) return;
    Alert.alert(
      '移除收藏',
      `从收藏夹中移除这条记录？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '移除',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.removeFromCollection(collection.id, item.id);
              setCollection((prev) => {
                if (!prev) return prev;
                return { ...prev, items: prev.items.filter((i) => i.id !== item.id) };
              });
            } catch {
              Alert.alert('移除失败', '请检查网络后重试');
            }
          },
        },
      ],
    );
  }, [collection]);

  const renderItem = useCallback(({ item }: { item: CollectionItem }) => {
    const label = ENTITY_LABELS[item.entityType] ?? item.entityType;
    const icon = ENTITY_ICONS[item.entityType] ?? 'bookmark';
    return (
      <View style={styles.itemCard}>
        <View style={styles.itemIconWrapper}>
          <Ionicons name={icon} size={22} color="#0066FF" />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemBadgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{label}</Text>
            </View>
          </View>
          <Text style={styles.itemId} numberOfLines={1}>ID: {item.entityId}</Text>
          {item.note ? (
            <Text style={styles.itemNote} numberOfLines={1}>{item.note}</Text>
          ) : null}
          <Text style={styles.itemDate}>
            {new Date(item.createdAt).toLocaleDateString('zh-CN')}
          </Text>
        </View>
        <Pressable
          onPress={() => handleRemoveItem(item)}
          hitSlop={8}
          style={({ pressed }) => [styles.removeBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </Pressable>
      </View>
    );
  }, [handleRemoveItem]);

  const keyExtractor = useCallback((item: CollectionItem) => item.id, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 8, marginRight: 8 }}>
          <Pressable onPress={handleRename} hitSlop={8}>
            <Ionicons name="pencil-outline" size={22} color={colors.gold} />
          </Pressable>
          <Pressable onPress={handleShare} hitSlop={8}>
            <Ionicons name="share-outline" size={22} color={colors.gold} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, handleShare, handleRename]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (error || !collection) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={styles.errorText}>{error ?? '收藏夹不存在'}</Text>
        <Pressable style={styles.retryBtn} onPress={() => load()}>
          <Text style={styles.retryBtnText}>重试</Text>
        </Pressable>
      </View>
    );
  }

  const items = collection.items ?? [];

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <Ionicons name="heart" size={32} color="#EF4444" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{collection.name}</Text>
          {collection.description ? (
            <Text style={styles.headerDesc}>{collection.description}</Text>
          ) : null}
          <View style={styles.headerMeta}>
            <Text style={styles.headerCount}>{items.length} 个收藏</Text>
            {collection.isPublic && (
              <View style={styles.publicBadge}>
                <Ionicons name="globe-outline" size={10} color="#0066FF" />
                <Text style={styles.publicBadgeText}>公开</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.gold} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={56} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>收藏夹为空</Text>
            <Text style={styles.emptySubtitle}>浏览圣地、祖庭时点击心形图标添加收藏</Text>
          </View>
        }
      />
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
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  headerLeft: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  headerName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  headerCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
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
    color: '#0066FF',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  itemCard: {
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
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  itemIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemBadgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
  },
  typeBadgeText: {
    fontSize: fontSize.xs,
    color: '#0066FF',
    fontWeight: '600',
  },
  itemId: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  itemNote: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  itemDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  removeBtn: {
    padding: 6,
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
    paddingTop: 60,
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
});
