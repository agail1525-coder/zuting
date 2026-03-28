import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { Seal, fetchSealById } from '../../lib/api'
import './index.scss'

const SERIES_COLORS: Record<string, string> = {
  '初印系': '#60a5fa',
  '中印系': '#a78bfa',
  '印果印': '#f472b6',
  '成道印': '#f59e0b',
  '归源印': '#34d399',
}

export default function SealDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [seal, setSeal] = useState<Seal | null>(null)
  const [loading, setLoading] = useState(true)

  useShareAppMessage(() => ({
    title: seal ? `${seal.name} (${seal.series}) — 全球祖庭之旅` : '修行印 — 全球祖庭之旅',
    path: `/pages/seal-detail/index?id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: seal ? `第${seal.number}印 ${seal.name} | ${seal.series}` : '修行印 — 全球祖庭之旅',
    query: `id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useEffect(() => {
    if (id) loadSeal()
  }, [id])

  const loadSeal = async () => {
    try {
      setLoading(true)
      const data = await fetchSealById(id!)
      setSeal(data)
    } catch (err) {
      console.error('Failed to load seal:', err)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className='container'>
        <Text className='loading-text'>正在加载...</Text>
      </View>
    )
  }

  if (!seal) {
    return (
      <View className='container'>
        <Text className='empty-text'>印不存在</Text>
      </View>
    )
  }

  const seriesColor = SERIES_COLORS[seal.series] || '#0066FF'

  return (
    <ScrollView className='seal-detail' scrollY>
      {/* Header */}
      <View className='seal-detail__header'>
        <View className='seal-detail__number' style={{ borderColor: seriesColor }}>
          <Text className='seal-detail__number-text' style={{ color: seriesColor }}>
            {seal.number}
          </Text>
        </View>
        <Text className='seal-detail__name'>{seal.name}</Text>
        <Text className='seal-detail__name-en'>{seal.nameEn}</Text>
        <Text className='seal-detail__series' style={{ color: seriesColor, borderColor: seriesColor }}>
          {seal.series}
        </Text>
      </View>

      {/* Verse */}
      {seal.verse && (
        <View className='content-card'>
          <View className='content-card__header'>
            <View className='content-card__dot' style={{ backgroundColor: seriesColor }} />
            <Text className='content-card__title'>偈颂</Text>
          </View>
          <View className='verse-box'>
            <Text className='verse-box__text'>{seal.verse}</Text>
          </View>
        </View>
      )}

      {/* Meaning */}
      {seal.meaning && (
        <View className='content-card'>
          <View className='content-card__header'>
            <View className='content-card__dot' style={{ backgroundColor: seriesColor }} />
            <Text className='content-card__title'>含义</Text>
          </View>
          <Text className='content-card__body'>{seal.meaning}</Text>
        </View>
      )}

      {/* Practice */}
      {seal.practice && (
        <View className='content-card'>
          <View className='content-card__header'>
            <View className='content-card__dot' style={{ backgroundColor: seriesColor }} />
            <Text className='content-card__title'>修行方法</Text>
          </View>
          <Text className='content-card__body'>{seal.practice}</Text>
        </View>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
