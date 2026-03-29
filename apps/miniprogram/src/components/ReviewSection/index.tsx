import { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  Review, ReviewStats,
  fetchReviewStats, fetchReviews, voteReview, unvoteReview,
} from '../../lib/api'
import StarRating from '../StarRating'
import './index.scss'

interface ReviewItemProps {
  review: Review
}

function ReviewItem({ review }: ReviewItemProps) {
  const [voted, setVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const [voting, setVoting] = useState(false)

  const handleVote = async () => {
    if (voting) return
    setVoting(true)
    try {
      if (voted) {
        await unvoteReview(review.id)
        setVoted(false)
        setVoteCount(c => Math.max(0, c - 1))
      } else {
        await voteReview(review.id)
        setVoted(true)
        setVoteCount(c => c + 1)
      }
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none', duration: 1500 })
    } finally {
      setVoting(false)
    }
  }

  return (
    <View className='review-card'>
      <View className='review-card__header'>
        <View className='review-card__avatar'>
          <Text className='review-card__avatar-text'>
            {(review.user.nickname ?? '匿').charAt(0)}
          </Text>
        </View>
        <Text className='review-card__nickname'>{review.user.nickname ?? '匿名朝圣者'}</Text>
        <Text className='review-card__date'>{review.createdAt.slice(0, 10)}</Text>
      </View>
      <StarRating value={review.rating} readonly size='small' />
      {review.content && <Text className='review-card__content'>{review.content}</Text>}
      <View className='review-card__footer'>
        <View
          className={`review-card__vote ${voted ? 'review-card__vote--active' : ''}`}
          onClick={handleVote}
        >
          <Text className='review-card__vote-icon'>{voted ? '👍' : '👍'}</Text>
          <Text className='review-card__vote-text'>{voted ? '已有用' : '有用'}</Text>
          {voteCount > 0 && <Text className='review-card__vote-count'>{voteCount}</Text>}
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
      fetchReviews(targetType, targetId, 3),
    ])
      .then(([statsData, reviewsData]) => {
        setStats(statsData)
        setReviews(reviewsData.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [targetType, targetId])

  const handleWriteReview = () => {
    Taro.navigateTo({
      url: `/pages/write-review/index?targetType=${targetType}&targetId=${targetId}`,
    })
  }

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
      <View className='review-section__header'>
        <Text className='review-section__title'>朝圣评价</Text>
        <View className='review-section__write-btn' onClick={handleWriteReview}>
          <Text className='review-section__write-text'>写评价</Text>
        </View>
      </View>

      {isEmpty ? (
        <View className='review-section__empty'>
          <Text style={{ fontSize: '48rpx', marginBottom: '12rpx' }}>📝</Text>
          <Text className='review-section__empty-text'>暂无评价，来写第一条吧</Text>
        </View>
      ) : (
        <>
          {/* Stats */}
          <View className='stats-card'>
            <View className='stats-card__left'>
              <Text className='stats-card__avg'>{stats!.averageRating.toFixed(1)}</Text>
              <StarRating value={stats!.averageRating} readonly size='small' />
              <Text className='stats-card__total'>{stats!.totalCount} 条</Text>
            </View>
            <View className='stats-card__right'>
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

          {/* Reviews — first 3 */}
          {reviews.map(review => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </>
      )}
    </View>
  )
}
