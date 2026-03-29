import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Merchant, fetchMerchants } from '../../lib/api'
import './index.scss'

const TYPES = [
  { key: '', label: '全部' },
  { key: 'TEMPLE', label: '寺庙' },
  { key: 'GUIDE', label: '导游' },
  { key: 'HOTEL', label: '住宿' },
  { key: 'TRANSPORT', label: '交通' },
]

const TYPE_LABELS: Record<string, string> = {
  TEMPLE: '寺庙',
  GUIDE: '导游',
  HOTEL: '住宿',
  TRANSPORT: '交通',
}

export default function MerchantsPage() {
  const [activeType, setActiveType] = useState('')
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeType])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetchMerchants(activeType || undefined, 1)
      setMerchants(res.items)
    } catch (err) {
      console.error('Failed to load merchants:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='merchants-page'>
      {/* Type filter tabs */}
      <ScrollView className='type-tabs' scrollX>
        {TYPES.map(t => (
          <View
            key={t.key}
            className={`type-tabs__item ${activeType === t.key ? 'type-tabs__item--active' : ''}`}
            onClick={() => setActiveType(t.key)}
          >
            <Text className={`type-tabs__text ${activeType === t.key ? 'type-tabs__text--active' : ''}`}>
              {t.label}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Merchant list */}
      <ScrollView className='merchant-list' scrollY>
        {loading ? (
          <View className='merchant-list__empty'>
            <Text className='merchant-list__empty-text'>加载中...</Text>
          </View>
        ) : merchants.length === 0 ? (
          <View className='merchant-list__empty'>
            <Text className='merchant-list__empty-icon'>🏪</Text>
            <Text className='merchant-list__empty-text'>暂无商家</Text>
          </View>
        ) : (
          merchants.map(m => (
            <View
              key={m.id}
              className='merchant-card'
              hoverClass='merchant-card--hover'
              onClick={() => Taro.navigateTo({ url: `/pages/merchant-detail/index?id=${m.id}` })}
            >
              <View className='merchant-card__icon'>
                <Text className='merchant-card__icon-emoji'>🏪</Text>
              </View>
              <View className='merchant-card__info'>
                <Text className='merchant-card__name'>{m.name}</Text>
                <View className='merchant-card__meta'>
                  <View className='merchant-card__type-badge'>
                    <Text className='merchant-card__type-text'>{TYPE_LABELS[m.type] ?? m.type}</Text>
                  </View>
                  <View className='merchant-card__rating'>
                    <Text className='merchant-card__rating-star'>★</Text>
                    <Text className='merchant-card__rating-text'>{m.rating.toFixed(1)}</Text>
                  </View>
                  <Text className='merchant-card__orders'>{m.totalOrders}单</Text>
                </View>
                {m.address && (
                  <Text className='merchant-card__address'>📍 {m.address}</Text>
                )}
              </View>
              <Text className='merchant-card__arrow'>›</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
