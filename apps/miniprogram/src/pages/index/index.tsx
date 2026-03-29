import { useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import {
  Religion, Route, HolySite, Temple, Patriarch, RecommendedItem,
  fetchReligions, fetchFeaturedRoutes, fetchHolySites, fetchTemples, fetchPatriarchs,
  fetchPopularItems,
} from '../../lib/api'
import './index.scss'

/* ─── Constants ─── */

const SEARCH_TABS = [
  { key: 'sites', label: '圣地', icon: '📍' },
  { key: 'routes', label: '路线', icon: '🗺' },
  { key: 'ai', label: 'AI', icon: '💬' },
  { key: 'wiki', label: '百科', icon: '📖' },
]

const CATEGORY_ICONS = [
  { value: 'ZEN', icon: '🍃', label: '禅宗' },
  { value: 'BUDDHIST', icon: '🪷', label: '佛教' },
  { value: 'TAOIST', icon: '💧', label: '道教' },
  { value: 'CHRISTIAN', icon: '🏠', label: '基督' },
  { value: 'ISLAMIC', icon: '🌙', label: '丝路' },
  { value: 'CROSS_CULTURAL', icon: '🌍', label: '跨文化' },
  { value: 'HINDU', icon: '☀️', label: '印度教' },
  { value: 'CULTURAL_HERITAGE', icon: '📚', label: '遗产' },
]

const HOT_TAGS = ['#禅宗路线', '#耶路撒冷', '#丝绸之路', '#朝圣之旅']

const PLATFORM_HIGHLIGHTS = [
  { icon: '🌏', title: '12大信仰', desc: '全球文化传统' },
  { icon: '📍', title: '60+圣地', desc: '精选目的地' },
  { icon: '💬', title: 'AI规划师', desc: '智能路线定制' },
  { icon: '📝', title: '朝圣日志', desc: '记录旅途故事' },
]

const PILGRIM_STORIES = [
  { siteName: '南华寺', author: '慧明', title: '六祖故里三日记', excerpt: '在南华寺的晨钟暮鼓中感悟禅意...' },
  { siteName: '耶路撒冷', author: 'David', title: '圣城朝圣之路', excerpt: '踏上这片古老的土地，感受千年信仰...' },
  { siteName: '武当山', author: '清风', title: '问道武当七日行', excerpt: '太极发源地的山水与道法自然...' },
  { siteName: '菩提伽耶', author: 'Ananda', title: '菩提树下的觉悟', excerpt: '佛陀成道之地，感受最纯粹的宁静...' },
]

const REC_TABS = [
  { key: 'temples', label: '祖庭' },
  { key: 'patriarchs', label: '祖师' },
  { key: 'sites', label: '圣地' },
]

/* ─── Page ─── */

export default function IndexPage() {
  const [religions, setReligions] = useState<Religion[]>([])
  const [featuredRoutes, setFeaturedRoutes] = useState<Route[]>([])
  const [holySites, setHolySites] = useState<HolySite[]>([])
  const [temples, setTemples] = useState<Temple[]>([])
  const [patriarchs, setPatriarchs] = useState<Patriarch[]>([])
  const [popularItems, setPopularItems] = useState<RecommendedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSearchTab, setActiveSearchTab] = useState('sites')
  const [activeRecTab, setActiveRecTab] = useState('temples')

  useShareAppMessage(() => ({
    title: '帮助100万人走祖庭 — 全球文化旅行平台',
    path: '/pages/index/index',
    imageUrl: '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: '帮助100万人走祖庭 — 精选深度文化路线',
    imageUrl: '/assets/share-default.png',
  }))

  useDidShow(() => { loadData() })

  const loadData = async () => {
    try {
      setLoading(true)
      const [religionList, routeList, siteList, templeList, patriarchList, popularList] = await Promise.all([
        fetchReligions(),
        fetchFeaturedRoutes(6),
        fetchHolySites(),
        fetchTemples(),
        fetchPatriarchs(),
        fetchPopularItems(undefined, 8).catch(() => [] as RecommendedItem[]),
      ])
      setReligions(religionList)
      setFeaturedRoutes(routeList)
      setHolySites(siteList)
      setTemples(templeList)
      setPatriarchs(patriarchList)
      setPopularItems(popularList)
    } catch (err) {
      console.error('Failed to load data:', err)
      Taro.showToast({ title: '加载失败，请检查网络', icon: 'none', duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const handleSearchTabPress = (key: string) => {
    setActiveSearchTab(key)
    if (key === 'ai') {
      Taro.navigateTo({ url: '/pages/chat/index' })
    } else {
      Taro.navigateTo({ url: '/pages/search/index' })
    }
  }

  const recData = activeRecTab === 'temples'
    ? temples.slice(0, 6).map(t => ({ id: t.id, name: t.name, sub: t.country, image: t.imageUrl }))
    : activeRecTab === 'patriarchs'
    ? patriarchs.slice(0, 6).map(p => ({ id: p.id, name: p.name, sub: p.dates, image: p.imageUrl }))
    : holySites.slice(0, 6).map(s => ({ id: s.id, name: s.name, sub: s.country, image: s.imageUrl }))

  return (
    <ScrollView className='index-page' scrollY>
      {/* ── 1. Hero + Tab Search ── */}
      <View className='hero'>
        <Text className='hero__title'>帮助100万人走祖庭</Text>
        <Text className='hero__subtitle'>探索全球60+文化圣地 · 深度旅行体验</Text>

        {/* Tab Search Card */}
        <View className='search-card'>
          <View className='search-card__tabs'>
            {SEARCH_TABS.map(tab => (
              <View
                key={tab.key}
                className={`search-card__tab ${activeSearchTab === tab.key ? 'search-card__tab--active' : ''}`}
                onClick={() => handleSearchTabPress(tab.key)}
              >
                <Text className='search-card__tab-icon'>{tab.icon}</Text>
                <Text className={`search-card__tab-text ${activeSearchTab === tab.key ? 'search-card__tab-text--active' : ''}`}>
                  {tab.label}
                </Text>
              </View>
            ))}
          </View>
          <View
            className='search-card__input'
            onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
          >
            <Text className='search-card__input-icon'>🔍</Text>
            <Text className='search-card__input-text'>搜路线、查目的地...</Text>
          </View>
        </View>

        {/* Hot Tags */}
        <ScrollView className='hero__tags' scrollX>
          {HOT_TAGS.map(tag => (
            <Text
              key={tag}
              className='hero__tag'
              onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
            >
              {tag}
            </Text>
          ))}
        </ScrollView>

        <Text className='hero__trust'>12大文化传统 · 60+圣地 · 专业路线规划 · AI旅行顾问</Text>
      </View>

      {/* ── 2. Category Icons ── */}
      <View className='category-card'>
        {CATEGORY_ICONS.map(cat => (
          <View
            key={cat.value}
            className='category-card__item'
            hoverClass='category-card__item--hover'
            onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
          >
            <View className='category-card__icon'>
              <Text className='category-card__emoji'>{cat.icon}</Text>
            </View>
            <Text className='category-card__label'>{cat.label}</Text>
          </View>
        ))}
      </View>

      {/* ── 3. Platform Highlights ── */}
      <View className='section-header'>
        <Text className='section-title'>为什么选择我们</Text>
      </View>
      <View className='highlight-grid'>
        {PLATFORM_HIGHLIGHTS.map(h => (
          <View key={h.title} className='highlight-card'>
            <View className='highlight-card__icon'>
              <Text className='highlight-card__emoji'>{h.icon}</Text>
            </View>
            <Text className='highlight-card__title'>{h.title}</Text>
            <Text className='highlight-card__desc'>{h.desc}</Text>
            <Text className='highlight-card__cta'>了解更多 &gt;</Text>
          </View>
        ))}
      </View>

      {/* ── 4. Pilgrim Stories ── */}
      <View className='section-header'>
        <Text className='section-title'>朝圣故事</Text>
        <Text
          className='section-more'
          onClick={() => Taro.navigateTo({ url: '/pages/journals/index' })}
        >
          查看全部 &gt;
        </Text>
      </View>
      <ScrollView className='story-scroll' scrollX>
        {PILGRIM_STORIES.map(story => {
          const matchedSite = holySites.find(s => s.name.includes(story.siteName))
          return (
            <View
              key={story.siteName}
              className='story-card'
              onClick={() => Taro.navigateTo({ url: '/pages/journals/index' })}
            >
              {matchedSite?.imageUrl ? (
                <Image className='story-card__image' src={matchedSite.imageUrl} mode='aspectFill' lazyLoad />
              ) : (
                <View className='story-card__image story-card__image--placeholder'>
                  <Text className='story-card__placeholder-icon'>🏔</Text>
                </View>
              )}
              <View className='story-card__body'>
                <View className='story-card__author'>
                  <View className='story-card__avatar'>
                    <Text className='story-card__avatar-text'>{story.author[0]}</Text>
                  </View>
                  <Text className='story-card__author-name'>{story.author}</Text>
                </View>
                <Text className='story-card__title'>{story.title}</Text>
                <Text className='story-card__excerpt'>{story.excerpt}</Text>
              </View>
            </View>
          )
        })}
      </ScrollView>

      {/* ── 5. Featured Routes ── */}
      <View className='section-header'>
        <Text className='section-title'>精选路线</Text>
        <Text
          className='section-more'
          onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
        >
          查看全部 &gt;
        </Text>
      </View>
      <ScrollView className='route-scroll' scrollX>
        {featuredRoutes.map(route => (
          <View
            key={route.id}
            className='route-card'
            onClick={() => Taro.navigateTo({ url: `/pages/route-detail/index?slug=${route.slug}` })}
          >
            <View className='route-card__image'>
              {route.coverImage ? (
                <Image className='route-card__cover' src={route.coverImage} mode='aspectFill' lazyLoad />
              ) : (
                <View className='route-card__image--placeholder'>
                  <Text className='route-card__placeholder-icon'>🗺</Text>
                </View>
              )}
              <View className='route-card__badge'>
                <Text className='route-card__badge-text'>{route.duration}天{route.nights}晚</Text>
              </View>
              {route.rating && (
                <View className='route-card__rating'>
                  <Text className='route-card__rating-text'>★ {route.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <View className='route-card__body'>
              <Text className='route-card__title'>{route.title}</Text>
              <Text className='route-card__subtitle'>{route.subtitle}</Text>
              <View className='route-card__footer'>
                <Text className='route-card__price'>¥{(route.priceFrom / 100).toLocaleString()}<Text className='route-card__price-unit'>/人起</Text></Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* ── 6. AI Planner Banner ── */}
      <View
        className='ai-banner'
        onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
      >
        <View className='ai-banner__content'>
          <Text className='ai-banner__title'>AI旅行规划师</Text>
          <Text className='ai-banner__desc'>告诉我你想去哪里，我来帮你规划完美的朝圣路线</Text>
          <View className='ai-banner__btn'>
            <Text className='ai-banner__btn-text'>开始对话 →</Text>
          </View>
        </View>
        <View className='ai-banner__chat'>
          <View className='ai-banner__bubble ai-banner__bubble--user'>
            <Text className='ai-banner__bubble-text'>推荐一条禅宗路线</Text>
          </View>
          <View className='ai-banner__bubble ai-banner__bubble--reply'>
            <Text className='ai-banner__bubble-text--reply'>为您推荐「禅宗祖庭巡礼」5天4晚...</Text>
          </View>
        </View>
      </View>

      {/* ── 7. Popular Destinations ── */}
      <View className='section-header'>
        <Text className='section-title'>热门目的地</Text>
        <Text
          className='section-more'
          onClick={() => Taro.switchTab({ url: '/pages/holy-sites/index' })}
        >
          查看全部 &gt;
        </Text>
      </View>
      <View className='dest-grid'>
        {holySites.slice(0, 4).map(site => (
          <View
            key={site.id}
            className='dest-card'
            onClick={() => Taro.navigateTo({ url: `/pages/holy-site-detail/index?id=${site.id}` })}
          >
            {site.imageUrl ? (
              <Image className='dest-card__image' src={site.imageUrl} mode='aspectFill' lazyLoad />
            ) : (
              <View className='dest-card__image dest-card__image--placeholder'>
                <Text style={{ fontSize: '48rpx' }}>🏔</Text>
              </View>
            )}
            <View className='dest-card__overlay'>
              <Text className='dest-card__name'>{site.name}</Text>
              <Text className='dest-card__country'>{site.country}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── 8. Recommendation Tabs ── */}
      <View className='section-header'>
        <Text className='section-title'>热门推荐</Text>
      </View>
      <View className='rec-tabs'>
        {REC_TABS.map(tab => (
          <View
            key={tab.key}
            className={`rec-tabs__item ${activeRecTab === tab.key ? 'rec-tabs__item--active' : ''}`}
            onClick={() => setActiveRecTab(tab.key)}
          >
            <Text className={`rec-tabs__text ${activeRecTab === tab.key ? 'rec-tabs__text--active' : ''}`}>
              {tab.label}
            </Text>
          </View>
        ))}
      </View>
      <View className='rec-grid'>
        {recData.map(item => (
          <View key={item.id} className='rec-card'>
            {item.image ? (
              <Image className='rec-card__image' src={item.image} mode='aspectFill' lazyLoad />
            ) : (
              <View className='rec-card__image rec-card__image--placeholder'>
                <Text style={{ fontSize: '40rpx' }}>🏛</Text>
              </View>
            )}
            <Text className='rec-card__name'>{item.name}</Text>
            <Text className='rec-card__sub'>{item.sub}</Text>
          </View>
        ))}
      </View>

      {/* ── 9. Popular Recommendations from API ── */}
      {popularItems.length > 0 && (
        <>
          <View className='section-header'>
            <Text className='section-title'>全平台热门</Text>
            <Text
              className='section-more'
              onClick={() => Taro.navigateTo({ url: '/pages/holy-sites/index' })}
            >
              查看全部 &gt;
            </Text>
          </View>
          <ScrollView className='popular-scroll' scrollX>
            {popularItems.map(item => (
              <View
                key={item.id}
                className='popular-card'
                onClick={() => {
                  const pageMap: Record<string, string> = {
                    HOLY_SITE: '/pages/holy-site-detail/index',
                    TEMPLE: '/pages/temple-detail/index',
                    PATRIARCH: '/pages/patriarch-detail/index',
                    ROUTE: '/pages/route-detail/index',
                  }
                  const page = pageMap[item.entityType]
                  if (page) {
                    const param = item.entityType === 'ROUTE' ? 'slug' : 'id'
                    Taro.navigateTo({ url: `${page}?${param}=${item.id}` })
                  }
                }}
              >
                {item.imageUrl ? (
                  <Image className='popular-card__image' src={item.imageUrl} mode='aspectFill' lazyLoad />
                ) : (
                  <View className='popular-card__image popular-card__image--placeholder'>
                    <Text style={{ fontSize: '44rpx' }}>🏛</Text>
                  </View>
                )}
                <View className='popular-card__overlay'>
                  <Text className='popular-card__name'>{item.title}</Text>
                  {item.religion && (
                    <Text className='popular-card__religion'>{item.religion}</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </>
      )}

      {/* ── 10. Stats + CTA ── */}
      <View className='stats-card'>
        <View className='stats-card__grid'>
          <View className='stats-card__item'>
            <Text className='stats-card__value'>12</Text>
            <Text className='stats-card__label'>文化传统</Text>
          </View>
          <View className='stats-card__item'>
            <Text className='stats-card__value'>60+</Text>
            <Text className='stats-card__label'>圣地</Text>
          </View>
          <View className='stats-card__item'>
            <Text className='stats-card__value'>27</Text>
            <Text className='stats-card__label'>祖庭</Text>
          </View>
          <View className='stats-card__item'>
            <Text className='stats-card__value'>50000+</Text>
            <Text className='stats-card__label'>旅行者</Text>
          </View>
        </View>
      </View>

      <View className='cta-section'>
        <Text className='cta-section__title'>开启你的文化之旅</Text>
        <Text className='cta-section__desc'>精选深度路线，探访全球文化圣地</Text>
        <View className='cta-section__buttons'>
          <View
            className='cta-section__btn'
            hoverClass='cta-section__btn--hover'
            onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
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

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}
