import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, Seal } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius, seriesColors } from '../../src/lib/theme';

export default function SealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const [seal, setSeal] = useState<Seal | null>(null);
  const [allSeals, setAllSeals] = useState<Seal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const seals = await api.getSeals();
        const sorted = seals.sort((a, b) => a.number - b.number);
        setAllSeals(sorted);
        const found = sorted.find((s) => s.id === id);
        if (found) {
          setSeal(found);
          navigation.setOptions({
            title: `第${found.number}印 · ${found.nameZh}`,
          });
        }
      } catch (err) {
        console.error('Failed to fetch seal detail:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, navigation]);

  if (loading || !seal) return <LoadingView />;

  const seriesColor = seriesColors[seal.series] || colors.gold;
  const currentIndex = allSeals.findIndex((s) => s.id === id);
  const prevSeal = currentIndex > 0 ? allSeals[currentIndex - 1] : null;
  const nextSeal =
    currentIndex < allSeals.length - 1 ? allSeals[currentIndex + 1] : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.hero}>
        <View style={[styles.numberCircle, { backgroundColor: seriesColor }]}>
          <Text style={styles.numberText}>{seal.number}</Text>
        </View>
        <Text style={styles.heroTitle}>{seal.nameZh}</Text>
        <Text style={styles.heroSubtitle}>{seal.nameEn}</Text>
        <View style={[styles.seriesBadge, { borderColor: seriesColor }]}>
          <View
            style={[styles.seriesDot, { backgroundColor: seriesColor }]}
          />
          <Text style={[styles.seriesText, { color: seriesColor }]}>
            {seal.series}
          </Text>
        </View>
      </View>

      {/* Poem */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>偈颂</Text>
        <Text style={styles.poemText}>{seal.poem}</Text>
      </View>

      {/* Essence */}
      {seal.essence ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>要义</Text>
          <Text style={styles.cardText}>{seal.essence}</Text>
        </View>
      ) : null}

      {/* Practice */}
      {seal.practice ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>修行</Text>
          <Text style={styles.cardText}>{seal.practice}</Text>
        </View>
      ) : null}

      {/* Vow */}
      {seal.vow ? (
        <View style={[styles.card, styles.vowCard]}>
          <Text style={styles.cardLabel}>愿文</Text>
          <Text style={styles.vowText}>{seal.vow}</Text>
        </View>
      ) : null}

      {/* Prev / Next Navigation */}
      <View style={styles.navRow}>
        {prevSeal ? (
          <Pressable
            style={styles.navButton}
            onPress={() => router.replace(`/seals/${prevSeal.id}` as any)}
          >
            <Ionicons name="chevron-back" size={20} color={colors.gold} />
            <View>
              <Text style={styles.navLabel}>上一印</Text>
              <Text style={styles.navName}>{prevSeal.nameZh}</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
        {nextSeal ? (
          <Pressable
            style={[styles.navButton, styles.navButtonRight]}
            onPress={() => router.replace(`/seals/${nextSeal.id}` as any)}
          >
            <View style={styles.navTextRight}>
              <Text style={styles.navLabel}>下一印</Text>
              <Text style={styles.navName}>{nextSeal.nameZh}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gold} />
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
      </View>
    </ScrollView>
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
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: 'rgba(212, 168, 85, 0.05)',
  },
  numberCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  numberText: {
    color: colors.white,
    fontSize: fontSize.xxl,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.gold,
  },
  heroSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  seriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  seriesDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  seriesText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  card: {
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.lg,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardLabel: {
    color: colors.gold,
    fontSize: fontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  poemText: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    lineHeight: 36,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  cardText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 26,
  },
  vowCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
  },
  vowText: {
    color: colors.goldLight,
    fontSize: fontSize.lg,
    lineHeight: 28,
    fontWeight: '500',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.sm,
  },
  navButtonRight: {
    justifyContent: 'flex-end',
  },
  navTextRight: {
    alignItems: 'flex-end',
  },
  navLabel: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
  },
  navName: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  navSpacer: {
    flex: 1,
  },
});
