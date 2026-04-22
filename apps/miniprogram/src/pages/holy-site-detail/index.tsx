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

      {/* 目的地++ v1 · 四季开放时间 */}
      {site.openingHoursBySeason && <SeasonHoursPanel hours={site.openingHoursBySeason} />}

      {/* 目的地++ v1 · 交通接驳分段 */}
      {Array.isArray(site.transportLegs) && site.transportLegs.length > 0 && (
        <TransportLegsPanel legs={site.transportLegs} />
      )}

      {/* 目的地++ v1 · 参访贴士分组 */}
      {site.visitorTipsGrouped && <VisitorTipsGroupedPanel tips={site.visitorTipsGrouped} />}

      {/* 目的地++ v1 · 当地讲解师 */}
      {Array.isArray(site.localGuides) && site.localGuides.length > 0 && (
        <LocalGuidesPanel guides={site.localGuides} />
      )}

      {/* 目的地++ v1 · 文化周边 */}
      {Array.isArray(site.culturalProducts) && site.culturalProducts.length > 0 && (
        <CulturalProductsPanel products={site.culturalProducts} />
      )}

      {/* 目的地++ v1 · 画面故事 */}
      {Array.isArray(site.photoStory) && site.photoStory.length > 0 && (
        <PhotoStoryPanel story={site.photoStory} />
      )}

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

/* ═══════════════════════════════════════════════════════════
   目的地++ v1 · 6 Mini Panels (data-driven)
   ═══════════════════════════════════════════════════════════ */

const MODE_ICON_MINI: Record<string, string> = {
  FLIGHT: '✈', TRAIN: '🚄', RAIL: '🚆', CAR: '🚘',
  BUS: '🚌', WALK: '🚶', SHUTTLE: '🚐', CABLE: '🚡', BOAT: '⛵',
}

function TransportLegsPanel({ legs }: { legs: NonNullable<HolySite['transportLegs']> }) {
  return (
    <View className='section'>
      <Text className='section__title'>🚗 交通接驳</Text>
      {legs.map((leg, i) => (
        <View key={i} className='card' style={{ marginBottom: '12rpx' }}>
          <Text style={{ fontSize: '28rpx', fontWeight: 700, color: '#1A1A1A' }}>
            {MODE_ICON_MINI[(leg.mode || '').toUpperCase()] || '▶'} {leg.from} → {leg.to}
          </Text>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20rpx', marginTop: '8rpx' }}>
            {leg.distanceKm != null && <Text style={{ fontSize: '24rpx', color: '#6B7280' }}>约 {leg.distanceKm} km</Text>}
            {leg.durationMin != null && <Text style={{ fontSize: '24rpx', color: '#6B7280' }}>约 {Math.round(leg.durationMin / 60 * 10) / 10} h</Text>}
            {leg.costFrom != null && <Text style={{ fontSize: '24rpx', color: '#EF4444', fontWeight: 700 }}>¥{leg.costFrom}/人起</Text>}
          </View>
          {leg.note && <Text style={{ fontSize: '24rpx', color: '#6B7280', marginTop: '8rpx' }}>{leg.note}</Text>}
        </View>
      ))}
    </View>
  )
}

function CulturalProductsPanel({ products }: { products: NonNullable<HolySite['culturalProducts']> }) {
  return (
    <View className='section'>
      <Text className='section__title'>🎁 文化周边</Text>
      {products.map((p, i) => (
        <View key={i} className='card' style={{ marginBottom: '12rpx', backgroundColor: '#FFF9EC', borderColor: '#E8D69A' }}>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: '44rpx' }}>{p.emoji || '🎁'}</Text>
            {p.tag && <Text style={{ fontSize: '20rpx', color: '#8B6914', fontWeight: 600 }}>{p.tag}</Text>}
          </View>
          <Text style={{ fontSize: '28rpx', fontWeight: 700, color: '#1A1A1A', marginTop: '8rpx' }}>{p.name}</Text>
          <Text style={{ fontSize: '24rpx', color: '#6B7280', lineHeight: '36rpx', marginTop: '4rpx' }}>{p.desc}</Text>
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: '12rpx' }}>
            {p.localStore && <Text style={{ fontSize: '22rpx', color: '#6B7280' }}>📍 {p.localStore}</Text>}
            {p.priceFrom != null && <Text style={{ fontSize: '24rpx', color: '#EF4444', fontWeight: 700 }}>¥{p.priceFrom}起</Text>}
          </View>
        </View>
      ))}
    </View>
  )
}

const SEASON_META_MINI: Record<string, { label: string; icon: string }> = {
  spring: { label: '春季', icon: '🌸' },
  summer: { label: '夏季', icon: '☀' },
  autumn: { label: '秋季', icon: '🍁' },
  winter: { label: '冬季', icon: '❄' },
}

