import { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
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
  DRAFT: '#6B7280',
  PLANNING: '#3b82f6',
  SUBMITTED: '#8b5cf6',
  CONFIRMED: '#0066FF',
  PAID: '#0066FF',
  PREPARING: '#f59e0b',
  IN_PROGRESS: '#10b981',
  COMPLETED: '#6B7280',
  REVIEWING: '#f97316',
  CANCELLED: '#ef4444',
  REFUNDING: '#f97316',
  REFUNDED: '#6B7280',
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
  const [search, setSearch] = useState('')

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
        setTrips(res.items)
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

  // Compute counts per filter tab (from all loaded trips regardless of current filter)
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { '全部': trips.length }
    FILTER_LIST.forEach(({ key }) => {
      if (key !== '全部') {
        counts[key] = trips.filter(t => t.status === key).length
      }
    })
    return counts
  }, [trips])

  // Stats
  const stats = useMemo(() => ({
    total: trips.length,
    inProgress: trips.filter(t => t.status === 'IN_PROGRESS').length,
    completed: trips.filter(t => t.status === 'COMPLETED').length,
  }), [trips])

  // Client-side search filter
  const displayTrips = useMemo(() => {
    if (!search.trim()) return trips
    return trips.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
  }, [trips, search])

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
      {/* Stats Header */}
      <View style={{ display: 'flex', flexDirection: 'row', gap: '16rpx', padding: '24rpx 32rpx 0' }}>
        <View style={{ flex: 1, background: 'rgba(212,168,85,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#D4A855' }}>{stats.total}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>全部行程</Text>
        </View>
        <View style={{ flex: 1, background: 'rgba(16,185,129,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#10b981' }}>{stats.inProgress}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>朝圣中</Text>
        </View>
        <View style={{ flex: 1, background: 'rgba(107,114,128,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#6B7280' }}>{stats.completed}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>已完成</Text>
        </View>
      </View>

      {/* Status Filter */}
      <ScrollView className='status-tabs' scrollX>
        {FILTER_LIST.map(({ key, label }) => (
          <View
            key={key}
            className={`status-tab ${activeStatus === key ? 'status-tab--active' : ''}`}
            onClick={() => setActiveStatus(key)}
          >
            <Text className='status-tab__text'>{label} ({tabCounts[key] ?? 0})</Text>
          </View>
        ))}
      </ScrollView>

      {/* Search Input */}
      <View style={{ padding: '16rpx 32rpx', background: 'transparent' }}>
        <Input
          className='search-input'
          placeholder='搜索行程名称...'
          value={search}
          onInput={e => setSearch(e.detail.value)}
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12rpx', padding: '16rpx 24rpx', fontSize: '28rpx', color: '#e2e8f0' }}
        />
      </View>

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
        ) : displayTrips.length === 0 && search.trim() ? (
          <View className='empty'>
            <Text className='empty__icon'>{'\u{1F50D}'}</Text>
            <Text className='empty__text'>未找到含"{search}"的行程</Text>
            <View
              style={{ marginTop: '24rpx', padding: '16rpx 40rpx', background: 'rgba(212,168,85,0.15)', borderRadius: '40rpx' }}
              onClick={() => setSearch('')}
            >
              <Text style={{ color: '#D4A855', fontSize: '28rpx' }}>清除搜索</Text>
            </View>
          </View>
        ) : displayTrips.length === 0 ? (
          <View className='empty'>
            <Text className='empty__icon'>{'\u{1F9ED}'}</Text>
            <Text className='empty__text'>暂无相关行程</Text>
            <Text style={{ display: 'block', fontSize: '24rpx', color: '#64748b', marginTop: '12rpx' }}>出发规划您的第一段朝圣之旅吧</Text>
          </View>
        ) : (
          displayTrips.map(trip => (
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
                    backgroundColor: `${STATUS_COLORS[trip.status] ?? '#6B7280'}20`,
                    borderColor: `${STATUS_COLORS[trip.status] ?? '#6B7280'}40`,
                  }}
                >
                  <Text
                    className='trip-card__tag-text'
                    style={{ color: STATUS_COLORS[trip.status] ?? '#6B7280' }}
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

        {/* Bottom CTA */}
        {!loading && !error && (
          <View
            style={{ margin: '32rpx', padding: '32rpx', background: 'linear-gradient(135deg, rgba(212,168,85,0.15), rgba(59,130,246,0.1))', borderRadius: '20rpx', textAlign: 'center' }}
            onClick={() => Taro.switchTab({ url: '/pages/holy-sites/index' })}
          >
            <Text style={{ display: 'block', fontSize: '30rpx', color: '#D4A855', fontWeight: 'bold' }}>探索更多圣地</Text>
            <Text style={{ display: 'block', fontSize: '24rpx', color: '#94a3b8', marginTop: '8rpx' }}>发现新的朝圣目的地，规划下一段旅程 →</Text>
          </View>
        )}

        <View style={{ height: '160rpx' }} />
      </ScrollView>

    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '我的行程',
})
