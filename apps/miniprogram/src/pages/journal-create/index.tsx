import { useState } from 'react'
import { View, Text, Input, Textarea, Switch } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { createJournal } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const MOOD_KEYS: Record<string, string> = {
  '\u611F\u609F': 'journals.moodInsight',
  '\u559C\u60A6': 'journals.moodJoy',
  '\u5E73\u9759': 'journals.moodPeace',
  '\u9707\u64BC': 'journals.moodAwe',
  '\u611F\u6069': 'journals.moodGratitude',
  '\u5B81\u9759': 'journals.moodSerenity',
}

const MOODS = [
  { label: '\u611F\u609F', emoji: '\u{1F54A}' },
  { label: '\u559C\u60A6', emoji: '\u{1F60A}' },
  { label: '\u5E73\u9759', emoji: '\u{1F54A}' },
  { label: '\u9707\u64BC', emoji: '\u26F0' },
  { label: '\u611F\u6069', emoji: '\u{1F64F}' },
  { label: '\u5B81\u9759', emoji: '\u{1F343}' },
]

export default function JournalCreatePage() {
  const { t } = useTranslation()

  useDidShow(() => {
    if (!isLoggedIn()) {
      Taro.showToast({ title: t('journals.loginFirst'), icon: 'none' })
      Taro.redirectTo({ url: '/pages/profile/index' })
    }
  })

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = title.trim().length > 0 && content.trim().length > 0 && !submitting

  const getMoodLabel = (moodValue: string) => {
    const key = MOOD_KEYS[moodValue]
    return key ? t(key) : moodValue
  }

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
      Taro.showToast({ title: t('journalCreate.publishSuccess'), icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    } catch (err) {
      Taro.showToast({
        title: err instanceof Error ? err.message : t('journalCreate.publishFailed'),
        icon: 'none',
      })
      setSubmitting(false)
    }
  }

  return (
    <View className='create-page'>
      <View className='form'>
        <View className='form__group'>
          <Text className='form__label'>{t('journalCreate.labelTitle')}</Text>
          <Input
            className='form__input'
            placeholder={t('journalCreate.titlePlaceholder')}
            placeholderClass='form__placeholder'
            maxlength={100}
            value={title}
            onInput={e => setTitle(e.detail.value)}
          />
        </View>

        <View className='form__group'>
          <Text className='form__label'>{t('journalCreate.labelContent')}</Text>
          <Textarea
            className='form__textarea'
            placeholder={t('journalCreate.contentPlaceholder')}
            placeholderClass='form__placeholder'
            maxlength={5000}
            value={content}
            onInput={e => setContent(e.detail.value)}
          />
          <Text className='form__count'>{content.length}/5000</Text>
        </View>

        <View className='form__group'>
          <Text className='form__label'>{t('journalCreate.labelMood')}</Text>
          <View className='mood-grid'>
            {MOODS.map(m => (
              <View
                key={m.label}
                className={`mood-item ${mood === m.label ? 'mood-item--active' : ''}`}
                onClick={() => setMood(mood === m.label ? '' : m.label)}
              >
                <Text className='mood-item__emoji'>{m.emoji}</Text>
                <Text className='mood-item__label'>{getMoodLabel(m.label)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='form__group form__row'>
          <Text className='form__label'>{t('journalCreate.publicJournal')}</Text>
          <Switch
            checked={isPublic}
            onChange={e => setIsPublic(e.detail.value)}
            color='#3264ff'
          />
        </View>

        <View
          className={`submit-btn ${canSubmit ? '' : 'submit-btn--disabled'}`}
          onClick={handleSubmit}
        >
          <Text className='submit-btn__text'>
            {submitting ? t('journalCreate.publishing') : t('journalCreate.publish')}
          </Text>
        </View>
      </View>
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '\u5199\u65E5\u8BB0',
})
