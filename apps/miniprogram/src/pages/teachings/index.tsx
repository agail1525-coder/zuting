import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Religion, Teaching, fetchReligions, fetchTeachings } from '../../lib/api'
import FilterTags from '../../components/FilterTags'
import './index.scss'

export default function TeachingsPage() {
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
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='teachings-page'>
      <View className='page-header'>
        <Text className='page-header__title'>祖训宝典</Text>
        <Text className='page-header__count'>{teachings.length} 条祖训</Text>
      </View>

      <FilterTags
        religions={religions}
        activeId={activeReligionId}
        onSelect={setActiveReligionId}
      />

      <ScrollView className='teachings-list' scrollY>
        {loading ? (
          <Text className='loading-text'>正在加载...</Text>
        ) : error ? (
          <View className='empty-text'>
            <Text>加载失败</Text>
            <Text className='retry-btn' onClick={loadTeachings}>重试</Text>
          </View>
        ) : teachings.length === 0 ? (
          <Text className='empty-text'>暂无祖训数据</Text>
        ) : (
          teachings.map(teaching => (
            <View key={teaching.id} className='teaching-card' onClick={() => Taro.navigateTo({ url: `/pages/teaching-detail/index?id=${teaching.id}` })}>
              <View className='teaching-card__content-wrap'>
                <Text className='teaching-card__quote'>{'\u{201C}'}</Text>
                <Text className='teaching-card__content'>{teaching.content}</Text>
              </View>
              <View className='teaching-card__footer'>
                <Text className='teaching-card__source'>{teaching.source}</Text>
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
