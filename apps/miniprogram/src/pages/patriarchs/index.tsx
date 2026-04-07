import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Religion, Patriarch, fetchReligions, fetchPatriarchs } from '../../lib/api'
import FilterTags from '../../components/FilterTags'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function PatriarchsPage() {
  const { t } = useTranslation()
  const [religions, setReligions] = useState<Religion[]>([])
  const [patriarchs, setPatriarchs] = useState<Patriarch[]>([])
  const [activeReligionId, setActiveReligionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadReligions()
  }, [])

  useEffect(() => {
    loadPatriarchs()
  }, [activeReligionId])

  const loadReligions = async () => {
    try {
      const list = await fetchReligions()
      setReligions(list)
    } catch (err) {
      console.error('Failed to load religions:', err)
    }
  }

  const loadPatriarchs = async () => {
    try {
      setLoading(true)
      setError(false)
      const list = await fetchPatriarchs(activeReligionId || undefined)
      setPatriarchs(list)
    } catch (err) {
      console.error('Failed to load patriarchs:', err)
      setError(true)
      Taro.showToast({ title: t('patriarchs.loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleTapPatriarch = (id: string) => {
    Taro.navigateTo({ url: `/pages/patriarch-detail/index?id=${id}` })
  }

  return (
    <View className='patriarchs-page'>
      <View className='page-header'>
        <Text className='page-header__title'>{t('patriarchs.title')}</Text>
        <Text className='page-header__count'>{t('patriarchs.count', { count: patriarchs.length })}</Text>
      </View>

      <FilterTags
        religions={religions}
        activeId={activeReligionId}
        onSelect={setActiveReligionId}
      />

      <ScrollView className='patriarchs-list' scrollY>
        {loading ? (
          <Text className='loading-text'>{t('common.loading')}</Text>
        ) : error ? (
          <View className='empty-text'>
            <Text>{t('patriarchs.loadFailed')}</Text>
            <Text className='retry-btn' onClick={loadPatriarchs}>{t('common.retry')}</Text>
          </View>
        ) : patriarchs.length === 0 ? (
          <Text className='empty-text'>{t('patriarchs.noData')}</Text>
        ) : (
          patriarchs.map(patriarch => (
            <View
              key={patriarch.id}
              className='patriarch-card'
              hoverClass='patriarch-card--hover'
              onClick={() => handleTapPatriarch(patriarch.id)}
            >
              <View className='patriarch-card__header'>
                <View className='patriarch-card__title-row'>
                  <Text className='patriarch-card__name'>{patriarch.name}</Text>
                  {patriarch.religion && (
                    <Text className='patriarch-card__badge'>{patriarch.religion.emoji} {patriarch.religion.name}</Text>
                  )}
                </View>
                <Text className='patriarch-card__name-en'>{patriarch.nameEn}</Text>
              </View>
              {patriarch.title && (
                <Text className='patriarch-card__title-text'>{patriarch.title}</Text>
              )}
              {patriarch.dates && (
                <View className='patriarch-card__era'>
                  <Text className='patriarch-card__era-label'>{t('patriarchs.era')}: </Text>
                  <Text className='patriarch-card__era-value'>{patriarch.dates}</Text>
                </View>
              )}
              {patriarch.biography && (
                <Text className='patriarch-card__bio'>
                  {patriarch.biography.slice(0, 100)}{patriarch.biography.length > 100 ? '...' : ''}
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
