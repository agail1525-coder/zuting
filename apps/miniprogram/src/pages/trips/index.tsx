import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { fetchTrips, Trip } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import './index.scss'

type StatusFilter = '全部' | 'DRAFT' | 'PLANNING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: '草稿',
  PLANNING: '规划中',
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
  PAID: '已付款',
  PREPARING: '准备中',
  IN_PROGRESS: '朝圣中',
  COMPLETED: '已完成',
  REVIEWING: '评价中',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#94a3b8',
  PLANNING: '#60a5fa',
  SUBMITTED: '#a78bfa',
  CONFIRMED: '#D4A855',
  PAID: '#D4A855',
  PREPARING: '#fbbf24',
  IN_PROGRESS: '#34d399',
  COMPLETED: '#94a3b8',
  REVIEWING: '#f97316',
  CANCELLED: '#ef4444',
  REFUNDING: '#f97316',
  REFUNDED: '#94a3b8',
}

const FILTER_LIST: { key: StatusFilter; label: string }[] = [
  { key: '全部', label: '全部' },
  { key: 'PLANNING', label: '规划中' },
  { key: 'CONFIRMED', label: '已确认' },
  { key: 'IN_PROGRESS', label: '朝圣中' },
  { key: 'COMPLETED', label: '已完成' },
]

export default function TripsPage() {
  const [authed, setAuthed] = useState(false)
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('全部')
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useDidShow(() => {
    setAuthed(isLoggedIn())
  })

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    setError(null)
    const statusParam = activeStatus === '全部' ? undefined : activeStatus
    fetchTrips(statusParam)
      .then(res => {
        setTrips(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      })
  }, [activeStatus, authed])

  const handleTripTap = (tripId: string) => {
    Taro.navigateTo({ url: `/pages/trip-detail/index?id=${tripId}` })
  }

  if (!authed) {
    return (
      <View className='trips-page'>
        <View className='auth-gate'>
          <Text className='auth-gate__icon'>{'\u{1F9ED}'}</Text>
          <Text className='auth-gate__title'>我的行程</Text>
          <Text className='auth-gate__desc'>请先登录后查看您的行程</Text>
          <View
            className='auth-gate__btn'
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <Text className='auth-gate__btn-text'>去登录</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className='trips-page'>
      {/* Status Filter */}
      <ScrollView className='status-tabs' scrollX>
        {FILTER_LIST.map(({ key, label }) => (
          <View
            key={key}
            className={`status-tab ${activeStatus === key ? 'status-tab--active' : ''}`}
            onClick={() => setActiveStatus(key)}
          >
            <Text className='status-tab__text'>{label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Trip List */}
      <ScrollView className='trip-list' scrollY>
        {loading ? (
          <View className='empty'>
            <Text className='empty__text'>加载中...</Text>
          </View>
        ) : error ? (
          <View className='empty'>
            <Text className='empty__icon'>{'\u274C'}</Text>
            <Text className='empty__text'>加载失败: {error}</Text>
          </View>
        ) : trips.length === 0 ? (
          <View className='empty'>
            <Text className='empty__icon'>{'\u{1F9ED}'}</Text>
            <Text className='empty__text'>暂无相关行程</Text>
          </View>
        ) : (
          trips.map(trip => (
            <View
              key={trip.id}
              className='trip-card'
              hoverClass='trip-card--hover'
              onClick={() => handleTripTap(trip.id)}
            >
              <View className='trip-card__header'>
                <Text className='trip-card__title'>{trip.title}</Text>
                <View
                  className='trip-card__tag'
                  style={{
                    backgroundColor: `${STATUS_COLORS[trip.status] ?? '#94a3b8'}20`,
                    borderColor: `${STATUS_COLORS[trip.status] ?? '#94a3b8'}40`,
                  }}
                >
                  <Text
                    className='trip-card__tag-text'
                    style={{ color: STATUS_COLORS[trip.status] ?? '#94a3b8' }}
                  >
                    {STATUS_LABELS[trip.status] ?? trip.status}
                  </Text>
                </View>
              </View>
              <Text className='trip-card__desc'>{trip.note ?? ''}</Text>
              <View className='trip-card__footer'>
                <View className='trip-card__info'>
                  <Text className='trip-card__info-icon'>{'\u{1F4C5}'}</Text>
                  <Text className='trip-card__info-text'>
                    {trip.startDate ? trip.startDate.slice(0, 10) : '待定'} ~ {trip.endDate ? trip.endDate.slice(0, 10) : '待定'}
                  </Text>
                </View>
                <View className='trip-card__info'>
                  <Text className='trip-card__info-icon'>{'\u{1F4CD}'}</Text>
                  <Text className='trip-card__info-text'>{trip.sites.length} 个圣地</Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: '160rpx' }} />
      </ScrollView>

    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '我的行程',
})
