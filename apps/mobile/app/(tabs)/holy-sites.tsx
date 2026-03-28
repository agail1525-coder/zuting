import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { api, HolySite, Religion } from '../../src/lib/api';
import { HolySiteCard } from '../../src/components/HolySiteCard';
import { FilterChips } from '../../src/components/FilterChips';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing } from '../../src/lib/theme';

export default function HolySitesScreen() {
  const [sites, setSites] = useState<HolySite[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [selectedReligion, setSelectedReligion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [sitesData, religionsData] = await Promise.all([
        api.getHolySites(selectedReligion || undefined),
        api.getReligions(),
      ]);
      setSites(sitesData);
      setReligions(religionsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载失败';
      setError(message);
      console.error('Failed to fetch holy sites:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedReligion]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const chips = religions.map((r) => ({ id: r.id, label: r.name }));

  if (loading && sites.length === 0) return <LoadingView />;

  if (error && sites.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>重试</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterChips
        chips={chips}
        selected={selectedReligion}
        onSelect={setSelectedReligion}
      />
      <FlatList
        data={sites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => <HolySiteCard site={item} compact />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
          />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>暂无圣地数据</Text>
          </View>
        }
        ListHeaderComponent={
          <Text style={styles.count}>{sites.length} 个圣地</Text>
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
  list: {
    paddingHorizontal: 12,
    paddingBottom: spacing.xxl,
  },
  row: {
    justifyContent: 'space-between',
  },
  count: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
