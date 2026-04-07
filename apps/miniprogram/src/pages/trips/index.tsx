import { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { fetchTrips, Trip } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

type StatusFilter = 'ALL' | 'DRAFT' | 'PLANNING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED'

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

const FILTER_KEYS: StatusFilter[] = ['ALL', 'PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED']

const STATUS_I18N_MAP: Record<string, string> = {
  DRAFT: 'trips.statusDraft',
  PLANNING: 'trips.statusPlanning',
  SUBMITTED: 'trips.statusSubmitted',
  CONFIRMED: 'trips.statusConfirmed',
  PAID: 'trips.statusPaid',
  PREPARING: 'trips.statusPreparing',
  IN_PROGRESS: 'trips.statusInProgress',
  COMPLETED: 'trips.statusCompleted',
  REVIEWING: 'trips.statusReviewing',
  CANCELLED: 'trips.statusCancelled',
  REFUNDING: 'trips.statusRefunding',
  REFUNDED: 'trips.statusRefunded',
}

const FILTER_I18N_MAP: Record<string, string> = {
  ALL: 'trips.filterAll',
  PLANNING: 'trips.statusPlanning',
  CONFIRMED: 'trips.statusConfirmed',
  IN_PROGRESS: 'trips.statusInProgress',
  COMPLETED: 'trips.statusCompleted',
}

export default function TripsPage() {
  const { t } = useTranslation()
  const [authed, setAuthed] = useState(false)
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('ALL')
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
    const statusParam = activeStatus === 'ALL' ? undefined : activeStatus
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
    const counts: Record<string, number> = { 'ALL': trips.length }
    FILTER_KEYS.forEach((key) => {
      if (key !== 'ALL') {
        counts[key] = trips.filter(tp => tp.status === key).length
      }
    })
    return counts
  }, [trips])

  // Stats
  const stats = useMemo(() => ({
    total: trips.length,
    inProgress: trips.filter(tp => tp.status === 'IN_PROGRESS').length,
    completed: trips.filter(tp => tp.status === 'COMPLETED').length,
  }), [trips])

  // Client-side search filter
  const displayTrips = useMemo(() => {
    if (!search.trim()) return trips
    return trips.filter(tp => tp.title.toLowerCase().includes(search.toLowerCase()))
  }, [trips, search])

  if (!authed) {
    return (
      <View className='trips-page'>
        <View className='auth-gate'>
          <Text className='auth-gate__icon'>{'\u{1F9ED}'}</Text>
          <Text className='auth-gate__title'>{t('trips.myTrips')}</Text>
          <Text className='auth-gate__desc'>{t('trips.loginRequired')}</Text>
          <View
            className='auth-gate__btn'
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <Text className='auth-gate__btn-text'>{t('trips.goLogin')}</Text>
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
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>{t('trips.allTrips')}</Text>
        </View>
        <View style={{ flex: 1, background: 'rgba(16,185,129,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#10b981' }}>{stats.inProgress}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>{t('trips.statusInProgress')}</Text>
        </View>
        <View style={{ flex: 1, background: 'rgba(107,114,128,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#6B7280' }}>{stats.completed}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>{t('trips.statusCompleted')}</Text>
        </View>
      </View>

      {/* Status Filter */}
      <ScrollView className='status-tabs' scrollX>
        {FILTER_KEYS.map((key) => (
          <View
            key={key}
            className={`status-tab ${activeStatus === key ? 'status-tab--active' : ''}`}
            onClick={() => setActiveStatus(key)}
          >
            <Text className='status-tab__text'>{t(FILTER_I18N_MAP[key])} ({tabCounts[key] ?? 0})</Text>
          </View>
        ))}
      </ScrollView>

      {/* Search Input */}
      <View style={{ padding: '16rpx 32rpx', background: 'transparent' }}>
        <Input
          className='search-input'
          placeholder={t('trips.searchPlaceholder')}
          value={search}
          onInput={e => setSearch(e.detail.value)}
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12rpx', padding: '16rpx 24rpx', fontSize: '28rpx', color: '#e2e8f0' }}
        />
      </View>

      {/* Trip List */}
      <ScrollView className='trip-list' scrollY>
        {loading ? (
          <View className='empty'>
            <Text className='empty__text'>{t('common.loading')}</Text>
          </View>
        ) : error ? (
          <View className='empty'>
            <Text className='empty__icon'>{'\u274C'}</Text>
            <Text className='empty__text'>{t('trips.loadFailed')}: {error}</Text>
          </View>
        ) : displayTrips.length === 0 && search.trim() ? (
          <View className='empty'>
            <Text className='empty__icon'>{'\u{1F50D}'}</Text>
            <Text className='empty__text'>{t('trips.searchNoResult', { keyword: search })}</Text>
            <View
              style={{ marginTop: '24rpx', padding: '16rpx 40rpx', background: 'rgba(212,168,85,0.15)', borderRadius: '40rpx' }}
              onClick={() => setSearch('')}
            >
              <Text style={{ color: '#D4A855', fontSize: '28rpx' }}>{t('trips.clearSearch')}</Text>
            </View>
          </View>
        ) : displayTrips.length === 0 ? (
          <View className='empty'>
            <Text className='empty__icon'>{'\u{1F9ED}'}</Text>
            <Text className='empty__text'>{t('trips.noTrips')}</Text>
            <Text style={{ display: 'block', fontSize: '24rpx', color: '#64748b', marginTop: '12rpx' }}>{t('trips.noTripsHint')}</Text>
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
                    {t(STATUS_I18N_MAP[trip.status] ?? 'common.noData') ?? trip.status}
                  </Text>
                </View>
              </View>
              <Text className='trip-card__desc'>{trip.note ?? ''}</Text>
              <View className='trip-card__footer'>
                <View className='trip-card__info'>
                  <Text className='trip-card__info-icon'>{'\u{1F4C5}'}</Text>
                  <Text className='trip-card__info-text'>
                    {trip.startDate ? trip.startDate.slice(0, 10) : t('trips.dateTbd')} ~ {trip.endDate ? trip.endDate.slice(0, 10) : t('trips.dateTbd')}
                  </Text>
                </View>
                <View className='trip-card__info'>
                  <Text className='trip-card__info-icon'>{'\u{1F4CD}'}</Text>
                  <Text className='trip-card__info-text'>{t('trips.siteCount', { count: trip.sites.length })}</Text>
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
            <Text style={{ display: 'block', fontSize: '30rpx', color: '#D4A855', fontWeight: 'bold' }}>{t('trips.exploreMore')}</Text>
            <Text style={{ display: 'block', fontSize: '24rpx', color: '#94a3b8', marginTop: '8rpx' }}>{t('trips.exploreMoreHint')}</Text>
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
