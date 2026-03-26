import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
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

  const fetchData = useCallback(async () => {
    try {
      const [sitesData, religionsData] = await Promise.all([
        api.getHolySites(selectedReligion || undefined),
        api.getReligions(),
      ]);
      setSites(sitesData);
      setReligions(religionsData);
    } catch (err) {
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

  const chips = religions.map((r) => ({ id: r.id, label: r.nameZh }));

  if (loading && sites.length === 0) return <LoadingView />;

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
        renderItem={({ item }) => <HolySiteCard site={item} />}
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
    paddingBottom: spacing.xxl,
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
});
