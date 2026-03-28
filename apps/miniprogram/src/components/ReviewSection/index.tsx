import { useEffect, useState } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import {
  Review, ReviewStats,
  fetchReviewStats, fetchReviews, createReview
} from '../../lib/api'
import './index.scss'

function Stars({ rating, interactive, onSelect }: {
  rating: number
  interactive?: boolean
  onSelect?: (star: number) => void
}) {
  return (
    <View className='stars-row'>
      {[1, 2, 3, 4, 5].map(star => (
        <Text
          key={star}
          className={`stars-row__star ${star <= Math.round(rating) ? 'stars-row__star--active' : ''} ${interactive ? 'stars-row__star--interactive' : ''}`}
          onClick={interactive ? () => onSelect?.(star) : undefined}
        >★</Text>
      ))}
    </View>
  )
}

function ReviewForm({ targetType, targetId, onSubmitted }: {
  targetType: string
  targetId: string
  onSubmitted: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!expanded) {
    return (
      <View className='expand-btn' onClick={() => setExpanded(true)}>
        <Text className='expand-btn__text'>✏️ 写评价</Text>
      </View>
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('请选择评分')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await createReview({
        targetType: targetType as 'TRIP' | 'GUIDE' | 'SITE',
        targetId,
        rating,
        content: content.trim() || undefined,
      })
      setRating(0)
      setContent('')
      setExpanded(false)
      onSubmitted()
    } catch (e) {
      setError('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='form-card'>
      <View className='form-card__row'>
        <Text className='form-card__label'>评分</Text>
        <Stars rating={rating} interactive onSelect={setRating} />
        {rating > 0 && <Text className='form-card__hint'>{rating}星</Text>}
      </View>
      <Textarea
        className='form-card__input'
        value={content}
        onInput={e => setContent(e.detail.value)}
        placeholder='分享你的朝圣体验...'
        placeholderClass='form-card__placeholder'
        maxlength={500}
      />
      {error && <Text className='form-card__error'>{error}</Text>}
      <View className='form-card__actions'>
        <Text className='form-card__cancel' onClick={() => setExpanded(false)}>取消</Text>
        <View
          className={`form-card__submit ${(submitting || rating === 0) ? 'form-card__submit--disabled' : ''}`}
          onClick={(!submitting && rating > 0) ? handleSubmit : undefined}
        >
          <Text className='form-card__submit-text'>{submitting ? '提交中...' : '提交评价'}</Text>
        </View>
      </View>
    </View>
  )
}

interface ReviewSectionProps {
  targetType: string
  targetId: string
}

export default function ReviewSection({ targetType, targetId }: ReviewSectionProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    if (!targetId) return
    setLoading(true)
    Promise.all([
      fetchReviewStats(targetType, targetId),
      fetchReviews(targetType, targetId, 5),
    ])
      .then(([statsData, reviewsData]) => {
        setStats(statsData)
        setReviews(reviewsData.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [targetType, targetId])

  if (loading) {
    return (
      <View className='review-section'>
        <Text className='review-section__title'>朝圣评价</Text>
        <Text className='review-section__loading'>加载评价中...</Text>
      </View>
    )
  }

  const isEmpty = !stats || stats.totalCount === 0

  return (
    <View className='review-section'>
      <Text className='review-section__title'>朝圣评价</Text>

      {isEmpty ? (
        <>
          <View className='review-section__empty'>
            <Text style={{ fontSize: '48rpx', marginBottom: '12rpx' }}>📝</Text>
            <Text className='review-section__empty-text'>暂无评价，来写第一条吧</Text>
          </View>
          <ReviewForm targetType={targetType} targetId={targetId} onSubmitted={loadData} />
        </>
      ) : (
        <>
          {/* Stats */}
          <View className='stats-card'>
            <View className='stats-card__left'>
              <Text className='stats-card__avg'>{stats!.averageRating.toFixed(1)}</Text>
              <Stars rating={stats!.averageRating} />
            </View>
            <View className='stats-card__right'>
              <Text className='stats-card__total'>{stats!.totalCount} 条评价</Text>
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats!.distribution[star] ?? 0
                const pct = stats!.totalCount > 0 ? (count / stats!.totalCount) * 100 : 0
                return (
                  <View key={star} className='stats-card__bar-row'>
                    <Text className='stats-card__bar-label'>{star}</Text>
                    <Text className='stats-card__bar-star'>★</Text>
                    <View className='stats-card__bar-bg'>
                      <View className='stats-card__bar-fill' style={{ width: `${pct}%` }} />
                    </View>
                    <Text className='stats-card__bar-count'>{count}</Text>
                  </View>
                )
              })}
            </View>
          </View>

          {/* Reviews */}
          {reviews.map(review => (
            <View key={review.id} className='review-card'>
              <View className='review-card__header'>
                <View className='review-card__avatar'>
                  <Text className='review-card__avatar-text'>
                    {(review.user.nickname ?? '匿').charAt(0)}
                  </Text>
                </View>
                <Text className='review-card__nickname'>{review.user.nickname ?? '匿名朝圣者'}</Text>
                <Text className='review-card__date'>{review.createdAt.slice(0, 10)}</Text>
              </View>
              <Stars rating={review.rating} />
              {review.content && <Text className='review-card__content'>{review.content}</Text>}
            </View>
          ))}

          <ReviewForm targetType={targetType} targetId={targetId} onSubmitted={loadData} />
        </>
      )}
    </View>
  )
}
