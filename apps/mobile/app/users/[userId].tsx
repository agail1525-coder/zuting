import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fetchPublicUserProfile, type PublicUserProfile } from '../../src/lib/api-pillars';
import { spacing, borderRadius } from '../../src/lib/theme';

const BLUE = '#3264ff';

const LEVEL_META: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: '初行者',   color: '#9CA3AF', emoji: '🌱' },
  2: { label: '参学者',   color: '#3264ff', emoji: '🌿' },
  3: { label: '善行者',   color: '#2D8B6F', emoji: '🌳' },
  4: { label: '明行者',   color: '#8B6914', emoji: '🌟' },
  5: { label: '证道者',   color: '#B91C1C', emoji: '👑' },
};

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [data, setData] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchPublicUserProfile(userId)
      .then(setData)
      .catch(() => setError('用户不存在或已隐私'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={BLUE} /></View>;
  if (error || !data) return <View style={s.center}><Text style={s.err}>{error ?? '未找到'}</Text></View>;

  const level = LEVEL_META[data.pilgrimLevel] ?? LEVEL_META[1];

  return (
    <>
      <Stack.Screen options={{ title: data.displayName ?? '用户主页' }} />
      <ScrollView style={s.container}>
        <LinearGradient colors={['#0f172a', level.color]} style={s.hero}>
          {data.avatar ? (
            <Image source={{ uri: data.avatar }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 36 }}>{level.emoji}</Text>
            </View>
          )}
          <Text style={s.name}>{data.displayName ?? '匿名行者'}</Text>
          <View style={s.levelBadge}>
            <Text style={s.levelText}>{level.emoji} Lv.{data.pilgrimLevel} · {level.label}</Text>
          </View>
          {data.location ? (
            <View style={s.locRow}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={s.loc}>{data.location}</Text>
            </View>
          ) : null}
          {data.bio ? <Text style={s.bio}>{data.bio}</Text> : null}
        </LinearGradient>

        <View style={s.statsRow}>
          <Stat label="行程" value={data.totalTrips} />
          <Stat label="圣地" value={data.totalSites} />
          <Stat label="攻略" value={data.guideCount} />
          <Stat label="评价" value={data.reviewCount} />
        </View>

        <View style={s.emptyHint}>
          <Ionicons name="construct-outline" size={32} color="#d1d5db" />
          <Text style={s.emptyText}>更多内容（游记/攻略/收藏）即将上线</Text>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={s.stat}>
      <Text style={s.statVal}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  err: { color: '#b91c1c' },
  hero: { padding: spacing.lg, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  name: { fontSize: 20, color: '#fff', fontWeight: '700' },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: borderRadius.md, marginTop: 8 },
  levelText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  loc: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  bio: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20, marginTop: 10, maxWidth: 280 },
  statsRow: { flexDirection: 'row', padding: spacing.md, gap: 10 },
  stat: { flex: 1, padding: spacing.md, backgroundColor: '#f8faff', borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  statVal: { fontSize: 22, color: BLUE, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4, letterSpacing: 1 },
  emptyHint: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { color: '#9ca3af', marginTop: 10, fontSize: 13 },
});
