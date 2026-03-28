import { useState } from 'react'
import { View, Text, Input, Textarea, Switch } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { createJournal } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import './index.scss'

const MOODS = [
  { label: '感悟', emoji: '\u{1F54A}' },
  { label: '喜悦', emoji: '\u{1F60A}' },
  { label: '平静', emoji: '\u{1F54A}' },
  { label: '震撼', emoji: '\u26F0' },
  { label: '感恩', emoji: '\u{1F64F}' },
  { label: '宁静', emoji: '\u{1F343}' },
]

export default function JournalCreatePage() {
  useDidShow(() => {
    if (!isLoggedIn()) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      Taro.redirectTo({ url: '/pages/profile/index' })
    }
  })

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    try {
      await createJournal({
        title: title.trim(),
        content: content.trim(),
        mood: mood || undefined,
        isPublic,
      })
      Taro.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : '发布失败',
        icon: 'none',
      })
      setSubmitting(false)
    }
  }

  return (
    <View className='create-page'>
      <View className='form'>
        <View className='form__group'>
          <Text className='form__label'>标题</Text>
          <Input
            className='form__input'
            placeholder='给日记起个标题...'
            placeholderClass='form__placeholder'
            maxlength={100}
            value={title}
            onInput={e => setTitle(e.detail.value)}
          />
        </View>

        <View className='form__group'>
          <Text className='form__label'>内容</Text>
          <Textarea
            className='form__textarea'
            placeholder='记录你的朝圣感悟...'
            placeholderClass='form__placeholder'
            maxlength={5000}
            value={content}
            onInput={e => setContent(e.detail.value)}
          />
          <Text className='form__count'>{content.length}/5000</Text>
        </View>

        <View className='form__group'>
          <Text className='form__label'>心情</Text>
          <View className='mood-grid'>
            {MOODS.map(m => (
              <View
                key={m.label}
                className={`mood-item ${mood === m.label ? 'mood-item--active' : ''}`}
                onClick={() => setMood(mood === m.label ? '' : m.label)}
              >
                <Text className='mood-item__emoji'>{m.emoji}</Text>
                <Text className='mood-item__label'>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='form__group form__row'>
          <Text className='form__label'>公开日记</Text>
          <Switch
            checked={isPublic}
            onChange={e => setIsPublic(e.detail.value)}
            color='#D4A855'
          />
        </View>

        <View
          className={`submit-btn ${canSubmit ? '' : 'submit-btn--disabled'}`}
          onClick={handleSubmit}
        >
          <Text className='submit-btn__text'>
            {submitting ? '发布中...' : '发布日记'}
          </Text>
        </View>
      </View>
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '写日记',
})
