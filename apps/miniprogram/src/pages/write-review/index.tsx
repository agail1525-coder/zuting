import { useState } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { createReview } from '../../lib/api'
import StarRating from '../../components/StarRating'
import './index.scss'

export default function WriteReviewPage() {
  const router = useRouter()
  const { targetType, targetId } = router.params

  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const targetLabels: Record<string, string> = {
    SITE: '圣地',
    TEMPLE: '祖庭',
    TRIP: '行程',
    GUIDE: '导游',
  }
  const label = targetType ? (targetLabels[targetType] ?? targetType) : ''

  const canSubmit = rating > 0 && content.trim().length >= 10 && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    if (!targetType || !targetId) {
      Taro.showToast({ title: '参数错误', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await createReview({
        targetType: targetType as 'TRIP' | 'GUIDE' | 'SITE',
        targetId,
        rating,
        content: content.trim(),
      })
      Taro.showToast({ title: '评价成功', icon: 'success', duration: 1500 })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none', duration: 2000 })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='write-review-page'>
      {/* Header */}
      <View className='wr-header'>
        <Text className='wr-header__title'>写评价</Text>
        {label ? <Text className='wr-header__sub'>评价{label}</Text> : null}
      </View>

      {/* Rating */}
      <View className='wr-section'>
        <Text className='wr-section__label'>评分</Text>
        <View className='wr-section__stars'>
          <StarRating value={rating} onChange={setRating} size='large' />
          {rating > 0 && (
            <Text className='wr-section__rating-hint'>
              {['', '非常差', '较差', '一般', '不错', '非常好'][rating]}
            </Text>
          )}
        </View>
      </View>

      {/* Content */}
      <View className='wr-section'>
        <Text className='wr-section__label'>评价内容 <Text className='wr-section__required'>（至少10字）</Text></Text>
        <Textarea
          className='wr-textarea'
          value={content}
          onInput={e => setContent(e.detail.value)}
          placeholder='分享你的朝圣体验，帮助更多朝圣者...'
          placeholderClass='wr-textarea__placeholder'
          maxlength={500}
          autoHeight
        />
        <Text className='wr-count'>{content.length}/500</Text>
      </View>

      {/* Hint */}
      {content.trim().length > 0 && content.trim().length < 10 && (
        <Text className='wr-hint'>还需补充 {10 - content.trim().length} 字</Text>
      )}

      {/* Submit */}
      <View
        className={`wr-submit ${!canSubmit ? 'wr-submit--disabled' : ''}`}
        onClick={handleSubmit}
      >
        <Text className='wr-submit__text'>{submitting ? '提交中...' : '提交评价'}</Text>
      </View>
    </View>
  )
}
