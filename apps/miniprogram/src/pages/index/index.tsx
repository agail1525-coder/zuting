import { useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import {
  Religion, Route, HolySite, Temple, Patriarch, RecommendedItem, GuideItem, PromotionItem, Journal,
  fetchReligions, fetchFeaturedRoutes, fetchHolySites, fetchTemples, fetchPatriarchs,
  fetchPopularItems, fetchTrending, fetchPromotions, fetchJournals,
} from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

/* ─── Constants ─── */

const SEARCH_TABS = [
  { key: 'sites', labelKey: 'home.searchTab.sites', icon: '📍' },
  { key: 'routes', labelKey: 'home.searchTab.routes', icon: '🗺' },
  { key: 'ai', labelKey: 'home.searchTab.ai', icon: '💬' },
  { key: 'wiki', labelKey: 'home.searchTab.wiki', icon: '📖' },
]

const CATEGORY_ICONS = [
  { value: 'ZEN', icon: '🍃', labelKey: 'home.category.zen' },
  { value: 'BUDDHIST', icon: '🪷', labelKey: 'home.category.buddhist' },
  { value: 'TAOIST', icon: '💧', labelKey: 'home.category.taoist' },
  { value: 'CHRISTIAN', icon: '🏠', labelKey: 'home.category.christian' },
  { value: 'ISLAMIC', icon: '🌙', labelKey: 'home.category.islamic' },
  { value: 'CROSS_CULTURAL', icon: '🌍', labelKey: 'home.category.crossCultural' },
  { value: 'HINDU', icon: '☀️', labelKey: 'home.category.hindu' },
  { value: 'CULTURAL_HERITAGE', icon: '📚', labelKey: 'home.category.heritage' },
]

const HOT_TAG_KEYS = [
  'home.hotTag.zenRoute',
  'home.hotTag.jerusalem',
  'home.hotTag.silkRoad',
  'home.hotTag.pilgrimage',
]

const PLATFORM_HIGHLIGHTS = [
  { icon: '🌏', titleKey: 'home.highlight.faiths', descKey: 'home.highlight.faithsDesc' },
  { icon: '📍', titleKey: 'home.highlight.sites', descKey: 'home.highlight.sitesDesc' },
  { icon: '💬', titleKey: 'home.highlight.aiPlanner', descKey: 'home.highlight.aiPlannerDesc' },
  { icon: '📝', titleKey: 'home.highlight.journal', descKey: 'home.highlight.journalDesc' },
]


const REC_TABS = [
  { key: 'temples', labelKey: 'home.recTab.temples' },
  { key: 'patriarchs', labelKey: 'home.recTab.patriarchs' },
  { key: 'sites', labelKey: 'home.recTab.sites' },
]

/* ─── Page ─── */

export default function IndexPage() {
  const { t, locale } = useTranslation()
  const [religions, setReligions] = useState<Religion[]>([])
  const [featuredRoutes, setFeaturedRoutes] = useState<Route[]>([])
  const [holySites, setHolySites] = useState<HolySite[]>([])
  const [temples, setTemples] = useState<Temple[]>([])
  const [patriarchs, setPatriarchs] = useState<Patriarch[]>([])
  const [popularItems, setPopularItems] = useState<RecommendedItem[]>([])
  const [trendingGuides, setTrendingGuides] = useState<GuideItem[]>([])
  const [activePromotions, setActivePromotions] = useState<PromotionItem[]>([])
  const [publicJournals, setPublicJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSearchTab, setActiveSearchTab] = useState('sites')
  const [activeRecTab, setActiveRecTab] = useState('temples')

  useShareAppMessage(() => ({
    title: t('home.shareTitle'),
    path: '/pages/index/index',
    imageUrl: '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: t('home.shareTimelineTitle'),
    imageUrl: '/assets/share-default.png',
  }))

  useDidShow(() => { loadData() })

  const loadData = async () => {
    try {
      setLoading(true)
      const [religionList, routeList, siteList, templeList, patriarchList, popularList, trendingData, promoData, journalsData] = await Promise.all([
        fetchReligions(),
        fetchFeaturedRoutes(6),
        fetchHolySites(),
        fetchTemples(),
        fetchPatriarchs(),
        fetchPopularItems(undefined, 8).catch((err) => { console.error('Load popular failed:', err); return [] as RecommendedItem[] }),
        fetchTrending().catch((err) => { console.error('Load trending failed:', err); return { hotGuides: [] as GuideItem[], hotQuestions: [] } }),
        fetchPromotions().catch((err) => { console.error('Load promotions failed:', err); return { data: [] as PromotionItem[], total: 0, page: 1, limit: 20 } }),
        fetchJournals({ isPublic: 'true', limit: '4' }).catch((err) => { console.error('Load journals failed:', err); return { items: [] as Journal[], total: 0, page: 1, limit: 4 } }),
      ])
      setReligions(religionList)
      setFeaturedRoutes(routeList)
      setHolySites(siteList)
      setTemples(templeList)
      setPatriarchs(patriarchList)
      setPopularItems(popularList)
      setTrendingGuides(Array.isArray(trendingData?.hotGuides) ? trendingData.hotGuides.slice(0, 3) : [])
      setActivePromotions(Array.isArray(promoData?.data) ? promoData.data.slice(0, 3) : [])
      setPublicJournals(Array.isArray(journalsData?.items) ? journalsData.items.slice(0, 4) : [])
    } catch (err) {
      console.error('Failed to load data:', err)
      Taro.showToast({ title: t('home.loadFailed'), icon: 'none', duration: 3000 })
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
    ? temples.slice(0, 6).map(tp => ({ id: tp.id, name: tp.name, sub: tp.country, image: tp.imageUrl }))
    : activeRecTab === 'patriarchs'
    ? patriarchs.slice(0, 6).map(p => ({ id: p.id, name: p.name, sub: p.dates, image: p.imageUrl }))
    : holySites.slice(0, 6).map(s => ({ id: s.id, name: s.name, sub: s.country, image: s.imageUrl }))

  if (!loading && religions.length === 0 && featuredRoutes.length === 0 && holySites.length === 0) {
    return (
      <View className='index-page' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '80rpx 40rpx' }}>
        <Text style={{ fontSize: '36rpx', marginBottom: '16rpx' }}>😔</Text>
        <Text style={{ fontSize: '30rpx', color: '#6B7280', marginBottom: '24rpx' }}>{t('home.noDataCheckNetwork')}</Text>
        <View
          hoverClass='card-hover'
          style={{ padding: '16rpx 48rpx', backgroundColor: '#3264ff', borderRadius: '12rpx' }}
          onClick={loadData}
        >
          <Text style={{ fontSize: '28rpx', color: '#FFFFFF' }}>{t('home.reload')}</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className='index-page' scrollY>
      {/* ── 1. Hero + Tab Search ── */}
      <View className='hero'>
        <Text className='hero__title'>{t('home.heroTitle')}</Text>
        <Text className='hero__subtitle'>{t('home.heroSubtitle')}</Text>

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
                  {t(tab.labelKey)}
                </Text>
              </View>
            ))}
          </View>
          <View
            className='search-card__input'
            onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
          >
            <Text className='search-card__input-icon'>🔍</Text>
            <Text className='search-card__input-text'>{t('home.searchPlaceholder')}</Text>
          </View>
        </View>

        {/* Hot Tags */}
        <ScrollView className='hero__tags' scrollX>
          {HOT_TAG_KEYS.map(tagKey => (
            <Text
              key={tagKey}
              className='hero__tag'
              onClick={() => Taro.navigateTo({ url: '/pages/search/index' })}
            >
              {t(tagKey)}
            </Text>
          ))}
        </ScrollView>

        <Text className='hero__trust'>{t('home.trustLine')}</Text>
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
            <Text className='category-card__label'>{t(cat.labelKey)}</Text>
          </View>
        ))}
      </View>

      {/* ── 2.5 Quick Actions (Coupon Entry) ── */}
      <View className='quick-actions'>
        <View
          className='quick-action-item'
          onClick={() => Taro.navigateTo({ url: '/pages/coupons/index' })}
        >
          <View className='quick-action-item__icon-wrap quick-action-item__icon-wrap--red'>
            <Text className='quick-action-item__icon'>🎫</Text>
          </View>
          <Text className='quick-action-item__label'>{t('home.quickAction.coupons')}</Text>
        </View>
        <View
          className='quick-action-item'
          onClick={() => Taro.navigateTo({ url: '/pages/promotions/index' })}
        >
          <View className='quick-action-item__icon-wrap quick-action-item__icon-wrap--orange'>
            <Text className='quick-action-item__icon'>⚡</Text>
          </View>
          <Text className='quick-action-item__label'>{t('home.quickAction.flashSale')}</Text>
        </View>
        <View
          className='quick-action-item'
          onClick={() => Taro.navigateTo({ url: '/pages/membership/index' })}
        >
          <View className='quick-action-item__icon-wrap quick-action-item__icon-wrap--purple'>
            <Text className='quick-action-item__icon'>👑</Text>
          </View>
          <Text className='quick-action-item__label'>{t('home.quickAction.membership')}</Text>
        </View>
        <View
          className='quick-action-item'
          onClick={() => Taro.navigateTo({ url: '/pages/packages/index' })}
        >
          <View className='quick-action-item__icon-wrap quick-action-item__icon-wrap--blue'>
            <Text className='quick-action-item__icon'>📦</Text>
          </View>
          <Text className='quick-action-item__label'>{t('home.quickAction.packages')}</Text>
        </View>
        <View
          className='quick-action-item'
          onClick={() => Taro.navigateTo({ url: '/pages/prices/index' })}
        >
          <View className='quick-action-item__icon-wrap quick-action-item__icon-wrap--green'>
            <Text className='quick-action-item__icon'>📊</Text>
          </View>
          <Text className='quick-action-item__label'>{t('home.quickAction.priceTools')}</Text>
        </View>
        <View
          className='quick-action-item'
          onClick={() => Taro.navigateTo({ url: '/pages/merchants/index' })}
        >
          <View className='quick-action-item__icon-wrap quick-action-item__icon-wrap--blue'>
            <Text className='quick-action-item__icon'>🏪</Text>
          </View>
          <Text className='quick-action-item__label'>{t('home.quickAction.merchants')}</Text>
        </View>
      </View>

      {/* ── 2.8 限时优惠 Section ── */}
      {activePromotions.length > 0 && (
        <>
          <View className='section-header'>
            <Text className='section-title'>{t('home.flashDeals')}</Text>
            <Text
              className='section-more'
              onClick={() => Taro.navigateTo({ url: '/pages/promotions/index' })}
            >
              {t('home.viewAll')} &gt;
            </Text>
          </View>
          <ScrollView className='promo-scroll' scrollX>
            {activePromotions.map(promo => {
              const accentColors: Record<string, string> = {
                FLASH_SALE: '#EF4444',
                EARLY_BIRD: '#F59E0B',
                LIMITED_TIME: '#8B5CF6',
              }
              const accent = accentColors[promo.type] || '#3264ff'
              const discountLabel = promo.discountType === 'PERCENT'
                ? t('home.promo.percentOff', { value: String(promo.discountValue) })
                : t('home.promo.amountOff', { value: String(promo.discountValue) })
              return (
                <View
                  key={promo.id}
                  className='promo-mini-card'
                  onClick={() => Taro.navigateTo({ url: '/pages/promotions/index' })}
                >
                  <View className='promo-mini-card__header' style={{ backgroundColor: accent }}>
                    <Text className='promo-mini-card__discount'>{discountLabel}</Text>
                    <Text className='promo-mini-card__type'>{promo.type === 'FLASH_SALE' ? t('home.promo.flashSale') : promo.type === 'EARLY_BIRD' ? t('home.promo.earlyBird') : t('home.promo.limitedTime')}</Text>
                  </View>
                  <View className='promo-mini-card__body'>
                    <Text className='promo-mini-card__name'>{promo.name}</Text>
                    {promo.totalQuota > 0 && (
                      <Text className='promo-mini-card__quota'>
                        {t('home.promo.remaining', { count: String(promo.totalQuota - promo.usedQuota) })}
                      </Text>
                    )}
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </>
      )}

      {/* ── 3. Platform Highlights ── */}
      <View className='section-header'>
        <Text className='section-title'>{t('home.whyChooseUs')}</Text>
      </View>
      <View className='highlight-grid'>
        {PLATFORM_HIGHLIGHTS.map(h => (
          <View key={h.titleKey} className='highlight-card'>
            <View className='highlight-card__icon'>
              <Text className='highlight-card__emoji'>{h.icon}</Text>
            </View>
            <Text className='highlight-card__title'>{t(h.titleKey)}</Text>
            <Text className='highlight-card__desc'>{t(h.descKey)}</Text>
            <Text className='highlight-card__cta'>{t('home.learnMore')} &gt;</Text>
          </View>
        ))}
      </View>

      {/* ── 4. Pilgrim Stories (from API: public journals) ── */}
      {publicJournals.length > 0 && (
        <>
          <View className='section-header'>
            <Text className='section-title'>{t('home.pilgrimStories')}</Text>
            <Text
              className='section-more'
              onClick={() => Taro.navigateTo({ url: '/pages/journals/index' })}
            >
              {t('home.viewAll')} &gt;
            </Text>
          </View>
          <ScrollView className='story-scroll' scrollX>
            {publicJournals.map(journal => {
              const firstImage = Array.isArray(journal.images) && journal.images.length > 0 ? journal.images[0] : null
              const authorName = journal.user?.nickname ?? t('home.anonymous')
              return (
                <View
                  key={journal.id}
                  className='story-card'
                  onClick={() => Taro.navigateTo({ url: `/pages/journal-detail/index?id=${journal.id}` })}
                >
                  {firstImage ? (
                    <Image className='story-card__image' src={firstImage} mode='aspectFill' lazyLoad />
                  ) : (
                    <View className='story-card__image story-card__image--placeholder'>
                      <Text className='story-card__placeholder-icon'>📝</Text>
                    </View>
                  )}
                  <View className='story-card__body'>
                    <View className='story-card__author'>
                      <View className='story-card__avatar'>
                        <Text className='story-card__avatar-text'>{authorName[0]}</Text>
                      </View>
                      <Text className='story-card__author-name'>{authorName}</Text>
                    </View>
                    <Text className='story-card__title'>{journal.title}</Text>
                    <Text className='story-card__excerpt'>{journal.content}</Text>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </>
      )}

      {/* ── 5. Featured Routes ── */}
      <View className='section-header'>
        <Text className='section-title'>{t('home.featuredRoutes')}</Text>
        <Text
          className='section-more'
          onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
        >
          {t('home.viewAll')} &gt;
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
                <Text className='route-card__badge-text'>{t('home.route.daysNights', { days: String(route.duration), nights: String(route.nights) })}</Text>
              </View>
              {route.rating && (
                <View className='route-card__rating'>
                  <Text className='route-card__rating-text'>★ {(route.rating ?? 0).toFixed(1)}</Text>
                </View>
              )}
            </View>
            <View className='route-card__body'>
              <Text className='route-card__title'>{route.title}</Text>
              <Text className='route-card__subtitle'>{route.subtitle}</Text>
              <View className='route-card__footer'>
                <Text className='route-card__price'>¥{((route.priceFrom ?? 0) / 100).toLocaleString(locale)}<Text className='route-card__price-unit'>{t('home.route.perPerson')}</Text></Text>
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
          <Text className='ai-banner__title'>{t('home.aiPlanner.title')}</Text>
          <Text className='ai-banner__desc'>{t('home.aiPlanner.desc')}</Text>
          <View className='ai-banner__btn'>
            <Text className='ai-banner__btn-text'>{t('home.aiPlanner.startChat')}</Text>
          </View>
        </View>
        <View className='ai-banner__chat'>
          <View className='ai-banner__bubble ai-banner__bubble--user'>
            <Text className='ai-banner__bubble-text'>{t('home.aiPlanner.sampleQuestion')}</Text>
          </View>
          <View className='ai-banner__bubble ai-banner__bubble--reply'>
            <Text className='ai-banner__bubble-text--reply'>{t('home.aiPlanner.sampleReply')}</Text>
          </View>
        </View>
      </View>

      {/* ── 7. Popular Destinations ── */}
      <View className='section-header'>
        <Text className='section-title'>{t('home.popularDestinations')}</Text>
        <Text
          className='section-more'
          onClick={() => Taro.switchTab({ url: '/pages/holy-sites/index' })}
        >
          {t('home.viewAll')} &gt;
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
        <Text className='section-title'>{t('home.hotRecommendations')}</Text>
      </View>
      <View className='rec-tabs'>
        {REC_TABS.map(tab => (
          <View
            key={tab.key}
            className={`rec-tabs__item ${activeRecTab === tab.key ? 'rec-tabs__item--active' : ''}`}
            onClick={() => setActiveRecTab(tab.key)}
          >
            <Text className={`rec-tabs__text ${activeRecTab === tab.key ? 'rec-tabs__text--active' : ''}`}>
              {t(tab.labelKey)}
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
            <Text className='section-title'>{t('home.platformPopular')}</Text>
            <Text
              className='section-more'
              onClick={() => Taro.navigateTo({ url: '/pages/holy-sites/index' })}
            >
              {t('home.viewAll')} &gt;
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

      {/* ── 9.5 Community Entry + Trending Guides ── */}
      <View className='section-header'>
        <Text className='section-title'>{t('home.community')}</Text>
        <Text
          className='section-more'
          onClick={() => Taro.navigateTo({ url: '/pages/community/index' })}
        >
          {t('home.viewAll')} &gt;
        </Text>
      </View>

      {/* Community Entry Card */}
      <View
        className='community-entry'
        onClick={() => Taro.navigateTo({ url: '/pages/community/index' })}
      >
        <View className='community-entry__item'>
          <Text className='community-entry__icon'>📖</Text>
          <Text className='community-entry__label'>{t('home.community.guides')}</Text>
        </View>
        <View className='community-entry__divider' />
        <View className='community-entry__item'>
          <Text className='community-entry__icon'>❓</Text>
          <Text className='community-entry__label'>{t('home.community.qa')}</Text>
        </View>
        <View className='community-entry__divider' />
        <View className='community-entry__item'>
          <Text className='community-entry__icon'>🏆</Text>
          <Text className='community-entry__label'>{t('home.community.rankings')}</Text>
        </View>
      </View>

      {/* Trending Guides */}
      {trendingGuides.length > 0 && (
        <>
          <View className='section-header'>
            <Text className='section-title'>{t('home.trendingGuides')}</Text>
            <Text
              className='section-more'
              onClick={() => Taro.navigateTo({ url: '/pages/community/index' })}
            >
              {t('home.more')} &gt;
            </Text>
          </View>
          <ScrollView className='trending-scroll' scrollX>
            {trendingGuides.map(guide => (
              <View
                key={guide.id}
                className='trending-card'
                onClick={() => Taro.navigateTo({ url: `/pages/guide-detail/index?id=${guide.id}` })}
              >
                {guide.coverImage ? (
                  <Image className='trending-card__cover' src={guide.coverImage} mode='aspectFill' lazyLoad />
                ) : (
                  <View className='trending-card__cover trending-card__cover--placeholder'>
                    <Text style={{ fontSize: '48rpx' }}>🏔</Text>
                  </View>
                )}
                <View className='trending-card__body'>
                  <Text className='trending-card__title'>{guide.title}</Text>
                  <View className='trending-card__meta'>
                    <Text className='trending-card__author'>{guide.user?.nickname || t('home.traveler')}</Text>
                    <Text className='trending-card__likes'>❤️ {guide.likeCount}</Text>
                  </View>
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
            <Text className='stats-card__label'>{t('home.stats.traditions')}</Text>
          </View>
          <View className='stats-card__item'>
            <Text className='stats-card__value'>60+</Text>
            <Text className='stats-card__label'>{t('home.stats.holySites')}</Text>
          </View>
          <View className='stats-card__item'>
            <Text className='stats-card__value'>27</Text>
            <Text className='stats-card__label'>{t('home.stats.temples')}</Text>
          </View>
          <View className='stats-card__item'>
            <Text className='stats-card__value'>50000+</Text>
            <Text className='stats-card__label'>{t('home.stats.travelers')}</Text>
          </View>
        </View>
      </View>

      <View className='cta-section'>
        <Text className='cta-section__title'>{t('home.cta.title')}</Text>
        <Text className='cta-section__desc'>{t('home.cta.desc')}</Text>
        <View className='cta-section__buttons'>
          <View
            className='cta-section__btn'
            hoverClass='cta-section__btn--hover'
            onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
          >
            <Text className='cta-section__btn-text'>{t('home.cta.browseRoutes')}</Text>
          </View>
          <View
            className='cta-section__btn cta-section__btn--outline'
            hoverClass='cta-section__btn--hover'
            onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
          >
            <Text className='cta-section__btn-text--outline'>{t('home.cta.aiPlan')}</Text>
          </View>
        </View>
      </View>

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}
