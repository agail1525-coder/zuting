import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { HolySite, Route, fetchHolySiteById, fetchRoutesBySite, recordView } from '../../lib/api'
import ReviewSection from '../../components/ReviewSection'
import RelatedEntities from '../../components/RelatedEntities'
import SaveButton from '../../components/SaveButton'
import MediaTour from '../../components/MediaTour'
import CrawlerVideos from '../../components/CrawlerVideos'
import TpPackages from '../../components/TpPackages'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function HolySiteDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const { t } = useTranslation()
  const [site, setSite] = useState<HolySite | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useShareAppMessage(() => ({
    title: site ? `${site.name} — ${t('holySiteDetail.shareTitle')}` : t('holySiteDetail.shareDefault'),
    path: `/pages/holy-site-detail/index?id=${id}`,
    imageUrl: site?.imageUrl || '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: site ? `${site.name} | ${site.city}, ${site.country}` : t('holySiteDetail.exploreHolySites'),
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
      recordView('HOLY_SITE', id!)
    } catch (err) {
      console.error('Failed to load site:', err)
      setError(t('holySiteDetail.networkError'))
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

  if (loading) return <View className='container'><Text className='loading-text'>{t('holySiteDetail.loading')}</Text></View>
  if (error) return <View className='container'><Text className='empty-text'>{error}</Text><Text className='retry-btn' onClick={loadData}>{t('holySiteDetail.tapRetry')}</Text></View>
  if (!site) return <View className='container'><Text className='empty-text'>{t('holySiteDetail.notFound')}</Text></View>

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
        <View className='detail-hero__save'>
          <SaveButton entityType='HOLY_SITE' entityId={id!} size='small' />
        </View>
      </View>

      {/* Info Grid */}
      <View className='info-grid'>
        <View className='info-grid__cell'>
          <Text className='info-grid__icon'>🌍</Text>
          <Text className='info-grid__label'>{t('holySiteDetail.country')}</Text>
          <Text className='info-grid__value'>{site.country}</Text>
        </View>
        {site.city && (
          <View className='info-grid__cell'>
            <Text className='info-grid__icon'>🏙</Text>
            <Text className='info-grid__label'>{t('holySiteDetail.city')}</Text>
            <Text className='info-grid__value'>{site.city}</Text>
          </View>
        )}
        <View className='info-grid__cell'>
          <Text className='info-grid__icon'>📍</Text>
          <Text className='info-grid__label'>{t('holySiteDetail.coordinates')}</Text>
          <Text className='info-grid__value'>{(site.latitude ?? 0).toFixed(4)}, {(site.longitude ?? 0).toFixed(4)}</Text>
        </View>
        <View className='info-grid__cell'>
          <Text className='info-grid__icon'>🕐</Text>
          <Text className='info-grid__label'>{t('holySiteDetail.timezone')}</Text>
          <Text className='info-grid__value'>UTC{(site.utcOffset ?? 0) >= 0 ? '+' : ''}{site.utcOffset ?? 0}</Text>
        </View>
      </View>

      {/* Practical Info */}
      {(site.openingHours || site.ticketPrice || site.bestSeason || site.visitDuration || site.transport) && (
        <View className='section'>
          <Text className='section__title'>{t('holySiteDetail.practicalInfo')}</Text>
          <View className='info-list'>
            {site.openingHours && <InfoRow icon='🕐' label={t('holySiteDetail.openHours')} value={site.openingHours} />}
            {site.ticketPrice && <InfoRow icon='🎫' label={t('holySiteDetail.ticketPrice')} value={site.ticketPrice} />}
            {site.bestSeason && <InfoRow icon='☀️' label={t('holySiteDetail.bestSeason')} value={site.bestSeason} />}
            {site.visitDuration && <InfoRow icon='⏱' label={t('holySiteDetail.visitDuration')} value={site.visitDuration} />}
            {site.transport && <InfoRow icon='🚌' label={t('holySiteDetail.transport')} value={site.transport} />}
          </View>
        </View>
      )}

      {/* Description */}
      <View className='section'>
        <Text className='section__title'>{t('holySiteDetail.description')}</Text>
        <View className='card'>
          <Text className='card__text'>{site.description}</Text>
        </View>
      </View>

      {/* Tips */}
      {Array.isArray(site.tips) && site.tips.length > 0 && (
        <View className='section'>
          <Text className='section__title'>{t('holySiteDetail.travelTips')}</Text>
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
          <Text className='section__title'>{t('holySiteDetail.nearbyRecommendations')}</Text>
          <View className='info-list'>
            {site.nearbyFood && <InfoRow icon='🍜' label={t('holySiteDetail.nearbyFood')} value={site.nearbyFood} />}
            {site.nearbyStay && <InfoRow icon='🏨' label={t('holySiteDetail.nearbyStay')} value={site.nearbyStay} />}
            {site.nearbyExperience && <InfoRow icon='✨' label={t('holySiteDetail.nearbyExperience')} value={site.nearbyExperience} />}
            {site.nearbySights && <InfoRow icon='👁' label={t('holySiteDetail.nearbySights')} value={site.nearbySights} />}
          </View>
        </View>
      )}

      {/* Related Routes */}
      {routes.length > 0 && (
        <View className='section'>
          <Text className='section__title'>{t('holySiteDetail.routesThroughSite')}</Text>
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
                <Text className='route-row__sub'>{t('holySiteDetail.routeDuration', { days: route.duration, nights: route.nights })} · {route.subtitle}</Text>
                <Text className='route-row__price'>{t('holySiteDetail.routePriceFrom', { price: ((route.priceFrom ?? 0) / 100).toLocaleString() })}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Multimedia Tour */}
      <MediaTour entityType='HOLY_SITE' entityId={id!} />

      {/* Crawler Videos (YouTube picks) */}
      <CrawlerVideos targetType='holySite' targetId={id!} />

      {/* TP++ Tiered Packages */}
      <TpPackages holySiteId={id!} />

      {/* Reviews */}
      <View className='section'>
        <ReviewSection targetType='SITE' targetId={id!} />
      </View>

      {/* Related Entities */}
      <View className='section'>
        <RelatedEntities entityType='HOLY_SITE' entityId={id!} title={t('holySiteDetail.nearbyHolySites')} />
      </View>

      {/* Map Action */}
      <View className='section'>
        <View className='map-action' onClick={openLocation}>
          <Text className='map-action__icon'>📍</Text>
          <Text className='map-action__text'>{t('holySiteDetail.openMap')}</Text>
        </View>
      </View>

      {/* CTA */}
      <View className='cta-row'>
        <View
          className='cta-row__btn'
          onClick={() => Taro.navigateTo({ url: '/pages/trips/index' })}
        >
          <Text className='cta-row__btn-text'>{t('holySiteDetail.addToTrip')}</Text>
        </View>
        <View
          className='cta-row__btn cta-row__btn--outline'
          onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}
        >
          <Text className='cta-row__btn-text--outline'>{t('holySiteDetail.aiPlan')}</Text>
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
