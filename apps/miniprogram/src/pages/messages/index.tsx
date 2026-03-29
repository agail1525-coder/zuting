import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { ChatRoom, fetchChatRooms } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import './index.scss'

const TYPE_ICONS: Record<string, string> = {
  PRIVATE: '💬',
  GROUP: '👥',
  SERVICE: '🏪',
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}小时前`
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function MessagesPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)

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
          <Text className='empty-state__text'>请先登录查看消息</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className='msg-page' scrollY>
      {loading ? (
        <View className='empty-state'>
          <Text className='empty-state__text'>加载中...</Text>
        </View>
      ) : rooms.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-state__icon'>💬</Text>
          <Text className='empty-state__text'>暂无消息</Text>
          <Text className='empty-state__sub'>您的聊天对话将显示在这里</Text>
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
                  <Text className='room-card__name'>{room.name ?? '聊天'}</Text>
                  {room.lastMessage && (
                    <Text className='room-card__time'>
                      {formatTime(room.lastMessage.createdAt)}
                    </Text>
                  )}
                </View>
                <View className='room-card__footer'>
                  <Text className='room-card__preview'>
                    {room.lastMessage?.content ?? '暂无消息'}
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
