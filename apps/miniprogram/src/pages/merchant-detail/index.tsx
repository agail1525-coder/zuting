import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Merchant, fetchMerchantDetail } from '../../lib/api'
import './index.scss'

const TYPE_LABELS: Record<string, string> = {
  TEMPLE: '寺庙',
  GUIDE: '导游',
  HOTEL: '住宿',
  TRANSPORT: '交通',
}

export default function MerchantDetailPage() {
  const router = useRouter()
  const id = router.params.id ?? ''
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await fetchMerchantDetail(id)
      setMerchant(data)
      Taro.setNavigationBarTitle({ title: data.name })
    } catch (err) {
      console.error('Failed to load merchant:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className='merchant-detail'>
        <View className='merchant-detail__loading'>
          <Text className='merchant-detail__loading-text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!merchant) {
    return (
      <View className='merchant-detail'>
        <View className='merchant-detail__loading'>
          <Text className='merchant-detail__loading-text'>商家不存在</Text>
        </View>
      </View>
    )
  }

  return (
    <View className='merchant-detail'>
      {/* Header */}
      <View className='merchant-detail__header'>
        <View className='merchant-detail__icon'>
          <Text className='merchant-detail__icon-emoji'>🏪</Text>
        </View>
        <Text className='merchant-detail__name'>{merchant.name}</Text>
        <View className='merchant-detail__meta'>
          <View className='merchant-detail__type-badge'>
            <Text className='merchant-detail__type-text'>{TYPE_LABELS[merchant.type] ?? merchant.type}</Text>
          </View>
          <View className='merchant-detail__rating'>
            <Text className='merchant-detail__rating-star'>★</Text>
            <Text className='merchant-detail__rating-value'>{merchant.rating.toFixed(1)}</Text>
          </View>
          <Text className='merchant-detail__orders'>{merchant.totalOrders} 单</Text>
        </View>
      </View>

      {/* Description */}
      {merchant.description && (
        <View className='merchant-detail__section'>
          <Text className='merchant-detail__section-title'>商家简介</Text>
          <Text className='merchant-detail__desc'>{merchant.description}</Text>
        </View>
      )}

      {/* Services */}
      {Array.isArray(merchant.services) && merchant.services.length > 0 && (
        <View className='merchant-detail__section'>
          <Text className='merchant-detail__section-title'>服务项目</Text>
          {merchant.services.map(svc => (
            <View key={svc.id} className='service-item'>
              <Text className='service-item__name'>{svc.name}</Text>
              <Text className='service-item__price'>¥{svc.price}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Address */}
      {merchant.address && (
        <View className='merchant-detail__section'>
          <Text className='merchant-detail__section-title'>地址</Text>
          <Text className='merchant-detail__desc'>📍 {merchant.address}</Text>
        </View>
      )}
    </View>
  )
}
