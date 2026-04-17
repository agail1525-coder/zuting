import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { fetchFhCase, type FamilyHarmonyCase } from '../../../src/lib/api-pillars';
import { spacing, borderRadius } from '../../../src/lib/theme';

const JADE = '#2D8B6F';

export default function FhCaseDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [data, setData] = useState<FamilyHarmonyCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchFhCase(slug)
      .then(setData)
      .catch(() => setError('案例不存在'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={JADE} /></View>;
  if (error || !data) return <View style={s.center}><Text style={s.err}>{error ?? '未找到'}</Text></View>;

  return (
    <>
      <Stack.Screen options={{ title: data.teamName }} />
      <ScrollView style={s.container}>
        <View style={s.hero}>
          {data.theme && (
            <View style={[s.tag, { backgroundColor: (data.theme.color || JADE) + '22' }]}>
              <Text style={[s.tagText, { color: data.theme.color || JADE }]}>{data.theme.title}</Text>
            </View>
          )}
          <Text style={s.title}>{data.teamName}</Text>
          <Text style={s.meta}>
            {data.orgType}{data.industry ? ` · ${data.industry}` : ''} · {data.headcount} 人
          </Text>
        </View>

        {data.photos && data.photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoRow}>
            {data.photos.map((p, i) => (
              <Image key={i} source={{ uri: p }} style={s.photo} resizeMode="cover" />
            ))}
          </ScrollView>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>家庭故事</Text>
          <Text style={s.story}>{data.story}</Text>
        </View>

        {data.highlights && data.highlights.length > 0 && (
          <View style={[s.section, { backgroundColor: '#f0fdf4' }]}>
            <Text style={s.sectionTitle}>疗愈亮点</Text>
            {data.highlights.map((h, i) => (
              <Text key={i} style={s.highlight}>✓ {h}</Text>
            ))}
          </View>
        )}

        {data.testimonial ? (
          <View style={[s.section, { backgroundColor: '#0f172a' }]}>
            <Text style={[s.sectionTitle, { color: '#6DB895' }]}>一句话感言</Text>
            <Text style={s.testimonial}>&ldquo;{data.testimonial}&rdquo;</Text>
          </View>
        ) : null}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  err: { color: '#b91c1c' },
  hero: { padding: spacing.lg, backgroundColor: '#f0fdf4' },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.sm, marginBottom: 8 },
  tagText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 22, color: '#111827', fontWeight: '700' },
  meta: { fontSize: 12, color: '#6b7280', marginTop: 6 },
  photoRow: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  photo: { width: 200, height: 140, borderRadius: borderRadius.md, marginRight: 10 },
  section: { padding: spacing.lg },
  sectionTitle: { fontSize: 18, color: '#111827', fontWeight: '700', marginBottom: spacing.sm },
  story: { fontSize: 14, color: '#4b5563', lineHeight: 26 },
  highlight: { fontSize: 13, color: JADE, lineHeight: 24, marginBottom: 2 },
  testimonial: { fontSize: 16, color: '#fff', lineHeight: 28, fontStyle: 'italic' },
});
