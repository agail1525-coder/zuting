import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api, Temple } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import ReviewSection from '../../src/components/ReviewSection';
import RelatedEntities from '../../src/components/RelatedEntities';
import SaveButton from '../../src/components/SaveButton';
import { useTranslation } from '../../src/lib/i18n';

export default function TempleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [temple, setTemple] = useState<Temple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setError(null);
        const found = await api.getTempleById(id);
        setTemple(found);
        navigation.setOptions({ title: found.name });
        // Record view silently for recommendation engine
        api.recordView('TEMPLE', id);
      } catch (err) {
        console.error('Failed to fetch temple:', err);
        setError(t('templeDetail.loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  if (loading) return <LoadingView />;
  if (error || !temple) {
    return (
      <View style={s.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#0066FF" />
        <Text style={s.errorText}>{error ?? t('templeDetail.notFound')}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: '#0066FF', fontSize: 15, marginTop: 8 }}>{t('common.back')}</Text>
        </Pressable>
      </View>
    );
  }

  const name = locale === 'zh-CN' ? (temple.name ?? '') : (temple.nameEn || temple.name || '');
  const nameEn = locale === 'zh-CN' ? (temple.nameEn ?? '') : (temple.name ?? '');
  const religion = temple.religion;
  const founded = temple.foundingDate ?? '';
  const hasImage = !!temple.imageUrl;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Hero */}
      <View style={s.hero}>
        {hasImage ? (
          <Image source={{ uri: temple.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
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
            <SaveButton entityType="TEMPLE" entityId={id!} size={26} />
          </View>
          <Text style={s.heroSubtitle}>{nameEn}</Text>
        </LinearGradient>
      </View>

      {/* Info Grid */}
      <View style={s.infoGrid}>
        <InfoCell icon="globe-outline" label={t('templeDetail.country')} value={temple.country ?? '—'} />
        {temple.city && <InfoCell icon="business-outline" label={t('templeDetail.city')} value={temple.city} />}
        {founded && <InfoCell icon="calendar-outline" label={t('templeDetail.founded')} value={founded} />}
        <InfoCell icon="navigate-outline" label={t('templeDetail.coordinates')} value={`${temple.latitude?.toFixed(4) ?? '—'}, ${temple.longitude?.toFixed(4) ?? '—'}`} />
      </View>

      {/* Description */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{t('templeDetail.description')}</Text>
        <View style={s.card}>
          <Text style={s.descText}>{temple.description}</Text>
        </View>
      </View>

      {/* Reviews */}
      <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
        <ReviewSection targetType="TEMPLE" targetId={id!} />
      </View>

      {/* Related Entities */}
      <RelatedEntities entityType="TEMPLE" entityId={id!} title={t('templeDetail.youMayLike')} />

      {/* Bottom CTA */}
      <View style={s.ctaRow}>
        <Pressable style={s.ctaBtn} onPress={() => router.push('/trips/create' as never)}>
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={s.ctaBtnText}>{t('templeDetail.addToTrip')}</Text>
        </Pressable>
        <Pressable style={s.ctaBtnOutline} onPress={() => router.push('/(tabs)/chat')}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#0066FF" />
          <Text style={s.ctaBtnOutlineText}>{t('templeDetail.aiPlan')}</Text>
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { paddingBottom: 40 },
  errorContainer: { flex: 1, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: '#6B7280', fontSize: 16 },
  hero: { height: 260, position: 'relative' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 20, paddingTop: 60 },
  religionBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 8 },
  religionBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginTop: 16, gap: 8 },
  infoCell: {
    width: '48%', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#E5E7EB',
  },
  infoCellLabel: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
  infoCellValue: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', textAlign: 'center' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  descText: { fontSize: 14, color: '#4B5563', lineHeight: 24 },
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
