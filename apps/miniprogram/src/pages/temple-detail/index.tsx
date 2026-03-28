import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { Temple, fetchTempleById } from '../../lib/api'
import './index.scss'

export default function TempleDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [temple, setTemple] = useState<Temple | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useShareAppMessage(() => ({
    title: temple ? `${temple.name} — 全球祖庭之旅` : '探索祖庭 — 全球祖庭之旅',
    path: `/pages/temple-detail/index?id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: temple ? `${temple.name} | ${temple.city}, ${temple.country}` : '探索祖庭 — 全球祖庭之旅',
    query: `id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useEffect(() => {
    if (id) loadTemple()
  }, [id])

  const loadTemple = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTempleById(id!)
      setTemple(data)
    } catch (err) {
      console.error('Failed to load temple:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const openLocation = () => {
    if (!temple) return
    Taro.openLocation({
      latitude: temple.latitude,
      longitude: temple.longitude,
      name: temple.name,
      address: `${temple.city}, ${temple.country}`
    })
  }

  if (loading) {
    return (
      <View className='container'>
        <Text className='loading-text'>正在加载...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className='container'>
        <Text className='empty-text'>{error}</Text>
        <Text className='retry-btn' onClick={loadTemple}>点击重试</Text>
      </View>
    )
  }

  if (!temple) {
    return (
      <View className='container'>
        <Text className='empty-text'>祖庭不存在</Text>
      </View>
    )
  }

  return (
    <ScrollView className='temple-detail' scrollY>
      {/* Header */}
      <View className='temple-detail__header'>
        <Text className='temple-detail__icon'>{'\u{1F3EF}'}</Text>
        {temple.religion && (
          <Text className='temple-detail__religion'>{temple.religion.emoji} {temple.religion.name}</Text>
        )}
        <Text className='temple-detail__name'>{temple.name}</Text>
        <Text className='temple-detail__name-en'>{temple.nameEn}</Text>
      </View>

      {/* Info Card */}
      <View className='info-card'>
        <View className='info-card__row'>
          <Text className='info-card__icon'>{'\u{1F4CD}'}</Text>
          <View className='info-card__content'>
            <Text className='info-card__label'>位置</Text>
            <Text className='info-card__value'>{temple.city}, {temple.country}</Text>
          </View>
        </View>
        {temple.founded && (
          <View className='info-card__row'>
            <Text className='info-card__icon'>{'\u{1F4C5}'}</Text>
            <View className='info-card__content'>
              <Text className='info-card__label'>创建</Text>
              <Text className='info-card__value'>{temple.founded}</Text>
            </View>
          </View>
        )}
        <View className='info-card__row'>
          <Text className='info-card__icon'>{'\u{1F30D}'}</Text>
          <View className='info-card__content'>
            <Text className='info-card__label'>坐标</Text>
            <Text className='info-card__value'>{temple.latitude.toFixed(4)}, {temple.longitude.toFixed(4)}</Text>
          </View>
        </View>
        <View className='info-card__action' onClick={openLocation}>
          <Text className='info-card__action-text'>打开地图导航</Text>
        </View>
      </View>

      {/* Description */}
      {temple.description && (
        <View className='desc-card'>
          <Text className='desc-card__title'>简介</Text>
          <Text className='desc-card__content'>{temple.description}</Text>
        </View>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
