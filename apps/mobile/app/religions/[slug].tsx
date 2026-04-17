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
import { useTranslation } from '../../src/lib/i18n';
import { CrawlerVideos } from '../../src/components/CrawlerVideos';

export default function ReligionDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { t, locale } = useTranslation();

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
        navigation.setOptions({ title: rel.name });

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
        setError(t('religionDetail.loadError'));
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
        <Text style={styles.heroNameZh}>{locale === 'zh-CN' ? religion.name : (religion.nameEn || religion.name)}</Text>
        <Text style={styles.heroNameEn}>{locale === 'zh-CN' ? religion.nameEn : religion.name}</Text>
      </View>

      {/* Religion type has no description field */}

      {/* Holy Sites */}
      {holySites.length > 0 && (
        <SectionBlock title={t('religionDetail.holySites')} subtitle={`${holySites.length} ${t('religionDetail.holySitesUnit')}`}>
          {holySites.map((site) => (
            <Pressable
              key={site.id}
              style={styles.listItem}
              onPress={() => router.push({ pathname: '/holy-sites/[id]', params: { id: site.id } })}
            >
              <Ionicons name="location" size={18} color={colors.gold} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{site.name}</Text>
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
        <SectionBlock title={t('religionDetail.temples')} subtitle={`${temples.length} ${t('religionDetail.templesUnit')}`}>
          {temples.map((temple) => (
            <Pressable
              key={temple.id}
              style={styles.listItem}
              onPress={() => router.push({ pathname: '/temples/[id]', params: { id: temple.id } })}
            >
              <Ionicons name="business" size={18} color={colors.gold} />
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>{temple.name}</Text>
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
        <SectionBlock title={t('religionDetail.patriarchs')} subtitle={`${patriarchs.length} ${t('religionDetail.patriarchsUnit')}`}>
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
                <Text style={styles.listItemTitle}>{patriarch.name}</Text>
                <Text style={styles.listItemSubtitle}>
                  {patriarch.title} · {patriarch.dates}
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
        <SectionBlock title={t('religionDetail.teachings')} subtitle={`${teachings.length} ${t('religionDetail.teachingsUnit')}`}>
          {teachings.map((teaching) => (
            <View key={teaching.id} style={styles.teachingItem}>
              <Text style={styles.teachingText} numberOfLines={3}>
                "{teaching.originalText}"
              </Text>
              <Text style={styles.teachingSource}>— {teaching.sourceText}</Text>
            </View>
          ))}
        </SectionBlock>
      )}

      {religion && <CrawlerVideos targetType="religion" targetId={religion.id} limit={8} />}
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
    backgroundColor: colors.backgroundCardSolid,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
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
    backgroundColor: colors.backgroundCardSolid,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
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
    backgroundColor: colors.backgroundCardSolid,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
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
