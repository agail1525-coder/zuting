import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ChatRoom, fetchChatRooms } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const TYPE_ICONS: Record<string, string> = {
  PRIVATE: '💬',
  GROUP: '👥',
  SERVICE: '🏪',
}

export default function MessagesPage() {
  const { t } = useTranslation()
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

  function formatTime(iso: string): string {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return t('messages.justNow')
    if (diffMin < 60) return t('messages.minutesAgo', { count: diffMin })
    const diffHour = Math.floor(diffMin / 60)
    if (diffHour < 24) return t('messages.hoursAgo', { count: diffHour })
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  const loadData = async () => {
    if (!isLoggedIn()) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchChatRooms()
      setRooms(data)
    } catch (err) {
      console.error('Failed to load chat rooms:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (!isLoggedIn()) {
    return (
      <View className='msg-page'>
        <View className='empty-state'>
          <Text className='empty-state__icon'>🔐</Text>
          <Text className='empty-state__text'>{t('messages.loginRequired')}</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className='msg-page' scrollY>
      {loading ? (
        <View className='empty-state'>
          <Text className='empty-state__text'>{t('common.loading')}</Text>
        </View>
      ) : rooms.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-state__icon'>💬</Text>
          <Text className='empty-state__text'>{t('messages.noMessages')}</Text>
          <Text className='empty-state__sub'>{t('messages.chatWillAppearHere')}</Text>
        </View>
      ) : (
        <View className='room-list'>
          {rooms.map(room => (
            <View
              key={room.id}
              className='room-card'
              onClick={() => Taro.navigateTo({ url: `/pages/chat-room/index?id=${room.id}` })}
            >
              <View className='room-card__avatar'>
                <Text className='room-card__avatar-text'>
                  {TYPE_ICONS[room.type] ?? '💬'}
                </Text>
              </View>
              <View className='room-card__content'>
                <View className='room-card__header'>
                  <Text className='room-card__name'>{room.name ?? t('messages.defaultChatName')}</Text>
                  {room.lastMessage && (
                    <Text className='room-card__time'>
                      {formatTime(room.lastMessage.createdAt)}
                    </Text>
                  )}
                </View>
                <View className='room-card__footer'>
                  <Text className='room-card__preview'>
                    {room.lastMessage?.content ?? t('messages.noMessages')}
                  </Text>
                  {(room.unreadCount ?? 0) > 0 && (
                    <View className='room-card__badge'>
                      <Text className='room-card__badge-text'>
                        {(room.unreadCount ?? 0) > 99 ? '99+' : room.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
