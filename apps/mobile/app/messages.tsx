import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../src/lib/theme';
import { ChatRoom, fetchChatRooms } from '../src/lib/api';

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  PRIVATE: 'person',
  GROUP: 'people',
  SERVICE: 'storefront',
};

export default function MessagesScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRooms = useCallback(async () => {
    try {
      const data = await fetchChatRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRooms();
  }, [loadRooms]);

  const renderRoom = ({ item }: { item: ChatRoom }) => {
    const iconName = TYPE_ICONS[item.type] ?? 'chatbubble';
    return (
      <Pressable
        style={({ pressed }) => [styles.roomCard, pressed && styles.roomCardPressed]}
        onPress={() => router.push(`/chat-room/${item.id}` as never)}
      >
        <View style={styles.avatarCircle}>
          <Ionicons name={iconName} size={22} color={colors.gold} />
        </View>
        <View style={styles.roomContent}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomName} numberOfLines={1}>
              {item.name ?? '聊天'}
            </Text>
            {item.lastMessage && (
              <Text style={styles.roomTime}>
                {formatTime(item.lastMessage.createdAt)}
              </Text>
            )}
          </View>
          <View style={styles.roomFooter}>
            <Text style={styles.roomPreview} numberOfLines={1}>
              {item.lastMessage?.content ?? '暂无消息'}
            </Text>
            {(item.unreadCount ?? 0) > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {(item.unreadCount ?? 0) > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        renderItem={renderRoom}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={rooms.length === 0 ? styles.emptyListContent : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>暂无消息</Text>
            <Text style={styles.emptyText}>您的聊天对话将显示在这里</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  emptyListContent: {
    flex: 1,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCardSolid,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1,
  },
  roomCardPressed: {
    opacity: 0.8,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 102, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomContent: {
    flex: 1,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  roomTime: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomPreview: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    backgroundColor: colors.gold,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
