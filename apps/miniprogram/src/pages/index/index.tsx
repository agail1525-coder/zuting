import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { Religion, Route, HolySite, fetchReligions, fetchFeaturedRoutes, fetchHolySites } from '../../lib/api'
import ReligionCard from '../../components/ReligionCard'
import HolySiteCard from '../../components/HolySiteCard'
import './index.scss'

const CATEGORY_ICONS = [
  { value: 'ZEN', icon: '\u{1F3EF}', label: '禅宗' },
  { value: 'BUDDHIST', icon: '\u2638', label: '佛教' },
  { value: 'TAOIST', icon: '\u262F', label: '道教' },
  { value: 'CHRISTIAN', icon: '\u26EA', label: '基督' },
  { value: 'ISLAMIC', icon: '\u{1F54C}', label: '丝路' },
  { value: 'CROSS_CULTURAL', icon: '\u{1F30F}', label: '跨文化' },
  { value: 'AI', icon: '\u{1F916}', label: 'AI规划' },
  { value: 'WIKI', icon: '\u{1F4D6}', label: '百科' },
]

const HOT_TAGS = ['#禅宗路线', '#耶路撒冷', '#丝绸之路', '#朝圣之旅']

export default function IndexPage() {
  const [religions, setReligions] = useState<Religion[]>([])
  const [featuredRoutes, setFeaturedRoutes] = useState<Route[]>([])
  const [featuredSites, setFeaturedSites] = useState<HolySite[]>([])
  const [loading, setLoading] = useState(true)

  useShareAppMessage(() => ({
    title: '走祖庭，看世界 — 全球文化旅行平台',
    path: '/pages/index/index',
    imageUrl: '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: '走祖庭，看世界 — 精选深度文化路线',
    imageUrl: '/assets/share-default.png',
  }))

  useDidShow(() => {
    loadData()
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const [religionList, routeList, siteList] = await Promise.all([
        fetchReligions(),
        fetchFeaturedRoutes(6),
        fetchHolySites()
      ])
      setReligions(religionList)
      setFeaturedRoutes(routeList)
      setFeaturedSites(siteList.slice(0, 4))
    } catch (err) {
      console.error('Failed to load data:', err)
      Taro.showToast({ title: '加载失败，请检查网络', icon: 'none', duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const navigateToRoutes = (category?: string) => {
    const url = category
      ? `/pages/routes/index?category=${category}`
      : '/pages/routes/index'
    Taro.navigateTo({ url })
  }

  return (
    <ScrollView className='index-page' scrollY>
      {/* Hero Section */}
      <View className='hero'>
        <View className='hero__glow' />
        <Text className='hero__title'>走祖庭，看世界</Text>
        <Text className='hero__subtitle'>探索全球文化圣地 · 深度旅行体验</Text>
      </View>

      {/* Search Entry */}
      <View
        className='search-entry'
        hoverClass='search-entry--hover'
        onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
      >
        <Text className='search-entry__icon'>&#x1F50D;</Text>
        <Text className='search-entry__text'>搜路线、查目的地...</Text>
      </View>

      {/* Hot Tags */}
      <ScrollView className='tags-scroll' scrollX>
        {HOT_TAGS.map(tag => (
          <Text
            key={tag}
            className='tag-chip'
            onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
          >
            {tag}
          </Text>
        ))}
      </ScrollView>

      {/* Category Icons */}
      <View className='category-grid'>
        {CATEGORY_ICONS.map(cat => (
          <View
            key={cat.value}
            className='category-item'
            hoverClass='category-item--hover'
            onClick={() => {
              if (cat.value === 'AI') {
                Taro.navigateTo({ url: '/pages/chat/index' })
              } else if (cat.value === 'WIKI') {
                Taro.navigateTo({ url: '/pages/religion-detail/index' })
              } else {
                navigateToRoutes(cat.value)
              }
            }}
          >
            <View className='category-item__icon'>
              <Text className='category-item__emoji'>{cat.icon}</Text>
            </View>
            <Text className='category-item__label'>{cat.label}</Text>
          </View>
        ))}
      </View>

      {/* Featured Routes */}
      <View className='section'>
        <View className='section__header'>
          <Text className='section-title'>精选路线</Text>
          <Text
            className='section__more'
            onClick={() => navigateToRoutes()}
          >
            查看全部 &gt;
          </Text>
        </View>
        <ScrollView className='route-scroll' scrollX>
          {featuredRoutes.map(route => (
            <View
              key={route.id}
              className='route-card'
              hoverClass='route-card--hover'
              onClick={() => Taro.navigateTo({ url: `/pages/route-detail/index?slug=${route.slug}` })}
            >
              <View className='route-card__image'>
                {route.coverImage ? (
                  <Image className='route-card__cover' src={route.coverImage} mode='aspectFill' lazyLoad />
                ) : (
                  <Text className='route-card__emoji'>
                    {route.category === 'ZEN' ? '\u{1F3EF}' : route.category === 'BUDDHIST' ? '\u2638' : route.category === 'TAOIST' ? '\u262F' : route.category === 'CHRISTIAN' ? '\u26EA' : route.category === 'ISLAMIC' ? '\u{1F54C}' : '\u{1F30F}'}
                  </Text>
                )}
                <View className='route-card__badge'>
                  <Text className='route-card__badge-text'>{route.duration}天{route.nights}晚</Text>
                </View>
              </View>
              <View className='route-card__body'>
                <Text className='route-card__title'>{route.title}</Text>
                <Text className='route-card__subtitle'>{route.subtitle}</Text>
                <View className='route-card__footer'>
                  <Text className='route-card__price'>¥{(route.priceFrom / 100).toLocaleString()}</Text>
                  {route.rating && (
                    <Text className='route-card__rating'>★ {route.rating.toFixed(1)}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* AI Planner Card */}
      <View
        className='ai-card'
        hoverClass='ai-card--hover'
        onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
      >
        <Text className='ai-card__icon'>{'\u{1F916}'}</Text>
        <View className='ai-card__content'>
          <Text className='ai-card__title'>AI旅行规划师</Text>
          <Text className='ai-card__desc'>帮你定制专属文化旅行路线</Text>
        </View>
        <Text className='ai-card__arrow'>&gt;</Text>
      </View>

      {/* Popular Destinations */}
      <View className='section'>
        <View className='section__header'>
          <Text className='section-title'>热门目的地</Text>
          <Text
            className='section__more'
            onClick={() => Taro.switchTab({ url: '/pages/holy-sites/index' })}
          >
            查看全部 &gt;
          </Text>
        </View>
        {featuredSites.map(site => (
          <HolySiteCard key={site.id} site={site} showReligion />
        ))}
      </View>

      {/* Cultural Traditions */}
      <View className='section'>
        <Text className='section-title'>文化百科</Text>
        <View className='religion-grid'>
          {religions.slice(0, 8).map(r => (
            <ReligionCard key={r.id} religion={r} />
          ))}
        </View>
      </View>

      {/* Stats */}
      <View className='stats'>
        <View className='stats__item'>
          <Text className='stats__number'>12</Text>
          <Text className='stats__label'>文化传统</Text>
        </View>
        <View className='stats__divider' />
        <View className='stats__item'>
          <Text className='stats__number'>60+</Text>
          <Text className='stats__label'>圣地</Text>
        </View>
        <View className='stats__divider' />
        <View className='stats__item'>
          <Text className='stats__number'>10+</Text>
          <Text className='stats__label'>路线</Text>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className='cta-section'>
        <Text className='cta-section__title'>开启你的文化之旅</Text>
        <Text className='cta-section__desc'>精选深度路线，探访全球文化圣地</Text>
        <View className='cta-section__buttons'>
          <View
            className='cta-section__btn'
            hoverClass='cta-section__btn--hover'
            onClick={() => navigateToRoutes()}
          >
            <Text className='cta-section__btn-text'>浏览路线</Text>
          </View>
          <View
            className='cta-section__btn cta-section__btn--outline'
            hoverClass='cta-section__btn--hover'
            onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
          >
            <Text className='cta-section__btn-text--outline'>AI帮你规划</Text>
          </View>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}
