import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Religion, Patriarch, fetchReligions, fetchPatriarchs } from '../../lib/api'
import FilterTags from '../../components/FilterTags'
import './index.scss'

export default function PatriarchsPage() {
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
      Taro.showToast({ title: '加载失败', icon: 'none' })
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
        <Text className='page-header__title'>历代祖师</Text>
        <Text className='page-header__count'>{patriarchs.length} 位祖师</Text>
      </View>

      <FilterTags
        religions={religions}
        activeId={activeReligionId}
        onSelect={setActiveReligionId}
      />

      <ScrollView className='patriarchs-list' scrollY>
        {loading ? (
          <Text className='loading-text'>正在加载...</Text>
        ) : error ? (
          <View className='empty-text'>
            <Text>加载失败</Text>
            <Text className='retry-btn' onClick={loadPatriarchs}>重试</Text>
          </View>
        ) : patriarchs.length === 0 ? (
          <Text className='empty-text'>暂无祖师数据</Text>
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
              {patriarch.era && (
                <View className='patriarch-card__era'>
                  <Text className='patriarch-card__era-label'>年代: </Text>
                  <Text className='patriarch-card__era-value'>{patriarch.era}</Text>
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
