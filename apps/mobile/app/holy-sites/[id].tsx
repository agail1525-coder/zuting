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
import { CrawlerVideos } from '../../src/components/CrawlerVideos';
import { TpPackages } from '../../src/components/TpPackages';

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
        <Ionicons name="alert-circle-outline" size={48} color="#3264ff" />
        <Text style={s.errorText}>{error ?? t('holySiteDetail.notFound')}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: '#3264ff', fontSize: 15, marginTop: 8 }}>{t('common.back')}</Text>
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
          <LinearGradient colors={['#3264ff', '#003D99']} style={StyleSheet.absoluteFillObject} />
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

      {/* 目的地++ v1 · 四季开放时间 */}
      {site.openingHoursBySeason && <SeasonHoursSection hours={site.openingHoursBySeason} />}

      {/* 目的地++ v1 · 交通接驳分段 */}
      {Array.isArray(site.transportLegs) && site.transportLegs.length > 0 && (
        <TransportLegsSection legs={site.transportLegs} />
      )}

      {/* 目的地++ v1 · 参访贴士分组 */}
      {site.visitorTipsGrouped && <VisitorTipsGroupedSection tips={site.visitorTipsGrouped} />}

      {/* 目的地++ v1 · 当地讲解师 */}
      {Array.isArray(site.localGuides) && site.localGuides.length > 0 && (
        <LocalGuidesSection guides={site.localGuides} />
      )}

      {/* 目的地++ v1 · 文化周边 */}
      {Array.isArray(site.culturalProducts) && site.culturalProducts.length > 0 && (
        <CulturalProductsSection products={site.culturalProducts} />
      )}

      {/* 目的地++ v1 · 画面故事 */}
      {Array.isArray(site.photoStory) && site.photoStory.length > 0 && (
        <PhotoStorySection story={site.photoStory} />
      )}

      {/* Tips */}
      {Array.isArray(site.tips) && site.tips.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('holySiteDetail.tips')}</Text>
          <View style={s.card}>
            {site.tips.map((tip: string, i: number) => (
              <View key={i} style={s.tipRow}>
                <Ionicons name="checkmark-circle" size={16} color="#3264ff" />
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

      {/* YouTube Crawler Videos */}
      <CrawlerVideos targetType="holySite" targetId={id!} limit={8} />

      {/* TP++ Tiered Packages */}
      <TpPackages holySiteId={id!} />

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
          <Ionicons name="chatbubble-ellipses" size={18} color="#3264ff" />
          <Text style={s.ctaBtnOutlineText}>{t('holySiteDetail.aiPlan')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function InfoCell({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={s.infoCell}>
      <Ionicons name={icon} size={18} color="#3264ff" />
      <Text style={s.infoCellLabel}>{label}</Text>
      <Text style={s.infoCellValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Ionicons name={icon} size={16} color="#3264ff" style={{ marginTop: 2 }} />
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
    gap: 6, backgroundColor: '#3264ff', paddingVertical: 12, borderRadius: 999,
  },
  ctaBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  ctaBtnOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1, borderColor: '#3264ff', paddingVertical: 12, borderRadius: 999,
  },
  ctaBtnOutlineText: { color: '#3264ff', fontSize: 15, fontWeight: '600' },
  // 目的地++ v1 panels
  panelTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  panelCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8 },
  panelMutedText: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: { backgroundColor: '#EEF2FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  chipText: { fontSize: 11, color: '#3264ff', fontWeight: '600' },
});

/* ═══════════════════════════════════════════════════════════
   目的地++ v1 · 6 Mobile Panels (data-driven)
   ═══════════════════════════════════════════════════════════ */

const MODE_ICON_MOBILE: Record<string, string> = {
  FLIGHT: '✈', TRAIN: '🚄', RAIL: '🚆', CAR: '🚘',
  BUS: '🚌', WALK: '🚶', SHUTTLE: '🚐', CABLE: '🚡', BOAT: '⛵',
};

function TransportLegsSection({ legs }: { legs: NonNullable<HolySite['transportLegs']> }) {
  return (
    <View style={s.section}>
      <Text style={s.panelTitle}>🚗 交通接驳</Text>
      {legs.map((leg, i) => (
        <View key={i} style={s.panelCard}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>
            {MODE_ICON_MOBILE[(leg.mode || '').toUpperCase()] || '▶'} {leg.from} → {leg.to}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
            {leg.distanceKm != null && <Text style={s.panelMutedText}>约 {leg.distanceKm} km</Text>}
            {leg.durationMin != null && <Text style={s.panelMutedText}>约 {Math.round(leg.durationMin / 60 * 10) / 10} h</Text>}
            {leg.costFrom != null && <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '700' }}>¥{leg.costFrom}/人起</Text>}
          </View>
          {leg.note && <Text style={[s.panelMutedText, { marginTop: 4 }]}>{leg.note}</Text>}
        </View>
      ))}
    </View>
  );
}

function CulturalProductsSection({ products }: { products: NonNullable<HolySite['culturalProducts']> }) {
  return (
    <View style={s.section}>
      <Text style={s.panelTitle}>🎁 文化周边</Text>
      {products.map((p, i) => (
        <View key={i} style={[s.panelCard, { backgroundColor: '#FFF9EC', borderColor: '#E8D69A' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 22 }}>{p.emoji || '🎁'}</Text>
            {p.tag && <Text style={{ fontSize: 10, color: '#8B6914', fontWeight: '600' }}>{p.tag}</Text>}
          </View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 }}>{p.name}</Text>
          <Text style={s.panelMutedText} numberOfLines={3}>{p.desc}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            {p.localStore && <Text style={s.panelMutedText}>📍 {p.localStore}</Text>}
            {p.priceFrom != null && <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '700' }}>¥{p.priceFrom}起</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

const SEASON_META_MOBILE: Record<string, { label: string; icon: string }> = {
  spring: { label: '春季', icon: '🌸' },
  summer: { label: '夏季', icon: '☀' },
  autumn: { label: '秋季', icon: '🍁' },
  winter: { label: '冬季', icon: '❄' },
};

function SeasonHoursSection({ hours }: { hours: NonNullable<HolySite['openingHoursBySeason']> }) {
  const entries = (['spring', 'summer', 'autumn', 'winter'] as const)
    .map((k) => ({ key: k, v: (hours as Record<string, { open?: string; close?: string; note?: string } | undefined>)[k] }))
    .filter((e) => e.v && (e.v.open || e.v.close || e.v.note));
  if (entries.length === 0) return null;
  return (
    <View style={s.section}>
      <Text style={s.panelTitle}>🕐 四季开放</Text>
      {entries.map(({ key, v }) => {
        const meta = SEASON_META_MOBILE[key];
        return (
          <View key={key} style={s.panelCard}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 }}>
              {meta.icon} {meta.label}
            </Text>
            {(v?.open || v?.close) && (
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#3264ff' }}>
                {v?.open || '—'}  ~  {v?.close || '—'}
              </Text>
            )}
            {v?.note && <Text style={[s.panelMutedText, { marginTop: 2 }]}>{v.note}</Text>}
          </View>
        );
      })}
    </View>
  );
}

const TIP_META_MOBILE: Record<string, { label: string; icon: string }> = {
  transport: { label: '交通贴士', icon: '🚗' },
  dining: { label: '用餐贴士', icon: '🍲' },
  gear: { label: '装备贴士', icon: '🎒' },
  etiquette: { label: '礼仪贴士', icon: '🙏' },
};

function VisitorTipsGroupedSection({ tips }: { tips: NonNullable<HolySite['visitorTipsGrouped']> }) {
  const groups = (['transport', 'dining', 'gear', 'etiquette'] as const)
    .map((k) => ({ key: k, list: (tips as Record<string, string[] | undefined>)[k] || [] }))
    .filter((g) => g.list.length > 0);
  if (groups.length === 0) return null;
  return (
    <View style={s.section}>
      <Text style={s.panelTitle}>💡 参访贴士</Text>
      {groups.map((g) => {
        const meta = TIP_META_MOBILE[g.key];
        return (
          <View key={g.key} style={s.panelCard}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 }}>
              {meta.icon} {meta.label}
            </Text>
            {g.list.map((t, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                <Text style={{ color: '#3264ff' }}>•</Text>
                <Text style={[s.panelMutedText, { flex: 1 }]}>{t}</Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

function LocalGuidesSection({ guides }: { guides: NonNullable<HolySite['localGuides']> }) {
  return (
    <View style={s.section}>
      <Text style={s.panelTitle}>👤 当地讲解师</Text>
      {guides.map((g, i) => (
        <View key={i} style={s.panelCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#3264ff', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>{g.name?.[0] || '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>{g.name}</Text>
              <Text style={s.panelMutedText}>{g.specialty}</Text>
            </View>
            {g.rating != null && (
              <View style={{ backgroundColor: '#00b341', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{g.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          {Array.isArray(g.languages) && g.languages.length > 0 && (
            <View style={s.chipRow}>
              {g.languages.map((lang, j) => (
                <View key={j} style={s.chip}><Text style={s.chipText}>{lang}</Text></View>
              ))}
            </View>
          )}
          <Text style={[s.panelMutedText, { marginTop: 6 }]} numberOfLines={3}>{g.bio}</Text>
        </View>
      ))}
    </View>
  );
}

function PhotoStorySection({ story }: { story: NonNullable<HolySite['photoStory']> }) {
  const sorted = [...story].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <View style={s.section}>
      <Text style={s.panelTitle}>📷 镜头之下</Text>
      {sorted.map((frame, i) => (
        <View key={i} style={s.panelCard}>
          {frame.imageUrl && (
            <Image source={{ uri: frame.imageUrl }} style={{ width: '100%', height: 160, borderRadius: 8, marginBottom: 8 }} resizeMode="cover" />
          )}
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>{frame.caption}</Text>
          {frame.shotLocation && <Text style={[s.panelMutedText, { marginTop: 2 }]}>📍 {frame.shotLocation}</Text>}
          <Text style={[s.panelMutedText, { marginTop: 4 }]}>{frame.significance}</Text>
        </View>
      ))}
    </View>
  );
}
