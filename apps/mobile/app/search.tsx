import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api, SearchResultItem, SearchResponse } from '../src/lib/api';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';

const TYPE_TABS = [
  { key: 'all', label: '全部' },
  { key: 'religion', label: '信仰' },
  { key: 'holy-site', label: '圣地' },
  { key: 'temple', label: '祖庭' },
  { key: 'patriarch', label: '祖师' },
  { key: 'teaching', label: '祖训' },
  { key: 'seal', label: '印' },
];

const TYPE_LABELS: Record<string, string> = {
  religion: '信仰',
  'holy-site': '圣地',
  temple: '祖庭',
  patriarch: '祖师',
  teaching: '祖训',
  seal: '印',
};

function getDetailRoute(item: SearchResultItem): string | null {
  switch (item.type) {
    case 'religion':
      return `/religions/${item.id}`;
    case 'holy-site':
      return `/holy-sites/${item.id}`;
    case 'temple':
      return `/temples/${item.id}`;
    case 'patriarch':
      return `/patriarchs/${item.id}`;
    case 'seal':
      return `/seals/${item.id}`;
    default:
      return null;
  }
}

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const doSearch = useCallback(async (q: string, type: string, p: number, append = false) => {
    if (!q.trim()) {
      setResults(null);
      setError(null);
      return;
    }
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    try {
      const data = await api.search(q.trim(), type, p, 20);
      if (append && results) {
        setResults({
          ...data,
          results: [...results.results, ...data.results],
        });
      } else {
        setResults(data);
      }
    } catch {
      setError('搜索失败，请检查网络后重试');
      if (!append) setResults(null);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [results]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doSearch(query, activeType, 1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeType]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || loading || !results) return;
    const totalPages = Math.ceil(results.total / results.limit);
    if (page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch(query, activeType, nextPage, true);
  }, [loadingMore, loading, results, page, query, activeType, doSearch]);

  const handlePressItem = useCallback((item: SearchResultItem) => {
    const route = getDetailRoute(item);
    if (route) router.push(route as never);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: SearchResultItem }) => (
    <Pressable
      style={({ pressed }) => [styles.resultCard, pressed && styles.resultCardPressed]}
      onPress={() => handlePressItem(item)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.resultImage} />
      ) : (
        <View style={styles.resultImagePlaceholder}>
          <Text style={styles.resultImagePlaceholderText}>
            {item.religion?.symbol ?? '🏛'}
          </Text>
        </View>
      )}
      <View style={styles.resultContent}>
        <View style={styles.resultBadgeRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {TYPE_LABELS[item.type] ?? item.type}
            </Text>
          </View>
          {item.religion && item.type !== 'religion' && (
            <View style={[styles.religionBadge, item.religion.color ? { borderColor: `${item.religion.color}60` } : undefined]}>
              <Text style={[styles.religionBadgeText, item.religion.color ? { color: item.religion.color } : undefined]}>
                {item.religion.symbol} {item.religion.name}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={styles.resultSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        ) : null}
        {item.descriptionSnippet ? (
          <Text style={styles.resultSnippet} numberOfLines={2}>{item.descriptionSnippet}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  ), [handlePressItem]);

  const keyExtractor = useCallback(
    (item: SearchResultItem, index: number) => `${item.type}-${item.id}-${index}`,
    [],
  );

  const hasMore = results ? results.results.length < results.total : false;

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchInputRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="搜索圣地、祖庭、祖师..."
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="search"
            selectionColor={colors.gold}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setResults(null); }} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Type Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={styles.tabsScroll}
      >
        {TYPE_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeType === tab.key && styles.tabActive]}
            onPress={() => { setActiveType(tab.key); setPage(1); }}
          >
            <Text style={[styles.tabText, activeType === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Loading */}
      {loading && (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={styles.centerState}>
          <Ionicons name="cloud-offline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => doSearch(query, activeType, 1)}
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </Pressable>
        </View>
      )}

      {/* Empty - no query */}
      {!loading && !error && !query.trim() && (
        <View style={styles.centerState}>
          <Ionicons name="search" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>输入关键词开始搜索</Text>
          <Text style={styles.emptySubtext}>Search across all content</Text>
        </View>
      )}

      {/* Empty - no results */}
      {!loading && !error && query.trim() && results && results.results.length === 0 && (
        <View style={styles.centerState}>
          <Ionicons name="file-tray-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>未找到相关内容</Text>
          <Text style={styles.emptySubtext}>Try different keywords</Text>
        </View>
      )}

      {/* Results */}
      {!loading && !error && results && results.results.length > 0 && (
        <FlatList
          data={results.results}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <Text style={styles.totalText}>
              共找到 {results.total} 条结果
            </Text>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.gold} />
              </View>
            ) : !hasMore && results.results.length > 0 ? (
              <Text style={styles.footerText}>已展示全部结果</Text>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchInputRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    paddingVertical: 0,
  },
  tabsScroll: {
    maxHeight: 44,
  },
  tabsContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
  },
  tabActive: {
    backgroundColor: 'rgba(212, 168, 85, 0.15)',
    borderColor: 'rgba(212, 168, 85, 0.4)',
  },
  tabText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  tabTextActive: {
    color: colors.gold,
    fontWeight: '600',
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.lg,
    marginTop: spacing.md,
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  retryButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  retryButtonText: {
    color: colors.gold,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  totalText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginBottom: spacing.sm,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  resultCardPressed: {
    borderColor: colors.border,
    backgroundColor: 'rgba(30, 41, 59, 1)',
  },
  resultImage: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
  },
  resultImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultImagePlaceholderText: {
    fontSize: 22,
  },
  resultContent: {
    flex: 1,
  },
  resultBadgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(212, 168, 85, 0.15)',
  },
  typeBadgeText: {
    color: colors.gold,
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  religionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  religionBadgeText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
  },
  resultTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  resultSubtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  resultSnippet: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 4,
    lineHeight: 18,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});
