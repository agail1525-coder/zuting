import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Route, ItineraryDay, fetchRouteBySlug } from '../../lib/api'
import './index.scss'

const CATEGORY_LABELS: Record<string, string> = {
  ZEN: '禅宗路线',
  BUDDHIST: '佛教圣地',
  TAOIST: '道教寻根',
  CHRISTIAN: '基督文化',
  ISLAMIC: '伊斯兰文化',
  CROSS_CULTURAL: '跨文化融合',
  HINDU: '印度教',
  CULTURAL_HERITAGE: '文化遗产',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: '轻松',
  MODERATE: '适中',
  CHALLENGING: '挑战',
}

export default function RouteDetailPage() {
  const router = useRouter()
  const slug = router.params.slug as string
  const [route, setRoute] = useState<Route | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetchRouteBySlug(slug)
      .then(data => {
        setRoute(data)
        Taro.setNavigationBarTitle({ title: data.title })
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <View className='container'>
        <Text className='loading-text'>加载中...</Text>
      </View>
    )
  }

  if (error || !route) {
    return (
      <View className='container'>
        <Text className='empty-text'>路线不存在或加载失败</Text>
        <Text className='retry-btn' onClick={() => Taro.navigateBack()}>返回</Text>
      </View>
    )
  }

  const price = (route.priceFrom / 100).toLocaleString()

  return (
    <ScrollView className='detail-page' scrollY>
      {/* Hero with Cover Image */}
      <View className='detail-hero'>
        {route.coverImage ? (
          <Image className='detail-hero__image' src={route.coverImage} mode='aspectFill' />
        ) : (
          <View className='detail-hero__image detail-hero__image--gradient' />
        )}
        <View className='detail-hero__overlay'>
          <View className='detail-hero__badges'>
            <View className='detail-hero__badge'>
              <Text className='detail-hero__badge-text'>
                {CATEGORY_LABELS[route.category] ?? route.category}
              </Text>
            </View>
            <View className='detail-hero__badge'>
              <Text className='detail-hero__badge-text'>
                {DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}
              </Text>
            </View>
          </View>
          <Text className='detail-hero__title'>{route.title}</Text>
          <Text className='detail-hero__subtitle'>{route.subtitle}</Text>
          <View className='detail-hero__meta'>
            <Text className='detail-hero__meta-item'>📅 {route.duration}天{route.nights}晚</Text>
            <Text className='detail-hero__meta-item'>🌤 {route.season}</Text>
            <Text className='detail-hero__meta-item'>👥 {route.groupSize}</Text>
            {route.rating && (
              <Text className='detail-hero__meta-item'>★ {route.rating.toFixed(1)} ({route.reviewCount}评)</Text>
            )}
          </View>
        </View>
      </View>

      {/* Price Card */}
      <View className='price-card'>
        <Text className='price-card__label'>起价</Text>
        <Text className='price-card__value'>¥{price}<Text className='price-card__unit'>/人</Text></Text>
        <Text className='price-card__book-count'>已有 {route.bookCount} 人预订</Text>
      </View>

      {/* Highlights */}
      <View className='highlights'>
        {route.highlights.map(h => (
          <Text key={h} className='highlight-chip'>{h}</Text>
        ))}
      </View>

      {/* Description */}
      <View className='section'>
        <Text className='section__title'>路线介绍</Text>
        <View className='card'>
          <Text className='card__text'>{route.description}</Text>
        </View>
      </View>

      {/* Itinerary */}
      <View className='section'>
        <Text className='section__title'>逐日行程</Text>
        {(route.itinerary as ItineraryDay[]).map(day => (
          <View key={day.day} className='day-card'>
            <View className='day-card__header'>
              <View className='day-card__circle'>
                <Text className='day-card__number'>{day.day}</Text>
              </View>
              <Text className='day-card__title'>Day {day.day}: {day.title}</Text>
            </View>
            {day.activities && day.activities.length > 0 && (
              <View className='day-card__activities'>
                {day.activities.map((act, i) => (
                  <Text key={i} className='day-card__activity'>{act}</Text>
                ))}
              </View>
            )}
            {day.meals && day.meals.length > 0 && (
              <Text className='day-card__meta'>🍽 {day.meals.join(' | ')}</Text>
            )}
            {day.accommodation && (
              <Text className='day-card__meta'>🏨 {day.accommodation}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Included / Excluded */}
      <View className='section'>
        <Text className='section__title'>费用包含</Text>
        {route.included.map((item, i) => (
          <Text key={i} className='list-item list-item--included'>✓ {item}</Text>
        ))}
      </View>

      <View className='section'>
        <Text className='section__title'>费用不含</Text>
        {route.excluded.map((item, i) => (
          <Text key={i} className='list-item list-item--excluded'>✗ {item}</Text>
        ))}
      </View>

      {/* Tips */}
      {route.tips.length > 0 && (
        <View className='section'>
          <Text className='section__title'>出行贴士</Text>
          <View className='card'>
            {route.tips.map((tip, i) => (
              <View key={i} className='tip-row'>
                <Text className='tip-row__icon'>💡</Text>
                <Text className='tip-row__text'>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* CTA */}
      <View className='cta-row'>
        <View className='cta-row__btn' onClick={() => Taro.navigateTo({ url: '/pages/trips/index' })}>
          <Text className='cta-row__btn-text'>立即预订</Text>
        </View>
        <View className='cta-row__btn cta-row__btn--outline' onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}>
          <Text className='cta-row__btn-text--outline'>AI规划</Text>
        </View>
      </View>

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
