import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { Journal, fetchJournalById } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const MOOD_EMOJI: Record<string, string> = {
  '\u611F\u609F': '\u{1F54A}',
  '\u559C\u60A6': '\u{1F60A}',
  '\u5E73\u9759': '\u{1F54A}',
  '\u9707\u64BC': '\u26F0',
  '\u611F\u6069': '\u{1F64F}',
  '\u5B81\u9759': '\u{1F343}',
}

const MOOD_KEYS: Record<string, string> = {
  '\u611F\u609F': 'journals.moodInsight',
  '\u559C\u60A6': 'journals.moodJoy',
  '\u5E73\u9759': 'journals.moodPeace',
  '\u9707\u64BC': 'journals.moodAwe',
  '\u611F\u6069': 'journals.moodGratitude',
  '\u5B81\u9759': 'journals.moodSerenity',
}

export default function JournalDetailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.params
  const [journal, setJournal] = useState<Journal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) loadJournal()
  }, [id])

  const loadJournal = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchJournalById(id!)
      setJournal(data)
    } catch (err) {
      console.error('Failed to load journal:', err)
      setError(t('journalDetail.networkError'))
    } finally {
      setLoading(false)
    }
  }

  const getMoodLabel = (mood: string) => {
    const key = MOOD_KEYS[mood]
    return key ? t(key) : mood
  }

  if (loading) {
    return (
      <View className='container'>
        <Text className='loading-text'>{t('common.loading')}</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className='container'>
        <Text className='empty-text'>{error}</Text>
        <Text className='retry-btn' onClick={loadJournal}>{t('journalDetail.tapRetry')}</Text>
      </View>
    )
  }

  if (!journal) {
    return (
      <View className='container'>
        <Text className='empty-text'>{t('journalDetail.notFound')}</Text>
      </View>
    )
  }

  return (
    <ScrollView className='journal-detail' scrollY>
      <View className='journal-detail__header'>
        <Text className='journal-detail__title'>{journal.title}</Text>
        <View className='journal-detail__meta'>
          {journal.mood && (
            <Text className='journal-detail__mood'>
              {MOOD_EMOJI[journal.mood] ?? ''} {getMoodLabel(journal.mood)}
            </Text>
          )}
          <Text className='journal-detail__date'>
            {journal.createdAt.slice(0, 10)}
          </Text>
        </View>
      </View>

      {journal.trip && (
        <View className='info-card'>
          <Text className='info-card__icon'>{'\u{1F4CD}'}</Text>
          <View className='info-card__content'>
            <Text className='info-card__label'>{t('journalDetail.linkedTrip')}</Text>
            <Text className='info-card__value'>{journal.trip.title}</Text>
          </View>
        </View>
      )}

      <View className='content-card'>
        <Text className='content-card__text'>{journal.content}</Text>
      </View>

      {journal.user && (
        <View className='author-card'>
          <Text className='author-card__label'>{t('journalDetail.author')}</Text>
          <Text className='author-card__name'>{journal.user.nickname}</Text>
        </View>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
