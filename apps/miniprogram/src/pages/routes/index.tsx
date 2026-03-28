import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Route, PaginatedRoutes, fetchRoutes } from '../../lib/api'
import './index.scss'

const CATEGORIES = [
  { value: '', label: '全部' },
  { value: 'ZEN', label: '禅宗' },
  { value: 'BUDDHIST', label: '佛教' },
  { value: 'TAOIST', label: '道教' },
  { value: 'CHRISTIAN', label: '基督' },
  { value: 'ISLAMIC', label: '伊斯兰' },
  { value: 'CROSS_CULTURAL', label: '跨文化' },
  { value: 'HINDU', label: '印度教' },
]

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: '轻松',
  MODERATE: '适中',
  CHALLENGING: '挑战',
}

export default function RoutesPage() {
  const router = useRouter()
  const initialCategory = (router.params.category as string) || ''
  const [routes, setRoutes] = useState<Route[]>([])
  const [total, setTotal] = useState(0)
  const [category, setCategory] = useState(initialCategory)
  const [loading, setLoading] = useState(true)

  const loadRoutes = async (cat?: string) => {
    try {
      setLoading(true)
      const c = cat ?? category
      const data = await fetchRoutes({
        category: c || undefined,
        pageSize: '20',
      })
      setRoutes(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error('Failed to load routes:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoutes()
  }, [])

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    loadRoutes(cat)
  }

  return (
    <ScrollView className='routes-page' scrollY>
      {/* Category Filter */}
      <ScrollView className='filter-bar' scrollX>
        {CATEGORIES.map(c => (
          <Text
            key={c.value}
            className={`filter-chip ${category === c.value ? 'filter-chip--active' : ''}`}
            onClick={() => handleCategoryChange(c.value)}
          >
            {c.label}
          </Text>
        ))}
      </ScrollView>

      {/* Route List */}
      {loading ? (
        <View className='loading'>
          <Text className='loading__text'>加载中...</Text>
        </View>
      ) : routes.length === 0 ? (
        <View className='empty'>
          <Text className='empty__text'>暂无路线</Text>
          <Text
            className='empty__reset'
            onClick={() => handleCategoryChange('')}
          >
            清除筛选
          </Text>
        </View>
      ) : (
        <View className='route-list'>
          {routes.map(route => {
            const price = (route.priceFrom / 100).toLocaleString()
            return (
              <View
                key={route.id}
                className='route-item'
                hoverClass='route-item--hover'
                onClick={() => Taro.navigateTo({ url: `/pages/route-detail/index?slug=${route.slug}` })}
              >
                <View className='route-item__image'>
                  <Text className='route-item__emoji'>
                    {route.category === 'ZEN' ? '\u{1F3EF}' : route.category === 'BUDDHIST' ? '\u2638' : route.category === 'TAOIST' ? '\u262F' : route.category === 'CHRISTIAN' ? '\u26EA' : route.category === 'ISLAMIC' ? '\u{1F54C}' : '\u{1F30F}'}
                  </Text>
                </View>
                <View className='route-item__body'>
                  <View className='route-item__tags'>
                    <Text className='route-item__tag'>{route.duration}天{route.nights}晚</Text>
                    <Text className='route-item__tag'>{DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}</Text>
                  </View>
                  <Text className='route-item__title'>{route.title}</Text>
                  <Text className='route-item__subtitle'>{route.subtitle}</Text>
                  <View className='route-item__footer'>
                    <Text className='route-item__price'>¥{price}<Text className='route-item__price-unit'>/人</Text></Text>
                    {route.rating && (
                      <Text className='route-item__rating'>★ {route.rating.toFixed(1)}</Text>
                    )}
                  </View>
                </View>
              </View>
            )
          })}
          <Text className='route-total'>共 {total} 条路线</Text>
        </View>
      )}
    </ScrollView>
  )
}
