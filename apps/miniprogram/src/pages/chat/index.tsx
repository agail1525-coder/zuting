import { useState, useRef, useCallback, useEffect } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getAccessToken, isLoggedIn, API_URL } from '../../lib/auth'
import './index.scss'

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  typing?: boolean
}

const SUGGESTIONS = [
  '推荐佛教圣地',
  '如何规划朝圣行程？',
  '曹溪三十印是什么？',
  '介绍道教祖庭',
  '世界十二大信仰',
  '修行入门指南',
]

let msgIdCounter = 0
function genId() {
  return `msg_${Date.now()}_${++msgIdCounter}`
}

export default function ChatPage() {
  const [authed, setAuthed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: genId(),
      role: 'bot',
      content: '您好！我是小鸿，您的智慧助手。我可以帮您了解全球圣地、朝圣行程规划、修行指南等。请问有什么可以帮您的？',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [scrollId, setScrollId] = useState('')
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setAuthed(isLoggedIn())
  }, [])

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
    if (!token) return '请先登录后使用AI助手功能'
    try {
      const res = await Taro.request({
        url: `${API_URL}/xiaohong/chat`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: { message: text },
      })
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const reply = res.data?.reply || res.data?.content || res.data?.message
        if (reply) return reply
        return '抱歉，小鸿暂时无法回答这个问题，请稍后重试'
      }
      return '服务暂时不可用，请稍后重试'
    } catch {
      return '网络异常，请稍后重试'
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
          <Text className='auth-gate__title'>小鸿 AI 助手</Text>
          <Text className='auth-gate__desc'>请先登录后再与小鸿对话</Text>
          <View
            className='auth-gate__btn'
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <Text className='auth-gate__btn-text'>去登录</Text>
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
            placeholder='向小鸿提问...'
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
  navigationBarTitleText: '小鸿AI助手',
})
