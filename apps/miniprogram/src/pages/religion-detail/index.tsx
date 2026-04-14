import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import {
  Religion, HolySite, Temple, Patriarch, Teaching,
  fetchReligionBySlug, fetchReligionById, fetchHolySites, fetchTemples, fetchPatriarchs, fetchTeachings
} from '../../lib/api'
import HolySiteCard from '../../components/HolySiteCard'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function ReligionDetailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id, slug } = router.params
  const [religion, setReligion] = useState<Religion | null>(null)
  const [holySites, setHolySites] = useState<HolySite[]>([])
  const [temples, setTemples] = useState<Temple[]>([])
  const [patriarchs, setPatriarchs] = useState<Patriarch[]>([])
  const [teachings, setTeachings] = useState<Teaching[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!slug && !id) return
    try {
      setLoading(true)
      setError(false)
      const rel = id
        ? await fetchReligionById(id)
        : slug
          ? await fetchReligionBySlug(slug)
          : null
      setReligion(rel)
      const religionId = rel?.id || id
      if (religionId) {
        const [sites, tmps, pats, tchs] = await Promise.all([
          fetchHolySites(religionId),
          fetchTemples(religionId),
          fetchPatriarchs(religionId),
          fetchTeachings(religionId)
        ])
        setHolySites(sites)
        setTemples(tmps)
        setPatriarchs(pats)
        setTeachings(tchs)
      }
    } catch (err) {
      console.error('Failed to load religion detail:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className='container'>
        <Text className='loading-text'>{t('common.loading')}</Text>
      </View>
    )
  }

  if (error || !religion) {
    return (
      <View className='container' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80rpx 40rpx' }}>
        <Text style={{ fontSize: '32rpx', color: '#6B7280', marginBottom: '24rpx' }}>{error ? t('religionDetail.loadFailed') : t('religionDetail.notFound')}</Text>
        <View style={{ display: 'flex', flexDirection: 'row', gap: '24rpx' }}>
          <View
            hoverClass='card-hover'
            style={{ padding: '16rpx 48rpx', backgroundColor: '#3264ff', borderRadius: '12rpx' }}
            onClick={loadData}
          >
            <Text style={{ fontSize: '28rpx', color: '#FFFFFF' }}>{t('common.retry')}</Text>
          </View>
          <View
            hoverClass='card-hover'
            style={{ padding: '16rpx 48rpx', backgroundColor: '#F3F4F6', borderRadius: '12rpx' }}
            onClick={() => Taro.navigateBack()}
          >
            <Text style={{ fontSize: '28rpx', color: '#374151' }}>{t('religionDetail.goBack')}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className='religion-detail' scrollY>
      {/* Header */}
      {religion && (
        <View className='detail-header'>
          <Text className='detail-header__emoji'>{religion.emoji}</Text>
          <Text className='detail-header__name'>{religion.name}</Text>
          <Text className='detail-header__name-en'>{religion.nameEn}</Text>
          <Text className='detail-header__desc'>{religion.description}</Text>
          <View className='detail-header__meta'>
            {religion.foundedYear && (
              <View className='detail-header__tag'>
                <Text className='detail-header__tag-text'>{t('religionDetail.founded')}: {religion.foundedYear}</Text>
              </View>
            )}
            {religion.origin && (
              <View className='detail-header__tag'>
                <Text className='detail-header__tag-text'>{t('religionDetail.origin')}: {religion.origin}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Holy Sites */}
      {holySites.length > 0 && (
        <View className='detail-section'>
          <Text className='section-title'>{t('religionDetail.holySites')} ({holySites.length})</Text>
          {holySites.map(site => (
            <HolySiteCard key={site.id} site={site} />
          ))}
        </View>
      )}

      {/* Temples */}
      {temples.length > 0 && (
        <View className='detail-section'>
          <Text className='section-title'>{t('religionDetail.temples')} ({temples.length})</Text>
          {temples.map(temple => (
            <View
              key={temple.id}
              className='card'
              hoverClass='card-hover'
              onClick={() => Taro.navigateTo({ url: `/pages/temple-detail/index?id=${temple.id}` })}
            >
              <Text className='card__name'>{temple.name}</Text>
              <Text className='card__name-en'>{temple.nameEn}</Text>
              <View className='card__location'>
                <Text className='card__location-text'>{temple.city}, {temple.country}</Text>
              </View>
              {temple.description && (
                <Text className='card__desc'>
                  {temple.description.slice(0, 80)}{temple.description.length > 80 ? '...' : ''}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Patriarchs */}
      {patriarchs.length > 0 && (
        <View className='detail-section'>
          <Text className='section-title'>{t('religionDetail.patriarchs')} ({patriarchs.length})</Text>
          {patriarchs.map(p => (
            <View
              key={p.id}
              className='card'
              hoverClass='card-hover'
              onClick={() => Taro.navigateTo({ url: `/pages/patriarch-detail/index?id=${p.id}` })}
            >
              <Text className='card__name'>{p.name}</Text>
              <Text className='card__name-en'>{p.nameEn}</Text>
              {p.title && <Text className='card__subtitle'>{p.title}</Text>}
              {p.dates && <Text className='card__era'>{p.dates}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Teachings */}
      {teachings.length > 0 && (
        <View className='detail-section'>
          <Text className='section-title'>{t('religionDetail.teachings')} ({teachings.length})</Text>
          {teachings.map(tch => (
            <View key={tch.id} className='teaching-card'>
              <Text className='teaching-card__quote'>&ldquo;</Text>
              <Text className='teaching-card__content'>{tch.originalText}</Text>
              <Text className='teaching-card__source'>-- {tch.sourceText}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