function SeasonHoursPanel({ hours }: { hours: NonNullable<HolySite['openingHoursBySeason']> }) {
  const entries = (['spring', 'summer', 'autumn', 'winter'] as const)
    .map((k) => ({ key: k, v: (hours as Record<string, { open?: string; close?: string; note?: string } | undefined>)[k] }))
    .filter((e) => e.v && (e.v.open || e.v.close || e.v.note))
  if (entries.length === 0) return null
  return (
    <View className='section'>
      <Text className='section__title'>🕐 四季开放</Text>
      {entries.map(({ key, v }) => {
        const meta = SEASON_META_MINI[key]
        return (
          <View key={key} className='card' style={{ marginBottom: '12rpx' }}>
            <Text style={{ fontSize: '28rpx', fontWeight: 700, color: '#1A1A1A' }}>
              {meta.icon} {meta.label}
            </Text>
            {(v?.open || v?.close) && (
              <Text style={{ fontSize: '28rpx', fontWeight: 600, color: '#3264ff', marginTop: '4rpx' }}>
                {v?.open || '—'}  ~  {v?.close || '—'}
              </Text>
            )}
            {v?.note && <Text style={{ fontSize: '22rpx', color: '#6B7280', marginTop: '4rpx' }}>{v.note}</Text>}
          </View>
        )
      })}
    </View>
  )
}

const TIP_META_MINI: Record<string, { label: string; icon: string }> = {
  transport: { label: '交通贴士', icon: '🚗' },
  dining: { label: '用餐贴士', icon: '🍲' },
  gear: { label: '装备贴士', icon: '🎒' },
  etiquette: { label: '礼仪贴士', icon: '🙏' },
}

function VisitorTipsGroupedPanel({ tips }: { tips: NonNullable<HolySite['visitorTipsGrouped']> }) {
  const groups = (['transport', 'dining', 'gear', 'etiquette'] as const)
    .map((k) => ({ key: k, list: (tips as Record<string, string[] | undefined>)[k] || [] }))
    .filter((g) => g.list.length > 0)
  if (groups.length === 0) return null
  return (
    <View className='section'>
      <Text className='section__title'>💡 参访贴士</Text>
      {groups.map((g) => {
        const meta = TIP_META_MINI[g.key]
        return (
          <View key={g.key} className='card' style={{ marginBottom: '12rpx' }}>
            <Text style={{ fontSize: '28rpx', fontWeight: 700, color: '#1A1A1A', marginBottom: '8rpx' }}>
              {meta.icon} {meta.label}
            </Text>
            {g.list.map((t, i) => (
              <View key={i} style={{ display: 'flex', flexDirection: 'row', marginBottom: '6rpx' }}>
                <Text style={{ color: '#3264ff', marginRight: '8rpx' }}>•</Text>
                <Text style={{ fontSize: '24rpx', color: '#6B7280', flex: 1 }}>{t}</Text>
              </View>
            ))}
          </View>
        )
      })}
    </View>
  )
}

function LocalGuidesPanel({ guides }: { guides: NonNullable<HolySite['localGuides']> }) {
  return (
    <View className='section'>
      <Text className='section__title'>👤 当地讲解师</Text>
      {guides.map((g, i) => (
        <View key={i} className='card' style={{ marginBottom: '12rpx' }}>
          <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '8rpx' }}>
            <View style={{ width: '72rpx', height: '72rpx', borderRadius: '36rpx', backgroundColor: '#3264ff', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '16rpx' }}>
              <Text style={{ color: '#FFFFFF', fontSize: '32rpx', fontWeight: 800 }}>{g.name?.[0] || '?'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '28rpx', fontWeight: 700, color: '#1A1A1A' }}>{g.name}</Text>
              <Text style={{ fontSize: '22rpx', color: '#6B7280', marginTop: '2rpx' }}>{g.specialty}</Text>
            </View>
            {g.rating != null && (
              <View style={{ backgroundColor: '#00b341', paddingLeft: '10rpx', paddingRight: '10rpx', paddingTop: '4rpx', paddingBottom: '4rpx', borderRadius: '6rpx' }}>
                <Text style={{ color: '#FFFFFF', fontSize: '20rpx', fontWeight: 800 }}>{g.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          {Array.isArray(g.languages) && g.languages.length > 0 && (
            <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8rpx', marginBottom: '8rpx' }}>
              {g.languages.map((lang, j) => (
                <View key={j} style={{ backgroundColor: '#EEF2FF', paddingLeft: '12rpx', paddingRight: '12rpx', paddingTop: '4rpx', paddingBottom: '4rpx', borderRadius: '999rpx' }}>
                  <Text style={{ fontSize: '20rpx', color: '#3264ff', fontWeight: 600 }}>{lang}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={{ fontSize: '24rpx', color: '#6B7280', lineHeight: '36rpx' }}>{g.bio}</Text>
        </View>
      ))}
    </View>
  )
}

function PhotoStoryPanel({ story }: { story: NonNullable<HolySite['photoStory']> }) {
  const sorted = [...story].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return (
    <View className='section'>
      <Text className='section__title'>📷 镜头之下</Text>
      {sorted.map((frame, i) => (
        <View key={i} className='card' style={{ marginBottom: '12rpx' }}>
          {frame.imageUrl && (
            <Image className='route-row__image' src={frame.imageUrl} mode='aspectFill' lazyLoad style={{ width: '100%', height: '320rpx', borderRadius: '12rpx', marginBottom: '12rpx' }} />
          )}
          <Text style={{ fontSize: '28rpx', fontWeight: 700, color: '#1A1A1A' }}>{frame.caption}</Text>
          {frame.shotLocation && <Text style={{ fontSize: '22rpx', color: '#6B7280', marginTop: '4rpx' }}>📍 {frame.shotLocation}</Text>}
          <Text style={{ fontSize: '24rpx', color: '#6B7280', marginTop: '8rpx', lineHeight: '36rpx' }}>{frame.significance}</Text>
        </View>
      ))}
    </View>
  )
}
