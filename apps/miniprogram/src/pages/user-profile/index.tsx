import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchPublicUserProfile, PublicUserProfile } from '../../lib/api'
import './index.scss'

const LEVEL_META: Record<number, { name: string; color: string; icon: string }> = {
  1: { name: '初心', color: '#94a3b8', icon: '🌱' },
  2: { name: '行者', color: '#3264ff', icon: '🚶' },
  3: { name: '文化使者', color: '#8b5cf6', icon: '🌠' },
  4: { name: '传灯人', color: '#D4A855', icon: '🕯' },
  5: { name: '圆融', color: '#ef4444', icon: '🪷' },
}

export default function UserProfilePage() {
  const params = Taro.getCurrentInstance().router?.params ?? {}
  const userId = (params.userId as string | undefined) ?? ''
  const [profile, setProfile] = useState<PublicUserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      setError('用户不存在')
      return
    }
    setLoading(true)
    fetchPublicUserProfile(userId)
      .then((p) => {
        setProfile(p)
        setError(null)
      })
      .catch(() => setError('加载失败或用户不存在'))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <View className='up-page'>
        <View className='up-loading'>
          <Text className='up-loading-text'>加载中…</Text>
        </View>
      </View>
    )
  }

  if (error || !profile) {
    return (
      <View className='up-page'>
        <View className='up-empty'>
          <Text className='up-empty-icon'>🔍</Text>
          <Text className='up-empty-text'>{error ?? '用户不存在'}</Text>
          <View className='up-empty-btn' onClick={() => Taro.navigateBack()}>
            <Text className='up-empty-btn-text'>返回</Text>
          </View>
        </View>
      </View>
    )
  }

  const levelMeta = LEVEL_META[profile.pilgrimLevel] ?? LEVEL_META[1]

  return (
    <ScrollView scrollY className='up-page'>
      <View className='up-hero' style={{ background: `linear-gradient(135deg, ${levelMeta.color} 0%, #0f172a 100%)` }}>
        <View className='up-avatar'>
          {profile.avatar ? (
            <Image className='up-avatar-img' src={profile.avatar} mode='aspectFill' />
          ) : (
            <Text className='up-avatar-init'>{(profile.displayName ?? 'U')[0]}</Text>
          )}
        </View>
        <Text className='up-name'>{profile.displayName ?? '匿名使者'}</Text>
        <View className='up-level-badge' style={{ backgroundColor: levelMeta.color }}>
          <Text className='up-level-text'>{levelMeta.icon} Lv.{profile.pilgrimLevel} · {levelMeta.name}</Text>
        </View>
        {profile.location && (
          <Text className='up-location'>📍 {profile.location}</Text>
        )}
      </View>

      {profile.bio && (
        <View className='up-section'>
          <Text className='up-section-title'>个人简介</Text>
          <Text className='up-bio'>{profile.bio}</Text>
        </View>
      )}

      <View className='up-stats'>
        <View className='up-stat'>
          <Text className='up-stat-num'>{profile.totalTrips}</Text>
          <Text className='up-stat-label'>文化之旅</Text>
        </View>
        <View className='up-stat'>
          <Text className='up-stat-num'>{profile.totalSites}</Text>
          <Text className='up-stat-label'>到访圣地</Text>
        </View>
        <View className='up-stat'>
          <Text className='up-stat-num'>{profile.guideCount}</Text>
          <Text className='up-stat-label'>攻略</Text>
        </View>
        <View className='up-stat'>
          <Text className='up-stat-num'>{profile.reviewCount}</Text>
          <Text className='up-stat-label'>评价</Text>
        </View>
      </View>

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
