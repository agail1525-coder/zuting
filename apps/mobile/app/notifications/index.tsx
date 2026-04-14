import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, Notification } from '../../src/lib/api';
import { LoadingView } from '../../src/components/LoadingView';

const TYPE_ICONS: Record<string, string> = {
  TRIP_STATUS: 'compass',
  PAYMENT: 'card',
  REFUND: 'return-down-back',
  REVIEW: 'star',
  SYSTEM: 'megaphone',
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getNotifications({ limit: '50' });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const markRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { Alert.alert('提示', '操作失败，请重试'); }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { Alert.alert('提示', '操作失败，请重试'); }
  };

  const hasUnread = notifications.some(n => !n.read);

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconName = TYPE_ICONS[item.type] ?? 'notifications';
    return (
      <Pressable
        style={[s.notifCard, !item.read && s.notifCardUnread]}
        onPress={() => !item.read && markRead(item.id)}
      >
        <View style={[s.iconCircle, !item.read && s.iconCircleUnread]}>
          <Ionicons name={iconName as any} size={18} color={item.read ? '#9CA3AF' : '#3264ff'} />
        </View>
        <View style={s.notifContent}>
          <Text style={[s.notifTitle, !item.read && s.notifTitleUnread]}>{item.title}</Text>
          <Text style={s.notifBody} numberOfLines={2}>{item.content}</Text>
          <Text style={s.notifDate}>{item.createdAt.slice(0, 16).replace('T', ' ')}</Text>
        </View>
        {!item.read && <View style={s.unreadDot} />}
      </Pressable>
    );
  };

  return (
    <View style={s.container}>
      {/* Header actions */}
      {hasUnread && (
        <Pressable style={s.markAllBtn} onPress={markAllRead}>
          <Ionicons name="checkmark-done" size={16} color="#3264ff" />
          <Text style={s.markAllText}>全部已读</Text>
        </Pressable>
      )}

      {loading ? (
        <LoadingView />
      ) : notifications.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="notifications-off-outline" size={48} color="#D1D5DB" />
          <Text style={s.emptyText}>暂无通知</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderNotification}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  markAllBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8,
  },
  markAllText: { fontSize: 13, color: '#3264ff' },
  notifCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'flex-start', gap: 12,
  },
  notifCardUnread: { borderColor: 'rgba(0,102,255,0.2)', backgroundColor: '#FAFBFF' },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  iconCircleUnread: { backgroundColor: 'rgba(0,102,255,0.1)' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 2 },
  notifTitleUnread: { color: '#1A1A1A' },
  notifBody: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 4 },
  notifDate: { fontSize: 11, color: '#9CA3AF' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3264ff', marginTop: 4 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
});
