import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { HolySite, Route, fetchHolySiteById, fetchRoutesBySite } from '../../lib/api'
import ReviewSection from '../../components/ReviewSection'
import './index.scss'

export default function HolySiteDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [site, setSite] = useState<any>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useShareAppMessage(() => ({
    title: site ? `${site.name} — 全球祖庭之旅` : '探索圣地 — 全球祖庭之旅',
    path: `/pages/holy-site-detail/index?id=${id}`,
    imageUrl: site?.imageUrl || '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: site ? `${site.name} | ${site.city}, ${site.country}` : '探索圣地',
    query: `id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useEffect(() => {
    if (id) loadData()
  }, [id])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [data, relatedRoutes] = await Promise.all([
        fetchHolySiteById(id!),
        fetchRoutesBySite(id!).catch(() => []),
      ])
      setSite(data)
      setRoutes(relatedRoutes)
    } catch (err) {
      console.error('Failed to load site:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const openLocation = () => {
    if (!site) return
    Taro.openLocation({
      latitude: site.latitude,
      longitude: site.longitude,
      name: site.name,
      address: `${site.city}, ${site.country}`
    })
  }

  if (loading) return <View className='container'><Text className='loading-text'>正在加载...</Text></View>
  if (error) return <View className='container'><Text className='empty-text'>{error}</Text><Text className='retry-btn' onClick={loadData}>点击重试</Text></View>
  if (!site) return <View className='container'><Text className='empty-text'>圣地不存在</Text></View>

  return (
    <ScrollView className='detail-page' scrollY>
      {/* Hero */}
      <View className='detail-hero'>
        {site.imageUrl ? (
          <Image className='detail-hero__image' src={site.imageUrl} mode='aspectFill' />
        ) : (
          <View className='detail-hero__image detail-hero__image--gradient' />
        )}
        <View className='detail-hero__overlay'>
          {site.religion && (
            <View className='detail-hero__badge'>
              <Text className='detail-hero__badge-text'>{site.religion.name}</Text>
            </View>
          )}
          <Text className='detail-hero__title'>{site.name}</Text>
          <Text className='detail-hero__subtitle'>{site.nameEn}</Text>
        </View>
      </View>

      {/* Info Grid */}
      <View className='info-grid'>
        <View className='info-grid__cell'>
          <Text className='info-grid__icon'>🌍</Text>
          <Text className='info-grid__label'>国家</Text>
          <Text className='info-grid__value'>{site.country}</Text>
        </View>
        {site.city && (
          <View className='info-grid__cell'>
            <Text className='info-grid__icon'>🏙</Text>
            <Text className='info-grid__label'>城市</Text>
            <Text className='info-grid__value'>{site.city}</Text>
          </View>
        )}
        <View className='info-grid__cell'>
          <Text className='info-grid__icon'>📍</Text>
          <Text className='info-grid__label'>坐标</Text>
          <Text className='info-grid__value'>{site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}</Text>
        </View>
        <View className='info-grid__cell'>
          <Text className='info-grid__icon'>🕐</Text>
          <Text className='info-grid__label'>时区</Text>
          <Text className='info-grid__value'>UTC{site.utcOffset >= 0 ? '+' : ''}{site.utcOffset}</Text>
        </View>
      </View>

      {/* Practical Info */}
      {(site.openingHours || site.ticketPrice || site.bestSeason || site.visitDuration || site.transport) && (
        <View className='section'>
          <Text className='section__title'>实用信息</Text>
          <View className='info-list'>
            {site.openingHours && <InfoRow icon='🕐' label='开放时间' value={site.openingHours} />}
            {site.ticketPrice && <InfoRow icon='🎫' label='门票' value={site.ticketPrice} />}
            {site.bestSeason && <InfoRow icon='☀️' label='最佳季节' value={site.bestSeason} />}
            {site.visitDuration && <InfoRow icon='⏱' label='建议游览' value={site.visitDuration} />}
            {site.transport && <InfoRow icon='🚌' label='交通' value={site.transport} />}
          </View>
        </View>
      )}

      {/* Description */}
      <View className='section'>
        <Text className='section__title'>介绍</Text>
        <View className='card'>
          <Text className='card__text'>{site.description}</Text>
        </View>
      </View>

      {/* Tips */}
      {Array.isArray(site.tips) && site.tips.length > 0 && (
        <View className='section'>
          <Text className='section__title'>旅行贴士</Text>
          <View className='card'>
            {site.tips.map((tip: string, i: number) => (
              <View key={i} className='tip-row'>
                <Text className='tip-row__icon'>✅</Text>
                <Text className='tip-row__text'>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Nearby */}
      {(site.nearbyFood || site.nearbyStay || site.nearbyExperience || site.nearbySights) && (
        <View className='section'>
          <Text className='section__title'>周边推荐</Text>
          <View className='info-list'>
            {site.nearbyFood && <InfoRow icon='🍜' label='美食' value={site.nearbyFood} />}
            {site.nearbyStay && <InfoRow icon='🏨' label='住宿' value={site.nearbyStay} />}
            {site.nearbyExperience && <InfoRow icon='✨' label='体验' value={site.nearbyExperience} />}
            {site.nearbySights && <InfoRow icon='👁' label='景点' value={site.nearbySights} />}
          </View>
        </View>
      )}

      {/* Related Routes */}
      {routes.length > 0 && (
        <View className='section'>
          <Text className='section__title'>经过此圣地的路线</Text>
          {routes.map(route => (
            <View
              key={route.id}
              className='route-row'
              onClick={() => Taro.navigateTo({ url: `/pages/route-detail/index?slug=${route.slug}` })}
            >
              {route.coverImage ? (
                <Image className='route-row__image' src={route.coverImage} mode='aspectFill' lazyLoad />
              ) : (
                <View className='route-row__image route-row__image--placeholder'>
                  <Text style={{ fontSize: '40rpx' }}>🗺</Text>
                </View>
              )}
              <View className='route-row__info'>
                <Text className='route-row__name'>{route.title}</Text>
                <Text className='route-row__sub'>{route.duration}天{route.nights}晚 · {route.subtitle}</Text>
                <Text className='route-row__price'>¥{(route.priceFrom / 100).toLocaleString()}/人起</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Reviews */}
      <View className='section'>
        <ReviewSection targetType='SITE' targetId={id!} />
      </View>

      {/* Map Action */}
      <View className='section'>
        <View className='map-action' onClick={openLocation}>
          <Text className='map-action__icon'>📍</Text>
          <Text className='map-action__text'>打开地图导航</Text>
        </View>
      </View>

      {/* CTA */}
      <View className='cta-row'>
        <View
          className='cta-row__btn'
          onClick={() => Taro.navigateTo({ url: '/pages/trips/index' })}
        >
          <Text className='cta-row__btn-text'>加入行程</Text>
        </View>
        <View
          className='cta-row__btn cta-row__btn--outline'
          onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
        >
          <Text className='cta-row__btn-text--outline'>AI规划</Text>
        </View>
      </View>

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className='info-list__row'>
      <Text className='info-list__icon'>{icon}</Text>
      <View className='info-list__content'>
        <Text className='info-list__label'>{label}</Text>
        <Text className='info-list__value'>{value}</Text>
      </View>
    </View>
  )
}
