import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { HolySite, fetchHolySiteById } from '../../lib/api'
import './index.scss'

export default function HolySiteDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [site, setSite] = useState<HolySite | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useShareAppMessage(() => ({
    title: site ? `${site.name} — 全球祖庭之旅` : '探索圣地 — 全球祖庭之旅',
    path: `/pages/holy-site-detail/index?id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: site ? `${site.name} | ${site.city}, ${site.country}` : '探索圣地 — 全球祖庭之旅',
    query: `id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useEffect(() => {
    if (id) loadSite()
  }, [id])

  const loadSite = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchHolySiteById(id!)
      setSite(data)
    } catch (err) {
      console.error('Failed to load site:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const openLocation = () => {
    if (!site) return
    Taro.openLocation({
      latitude: site.latitude,
      longitude: site.longitude,
      name: site.name,
      address: `${site.city}, ${site.country}`
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
        <Text className='retry-btn' onClick={loadSite}>点击重试</Text>
      </View>
    )
  }

  if (!site) {
    return (
      <View className='container'>
        <Text className='empty-text'>圣地不存在</Text>
      </View>
    )
  }

  return (
    <ScrollView className='site-detail' scrollY>
      {/* Header */}
      <View className='site-detail__header'>
        {site.religion && (
          <Text className='site-detail__religion'>{site.religion.emoji} {site.religion.name}</Text>
        )}
        <Text className='site-detail__name'>{site.name}</Text>
        <Text className='site-detail__name-en'>{site.nameEn}</Text>
      </View>

      {/* Location Card */}
      <View className='info-card' onClick={openLocation}>
        <View className='info-card__row'>
          <Text className='info-card__icon'>{'\u{1F4CD}'}</Text>
          <View className='info-card__content'>
            <Text className='info-card__label'>位置</Text>
            <Text className='info-card__value'>{site.city}, {site.country}</Text>
          </View>
        </View>
        <View className='info-card__row'>
          <Text className='info-card__icon'>{'\u{1F30D}'}</Text>
          <View className='info-card__content'>
            <Text className='info-card__label'>坐标</Text>
            <Text className='info-card__value'>{site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}</Text>
          </View>
        </View>
        <View className='info-card__row'>
          <Text className='info-card__icon'>{'\u{1F552}'}</Text>
          <View className='info-card__content'>
            <Text className='info-card__label'>时区</Text>
            <Text className='info-card__value'>UTC{site.utcOffset >= 0 ? '+' : ''}{site.utcOffset}</Text>
          </View>
        </View>
        <View className='info-card__action'>
          <Text className='info-card__action-text'>打开地图导航</Text>
        </View>
      </View>

      {/* Description */}
      {site.description && (
        <View className='desc-card'>
          <Text className='desc-card__title'>简介</Text>
          <Text className='desc-card__content'>{site.description}</Text>
        </View>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
