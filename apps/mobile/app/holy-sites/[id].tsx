import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api, HolySite, Route } from '../../src/lib/api';
import { useTranslation } from '../../src/lib/i18n';
import { LoadingView } from '../../src/components/LoadingView';
import ReviewSection from '../../src/components/ReviewSection';
import RelatedEntities from '../../src/components/RelatedEntities';
import SaveButton from '../../src/components/SaveButton';
import MediaTour from '../../src/components/MediaTour';

export default function HolySiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [site, setSite] = useState<HolySite | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setError(null);
        const [found, relatedRoutes] = await Promise.all([
          api.getHolySiteById(id),
          api.getRoutesBySite(id).catch(() => []),
        ]);
        setSite(found);
        setRoutes(relatedRoutes);
        navigation.setOptions({ title: found.name });
        // Record view silently for recommendation engine
        api.recordView('HOLY_SITE', id);
      } catch (err) {
        console.error('Failed to fetch holy site:', err);
        setError(t('holySiteDetail.loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  if (loading) return <LoadingView />;
  if (error || !site) {
    return (
      <View style={s.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#0066FF" />
        <Text style={s.errorText}>{error ?? t('holySiteDetail.notFound')}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: '#0066FF', fontSize: 15, marginTop: 8 }}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  const name = site.name ?? '';
  const nameEn = site.nameEn ?? '';
  const religion = site.religion;
  const hasImage = !!site.imageUrl;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Hero */}
      <View style={s.hero}>
        {hasImage ? (
          <Image source={{ uri: site.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        ) : (
          <LinearGradient colors={['#0066FF', '#003D99']} style={StyleSheet.absoluteFillObject} />
        )}
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={s.heroOverlay}>
          {religion && (
            <View style={s.religionBadge}>
              <Text style={s.religionBadgeText}>{religion.name}</Text>
            </View>
          )}
          <View style={s.heroTitleRow}>
            <Text style={[s.heroTitle, { flex: 1 }]}>{name}</Text>
            <SaveButton entityType="HOLY_SITE" entityId={id!} size={26} />
          </View>
          <Text style={s.heroSubtitle}>{nameEn}</Text>
        </LinearGradient>
      </View>

      {/* Info Grid */}
      <View style={s.infoGrid}>
        <InfoCell icon="globe-outline" label={t('holySiteDetail.country')} value={site.country ?? ''} />
        {site.city && <InfoCell icon="business-outline" label={t('holySiteDetail.city')} value={site.city} />}
        <InfoCell icon="navigate-outline" label={t('holySiteDetail.coordinates')} value={`${(site.latitude ?? 0).toFixed(4)}, ${(site.longitude ?? 0).toFixed(4)}`} />
        <InfoCell icon="time-outline" label={t('holySiteDetail.timezone')} value={`UTC${(site.utcOffset ?? 0) >= 0 ? '+' : ''}${site.utcOffset ?? 0}`} />
      </View>

      {/* Practical Info (conditional) */}
      {(site.openingHours || site.ticketPrice || site.bestSeason || site.visitDuration || site.transport) && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('holySiteDetail.practicalInfo')}</Text>
          <View style={s.card}>
            {site.openingHours && <InfoRow icon="time" label={t('holySiteDetail.openingHours')} value={site.openingHours} />}
            {site.ticketPrice && <InfoRow icon="pricetag" label={t('holySiteDetail.ticket')} value={site.ticketPrice} />}
            {site.bestSeason && <InfoRow icon="sunny" label={t('holySiteDetail.bestSeason')} value={site.bestSeason} />}
            {site.visitDuration && <InfoRow icon="hourglass" label={t('holySiteDetail.suggestedVisit')} value={site.visitDuration} />}
            {site.transport && <InfoRow icon="bus" label={t('holySiteDetail.transport')} value={site.transport} />}
          </View>
        </View>
      )}

      {/* Description */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('holySiteDetail.description')}</Text>
        <View style={s.card}>
          <Text style={s.descText}>{site.description}</Text>
        </View>
      </View>

      {/* Tips */}
      {Array.isArray(site.tips) && site.tips.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('holySiteDetail.tips')}</Text>
          <View style={s.card}>
            {site.tips.map((tip: string, i: number) => (
              <View key={i} style={s.tipRow}>
                <Ionicons name="checkmark-circle" size={16} color="#0066FF" />
                <Text style={s.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Nearby */}
      {(site.nearbyFood || site.nearbyStay || site.nearbyExperience || site.nearbySights) && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('holySiteDetail.nearby')}</Text>
          <View style={s.card}>
            {site.nearbyFood && <InfoRow icon="restaurant" label={t('holySiteDetail.nearbyFood')} value={site.nearbyFood} />}
            {site.nearbyStay && <InfoRow icon="bed" label={t('holySiteDetail.nearbyStay')} value={site.nearbyStay} />}
            {site.nearbyExperience && <InfoRow icon="sparkles" label={t('holySiteDetail.nearbyExperience')} value={site.nearbyExperience} />}
            {site.nearbySights && <InfoRow icon="eye" label={t('holySiteDetail.nearbySights')} value={site.nearbySights} />}
          </View>
        </View>
      )}

      {/* Related Routes */}
      {routes.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('holySiteDetail.relatedRoutes')}</Text>
          {routes.map(route => (
            <Pressable
              key={route.id}
              style={s.routeCard}
              onPress={() => router.push(`/routes/${route.slug}` as never)}
            >
              {route.coverImage ? (
                <Image source={{ uri: route.coverImage }} style={s.routeImage} resizeMode="cover" />
              ) : (
                <View style={[s.routeImage, { backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="map" size={24} color="#CBD5E1" />
                </View>
              )}
              <View style={s.routeInfo}>
                <Text style={s.routeName} numberOfLines={1}>{route.title}</Text>
                <Text style={s.routeSub} numberOfLines={1}>{t('holySiteDetail.routeDuration').replace('{days}', String(route.duration ?? 0)).replace('{nights}', String(route.nights ?? 0))} · {route.subtitle ?? ''}</Text>
                <Text style={s.routePrice}>{t('holySiteDetail.priceFrom').replace('{price}', ((route.priceFrom ?? 0) / 100).toLocaleString(locale))}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      {/* Multimedia Tour */}
      <MediaTour entityType="HOLY_SITE" entityId={id!} />

      {/* Reviews */}
      <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
        <ReviewSection targetType="SITE" targetId={id!} />
      </View>

      {/* Related Entities */}
      <RelatedEntities entityType="HOLY_SITE" entityId={id!} title={t('holySiteDetail.youMayLike')} />

      {/* Bottom CTA */}
      <View style={s.ctaRow}>
        <Pressable style={s.ctaBtn} onPress={() => router.push('/trips/create' as never)}>
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={s.ctaBtnText}>{t('holySiteDetail.addToTrip')}</Text>
        </Pressable>
        <Pressable style={s.ctaBtnOutline} onPress={() => router.push('/(tabs)/chat')}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#0066FF" />
          <Text style={s.ctaBtnOutlineText}>{t('holySiteDetail.aiPlan')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InfoCell({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={s.infoCell}>
      <Ionicons name={icon} size={18} color="#0066FF" />
      <Text style={s.infoCellLabel}>{label}</Text>
      <Text style={s.infoCellValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon} size={16} color="#0066FF" style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <Text style={s.infoRowLabel}>{label}</Text>
        <Text style={s.infoRowValue}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { paddingBottom: 40 },
  errorContainer: { flex: 1, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: '#6B7280', fontSize: 16 },

  // Hero
  hero: { height: 260, position: 'relative' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 20, paddingTop: 60 },
  religionBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 8 },
  religionBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  // Info Grid
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 16, gap: 8 },
  infoCell: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB',
  },
  infoCellLabel: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
  infoCellValue: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' },

  // Section
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  descText: { fontSize: 14, color: '#4B5563', lineHeight: 24 },

  // Info Row
  infoRow: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F3F4F6' },
  infoRowLabel: { fontSize: 11, color: '#9CA3AF' },
  infoRowValue: { fontSize: 13, color: '#374151', marginTop: 1 },

  // Tips
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  tipText: { fontSize: 13, color: '#4B5563', flex: 1, lineHeight: 20 },

  // Route Card
  routeCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden',
    marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB',
  },
  routeImage: { width: 100, height: 80 },
  routeInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  routeName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
  routeSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  routePrice: { fontSize: 14, fontWeight: '700', color: '#EF4444', marginTop: 4 },

  // CTA
  ctaRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 24, gap: 12 },
  ctaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#0066FF', paddingVertical: 12, borderRadius: 999,
  },
  ctaBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  ctaBtnOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderColor: '#0066FF', paddingVertical: 12, borderRadius: 999,
  },
  ctaBtnOutlineText: { color: '#0066FF', fontSize: 15, fontWeight: '600' },
});
