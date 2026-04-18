import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Textarea, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  fetchLifeQuestions,
  submitDialogue,
  type LifeQuestion,
  type LifePerspective,
} from '../../lib/api'
import './index.scss'

export default function CultureLifeDialoguePage() {
  const [questions, setQuestions] = useState<LifeQuestion[]>([])
  const [selected, setSelected] = useState<number>(0)
  const [situation, setSituation] = useState('')
  const [reply, setReply] = useState('')
  const [cited, setCited] = useState<LifePerspective[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchLifeQuestions()
      .then((r) => setQuestions(r?.items ?? []))
      .catch(() => setQuestions([]))
  }, [])

  const options = ['不限命题', ...questions.map((q) => q.title)]
  const code = selected === 0 ? '' : questions[selected - 1]?.code ?? ''

  const handleSubmit = async () => {
    if (!situation.trim()) {
      Taro.showToast({ title: '请先描述你的处境', icon: 'none' })
      return
    }
    setLoading(true)
    setReply('')
    setCited([])
    try {
      const res = await submitDialogue(situation.trim(), code || undefined)
      setReply(res.reply ?? '')
      setCited(res.citedPerspectives ?? [])
    } catch {
      setReply('（对话服务暂不可用，请稍后再试）')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView scrollY className='cld-page'>
      <View className='cld-hero'>
        <Text className='cld-kicker'>AI · CULTURAL DIALOGUE</Text>
        <Text className='cld-title'>与文化对话</Text>
        <Text className='cld-sub'>把你的困惑告诉我 · 12 文化传统同堂论道</Text>
      </View>

      <View className='cld-form'>
        <Text className='cld-label'>命题（可选）</Text>
        <Picker
          mode='selector'
          range={options}
          value={selected}
          onChange={(e) => setSelected(Number(e.detail.value))}
        >
          <View className='cld-picker'>
            <Text className='cld-picker-text'>{options[selected]}</Text>
            <Text className='cld-picker-arrow'>▾</Text>
          </View>
        </Picker>

        <Text className='cld-label'>你的处境</Text>
        <Textarea
          className='cld-textarea'
          value={situation}
          onInput={(e) => setSituation(e.detail.value)}
          placeholder='如：我正陷入事业瓶颈，不知道该坚持还是转换方向……'
          maxlength={500}
          autoHeight
        />

        <View className='cld-cta' onClick={handleSubmit}>
          <Text className='cld-cta-text'>{loading ? '请稍候…' : '开启对话'}</Text>
        </View>
      </View>

      {reply && (
        <View className='cld-reply'>
          <Text className='cld-reply-title'>AI 融合回应</Text>
          <Text className='cld-reply-text'>{reply}</Text>
        </View>
      )}

      {cited.length > 0 && (
        <View className='cld-cited'>
          <Text className='cld-reply-title'>引用视角</Text>
          {cited.map((p) => {
            const color = p.religion?.color || '#3264ff'
            return (
              <View key={p.id} className='cld-c-item' style={{ borderLeftColor: color }}>
                <Text className='cld-c-name' style={{ color }}>
                  {p.religion?.symbol ?? '✨'} {p.religion?.name ?? '—'}
                </Text>
                <Text className='cld-c-core'>{p.corePosition}</Text>
                {p.practiceGuide && (
                  <Text className='cld-c-guide'>↳ {p.practiceGuide}</Text>
                )}
              </View>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}
