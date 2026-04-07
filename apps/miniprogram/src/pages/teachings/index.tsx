import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Religion, Teaching, fetchReligions, fetchTeachings } from '../../lib/api'
import FilterTags from '../../components/FilterTags'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function TeachingsPage() {
  const { t } = useTranslation()
  const [religions, setReligions] = useState<Religion[]>([])
  const [teachings, setTeachings] = useState<Teaching[]>([])
  const [activeReligionId, setActiveReligionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadReligions()
  }, [])

  useEffect(() => {
    loadTeachings()
  }, [activeReligionId])

  const loadReligions = async () => {
    try {
      const list = await fetchReligions()
      setReligions(list)
    } catch (err) {
      console.error('Failed to load religions:', err)
    }
  }

  const loadTeachings = async () => {
    try {
      setLoading(true)
      setError(false)
      const list = await fetchTeachings(activeReligionId || undefined)
      setTeachings(list)
    } catch (err) {
      console.error('Failed to load teachings:', err)
      setError(true)
      Taro.showToast({ title: t('teachings.loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='teachings-page'>
      <View className='page-header'>
        <Text className='page-header__title'>{t('teachings.title')}</Text>
        <Text className='page-header__count'>{t('teachings.count', { count: teachings.length })}</Text>
      </View>

      <FilterTags
        religions={religions}
        activeId={activeReligionId}
        onSelect={setActiveReligionId}
      />

      <ScrollView className='teachings-list' scrollY>
        {loading ? (
          <Text className='loading-text'>{t('common.loading')}</Text>
        ) : error ? (
          <View className='empty-text'>
            <Text>{t('teachings.loadFailed')}</Text>
            <Text className='retry-btn' onClick={loadTeachings}>{t('common.retry')}</Text>
          </View>
        ) : teachings.length === 0 ? (
          <Text className='empty-text'>{t('teachings.noData')}</Text>
        ) : (
          teachings.map(teaching => (
            <View key={teaching.id} className='teaching-card' onClick={() => Taro.navigateTo({ url: `/pages/teaching-detail/index?id=${teaching.id}` })}>
              <View className='teaching-card__content-wrap'>
                <Text className='teaching-card__quote'>{'\u{201C}'}</Text>
                <Text className='teaching-card__content'>{teaching.originalText}</Text>
              </View>
              <View className='teaching-card__footer'>
                <Text className='teaching-card__source'>{teaching.sourceText}</Text>
                {teaching.religion && (
                  <Text className='teaching-card__badge'>{teaching.religion.emoji} {teaching.religion.name}</Text>
                )}
              </View>
            </View>
          ))
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
