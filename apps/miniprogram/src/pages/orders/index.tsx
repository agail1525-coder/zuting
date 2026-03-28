import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
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
      {/* Filters */}
      <View className='filter-row'>
        {FILTERS.map(f => (
          <View
            key={f}
            className={`filter-row__chip ${filter === f ? 'filter-row__chip--active' : ''}`}
            onClick={() => setFilter(f)}
          >
            <Text className={`filter-row__text ${filter === f ? 'filter-row__text--active' : ''}`}>
              {FILTER_LABELS[f]}
            </Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View className='empty-state'>
          <Text className='empty-state__text'>加载中...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View className='empty-state'>
          <Text className='empty-state__icon'>📋</Text>
          <Text className='empty-state__text'>暂无订单</Text>
        </View>
      ) : (
        <View className='order-list'>
          {orders.map(order => (
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
        </View>
      )}
    </ScrollView>
  )
}
