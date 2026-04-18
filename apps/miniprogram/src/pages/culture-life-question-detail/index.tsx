import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchQuestionMatrix, type LifeQuestion, type LifePerspective } from '../../lib/api'
import './index.scss'

export default function CultureLifeQuestionDetailPage() {
  const [data, setData] = useState<(LifeQuestion & { perspectives: LifePerspective[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { code } = Taro.getCurrentInstance().router?.params ?? {}
    if (!code) return
    fetchQuestionMatrix(code)
      .then(setData)
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <View className='clq-loading'><Text>加载中…</Text></View>
  if (!data) return <View className='clq-loading'><Text>命题不存在</Text></View>

  return (
    <ScrollView scrollY className='clq-page'>
      <View className='clq-hero'>
        <Text className='clq-kicker'>CULTURE · LIFE QUESTION</Text>
        <Text className='clq-title'>{data.title}</Text>
        <Text className='clq-question'>"{data.question}"</Text>
        {data.philosophicalDepth && (
          <Text className='clq-depth'>{data.philosophicalDepth}</Text>
        )}
      </View>

      <View className='clq-section'>
        <Text className='clq-section-title'>12 文化传统视角</Text>
        {data.perspectives.map((p) => {
          const color = p.religion?.color || '#3264ff'
          return (
            <View key={p.id} className='clq-perspective' style={{ borderLeftColor: color }}>
              <View className='clq-p-head'>
                <Text className='clq-p-symbol'>{p.religion?.symbol ?? '✨'}</Text>
                <Text className='clq-p-name' style={{ color }}>{p.religion?.name ?? '—'}</Text>
              </View>
              <Text className='clq-p-core'>{p.corePosition}</Text>
              <Text className='clq-p-elab'>{p.elaboration}</Text>
              {p.practiceGuide && (
                <Text className='clq-p-guide'>💡 {p.practiceGuide}</Text>
              )}
              {p.aiReflection && (
                <Text className='clq-p-ai'>🤖 {p.aiReflection}</Text>
              )}
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}
