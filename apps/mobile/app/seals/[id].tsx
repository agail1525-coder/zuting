import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api, Seal } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { seriesColors } from '../../src/lib/theme';

export default function SealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const [seal, setSeal] = useState<Seal | null>(null);
  const [allSeals, setAllSeals] = useState<Seal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setError(null);
        const [found, seals] = await Promise.all([
          api.getSealById(id),
          api.getSeals(),
        ]);
        setSeal(found);
        navigation.setOptions({ title: `第${found.number}印 · ${found.nameZh}` });
        setAllSeals(seals.sort((a, b) => a.number - b.number));
      } catch (err) {
        console.error('Failed to fetch seal detail:', err);
        setError('加载印详情失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  if (loading) return <LoadingView />;
  if (error || !seal) {
    return (
      <View style={s.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#0066FF" />
        <Text style={s.errorText}>{error ?? '印不存在'}</Text>
      </View>
    );
  }

  const seriesColor = seriesColors[seal.series] || '#0066FF';
  const currentIndex = allSeals.findIndex((item) => item.id === id);
  const prevSeal = currentIndex > 0 ? allSeals[currentIndex - 1] : null;
  const nextSeal = currentIndex < allSeals.length - 1 ? allSeals[currentIndex + 1] : null;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Hero with gradient */}
      <View style={s.hero}>
        <LinearGradient colors={[seriesColor, '#003D99']} style={StyleSheet.absoluteFillObject} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={s.heroOverlay}>
          <View style={s.numberCircle}>
            <Text style={s.numberText}>{seal.number}</Text>
          </View>
          <Text style={s.heroTitle}>{seal.nameZh}</Text>
          <Text style={s.heroSubtitle}>{seal.nameEn}</Text>
          <View style={s.seriesBadge}>
            <View style={[s.seriesDot, { backgroundColor: '#FFFFFF' }]} />
            <Text style={s.seriesText}>{seal.series}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Poem */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>偈颂</Text>
        <View style={s.poemCard}>
          <Text style={s.poemText}>{seal.poem}</Text>
        </View>
      </View>

      {/* Essence */}
      {seal.essence ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>要义</Text>
          <View style={s.card}>
            <Text style={s.cardText}>{seal.essence}</Text>
          </View>
        </View>
      ) : null}

      {/* Practice */}
      {seal.practice ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>修行</Text>
          <View style={s.card}>
            <Text style={s.cardText}>{seal.practice}</Text>
          </View>
        </View>
      ) : null}

      {/* Vow */}
      {seal.vow ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>愿文</Text>
          <View style={[s.card, { borderLeftWidth: 3, borderLeftColor: seriesColor }]}>
            <Text style={[s.cardText, { color: '#1E40AF', fontWeight: '500' }]}>{seal.vow}</Text>
          </View>
        </View>
      ) : null}

      {/* Prev / Next Navigation */}
      <View style={s.navRow}>
        {prevSeal ? (
          <Pressable
            style={s.navButton}
            onPress={() => router.replace({ pathname: '/seals/[id]', params: { id: prevSeal.id } })}
          >
            <Ionicons name="chevron-back" size={20} color="#0066FF" />
            <View>
              <Text style={s.navLabel}>上一印</Text>
              <Text style={s.navName}>{prevSeal.nameZh}</Text>
            </View>
          </Pressable>
        ) : <View style={s.navSpacer} />}
        {nextSeal ? (
          <Pressable
            style={[s.navButton, { justifyContent: 'flex-end' }]}
            onPress={() => router.replace({ pathname: '/seals/[id]', params: { id: nextSeal.id } })}
          >
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.navLabel}>下一印</Text>
              <Text style={s.navName}>{nextSeal.nameZh}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0066FF" />
          </Pressable>
        ) : <View style={s.navSpacer} />}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { paddingBottom: 40 },
  errorContainer: { flex: 1, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: '#6B7280', fontSize: 16 },
  hero: { height: 260, position: 'relative' },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 20, paddingTop: 60, alignItems: 'center',
  },
  numberCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  numberText: { color: '#FFFFFF', fontSize: 28, fontWeight: '800' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  seriesBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  seriesDot: { width: 8, height: 8, borderRadius: 4 },
  seriesText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  poemCard: {
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 24,
    borderWidth: 1, borderColor: '#DBEAFE', alignItems: 'center',
  },
  poemText: {
    fontSize: 18, color: '#1E40AF', lineHeight: 32,
    fontStyle: 'italic', textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardText: { fontSize: 14, color: '#4B5563', lineHeight: 24 },
  navRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, marginTop: 24, gap: 12,
  },
  navButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB', gap: 8,
  },
  navLabel: { color: '#9CA3AF', fontSize: 11 },
  navName: { color: '#1A1A1A', fontSize: 14, fontWeight: '600' },
  navSpacer: { flex: 1 },
});
