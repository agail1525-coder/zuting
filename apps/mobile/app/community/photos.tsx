import React, { useEffect, useState, useCallback } from 'react';
import { Dimensions, FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { fetchPhotoWall, PhotoItem } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';
import { colors, fontSize, spacing, borderRadius } from '../../src/lib/theme';

const SCREEN_W = Dimensions.get('window').width;
const COL = 3;
const GAP = 3;
const TILE = (SCREEN_W - spacing.md * 2 - GAP * (COL - 1)) / COL;
const PAGE_SIZE = 18;

export default function PhotoWallScreen() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expanded, setExpanded] = useState<PhotoItem | null>(null);

  const loadPage = useCallback(async (p: number) => {
    try {
      if (p === 1) setLoading(true);
      const res = await fetchPhotoWall({ page: p, limit: PAGE_SIZE });
      const items = Array.isArray(res.items) ? res.items : [];
      if (p === 1) {
        setPhotos(items);
      } else {
        setPhotos(prev => [...prev, ...items]);
      }
      setHasMore(items.length >= PAGE_SIZE);
      setPage(p);
    } catch (err) {
      console.error('Failed to fetch photos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPage(1); }, []);

  const handleEndReached = () => {
    if (hasMore && !loading) loadPage(page + 1);
  };

  return (
    <View style={s.container}>
      <Stack.Screen options={{ title: '照片墙', headerStyle: { backgroundColor: '#FFFFFF' }, headerTintColor: colors.gold }} />

      {loading && photos.length === 0 ? <LoadingView /> : photos.length === 0 ? (
        <View style={s.empty}><Text style={s.emptyText}>暂无照片</Text></View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={COL}
          columnWrapperStyle={s.row}
          contentContainerStyle={s.grid}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <Pressable onPress={() => setExpanded(item)}>
              <Image source={{ uri: item.url }} style={s.tile} resizeMode="cover" />
            </Pressable>
          )}
          ListFooterComponent={hasMore ? <Text style={s.loadMore}>加载中...</Text> : null}
        />
      )}

      {/* Lightbox */}
      <Modal visible={!!expanded} transparent animationType="fade" onRequestClose={() => setExpanded(null)}>
        <Pressable style={s.modal} onPress={() => setExpanded(null)}>
          {expanded && (
            <View style={s.modalContent}>
              <Image source={{ uri: expanded.url }} style={s.modalImage} resizeMode="contain" />
              <View style={s.modalInfo}>
                <View style={s.modalUser}>
                  <View style={s.userAvatar}>
                    <Text style={s.userInitial}>{(expanded.userName || '?')[0]}</Text>
                  </View>
                  <Text style={s.userName}>{expanded.userName}</Text>
                </View>
                <Text style={s.entityTag}>{expanded.entityType}</Text>
              </View>
            </View>
          )}
          <Pressable style={s.closeBtn} onPress={() => setExpanded(null)}>
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  grid: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xxl },
  row: { gap: GAP, marginBottom: GAP },
  tile: { width: TILE, height: TILE, borderRadius: borderRadius.sm },
  loadMore: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.sm, paddingVertical: spacing.md },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: fontSize.lg },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxHeight: '80%' },
  modalImage: { width: '100%', height: 400, borderRadius: borderRadius.lg },
  modalInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md },
  modalUser: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  userAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(212,168,85,0.3)', justifyContent: 'center', alignItems: 'center' },
  userInitial: { color: '#FFFFFF', fontWeight: '700', fontSize: fontSize.md },
  userName: { color: '#FFFFFF', fontSize: fontSize.md },
  entityTag: { color: colors.gold, fontSize: fontSize.xs, backgroundColor: 'rgba(212,168,85,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.sm },
  closeBtn: { position: 'absolute', top: 60, right: 20 },
});
