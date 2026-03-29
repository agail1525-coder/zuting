import { useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { ChatMessageItem, fetchChatMessages, sendChatMessage, markChatRead } from '../../lib/api'
import { getAccessToken, getCachedUser } from '../../lib/auth'
import './index.scss'

const POLL_INTERVAL = 5000

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function ChatRoomPage() {
  const router = useRouter()
  const roomId = router.params.id ?? ''
  const cachedUser = getCachedUser()
  const currentUserId = cachedUser?.id ?? ''

  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollIntoView = useRef('msg-bottom')

  const loadMessages = async () => {
    if (!roomId) return
    try {
      const res = await fetchChatMessages(roomId)
      setMessages(res.items.slice().reverse())
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
    if (roomId) {
      markChatRead(roomId).catch(() => {})
    }
  }, [roomId])

  // Polling
  useEffect(() => {
    const timer = setInterval(loadMessages, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [roomId])

  const handleSend = async () => {
    const text = inputText.trim()
    if (!text || !roomId || sending) return
    setSending(true)
    setInputText('')
    try {
      const newMsg = await sendChatMessage(roomId, text)
      setMessages(prev => [...prev, newMsg])
      scrollIntoView.current = `msg-${newMsg.id}`
    } catch (err) {
      console.error('Failed to send message:', err)
      setInputText(text)
      Taro.showToast({ title: '发送失败', icon: 'none' })
    } finally {
      setSending(false)
    }
  }

  if (!getAccessToken()) {
    return (
      <View className='chat-page'>
        <View className='empty-state'>
          <Text className='empty-state__text'>请先登录</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='chat-page'>
      <ScrollView
        className='chat-page__messages'
        scrollY
        scrollIntoView={scrollIntoView.current}
        scrollWithAnimation
      >
        {loading ? (
          <View className='empty-state'>
            <Text className='empty-state__text'>加载中...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-state__text'>暂无消息，发送第一条吧</Text>
          </View>
        ) : (
          messages.map(msg => {
            const isOwn = msg.senderId === currentUserId
            return (
              <View
                key={msg.id}
                id={`msg-${msg.id}`}
                className={`msg-row ${isOwn ? 'msg-row--own' : 'msg-row--other'}`}
              >
                {!isOwn && (
                  <View className='msg-avatar'>
                    <Text className='msg-avatar__text'>👤</Text>
                  </View>
                )}
                <View className={`msg-bubble ${isOwn ? 'msg-bubble--own' : 'msg-bubble--other'}`}>
                  {msg.isDeleted ? (
                    <Text className='msg-bubble__deleted'>消息已撤回</Text>
                  ) : (
                    <Text className={`msg-bubble__text ${isOwn ? 'msg-bubble__text--own' : ''}`}>
                      {msg.content}
                    </Text>
                  )}
                  <Text className={`msg-bubble__time ${isOwn ? 'msg-bubble__time--own' : ''}`}>
                    {formatTime(msg.createdAt)}
                  </Text>
                </View>
              </View>
            )
          })
        )}
        <View id='msg-bottom' style={{ height: '1px' }} />
      </ScrollView>

      <View className='chat-page__input-bar'>
        <Input
          className='chat-page__input'
          placeholder='输入消息...'
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          confirmType='send'
          onConfirm={handleSend}
          maxlength={500}
        />
        <View
          className={`chat-page__send-btn ${(!inputText.trim() || sending) ? 'chat-page__send-btn--disabled' : ''}`}
          onClick={handleSend}
        >
          <Text className='chat-page__send-btn-text'>发送</Text>
        </View>
      </View>
    </View>
  )
}
