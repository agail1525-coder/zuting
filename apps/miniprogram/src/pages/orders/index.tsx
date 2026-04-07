import { useEffect, useState, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { OrderDetail, fetchOrderList, cancelOrder } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const STATUS_I18N_MAP: Record<string, string> = {
  PENDING: 'orders.statusPending',
  PAID: 'orders.statusPaid',
  CANCELLED: 'orders.statusCancelled',
  REFUNDING: 'orders.statusRefunding',
  REFUNDED: 'orders.statusRefunded',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  PAID: '#22C55E',
  CANCELLED: '#9CA3AF',
  REFUNDING: '#EF4444',
  REFUNDED: '#6B7280',
}

const FILTERS = ['ALL', 'PENDING', 'PAID', 'CANCELLED', 'REFUNDED']
const FILTER_I18N_MAP: Record<string, string> = {
  ALL: 'orders.filterAll',
  PENDING: 'orders.statusPending',
  PAID: 'orders.statusPaid',
  CANCELLED: 'orders.statusCancelled',
  REFUNDED: 'orders.statusRefunded',
}

export default function OrdersPage() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState<OrderDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const loadOrders = async () => {
    if (!isLoggedIn()) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = filter === 'ALL' ? {} : { status: filter }
      const res = await fetchOrderList(params)
      setOrders(res.data)
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [filter])

  const handleCancel = async (id: string) => {
    try {
      await cancelOrder(id)
      Taro.showToast({ title: t('orders.cancelledSuccess'), icon: 'success' })
      loadOrders()
    } catch {
      Taro.showToast({ title: t('orders.cancelFailed'), icon: 'none' })
    }
  }

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { 'ALL': orders.length }
    FILTERS.forEach(f => {
      if (f !== 'ALL') counts[f] = orders.filter(o => o.status === f).length
    })
    return counts
  }, [orders])

  // Stats
  const stats = useMemo(() => {
    const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0)
    return { total: orders.length, totalAmount }
  }, [orders])

  // Client-side search filter
  const displayOrders = useMemo(() => {
    if (!search.trim()) return orders
    return orders.filter(o => o.orderNo?.toLowerCase().includes(search.toLowerCase()))
  }, [orders, search])

  if (!isLoggedIn()) {
    return (
      <View className='orders-page'>
        <View className='empty-state'>
          <Text className='empty-state__icon'>{'\u{1F510}'}</Text>
          <Text className='empty-state__text'>{t('orders.loginRequired')}</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className='orders-page' scrollY>
      {/* Stats Row */}
      <View style={{ display: 'flex', flexDirection: 'row', gap: '16rpx', padding: '24rpx 32rpx 0' }}>
        <View style={{ flex: 1, background: 'rgba(212,168,85,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#D4A855' }}>{stats.total}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>{t('orders.allOrders')}</Text>
        </View>
        <View style={{ flex: 2, background: 'rgba(34,197,94,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#22C55E' }}>{'\u00A5'}{((stats.totalAmount ?? 0) / 100).toFixed(2)}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>{t('orders.totalSpent')}</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={{ padding: '16rpx 32rpx' }}>
        <Input
          placeholder={t('orders.searchPlaceholder')}
          value={search}
          onInput={e => setSearch(e.detail.value)}
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '12rpx', padding: '16rpx 24rpx', fontSize: '28rpx', color: '#e2e8f0' }}
        />
      </View>

      {/* Filters */}
      <View className='filter-row'>
        {FILTERS.map(f => (
          <View
            key={f}
            className={`filter-row__chip ${filter === f ? 'filter-row__chip--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            <Text className={`filter-row__text ${filter === f ? 'filter-row__text--active' : ''}`}>
              {t(FILTER_I18N_MAP[f])} ({tabCounts[f] ?? 0})
            </Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View className='empty-state'>
          <Text className='empty-state__text'>{t('common.loading')}</Text>
        </View>
      ) : displayOrders.length === 0 && search.trim() ? (
        <View className='empty-state'>
          <Text className='empty-state__icon'>{'\u{1F50D}'}</Text>
          <Text className='empty-state__text'>{t('orders.searchNoResult', { keyword: search })}</Text>
          <View
            style={{ marginTop: '24rpx', padding: '16rpx 40rpx', background: 'rgba(212,168,85,0.15)', borderRadius: '40rpx' }}
            onClick={() => setSearch('')}
          >
            <Text style={{ color: '#D4A855', fontSize: '28rpx' }}>{t('orders.clearSearch')}</Text>
          </View>
        </View>
      ) : displayOrders.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-state__icon'>{'\u{1F4CB}'}</Text>
          <Text className='empty-state__text'>{t('orders.noOrders')}</Text>
          <Text style={{ display: 'block', fontSize: '24rpx', color: '#64748b', marginTop: '12rpx', textAlign: 'center' }}>{t('orders.noOrdersHint')}</Text>
          <View
            style={{ marginTop: '24rpx', padding: '16rpx 40rpx', background: 'rgba(212,168,85,0.15)', borderRadius: '40rpx' }}
            onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
          >
            <Text style={{ color: '#D4A855', fontSize: '28rpx' }}>{t('orders.browseRoutes')}</Text>
          </View>
        </View>
      ) : (
        <View className='order-list'>
          {displayOrders.map(order => (
            <View key={order.id} className='order-card'>
              <View className='order-card__header'>
                <Text className='order-card__no'>{t('orders.orderNo')}: {order.orderNo}</Text>
                <Text
                  className='order-card__status'
                  style={{ color: STATUS_COLORS[order.status] ?? '#9CA3AF' }}
                >
                  {t(STATUS_I18N_MAP[order.status] ?? 'common.noData') ?? order.status}
                </Text>
              </View>
              {order.trip && <Text className='order-card__trip'>{order.trip.title}</Text>}
              <View className='order-card__meta'>
                <Text className='order-card__amount'>{'\u00A5'}{((order.totalAmount ?? 0) / 100).toFixed(2)}</Text>
                <Text className='order-card__date'>{order.createdAt?.slice(0, 10) ?? ''}</Text>
              </View>
              {order.status === 'PENDING' && (
                <View className='order-card__cancel' onClick={() => handleCancel(order.id)}>
                  <Text className='order-card__cancel-text'>{t('orders.cancelOrder')}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Bottom CTA */}
          <View
            style={{ margin: '32rpx', padding: '32rpx', background: 'linear-gradient(135deg, rgba(212,168,85,0.15), rgba(34,197,94,0.1))', borderRadius: '20rpx', textAlign: 'center' }}
            onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
          >
            <Text style={{ display: 'block', fontSize: '30rpx', color: '#D4A855', fontWeight: 'bold' }}>{t('orders.discoverMore')}</Text>
            <Text style={{ display: 'block', fontSize: '24rpx', color: '#94a3b8', marginTop: '8rpx' }}>{t('orders.discoverMoreHint')}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}
