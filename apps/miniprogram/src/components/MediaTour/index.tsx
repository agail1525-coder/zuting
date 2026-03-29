import { useEffect, useState, useCallback } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchMediaByEntity, MediaContent } from '../../lib/api'
import './index.scss'

interface MediaTourProps {
  entityType: string
  entityId: string
}

type TabKey = 'VIDEO' | 'PANORAMA' | 'AUDIO'

function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const TAB_CONFIG: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'VIDEO', label: '视频', emoji: '🎬' },
  { key: 'PANORAMA', label: '全景', emoji: '🌐' },
  { key: 'AUDIO', label: '音频', emoji: '🎧' },
]

export default function MediaTour({ entityType, entityId }: MediaTourProps) {
  const [media, setMedia] = useState<MediaContent[]>([])
  const [loaded, setLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('VIDEO')
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [audioCtx, setAudioCtx] = useState<Taro.InnerAudioContext | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchMediaByEntity(entityType, entityId)
      .then((data) => {
        if (!cancelled) {
          setMedia(data)
          setLoaded(true)
        }
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => { cancelled = true }
  }, [entityType, entityId])

  useEffect(() => {
    return () => {
      audioCtx?.destroy()
    }
  }, [audioCtx])

  const playVideo = useCallback((item: MediaContent) => {
    Taro.previewMedia({
      sources: [{ url: item.url, type: 'video', poster: item.thumbnailUrl || '' }],
      current: 0,
    }).catch(() => {
      // Fallback: open video URL directly
      Taro.showToast({ title: '暂不支持播放', icon: 'none' })
    })
  }, [])

  const playAudio = useCallback((item: MediaContent) => {
    if (playingAudioId === item.id) {
      audioCtx?.pause()
      setPlayingAudioId(null)
      return
    }
    audioCtx?.destroy()
    const ctx = Taro.createInnerAudioContext()
    ctx.src = item.url
    ctx.onEnded(() => setPlayingAudioId(null))
    ctx.play()
    setAudioCtx(ctx)
    setPlayingAudioId(item.id)
  }, [playingAudioId, audioCtx])

  const previewPanorama = useCallback((item: MediaContent) => {
    Taro.previewImage({
      urls: [item.url],
      current: item.url,
    })
  }, [])

  if (!loaded) return null

  const grouped: Record<TabKey, MediaContent[]> = {
    VIDEO: media.filter((m) => m.mediaType === 'VIDEO'),
    PANORAMA: media.filter((m) => m.mediaType === 'PANORAMA'),
    AUDIO: media.filter((m) => m.mediaType === 'AUDIO'),
  }

  const tabs = TAB_CONFIG.filter((t) => grouped[t.key].length > 0)
  if (tabs.length === 0) return null

  const currentTab = tabs.find((t) => t.key === activeTab) ? activeTab : tabs[0].key
  const items = grouped[currentTab]

  return (
    <View className='media-tour'>
      <Text className='media-tour__title'>多媒体导览</Text>

      {/* Tabs */}
      <View className='media-tour__tabs'>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`media-tour__tab ${currentTab === tab.key ? 'media-tour__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className='media-tour__tab-text'>
              {tab.emoji} {tab.label} ({grouped[tab.key].length})
            </Text>
          </View>
        ))}
      </View>

      {/* Video list */}
      {currentTab === 'VIDEO' && items.map((item) => (
        <View key={item.id} className='media-tour__video' onClick={() => playVideo(item)}>
          {item.thumbnailUrl ? (
            <Image className='media-tour__video-thumb' src={item.thumbnailUrl} mode='aspectFill' lazyLoad />
          ) : (
            <View className='media-tour__video-thumb media-tour__video-thumb--placeholder'>
              <Text style={{ fontSize: '60rpx' }}>🎬</Text>
            </View>
          )}
          <View className='media-tour__video-play'>
            <Text style={{ fontSize: '48rpx' }}>▶</Text>
          </View>
          {item.duration != null && (
            <View className='media-tour__duration'>
              <Text className='media-tour__duration-text'>{formatDuration(item.duration)}</Text>
            </View>
          )}
          <View className='media-tour__video-info'>
            <Text className='media-tour__video-title'>{item.title}</Text>
          </View>
        </View>
      ))}

      {/* Panorama list */}
      {currentTab === 'PANORAMA' && items.map((item) => (
        <View key={item.id} className='media-tour__panorama' onClick={() => previewPanorama(item)}>
          {item.thumbnailUrl ? (
            <Image className='media-tour__panorama-thumb' src={item.thumbnailUrl} mode='aspectFill' lazyLoad />
          ) : (
            <View className='media-tour__panorama-thumb media-tour__panorama-thumb--placeholder'>
              <Text style={{ fontSize: '60rpx' }}>🌐</Text>
            </View>
          )}
          <View className='media-tour__video-play'>
            <Text style={{ fontSize: '40rpx' }}>🌐</Text>
          </View>
          <View className='media-tour__video-info'>
            <Text className='media-tour__video-title'>{item.title}</Text>
          </View>
        </View>
      ))}

      {/* Audio list */}
      {currentTab === 'AUDIO' && items.map((item) => (
        <View key={item.id} className='media-tour__audio' onClick={() => playAudio(item)}>
          <View className={`media-tour__audio-btn ${playingAudioId === item.id ? 'media-tour__audio-btn--playing' : ''}`}>
            <Text style={{ fontSize: '32rpx', color: '#fff' }}>{playingAudioId === item.id ? '⏸' : '▶'}</Text>
          </View>
          <View className='media-tour__audio-info'>
            <Text className='media-tour__audio-title'>{item.title}</Text>
            {item.description && <Text className='media-tour__audio-desc'>{item.description}</Text>}
          </View>
          <Text className='media-tour__audio-duration'>{formatDuration(item.duration)}</Text>
        </View>
      ))}
    </View>
  )
}
