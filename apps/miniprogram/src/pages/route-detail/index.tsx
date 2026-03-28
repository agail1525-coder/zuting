import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
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
      <View className='route-detail loading'>
        <Text className='loading__text'>加载中...</Text>
      </View>
    )
  }

  if (error || !route) {
    return (
      <View className='route-detail error'>
        <Text className='error__text'>路线不存在或加载失败</Text>
        <Text className='error__back' onClick={() => Taro.navigateBack()}>返回</Text>
      </View>
    )
  }

  const price = (route.priceFrom / 100).toLocaleString()

  return (
    <ScrollView className='route-detail' scrollY>
      {/* Hero */}
      <View className='hero'>
        <View className='hero__badges'>
          <Text className='hero__badge hero__badge--category'>
            {CATEGORY_LABELS[route.category] ?? route.category}
          </Text>
          <Text className='hero__badge hero__badge--difficulty'>
            {DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}
          </Text>
        </View>
        <Text className='hero__title'>{route.title}</Text>
        <Text className='hero__subtitle'>{route.subtitle}</Text>
        <Text className='hero__title-en'>{route.titleEn}</Text>
        <View className='hero__meta'>
          <Text className='hero__meta-item'>{'\u{1F4C5}'} {route.duration}天{route.nights}晚</Text>
          <Text className='hero__meta-item'>{'\u{1F324}'} {route.season}</Text>
          <Text className='hero__meta-item'>{'\u{1F465}'} {route.groupSize}</Text>
          {route.rating && (
            <Text className='hero__meta-item'>★ {route.rating.toFixed(1)} ({route.reviewCount}评)</Text>
          )}
        </View>
      </View>

      {/* Price Card */}
      <View className='price-card'>
        <Text className='price-card__label'>起价</Text>
        <Text className='price-card__value'>¥{price}<Text className='price-card__unit'>/人</Text></Text>
        <View
          className='price-card__btn'
          hoverClass='price-card__btn--hover'
          onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
        >
          <Text className='price-card__btn-text'>AI规划师咨询</Text>
        </View>
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
        <Text className='section__text'>{route.description}</Text>
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
              <Text className='day-card__meta'>{'\u{1F37D}'} {day.meals.join(' | ')}</Text>
            )}
            {day.accommodation && (
              <Text className='day-card__meta'>{'\u{1F3E8}'} {day.accommodation}</Text>
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
        <View className='tips-section'>
          <Text className='section__title'>出行贴士</Text>
          {route.tips.map((tip, i) => (
            <Text key={i} className='tip-item'>{'\u{1F4A1}'} {tip}</Text>
          ))}
        </View>
      )}

      {/* Bottom CTA */}
      <View
        className='bottom-cta'
        hoverClass='bottom-cta--hover'
        onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
      >
        <Text className='bottom-cta__text'>{'\u{1F916}'} 让AI规划师为你定制行程</Text>
      </View>

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}
