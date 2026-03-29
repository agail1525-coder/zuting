import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Religion, fetchReligions } from '../../lib/api'
import './index.scss'

const gradientColors: Record<string, string> = {
  buddhism: '#F59E0B',
  taoism: '#10B981',
  christianity: '#3B82F6',
  islam: '#059669',
  hinduism: '#F97316',
  judaism: '#6366F1',
  confucianism: '#EF4444',
  sikhism: '#F59E0B',
  shinto: '#EC4899',
  'tibetan-buddhism': '#8B5CF6',
  'indigenous-spirituality': '#14B8A6',
  bahai: '#06B6D4',
}

export default function ReligionsPage() {
  const [religions, setReligions] = useState<Religion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const list = await fetchReligions()
      setReligions(list)
    } catch (err) {
      console.error('Failed to load religions:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleTap = (slug: string) => {
    Taro.navigateTo({ url: `/pages/religion-detail/index?slug=${slug}` })
  }

  return (
    <View className='religions-page'>
      <View className='page-header'>
        <Text className='page-header__title'>十二大信仰</Text>
        <Text className='page-header__count'>{religions.length} 个信仰</Text>
      </View>

      <ScrollView className='religions-grid' scrollY>
        {loading ? (
          <Text className='loading-text'>正在加载...</Text>
        ) : religions.length === 0 ? (
          <Text className='empty-text'>暂无数据</Text>
        ) : (
          <View className='grid'>
            {religions.map(r => {
              const color = gradientColors[r.slug] || '#6366F1'
              return (
                <View
                  key={r.id}
                  className='religion-card'
                  hoverClass='religion-card--hover'
                  onClick={() => handleTap(r.slug)}
                >
                  <View className='religion-card__banner' style={{ backgroundColor: color }}>
                    <Text className='religion-card__emoji'>{r.emoji}</Text>
                  </View>
                  <View className='religion-card__body'>
                    <Text className='religion-card__name'>{r.name}</Text>
                    <Text className='religion-card__name-en'>{r.nameEn}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
