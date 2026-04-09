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
import { api, SearchResultItem, SearchResponse, HotKeyword, SearchSuggestion } from '../src/lib/api';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';

const TYPE_TABS = [
  { key: 'all', label: '全部' },
  { key: 'religion', label: '文化' },
  { key: 'holy-site', label: '圣地' },
  { key: 'temple', label: '祖庭' },
  { key: 'patriarch', label: '祖师' },
  { key: 'teaching', label: '祖训' },
  { key: 'seal', label: '印' },
];

const TYPE_LABELS: Record<string, string> = {
  religion: '文化',
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
    case 'teaching':
      return `/teachings/${item.id}`;
    case 'seal':
      return `/seals/${item.id}`;
    default:
      return null;
  }
}

function getSuggestionRoute(s: SearchSuggestion): string | null {
  if (!s.id) return null;
  switch (s.type) {
    case 'holy-site': return `/holy-sites/${s.id}`;
    case 'temple': return `/temples/${s.id}`;
    case 'patriarch': return `/patriarchs/${s.id}`;
    case 'religion': return `/religions/${s.id}`;
    case 'teaching': return `/teachings/${s.id}`;
    case 'seal': return `/seals/${s.id}`;
    default: return null;
  }
}

export default function SearchScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeType, setActiveType] = useState('all');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Hot keywords & suggestions state
  const [hotKeywords, setHotKeywords] = useState<HotKeyword[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch hot keywords on mount
  useEffect(() => {
    api.fetchHotKeywords()
      .then(setHotKeywords)
      .catch(() => {
        // Fallback hot keywords
        setHotKeywords([
          { text: '耶路撒冷' },
          { text: '麦加' },
          { text: '菩提伽耶' },
          { text: '梵蒂冈' },
          { text: '少林寺' },
        ]);
      });
  }, []);

  // Fetch suggestions when query >= 2 chars
  useEffect(() => {
    if (suggDebounceRef.current) clearTimeout(suggDebounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    suggDebounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const data = await api.fetchSearchSuggestions(query.trim());
        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 200);
    return () => {
      if (suggDebounceRef.current) clearTimeout(suggDebounceRef.current);
    };
  }, [query]);

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

  const handleHotKeyword = useCallback((keyword: string) => {
    setQuery(keyword);
    setIsFocused(false);
    inputRef.current?.blur();
  }, []);

  const handleSuggestion = useCallback((s: SearchSuggestion) => {
    const route = getSuggestionRoute(s);
    if (route) {
      router.push(route as never);
    } else {
      setQuery(s.text);
      setIsFocused(false);
      inputRef.current?.blur();
    }
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

  // Show suggestions overlay when focused and query >= 2 chars
  const showSuggestions = isFocused && query.trim().length >= 2;
  // Show hot keywords when focused and query is empty
  const showHotKeywords = isFocused && query.trim().length === 0 && hotKeywords.length > 0;

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchInputRow}>
        <View style={[styles.searchInputContainer, isFocused && styles.searchInputContainerFocused]}>
          <Ionicons name="search" size={18} color={isFocused ? colors.gold : colors.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder="搜索圣地、祖庭、祖师..."
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="search"
            selectionColor={colors.gold}
          />
          {query.length > 0 && (
            <Pressable onPress={() => { setQuery(''); setResults(null); setSuggestions([]); }} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Hot Keywords */}
      {showHotKeywords && (
        <View style={styles.hotSection}>
          <Text style={styles.hotTitle}>热门搜索</Text>
          <View style={styles.hotChips}>
            {hotKeywords.map((kw, i) => (
              <Pressable
                key={i}
                style={styles.hotChip}
                onPress={() => handleHotKeyword(kw.text)}
              >
                <Ionicons name="flame-outline" size={12} color="#EF4444" style={{ marginRight: 4 }} />
                <Text style={styles.hotChipText}>{kw.text}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <View style={styles.suggestionsBox}>
          {loadingSuggestions ? (
            <View style={styles.suggestionsLoading}>
              <ActivityIndicator size="small" color={colors.gold} />
            </View>
          ) : suggestions.length > 0 ? (
            <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 240 }}>
              {suggestions.map((s, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [styles.suggestionRow, pressed && styles.suggestionRowPressed]}
                  onPress={() => handleSuggestion(s)}
                >
                  <Ionicons name="search-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.suggestionText} numberOfLines={1}>{s.text}</Text>
                  {s.type && (
                    <Text style={styles.suggestionType}>{TYPE_LABELS[s.type] ?? s.type}</Text>
                  )}
                  <Ionicons name="arrow-forward-outline" size={14} color={colors.textMuted} />
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.suggestionsLoading}>
              <Text style={styles.noSuggestionsText}>无匹配建议</Text>
            </View>
          )}
        </View>
      )}

      {/* Type Tabs */}
      {!showHotKeywords && !showSuggestions && (
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
      )}

      {/* Loading */}
      {!showHotKeywords && !showSuggestions && loading && (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      )}

      {/* Error */}
      {!showHotKeywords && !showSuggestions && !loading && error && (
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
      {!showHotKeywords && !showSuggestions && !loading && !error && !query.trim() && (
        <View style={styles.centerState}>
          <Ionicons name="search" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>输入关键词开始搜索</Text>
          <Text style={styles.emptySubtext}>Search across all content</Text>
        </View>
      )}

      {/* Empty - no results */}
      {!showHotKeywords && !showSuggestions && !loading && !error && query.trim() && results && results.results.length === 0 && (
        <View style={styles.centerState}>
          <Ionicons name="file-tray-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>未找到相关内容</Text>
          <Text style={styles.emptySubtext}>Try different keywords</Text>
        </View>
      )}

      {/* Results */}
      {!showHotKeywords && !showSuggestions && !loading && !error && results && results.results.length > 0 && (
        <FlatList
          data={results.results}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
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
    borderColor: '#E5E7EB',
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInputContainerFocused: {
    borderColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
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
  // Hot Keywords
  hotSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundCardSolid,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  hotTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hotChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  hotChipText: {
    fontSize: fontSize.sm,
    color: '#EF4444',
    fontWeight: '500',
  },
  // Suggestions
  suggestionsBox: {
    backgroundColor: colors.backgroundCardSolid,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionsLoading: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  noSuggestionsText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  suggestionRowPressed: {
    backgroundColor: '#F9FAFB',
  },
  suggestionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  suggestionType: {
    fontSize: fontSize.xs,
    color: colors.gold,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
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
    borderColor: '#E5E7EB',
    backgroundColor: colors.backgroundCardSolid,
  },
  tabActive: {
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
    borderColor: 'rgba(0, 102, 255, 0.3)',
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
  resultCardPressed: {
    borderColor: colors.gold,
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#F3F4F6',
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
    backgroundColor: 'rgba(0, 102, 255, 0.1)',
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
    borderColor: '#E5E7EB',
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
