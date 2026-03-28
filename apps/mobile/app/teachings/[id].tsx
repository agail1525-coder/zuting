import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { api, Teaching } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';

export default function TeachingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const [teaching, setTeaching] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setError(null);
        const found = await api.getTeachingById(id);
        setTeaching(found);
        navigation.setOptions({ title: (found as any).title ?? '' });
      } catch (err) {
        console.error('Failed to fetch teaching detail:', err);
        setError('加载祖训详情失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  if (loading) return <LoadingView />;
  if (error || !teaching) {
    return (
      <View style={s.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#0066FF" />
        <Text style={s.errorText}>{error ?? '祖训不存在'}</Text>
      </View>
    );
  }

  const religionName = teaching.religion?.name ?? teaching.religion?.nameZh ?? '';

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Hero */}
      <View style={s.hero}>
        <LinearGradient colors={['#0066FF', '#003D99']} style={StyleSheet.absoluteFillObject} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={s.heroOverlay}>
          {religionName ? (
            <View style={s.religionBadge}>
              <Text style={s.religionBadgeText}>{religionName}</Text>
            </View>
          ) : null}
          <Text style={s.heroTitle}>{teaching.title}</Text>
          {teaching.source ? (
            <View style={s.sourceBadge}>
              <Ionicons name="book-outline" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={s.sourceText}>{teaching.source}</Text>
            </View>
          ) : null}
        </LinearGradient>
      </View>

      {/* Original Text */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>原文</Text>
        <View style={s.quoteCard}>
          <View style={s.quoteBar} />
          <Text style={s.quoteText}>{teaching.originalText}</Text>
        </View>
      </View>

      {/* Translation */}
      {teaching.translation ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>译文</Text>
          <View style={s.card}>
            <Text style={s.cardText}>{teaching.translation}</Text>
          </View>
        </View>
      ) : null}

      {/* Religion */}
      {religionName ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>所属信仰</Text>
          <View style={s.card}>
            <Text style={s.cardText}>{religionName}</Text>
          </View>
        </View>
      ) : null}

      {/* CTA */}
      <View style={s.ctaRow}>
        <Pressable style={s.ctaBtn} onPress={() => router.push('/trips/create' as never)}>
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={s.ctaBtnText}>规划行程</Text>
        </Pressable>
        <Pressable style={s.ctaBtnOutline} onPress={() => router.push('/(tabs)/chat')}>
          <Ionicons name="chatbubble-ellipses" size={18} color="#0066FF" />
          <Text style={s.ctaBtnOutlineText}>AI规划</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { paddingBottom: 40 },
  errorContainer: { flex: 1, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', gap: 12 },
  errorText: { color: '#6B7280', fontSize: 16 },
  hero: { height: 240, position: 'relative' },
  heroOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 20, paddingTop: 60,
  },
  religionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginBottom: 8,
  },
  religionBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  sourceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8,
  },
  sourceText: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 },
  quoteCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row',
  },
  quoteBar: {
    width: 3, backgroundColor: '#0066FF', borderRadius: 2, marginRight: 14,
  },
  quoteText: {
    flex: 1, fontSize: 16, color: '#374151', lineHeight: 28, fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardText: { fontSize: 14, color: '#4B5563', lineHeight: 24 },
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
