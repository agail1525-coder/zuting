import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Religion, Temple, fetchReligions, fetchTemples } from '../../lib/api'
import FilterTags from '../../components/FilterTags'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function TemplesPage() {
  const { t } = useTranslation()
  const [religions, setReligions] = useState<Religion[]>([])
  const [temples, setTemples] = useState<Temple[]>([])
  const [activeReligionId, setActiveReligionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadReligions()
  }, [])

  useEffect(() => {
    loadTemples()
  }, [activeReligionId])

  const loadReligions = async () => {
    try {
      const list = await fetchReligions()
      setReligions(list)
    } catch (err) {
      console.error('Failed to load religions:', err)
    }
  }

  const loadTemples = async () => {
    try {
      setLoading(true)
      setError(false)
      const list = await fetchTemples(activeReligionId || undefined)
      setTemples(list)
    } catch (err) {
      console.error('Failed to load temples:', err)
      setError(true)
      Taro.showToast({ title: t('temples.loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleTapTemple = (id: string) => {
    Taro.navigateTo({ url: `/pages/temple-detail/index?id=${id}` })
  }

  return (
    <View className='temples-page'>
      <View className='page-header'>
        <Text className='page-header__title'>{t('temples.title')}</Text>
        <Text className='page-header__count'>{t('temples.count', { count: temples.length })}</Text>
      </View>

      <FilterTags
        religions={religions}
        activeId={activeReligionId}
        onSelect={setActiveReligionId}
      />

      <ScrollView className='temples-list' scrollY>
        {loading ? (
          <Text className='loading-text'>{t('common.loading')}</Text>
        ) : error ? (
          <View className='empty-text'>
            <Text>{t('temples.loadFailed')}</Text>
            <Text className='retry-btn' onClick={loadTemples}>{t('common.retry')}</Text>
          </View>
        ) : temples.length === 0 ? (
          <Text className='empty-text'>{t('temples.noData')}</Text>
        ) : (
          temples.map(temple => (
            <View
              key={temple.id}
              className='temple-card'
              hoverClass='temple-card--hover'
              onClick={() => handleTapTemple(temple.id)}
            >
              <View className='temple-card__header'>
                <View className='temple-card__title-row'>
                  <Text className='temple-card__name'>{temple.name}</Text>
                  {temple.religion && (
                    <Text className='temple-card__badge'>{temple.religion.emoji} {temple.religion.name}</Text>
                  )}
                </View>
                <Text className='temple-card__name-en'>{temple.nameEn}</Text>
              </View>
              <View className='temple-card__location'>
                <Text className='temple-card__location-icon'>{'\u{1F3DB}'}</Text>
                <Text className='temple-card__location-text'>{temple.city}, {temple.country}</Text>
              </View>
              {temple.foundingDate && (
                <View className='temple-card__founded'>
                  <Text className='temple-card__founded-label'>{t('temples.founded')}: </Text>
                  <Text className='temple-card__founded-value'>{temple.foundingDate}</Text>
                </View>
              )}
              {temple.description && (
                <Text className='temple-card__desc'>
                  {temple.description.slice(0, 80)}{temple.description.length > 80 ? '...' : ''}
                </Text>
              )}
            </View>
          ))
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
