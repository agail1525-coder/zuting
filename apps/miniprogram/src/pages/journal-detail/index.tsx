import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { Journal, fetchJournalById } from '../../lib/api'
import './index.scss'

const MOOD_EMOJI: Record<string, string> = {
  '感悟': '🕊',
  '喜悦': '😊',
  '平静': '🕊',
  '震撼': '⛰',
  '感恩': '🙏',
  '宁静': '🍃',
}

export default function JournalDetailPage() {
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
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className='container'>
        <Text className='loading-text'>正在加载...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className='container'>
        <Text className='empty-text'>{error}</Text>
        <Text className='retry-btn' onClick={loadJournal}>点击重试</Text>
      </View>
    )
  }

  if (!journal) {
    return (
      <View className='container'>
        <Text className='empty-text'>日记不存在</Text>
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
              {MOOD_EMOJI[journal.mood] ?? ''} {journal.mood}
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
            <Text className='info-card__label'>关联行程</Text>
            <Text className='info-card__value'>{journal.trip.title}</Text>
          </View>
        </View>
      )}

      <View className='content-card'>
        <Text className='content-card__text'>{journal.content}</Text>
      </View>

      {journal.user && (
        <View className='author-card'>
          <Text className='author-card__label'>作者</Text>
          <Text className='author-card__name'>{journal.user.nickname}</Text>
        </View>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
