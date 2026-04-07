import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  AppNotification, fetchNotifications,
  markNotificationRead, markAllNotificationsRead
} from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const TYPE_ICONS: Record<string, string> = {
  TRIP_STATUS: '🧭',
  PAYMENT: '💳',
  REFUND: '↩️',
  REVIEW: '⭐',
  SYSTEM: '📢',
}

export default function NotificationsPage() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!isLoggedIn()) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetchNotifications({ limit: '50' })
      setNotifications(res.data)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch { Taro.showToast({ title: t('notifications.actionFailed'), icon: 'none' }) }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch { Taro.showToast({ title: t('notifications.actionFailed'), icon: 'none' }) }
  }

  if (!isLoggedIn()) {
    return (
      <View className='notif-page'>
        <View className='empty-state'>
          <Text className='empty-state__icon'>🔐</Text>
          <Text className='empty-state__text'>{t('notifications.loginRequired')}</Text>
        </View>
      </View>
    )
  }

  const hasUnread = notifications.some(n => !n.read)

  return (
    <ScrollView className='notif-page' scrollY>
      {hasUnread && (
        <View className='mark-all' onClick={handleMarkAllRead}>
          <Text className='mark-all__text'>✓ {t('notifications.markAllRead')}</Text>
        </View>
      )}

      {loading ? (
        <View className='empty-state'>
          <Text className='empty-state__text'>{t('common.loading')}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-state__icon'>🔔</Text>
          <Text className='empty-state__text'>{t('notifications.noNotifications')}</Text>
        </View>
      ) : (
        <View className='notif-list'>
          {notifications.map(notif => (
            <View
              key={notif.id}
              className={`notif-card ${!notif.read ? 'notif-card--unread' : ''}`}
              onClick={() => !notif.read && handleMarkRead(notif.id)}
            >
              <View className={`notif-card__icon ${!notif.read ? 'notif-card__icon--unread' : ''}`}>
                <Text className='notif-card__icon-text'>
                  {TYPE_ICONS[notif.type] ?? '🔔'}
                </Text>
              </View>
              <View className='notif-card__content'>
                <Text className={`notif-card__title ${!notif.read ? 'notif-card__title--unread' : ''}`}>
                  {notif.title}
                </Text>
                <Text className='notif-card__body'>{notif.content}</Text>
                <Text className='notif-card__date'>
                  {notif.createdAt.slice(0, 16).replace('T', ' ')}
                </Text>
              </View>
              {!notif.read && <View className='notif-card__dot' />}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
