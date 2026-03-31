import { useEffect, useState, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { OrderDetail, fetchOrderList, cancelOrder } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import './index.scss'

const STATUS_LABELS: Record<string, string> = {
  PENDING: '待付款',
  PAID: '已付款',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B',
  PAID: '#22C55E',
  CANCELLED: '#9CA3AF',
  REFUNDING: '#EF4444',
  REFUNDED: '#6B7280',
}

const FILTERS = ['全部', 'PENDING', 'PAID', 'CANCELLED', 'REFUNDED']
const FILTER_LABELS: Record<string, string> = {
  '全部': '全部',
  PENDING: '待付款',
  PAID: '已付款',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('全部')
  const [search, setSearch] = useState('')

  const loadOrders = async () => {
    if (!isLoggedIn()) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params = filter === '全部' ? {} : { status: filter }
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
      Taro.showToast({ title: '已取消', icon: 'success' })
      loadOrders()
    } catch {
      Taro.showToast({ title: '取消失败', icon: 'none' })
    }
  }

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { '全部': orders.length }
    FILTERS.forEach(f => {
      if (f !== '全部') counts[f] = orders.filter(o => o.status === f).length
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
          <Text className='empty-state__icon'>🔐</Text>
          <Text className='empty-state__text'>请先登录查看订单</Text>
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
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>全部订单</Text>
        </View>
        <View style={{ flex: 2, background: 'rgba(34,197,94,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#22C55E' }}>¥{(stats.totalAmount / 100).toFixed(2)}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>累计消费</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={{ padding: '16rpx 32rpx' }}>
        <Input
          placeholder='搜索订单号...'
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
              {FILTER_LABELS[f]} ({tabCounts[f] ?? 0})
            </Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View className='empty-state'>
          <Text className='empty-state__text'>加载中...</Text>
        </View>
      ) : displayOrders.length === 0 && search.trim() ? (
        <View className='empty-state'>
          <Text className='empty-state__icon'>🔍</Text>
          <Text className='empty-state__text'>未找到订单号"{search}"</Text>
          <View
            style={{ marginTop: '24rpx', padding: '16rpx 40rpx', background: 'rgba(212,168,85,0.15)', borderRadius: '40rpx' }}
            onClick={() => setSearch('')}
          >
            <Text style={{ color: '#D4A855', fontSize: '28rpx' }}>清除搜索</Text>
          </View>
        </View>
      ) : displayOrders.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-state__icon'>📋</Text>
          <Text className='empty-state__text'>暂无订单</Text>
          <Text style={{ display: 'block', fontSize: '24rpx', color: '#64748b', marginTop: '12rpx', textAlign: 'center' }}>去预订一段朝圣之旅吧</Text>
          <View
            style={{ marginTop: '24rpx', padding: '16rpx 40rpx', background: 'rgba(212,168,85,0.15)', borderRadius: '40rpx' }}
            onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
          >
            <Text style={{ color: '#D4A855', fontSize: '28rpx' }}>浏览路线</Text>
          </View>
        </View>
      ) : (
        <View className='order-list'>
          {displayOrders.map(order => (
            <View key={order.id} className='order-card'>
              <View className='order-card__header'>
                <Text className='order-card__no'>订单号: {order.orderNo}</Text>
                <Text
                  className='order-card__status'
                  style={{ color: STATUS_COLORS[order.status] ?? '#9CA3AF' }}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </Text>
              </View>
              {order.trip && <Text className='order-card__trip'>{order.trip.title}</Text>}
              <View className='order-card__meta'>
                <Text className='order-card__amount'>¥{(order.totalAmount / 100).toFixed(2)}</Text>
                <Text className='order-card__date'>{order.createdAt.slice(0, 10)}</Text>
              </View>
              {order.status === 'PENDING' && (
                <View className='order-card__cancel' onClick={() => handleCancel(order.id)}>
                  <Text className='order-card__cancel-text'>取消订单</Text>
                </View>
              )}
            </View>
          ))}

          {/* Bottom CTA */}
          <View
            style={{ margin: '32rpx', padding: '32rpx', background: 'linear-gradient(135deg, rgba(212,168,85,0.15), rgba(34,197,94,0.1))', borderRadius: '20rpx', textAlign: 'center' }}
            onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
          >
            <Text style={{ display: 'block', fontSize: '30rpx', color: '#D4A855', fontWeight: 'bold' }}>发现更多路线</Text>
            <Text style={{ display: 'block', fontSize: '24rpx', color: '#94a3b8', marginTop: '8rpx' }}>预订精选朝圣旅程，开启心灵之旅 →</Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}
