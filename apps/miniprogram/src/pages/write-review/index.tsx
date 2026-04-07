import { useState } from 'react'
import { View, Text, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { createReview } from '../../lib/api'
import StarRating from '../../components/StarRating'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function WriteReviewPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { targetType, targetId } = router.params

  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const targetLabels: Record<string, string> = {
    SITE: t('writeReview.targetSite'),
    TEMPLE: t('writeReview.targetTemple'),
    TRIP: t('writeReview.targetTrip'),
    GUIDE: t('writeReview.targetGuide'),
  }
  const label = targetType ? (targetLabels[targetType] ?? targetType) : ''

  const canSubmit = rating > 0 && content.trim().length >= 10 && !submitting

  const ratingHints = ['', t('writeReview.ratingVeryBad'), t('writeReview.ratingBad'), t('writeReview.ratingAverage'), t('writeReview.ratingGood'), t('writeReview.ratingExcellent')]

  const handleSubmit = async () => {
    if (!canSubmit) return
    if (!targetType || !targetId) {
      Taro.showToast({ title: t('writeReview.paramError'), icon: 'none' })
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
      Taro.showToast({ title: t('writeReview.submitSuccess'), icon: 'success', duration: 1500 })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch {
      Taro.showToast({ title: t('writeReview.submitFailed'), icon: 'none', duration: 2000 })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className='write-review-page'>
      {/* Header */}
      <View className='wr-header'>
        <Text className='wr-header__title'>{t('writeReview.title')}</Text>
        {label ? <Text className='wr-header__sub'>{t('writeReview.reviewTarget', { target: label })}</Text> : null}
      </View>

      {/* Rating */}
      <View className='wr-section'>
        <Text className='wr-section__label'>{t('writeReview.labelRating')}</Text>
        <View className='wr-section__stars'>
          <StarRating value={rating} onChange={setRating} size='large' />
          {rating > 0 && (
            <Text className='wr-section__rating-hint'>
              {ratingHints[rating]}
            </Text>
          )}
        </View>
      </View>

      {/* Content */}
      <View className='wr-section'>
        <Text className='wr-section__label'>{t('writeReview.labelContent')} <Text className='wr-section__required'>{t('writeReview.minChars')}</Text></Text>
        <Textarea
          className='wr-textarea'
          value={content}
          onInput={e => setContent(e.detail.value)}
          placeholder={t('writeReview.contentPlaceholder')}
          placeholderClass='wr-textarea__placeholder'
          maxlength={500}
          autoHeight
        />
        <Text className='wr-count'>{content.length}/500</Text>
      </View>

      {/* Hint */}
      {content.trim().length > 0 && content.trim().length < 10 && (
        <Text className='wr-hint'>{t('writeReview.moreCharsNeeded', { count: 10 - content.trim().length })}</Text>
      )}

      {/* Submit */}
      <View
        className={`wr-submit ${!canSubmit ? 'wr-submit--disabled' : ''}`}
        onClick={handleSubmit}
      >
        <Text className='wr-submit__text'>{submitting ? t('writeReview.submitting') : t('writeReview.submit')}</Text>
      </View>
    </View>
  )
}
