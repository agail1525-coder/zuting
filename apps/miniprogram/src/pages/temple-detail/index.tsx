import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { Temple, fetchTempleById, recordView } from '../../lib/api'
import ReviewSection from '../../components/ReviewSection'
import RelatedEntities from '../../components/RelatedEntities'
import SaveButton from '../../components/SaveButton'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function TempleDetailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.params
  const [temple, setTemple] = useState<Temple | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useShareAppMessage(() => ({
    title: temple ? `${temple.name} — ${t('templeDetail.shareTitle')}` : t('templeDetail.shareDefault'),
    path: `/pages/temple-detail/index?id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: temple ? `${temple.name} | ${temple.city}, ${temple.country}` : t('templeDetail.shareDefault'),
    query: `id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useEffect(() => {
    if (id) loadTemple()
  }, [id])

  const loadTemple = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTempleById(id!)
      setTemple(data)
      recordView('TEMPLE', id!)
    } catch (err) {
      console.error('Failed to load temple:', err)
      setError(t('templeDetail.networkError'))
    } finally {
      setLoading(false)
    }
  }

  const openLocation = () => {
    if (!temple) return
    Taro.openLocation({
      latitude: temple.latitude ?? 0,
      longitude: temple.longitude ?? 0,
      name: temple.name,
      address: `${temple.city}, ${temple.country}`
    })
  }

  if (loading) return <View className='container'><Text className='loading-text'>{t('common.loading')}</Text></View>
  if (error) return <View className='container'><Text className='empty-text'>{error}</Text><Text className='retry-btn' onClick={loadTemple}>{t('templeDetail.tapRetry')}</Text></View>
  if (!temple) return <View className='container'><Text className='empty-text'>{t('templeDetail.notFound')}</Text></View>

  const hasImage = !!temple.imageUrl

  return (
    <ScrollView className='detail-page' scrollY>
      {/* Hero */}
      <View className='detail-hero'>
        {hasImage ? (
          <Image className='detail-hero__image' src={temple.imageUrl!} mode='aspectFill' />
        ) : (
          <View className='detail-hero__image detail-hero__image--gradient' />
        )}
        <View className='detail-hero__overlay'>
          {temple.religion && (
            <View className='detail-hero__badge'>
              <Text className='detail-hero__badge-text'>{temple.religion.name}</Text>
            </View>
          )}
          <Text className='detail-hero__title'>{temple.name}</Text>
          <Text className='detail-hero__subtitle'>{temple.nameEn}</Text>
        </View>
        <View className='detail-hero__save'>
          <SaveButton entityType='TEMPLE' entityId={id!} size='small' />
        </View>
      </View>

      {/* Info Grid */}
      <View className='info-grid'>
        <View className='info-grid__cell'>
          <Text className='info-grid__icon'>🌍</Text>
          <Text className='info-grid__label'>{t('templeDetail.country')}</Text>
          <Text className='info-grid__value'>{temple.country}</Text>
        </View>
        {temple.city && (
          <View className='info-grid__cell'>
            <Text className='info-grid__icon'>🏙</Text>
            <Text className='info-grid__label'>{t('templeDetail.city')}</Text>
            <Text className='info-grid__value'>{temple.city}</Text>
          </View>
        )}
        {temple.foundingDate && (
          <View className='info-grid__cell'>
            <Text className='info-grid__icon'>📅</Text>
            <Text className='info-grid__label'>{t('templeDetail.founded')}</Text>
            <Text className='info-grid__value'>{temple.foundingDate}</Text>
          </View>
        )}
        <View className='info-grid__cell'>
          <Text className='info-grid__icon'>📍</Text>
          <Text className='info-grid__label'>{t('templeDetail.coordinates')}</Text>
          <Text className='info-grid__value'>{temple.latitude?.toFixed(4)}, {temple.longitude?.toFixed(4)}</Text>
        </View>
      </View>

      {/* Description */}
      <View className='section'>
        <Text className='section__title'>{t('templeDetail.description')}</Text>
        <View className='card'>
          <Text className='card__text'>{temple.description}</Text>
        </View>
      </View>

      {/* Reviews */}
      <View className='section'>
        <ReviewSection targetType='SITE' targetId={id!} />
      </View>

      {/* Related Entities */}
      <View className='section'>
        <RelatedEntities entityType='TEMPLE' entityId={id!} title={t('templeDetail.relatedTemples')} />
      </View>

      {/* Map Action */}
      <View className='section'>
        <View className='map-action' onClick={openLocation}>
          <Text className='map-action__icon'>📍</Text>
          <Text className='map-action__text'>{t('templeDetail.openMap')}</Text>
        </View>
      </View>

      {/* CTA */}
      <View className='cta-row'>
        <View className='cta-row__btn' onClick={() => Taro.navigateTo({ url: '/pages/trips/index' })}>
          <Text className='cta-row__btn-text'>{t('templeDetail.addToTrip')}</Text>
        </View>
        <View className='cta-row__btn cta-row__btn--outline' onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}>
          <Text className='cta-row__btn-text--outline'>{t('templeDetail.aiPlan')}</Text>
        </View>
      </View>

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
