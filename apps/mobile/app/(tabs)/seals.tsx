import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api, Seal } from '../../src/lib/api';
import { SealCard } from '../../src/components/SealCard';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius, seriesColors } from '../../src/lib/theme';

interface SealSection {
  title: string;
  color: string;
  data: Seal[];
}

const SERIES_ORDER = ['初印系', '中印系', '印果印', '成道印', '归源印'];

export default function SealsScreen() {
  const [sections, setSections] = useState<SealSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const seals = await api.getSeals();
      const grouped: Record<string, Seal[]> = {};
      seals.forEach((seal) => {
        if (!grouped[seal.series]) grouped[seal.series] = [];
        grouped[seal.series].push(seal);
      });

      const sectionData: SealSection[] = SERIES_ORDER
        .filter((series) => grouped[series])
        .map((series) => ({
          title: series,
          color: seriesColors[series] || colors.gold,
          data: grouped[series].sort((a, b) => a.number - b.number),
        }));

      setSections(sectionData);
    } catch (err) {
      console.error('Failed to fetch seals:', err);
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

  if (loading) return <LoadingView />;

  return (
    <SectionList
      style={styles.container}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SealCard seal={item} />}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <View
            style={[styles.sectionDot, { backgroundColor: section.color }]}
          />
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionCount}>{section.data.length} 印</Text>
        </View>
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🪷</Text>
          <Text style={styles.headerTitle}>曹溪愿命三十印</Text>
          <Text style={styles.headerSubtitle}>
            五系修行 · 从初发心到归源圆满
          </Text>
          <View style={styles.seriesLegend}>
            {SERIES_ORDER.map((series) => (
              <View key={series} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: seriesColors[series] },
                  ]}
                />
                <Text style={styles.legendText}>{series}</Text>
              </View>
            ))}
          </View>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.gold}
        />
      }
      contentContainerStyle={styles.list}
      stickySectionHeadersEnabled={false}
    />
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
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  seriesLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  sectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  sectionCount: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
