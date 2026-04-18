import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchCrawlerVideos, CrawlerVideo } from '../../lib/api'
import './index.scss'

interface CrawlerVideosProps {
  targetType: 'holySite' | 'religion'
  targetId: string
  title?: string
}

function formatViews(n: number | null): string {
  if (!n || n < 1000) return String(n ?? 0)
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}K`
  return `${(n / 1_000_000).toFixed(1)}M`
}

function formatDuration(sec: number | null): string {
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function CrawlerVideos({ targetType, targetId, title = '精选视频导览' }: CrawlerVideosProps) {
  const [videos, setVideos] = useState<CrawlerVideo[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchCrawlerVideos(targetType, targetId, 12)
      .then((items) => {
        if (!cancelled) {
          setVideos(items)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => { cancelled = true }
  }, [targetType, targetId])

  const handleClick = (video: CrawlerVideo) => {
    Taro.setClipboardData({
      data: video.url,
      success: () => {
        Taro.showToast({ title: '视频链接已复制，请在浏览器打开', icon: 'none', duration: 2500 })
      },
    })
  }

  if (!loaded || videos.length === 0) return null

  return (
    <View className='crawler-videos'>
      <View className='crawler-videos__head'>
        <Text className='crawler-videos__title'>🎬 {title}</Text>
        <Text className='crawler-videos__count'>{videos.length} 条</Text>
      </View>
      <ScrollView scrollX className='crawler-videos__scroll' showScrollbar={false}>
        <View className='crawler-videos__row'>
          {videos.map((v) => (
            <View key={v.id} className='crawler-videos__card' onClick={() => handleClick(v)}>
              {v.thumbnailUrl ? (
                <Image className='crawler-videos__thumb' src={v.thumbnailUrl} mode='aspectFill' lazyLoad />
              ) : (
                <View className='crawler-videos__thumb crawler-videos__thumb--fallback'>
                  <Text className='crawler-videos__fallback-icon'>🎬</Text>
                </View>
              )}
              <View className='crawler-videos__play'>
                <Text className='crawler-videos__play-icon'>▶</Text>
              </View>
              {v.durationSec != null && (
                <View className='crawler-videos__duration'>
                  <Text className='crawler-videos__duration-text'>{formatDuration(v.durationSec)}</Text>
                </View>
              )}
              <View className='crawler-videos__info'>
                <Text className='crawler-videos__card-title'>{v.title}</Text>
                <View className='crawler-videos__meta'>
                  {v.channel && <Text className='crawler-videos__channel'>{v.channel}</Text>}
                  {v.viewCount != null && (
                    <Text className='crawler-videos__views'>👁 {formatViews(v.viewCount)}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
