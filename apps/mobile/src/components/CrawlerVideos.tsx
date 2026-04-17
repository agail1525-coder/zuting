import React, { useEffect, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchCrawlerVideos, type CrawlerVideo } from '../lib/api-pillars';
import { spacing, borderRadius } from '../lib/theme';

const BLUE = '#3264ff';

function fmtDuration(sec: number | null): string {
  if (!sec || sec <= 0) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function fmtViews(count: number | null): string {
  if (!count) return '';
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万次`;
  return `${count.toLocaleString()}次`;
}

type Props = {
  targetType: 'holySite' | 'religion';
  targetId: string;
  limit?: number;
};

export function CrawlerVideos({ targetType, targetId, limit = 8 }: Props) {
  const [videos, setVideos] = useState<CrawlerVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchCrawlerVideos(targetType, targetId, limit)
      .then((v) => {
        if (!cancelled) setVideos(v);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId, limit]);

  if (loading) return null;
  if (!videos.length) return null;

  return (
    <View style={s.section}>
      <View style={s.head}>
        <Ionicons name="logo-youtube" size={18} color="#b91c1c" />
        <Text style={s.title}>相关视频</Text>
        <Text style={s.badge}>YouTube</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {videos.map((v) => (
          <Pressable
            key={v.id}
            style={s.card}
            onPress={() => Linking.openURL(v.url).catch(() => {})}
          >
            <View style={s.thumbBox}>
              {v.thumbnailUrl ? (
                <Image source={{ uri: v.thumbnailUrl }} style={s.thumb} resizeMode="cover" />
              ) : (
                <View style={[s.thumb, { backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="videocam-outline" size={32} color="#9ca3af" />
                </View>
              )}
              <View style={s.playBadge}>
                <Ionicons name="play" size={14} color="#fff" />
              </View>
              {v.durationSec ? (
                <View style={s.durationBadge}>
                  <Text style={s.durationText}>{fmtDuration(v.durationSec)}</Text>
                </View>
              ) : null}
            </View>
            <Text style={s.cardTitle} numberOfLines={2}>{v.title}</Text>
            <View style={s.cardMeta}>
              {v.channel ? <Text style={s.cardChannel} numberOfLines={1}>{v.channel}</Text> : null}
              {v.viewCount ? <Text style={s.cardViews}>{fmtViews(v.viewCount)}</Text> : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  section: { padding: spacing.md, backgroundColor: '#fff' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
  title: { fontSize: 16, color: '#111827', fontWeight: '700', flex: 1 },
  badge: { fontSize: 10, color: '#b91c1c', backgroundColor: '#fef2f2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: borderRadius.sm, fontWeight: '700' },
  row: { gap: 10, paddingHorizontal: spacing.sm },
  card: { width: 200 },
  thumbBox: { position: 'relative', marginBottom: 8 },
  thumb: { width: 200, height: 112, borderRadius: borderRadius.md, backgroundColor: '#f3f4f6' },
  playBadge: { position: 'absolute', top: '50%', left: '50%', marginLeft: -14, marginTop: -14, width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center' },
  durationBadge: { position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.75)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  durationText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  cardTitle: { fontSize: 13, color: '#111827', lineHeight: 18, fontWeight: '600' },
  cardMeta: { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  cardChannel: { fontSize: 11, color: BLUE, flex: 1 },
  cardViews: { fontSize: 10, color: '#9ca3af' },
});
