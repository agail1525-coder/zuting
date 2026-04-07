import { useState, useRef, useCallback } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { getAccessToken, isLoggedIn, API_URL } from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  typing?: boolean
}

let msgIdCounter = 0
function genId() {
  return `msg_${Date.now()}_${++msgIdCounter}`
}

export default function ChatPage() {
  const { t } = useTranslation()

  const SUGGESTIONS = [
    t('chat.suggestBuddhistSites'),
    t('chat.suggestPlanTrip'),
    t('chat.suggestThirtySeals'),
    t('chat.suggestTaoistTemples'),
    t('chat.suggestTwelveFaiths'),
    t('chat.suggestPracticeGuide'),
  ]

  const [authed, setAuthed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: genId(),
      role: 'bot',
      content: t('chat.welcomeMessage'),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [scrollId, setScrollId] = useState('')
  const [conversationId, setConversationId] = useState<string | undefined>()
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useDidShow(() => {
    setAuthed(isLoggedIn())
  })

  const scrollToBottom = useCallback((id: string) => {
    setTimeout(() => setScrollId(id), 100)
  }, [])

  const simulateTyping = useCallback((fullContent: string, msgId: string) => {
    let index = 0
    const step = () => {
      index += 2
      if (index >= fullContent.length) {
        setMessages(prev =>
          prev.map(m => m.id === msgId ? { ...m, content: fullContent, typing: false } : m)
        )
        scrollToBottom(msgId)
        return
      }
      setMessages(prev =>
        prev.map(m => m.id === msgId ? { ...m, content: fullContent.slice(0, index) } : m)
      )
      scrollToBottom(msgId)
      typingTimer.current = setTimeout(step, 30)
    }
    typingTimer.current = setTimeout(step, 300)
  }, [scrollToBottom])

  const fetchAIResponse = useCallback(async (text: string): Promise<string> => {
    const token = getAccessToken()
    if (!token) return t('chat.loginRequired')
    try {
      const res = await Taro.request({
        url: `${API_URL}/xiaohong/chat`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: { message: text, conversationId },
      })
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (res.data?.conversationId) {
          setConversationId(res.data.conversationId)
        }
        const reply = res.data?.content || res.data?.reply || res.data?.message
        if (reply) return reply
        return t('chat.cannotAnswer')
      }
      return t('chat.serviceUnavailable')
    } catch {
      return t('chat.networkError')
    }
  }, [])

  const handleSend = useCallback(async () => {
    const text = inputValue.trim()
    if (!text) return

    const userMsg: Message = { id: genId(), role: 'user', content: text }
    const botMsgId = genId()
    const botMsg: Message = { id: botMsgId, role: 'bot', content: '', typing: true }

    setMessages(prev => [...prev, userMsg, botMsg])
    setInputValue('')
    scrollToBottom(userMsg.id)

    const response = await fetchAIResponse(text)
    simulateTyping(response, botMsgId)
  }, [inputValue, scrollToBottom, simulateTyping, fetchAIResponse])

  const handleSuggestion = useCallback(async (text: string) => {
    setInputValue(text)
    const userMsg: Message = { id: genId(), role: 'user', content: text }
    const botMsgId = genId()
    const botMsg: Message = { id: botMsgId, role: 'bot', content: '', typing: true }

    setMessages(prev => [...prev, userMsg, botMsg])
    scrollToBottom(userMsg.id)

    const response = await fetchAIResponse(text)
    simulateTyping(response, botMsgId)
    setInputValue('')
  }, [scrollToBottom, simulateTyping, fetchAIResponse])

  // Auth gate
  if (!authed) {
    return (
      <View className='chat-page'>
        <View className='auth-gate'>
          <Text className='auth-gate__icon'>{'\u{1F3EF}'}</Text>
          <Text className='auth-gate__title'>{t('chat.aiAssistantTitle')}</Text>
          <Text className='auth-gate__desc'>{t('chat.loginFirst')}</Text>
          <View
            className='auth-gate__btn'
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <Text className='auth-gate__btn-text'>{t('chat.goLogin')}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='chat-page'>
      {/* Suggestions */}
      <ScrollView className='suggestions' scrollX>
        {SUGGESTIONS.map((s, i) => (
          <View key={i} className='suggestion-chip' onClick={() => handleSuggestion(s)}>
            <Text className='suggestion-chip__text'>{s}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Messages */}
      <ScrollView
        className='message-list'
        scrollY
        scrollIntoView={scrollId}
        scrollWithAnimation
      >
        {messages.map(msg => (
          <View key={msg.id} id={msg.id} className={`message message--${msg.role}`}>
            {msg.role === 'bot' && (
              <View className='message__avatar'>
                <Text className='message__avatar-text'>{'\u{1F426}'}</Text>
              </View>
            )}
            <View className={`message__bubble message__bubble--${msg.role}`}>
              <Text className='message__text'>
                {msg.content}
                {msg.typing && <Text className='typing-cursor'>|</Text>}
              </Text>
            </View>
          </View>
        ))}
        <View style={{ height: '20rpx' }} />
      </ScrollView>

      {/* Input Bar */}
      <View className='input-bar'>
        <View className='input-bar__wrapper'>
          <Input
            className='input-bar__input'
            value={inputValue}
            placeholder={t('chat.inputPlaceholder')}
            placeholderClass='input-bar__placeholder'
            onInput={(e) => setInputValue(e.detail.value)}
            onConfirm={handleSend}
            confirmType='send'
          />
          <View className='input-bar__send' onClick={handleSend}>
            <Text className='input-bar__send-text'>{'\u{27A1}'}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '',
})
