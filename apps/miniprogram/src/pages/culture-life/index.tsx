import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchLifeQuestions, type LifeQuestion } from '../../lib/api'
import './index.scss'

export default function CultureLifePage() {
  const [items, setItems] = useState<LifeQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLifeQuestions()
      .then((r) => setItems(r?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ScrollView scrollY className='cl-page'>
      <View className='cl-hero'>
        <Text className='cl-hero-kicker'>M40 · CULTURE & LIFE</Text>
        <Text className='cl-hero-title'>文化与生命</Text>
        <Text className='cl-hero-sub'>12 大生命命题 × 12 文化传统 × 7 阶段哲学</Text>

        <View className='cl-quick'>
          <View className='cl-chip' onClick={() => Taro.navigateTo({ url: '/pages/culture-life-stages/index' })}>
            <Text className='cl-chip-text'>🌱 七阶段人生</Text>
          </View>
          <View className='cl-chip' onClick={() => Taro.navigateTo({ url: '/pages/culture-life-dialogue/index' })}>
            <Text className='cl-chip-text'>🤖 AI 圆桌对话</Text>
          </View>
        </View>
      </View>

      <View className='cl-section'>
        <Text className='cl-section-title'>12 大命题</Text>
        {loading ? (
          <View className='cl-loading'>
            <Text>加载中…</Text>
          </View>
        ) : items.length === 0 ? (
          <View className='cl-empty'>
            <Text>暂无命题</Text>
          </View>
        ) : (
          items.map((q) => (
            <View
              key={q.id}
              className='cl-question-card'
              onClick={() =>
                Taro.navigateTo({ url: `/pages/culture-life-question-detail/index?code=${q.code}` })
              }
            >
              <View className='cl-q-head'>
                <Text className='cl-q-title'>{q.title}</Text>
              </View>
              <Text className='cl-q-question'>“{q.question}”</Text>
              {q.philosophicalDepth && (
                <Text className='cl-q-depth'>{q.philosophicalDepth}</Text>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}
