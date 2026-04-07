import { useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { GuideItem, fetchGuide, likeGuide, unlikeGuide } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function GuideDetailPage() {
  const { t } = useTranslation()
  const [guide, setGuide] = useState<GuideItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)

  useLoad((params) => {
    const id = params?.id
    if (id) {
      loadGuide(id)
    } else {
      setError(t('guideDetail.missingId'))
      setLoading(false)
    }
  })

  const loadGuide = async (id: string) => {
    try {
      setLoading(true)
      const data = await fetchGuide(id)
      setGuide(data)
      setLikeCount(data.likeCount)
    } catch {
      setError(t('guideDetail.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!guide || liking) return
    try {
      setLiking(true)
      if (liked) {
        await unlikeGuide(guide.id)
        setLiked(false)
        setLikeCount(c => Math.max(0, c - 1))
      } else {
        await likeGuide(guide.id)
        setLiked(true)
        setLikeCount(c => c + 1)
      }
    } catch {
      Taro.showToast({ title: t('guideDetail.actionFailed'), icon: 'none' })
    } finally {
      setLiking(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    } catch {
      return dateStr ?? ''
    }
  }

  if (loading) {
    return (
      <View className='guide-detail'>
        <View className='loading'>
          <Text className='loading__text'>{t('common.loading')}</Text>
        </View>
      </View>
    )
  }

  if (error || !guide) {
    return (
      <View className='guide-detail'>
        <View className='error'>
          <Text className='error__text'>{error || t('guideDetail.notFound')}</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className='guide-detail' scrollY>
      {/* Cover Image */}
      {guide.coverImage ? (
        <Image className='cover' src={guide.coverImage} mode='aspectFill' />
      ) : (
        <View className='cover--placeholder'>
          <Text className='cover__icon'>{'\u{1F3D4}'}</Text>
        </View>
      )}

      {/* Body */}
      <View className='body'>
        <Text className='body__title'>{guide.title}</Text>

        {/* Author Bar */}
        <View className='author-bar'>
          {guide.user?.avatar ? (
            <Image className='author-bar__avatar-img' src={guide.user.avatar} mode='aspectFill' />
          ) : (
            <View className='author-bar__avatar'>
              <Text className='author-bar__avatar-text'>
                {guide.user?.nickname ? guide.user.nickname[0] : t('guideDetail.userFallback')}
              </Text>
            </View>
          )}
          <View className='author-bar__info'>
            <Text className='author-bar__name'>{guide.user?.nickname || t('guideDetail.traveler')}</Text>
            <Text className='author-bar__date'>{formatDate(guide.publishedAt)}</Text>
          </View>
        </View>

        {/* Tags */}
        {(guide.tags?.length ?? 0) > 0 && (
          <View className='tags'>
            {guide.tags.map(tag => (
              <Text key={tag} className='tags__item'>#{tag}</Text>
            ))}
          </View>
        )}

        {/* Content */}
        <View className='content'>
          <Text className='content__text'>{guide.content}</Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View className='stats'>
        <View className='stats__item'>
          <Text className='stats__icon'>{'\u{1F441}'}</Text>
          <Text className='stats__value'>{guide.viewCount} {t('guideDetail.reads')}</Text>
        </View>
        <View className='stats__item'>
          <Text className='stats__icon'>{'\u{1F4AC}'}</Text>
          <Text className='stats__value'>{guide.commentCount} {t('guideDetail.comments')}</Text>
        </View>
      </View>

      {/* Like Button */}
      <View
        className={`like-btn ${liked ? 'like-btn--liked' : ''}`}
        onClick={handleLike}
      >
        <Text className='like-btn__icon'>{liked ? '\u2764\uFE0F' : '\u{1F90D}'}</Text>
        <Text className='like-btn__text'>{liked ? t('guideDetail.liked') : t('guideDetail.like')} {likeCount > 0 ? `(${likeCount})` : ''}</Text>
      </View>

      <View style={{ height: '60rpx' }} />
    </ScrollView>
  )
}
