import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  api,
  Religion,
  HolySite,
  Temple,
  Patriarch,
  Teaching,
} from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { ErrorView } from '../../src/components/ErrorView';
import {
  colors,
  fontSize,
  spacing,
  borderRadius,
  religionEmojis,
  religionGradients,
} from '../../src/lib/theme';

export default function ReligionDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [religion, setReligion] = useState<Religion | null>(null);
  const [holySites, setHolySites] = useState<HolySite[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [patriarchs, setPatriarchs] = useState<Patriarch[]>([]);
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
        const religions = await api.getReligions(slug);
        const rel = religions[0];
        if (!rel) return;
        setReligion(rel);
        navigation.setOptions({ title: rel.nameZh });

        const [sitesData, templesData, patriarchsData, teachingsData] =
          await Promise.all([
            api.getHolySites(rel.id),
            api.getTemples(rel.id),
            api.getPatriarchs(rel.id),
            api.getTeachings(rel.id),
          ]);

        setHolySites(sitesData);
        setTemples(templesData);
        setPatriarchs(patriarchsData);
        setTeachings(teachingsData);
      } catch (err: unknown) {
        console.error('Failed to fetch religion detail:', err);
        setError('加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadData();
  }, [slug, navigation]);

  if (loading) return <LoadingView />;
  if (error || !religion) return <ErrorView message={error ?? undefined} onRetry={loadData} />;

  const emoji = religionEmojis[religion.slug] || '🙏';
  const gradient = religionGradients[religion.slug] || ['#6366F1', '#4F46E5'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: gradient[0] }]}>
        <Text style={styles.heroEmoji}>{emoji}</Text>
        <Text style={styles.heroNameZh}>{religion.nameZh}</Text>
        <Text style={styles.heroNameEn}>{religion.nameEn}</Text>
      </View>

      {religion.description ? (
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{religion.description}</Text>
        </View>
      ) : null}

      {/* Holy Sites */}
      {holySites.length > 0 && (
        <SectionBlock title="圣地" subtitle={`${holySites.length} 处`}>
          {holySites.map((site) => (
            <Pressable
              key={site.id}
              style={styles.listItem}
              onPress={() => router.push({ pathname: '/holy-sites/[id]', params: { id: site.id } })}
            >
              <Ionicons name="location" size={18} color={colors.gold} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{site.nameZh}</Text>
                <Text style={styles.listItemSubtitle}>
                  {site.country}
                  {site.city ? ` · ${site.city}` : ''}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </SectionBlock>
      )}

      {/* Temples */}
      {temples.length > 0 && (
        <SectionBlock title="祖庭" subtitle={`${temples.length} 座`}>
          {temples.map((temple) => (
            <Pressable
              key={temple.id}
              style={styles.listItem}
              onPress={() => router.push({ pathname: '/temples/[id]', params: { id: temple.id } })}
            >
              <Ionicons name="business" size={18} color={colors.gold} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{temple.nameZh}</Text>
                <Text style={styles.listItemSubtitle}>
                  {temple.country}
                  {temple.city ? ` · ${temple.city}` : ''}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </SectionBlock>
      )}

      {/* Patriarchs */}
      {patriarchs.length > 0 && (
        <SectionBlock title="祖师" subtitle={`${patriarchs.length} 位`}>
          {patriarchs.map((patriarch) => (
            <Pressable
              key={patriarch.id}
              style={styles.listItem}
              onPress={() =>
                router.push({ pathname: '/patriarchs/[id]', params: { id: patriarch.id } })
              }
            >
              <Ionicons name="person" size={18} color={colors.gold} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{patriarch.nameZh}</Text>
                <Text style={styles.listItemSubtitle}>
                  {patriarch.title} · {patriarch.era}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </SectionBlock>
      )}

      {/* Teachings */}
      {teachings.length > 0 && (
        <SectionBlock title="祖训" subtitle={`${teachings.length} 条`}>
          {teachings.map((teaching) => (
            <View key={teaching.id} style={styles.teachingItem}>
              <Text style={styles.teachingText} numberOfLines={3}>
                "{teaching.originalText}"
              </Text>
              <Text style={styles.teachingSource}>— {teaching.source}</Text>
            </View>
          ))}
        </SectionBlock>
      )}
    </ScrollView>
  );
}

function SectionBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      {children}
    </View>
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
    paddingHorizontal: spacing.md,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  heroNameZh: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 2,
  },
  heroNameEn: {
    fontSize: fontSize.lg,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  descriptionCard: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  descriptionText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 24,
  },
  section: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.gold,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: '500',
  },
  listItemSubtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  teachingItem: {
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
  },
  teachingText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  teachingSource: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
});
