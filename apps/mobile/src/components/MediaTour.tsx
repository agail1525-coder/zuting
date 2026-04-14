import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Pressable, Image, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { fetchMediaByEntity, MediaContent } from '../lib/api';

interface MediaTourProps {
  entityType: string;
  entityId: string;
}

type TabKey = 'VIDEO' | 'PANORAMA' | 'AUDIO';

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const TAB_CONFIG: { key: TabKey; label: string; icon: string }[] = [
  { key: 'VIDEO', label: '视频', icon: 'videocam' },
  { key: 'PANORAMA', label: '全景', icon: 'globe' },
  { key: 'AUDIO', label: '音频', icon: 'headset' },
];

/* ---------- Audio Player ---------- */
function AudioPlayer({ media }: { media: MediaContent }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    if (status.durationMillis) {
      setProgress(status.positionMillis / status.durationMillis);
      setCurrentTime(Math.floor(status.positionMillis / 1000));
    }
    if (status.didJustFinish) {
      setPlaying(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: media.url },
          { shouldPlay: true },
          onPlaybackStatusUpdate,
        );
        soundRef.current = sound;
        setPlaying(true);
        return;
      }
      if (playing) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
      setPlaying(!playing);
    } catch (err) {
      console.error('Audio playback error:', err);
    }
  }, [playing, media.url, onPlaybackStatusUpdate]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  return (
    <View style={s.audioRow}>
      <Pressable onPress={toggle} style={s.audioPlayBtn}>
        <Ionicons name={playing ? 'pause' : 'play'} size={18} color="#FFFFFF" />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={s.audioTitle} numberOfLines={1}>{media.title}</Text>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
      <Text style={s.audioDuration}>
        {formatDuration(currentTime)} / {formatDuration(media.duration)}
      </Text>
    </View>
  );
}

/* ---------- Main Component ---------- */
export default function MediaTour({ entityType, entityId }: MediaTourProps) {
  const [media, setMedia] = useState<MediaContent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('VIDEO');

  useEffect(() => {
    let cancelled = false;
    fetchMediaByEntity(entityType, entityId)
      .then((data) => {
        if (!cancelled) {
          setMedia(data);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, [entityType, entityId]);

  if (!loaded) return null;

  const grouped: Record<TabKey, MediaContent[]> = {
    VIDEO: media.filter((m) => m.mediaType === 'VIDEO'),
    PANORAMA: media.filter((m) => m.mediaType === 'PANORAMA'),
    AUDIO: media.filter((m) => m.mediaType === 'AUDIO'),
  };

  const tabs = TAB_CONFIG.filter((t) => grouped[t.key].length > 0);
  if (tabs.length === 0) return null;

  const currentTab = tabs.find((t) => t.key === activeTab) ? activeTab : tabs[0].key;
  const items = grouped[currentTab];

  return (
    <View style={s.container}>
      <Text style={s.sectionTitle}>多媒体导览</Text>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[s.tab, currentTab === tab.key && s.tabActive]}
          >
            <Ionicons
              name={tab.icon as keyof typeof Ionicons.glyphMap}
              size={14}
              color={currentTab === tab.key ? '#FFFFFF' : '#3264ff'}
            />
            <Text style={[s.tabText, currentTab === tab.key && s.tabTextActive]}>
              {tab.label} ({grouped[tab.key].length})
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Video Grid */}
      {currentTab === 'VIDEO' && items.map((item) => (
        <Pressable key={item.id} style={s.videoCard}>
          {item.thumbnailUrl ? (
            <Image source={{ uri: item.thumbnailUrl }} style={s.videoThumb} resizeMode="cover" />
          ) : (
            <View style={[s.videoThumb, { backgroundColor: '#E0ECFF', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="videocam" size={32} color="#CBD5E1" />
            </View>
          )}
          <View style={s.videoOverlay}>
            <View style={s.playIcon}>
              <Ionicons name="play" size={20} color="#3264ff" />
            </View>
          </View>
          {item.duration != null && (
            <View style={s.durationBadge}>
              <Text style={s.durationText}>{formatDuration(item.duration)}</Text>
            </View>
          )}
          <Text style={s.videoTitle} numberOfLines={1}>{item.title}</Text>
        </Pressable>
      ))}

      {/* Panorama Grid */}
      {currentTab === 'PANORAMA' && items.map((item) => (
        <Pressable key={item.id} style={s.panoramaCard}>
          {item.thumbnailUrl ? (
            <Image source={{ uri: item.thumbnailUrl }} style={s.panoramaThumb} resizeMode="cover" />
          ) : (
            <View style={[s.panoramaThumb, { backgroundColor: '#E0F2FF', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="globe" size={32} color="#CBD5E1" />
            </View>
          )}
          <View style={s.videoOverlay}>
            <View style={s.playIcon}>
              <Ionicons name="globe" size={20} color="#3264ff" />
            </View>
          </View>
          <Text style={s.videoTitle} numberOfLines={1}>{item.title}</Text>
        </Pressable>
      ))}

      {/* Audio List */}
      {currentTab === 'AUDIO' && items.map((item) => (
        <AudioPlayer key={item.id} media={item} />
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#3264ff',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3264ff',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  // Video
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  videoThumb: {
    width: '100%',
    height: 180,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    padding: 12,
  },

  // Panorama
  panoramaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  panoramaThumb: {
    width: '100%',
    height: 140,
  },

  // Audio
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3264ff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  audioTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#3264ff',
    borderRadius: 2,
  },
  audioDuration: {
    fontSize: 11,
    color: '#9CA3AF',
    minWidth: 70,
    textAlign: 'right',
  },
});
