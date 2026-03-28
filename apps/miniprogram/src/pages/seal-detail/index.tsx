import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { Seal, fetchSealById } from '../../lib/api'
import './index.scss'

const SERIES_COLORS: Record<string, string> = {
  '初印系': '#6366F1',
  '中印系': '#8B5CF6',
  '印果印': '#EC4899',
  '成道印': '#F59E0B',
  '归源印': '#22C55E',
}

export default function SealDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [seal, setSeal] = useState<any>(null)
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

  if (loading) return <View className='container'><Text className='loading-text'>正在加载...</Text></View>
  if (!seal) return <View className='container'><Text className='empty-text'>印不存在</Text></View>

  const seriesColor = SERIES_COLORS[seal.series] || '#0066FF'

  return (
    <ScrollView className='detail-page' scrollY>
      {/* Hero with series gradient */}
      <View className='seal-hero' style={{ background: `linear-gradient(135deg, ${seriesColor}, #003D99)` }}>
        <View className='seal-hero__overlay'>
          <View className='seal-hero__number'>
            <Text className='seal-hero__number-text'>{seal.number}</Text>
          </View>
          <Text className='seal-hero__title'>{seal.name}</Text>
          <Text className='seal-hero__subtitle'>{seal.nameEn}</Text>
          <View className='seal-hero__series'>
            <View className='seal-hero__series-dot' />
            <Text className='seal-hero__series-text'>{seal.series}</Text>
          </View>
        </View>
      </View>

      {/* Poem/Verse */}
      {(seal.verse || seal.poem) && (
        <View className='section'>
          <Text className='section__title'>偈颂</Text>
          <View className='poem-card'>
            <Text className='poem-card__text'>{seal.verse || seal.poem}</Text>
          </View>
        </View>
      )}

      {/* Essence/Meaning */}
      {(seal.essence || seal.meaning) && (
        <View className='section'>
          <Text className='section__title'>要义</Text>
          <View className='card'>
            <Text className='card__text'>{seal.essence || seal.meaning}</Text>
          </View>
        </View>
      )}

      {/* Practice */}
      {seal.practice && (
        <View className='section'>
          <Text className='section__title'>修行方法</Text>
          <View className='card'>
            <Text className='card__text'>{seal.practice}</Text>
          </View>
        </View>
      )}

      {/* Vow */}
      {seal.vow && (
        <View className='section'>
          <Text className='section__title'>愿文</Text>
          <View className='vow-card' style={{ borderLeftColor: seriesColor }}>
            <Text className='vow-card__text'>{seal.vow}</Text>
          </View>
        </View>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
