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

const AI_RESPONSES: Record<string, string> = {
  '佛教': '佛教起源于公元前6世纪的古印度，由释迦牟尼佛创立。重要圣地包括菩提伽耶（佛陀成道处）、鹿野苑（初转法轮处）、拘尸那罗（涅槃处）等。佛教的核心教义是四圣谛与八正道，引导众生离苦得乐。',
  '道教': '道教是中国本土宗教，以老子《道德经》为根本经典。道教祖庭包括龙虎山（天师道祖庭）、武当山（真武道场）、青城山（道教发源地）等。修行强调"道法自然"，追求与天地合一的境界。',
  '圣地': '全球祖庭旅行平台收录了60处圣地，覆盖十二大信仰。每个圣地都有详细的GPS坐标、历史介绍和朝圣指南。您可以在"圣地"页面浏览全部圣地，也可以通过"圣地地图"查看它们的地理分布。',
  '行程': '规划朝圣行程，建议您：1) 先在平台上浏览感兴趣的圣地；2) 在"我的行程"中创建新行程；3) 添加想要朝圣的圣地；4) 查看最佳出行时间和注意事项。我们支持多圣地串联行程规划。',
  '三十印': '曹溪愿命三十印是修行体系的核心，分为五系：初印系（第1-6印）、中印系（第7-12印）、印果印（第13-18印）、成道印（第19-24印）、归源印（第25-30印）。每一印都包含偈语、含义和修行法门，引导修行者逐步深入。',
  '信仰': '平台涵盖十二大信仰：佛教、道教、基督教、伊斯兰教、印度教、犹太教、儒教、锡克教、神道教、藏传佛教、原住民灵性、巴哈伊教。每个信仰都有详细介绍、圣地、祖庭、祖师和祖训资料。',
  '修行': '修行是一个循序渐进的过程。建议从了解各信仰的核心教义开始，选择与自己内心共鸣的修行方式。平台提供"曹溪三十印"修行体系，以及各信仰的祖训智慧，帮助您在日常生活中实践修行。',
}

function getLocalResponse(input: string): string {
  const lower = input.toLowerCase()
  for (const [keyword, response] of Object.entries(AI_RESPONSES)) {
    if (lower.includes(keyword.toLowerCase()) || lower.includes(keyword)) {
      return response
    }
  }
  return '感谢您的提问。小鸿正在学习更多知识来回答您的问题。目前我可以为您介绍十二大信仰、全球圣地、曹溪三十印、朝圣行程规划等内容。请尝试问我相关的问题吧！'
}

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
    if (!token) return getLocalResponse(text)
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
        return res.data?.reply || res.data?.content || res.data?.message || getLocalResponse(text)
      }
      return getLocalResponse(text)
    } catch {
      return getLocalResponse(text)
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
