import { useEffect, useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { Seal, fetchSealById, fetchSeals } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const SERIES_COLORS: Record<string, string> = {
  '初印系': '#6366F1',
  '中印系': '#8B5CF6',
  '印果印': '#EC4899',
  '成道印': '#F59E0B',
  '归源印': '#22C55E',
}

const SERIES_ORDER = ['初印系', '中印系', '印果印', '成道印', '归源印']

export default function SealDetailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.params
  const [seal, setSeal] = useState<Seal | null>(null)
  const [allSeals, setAllSeals] = useState<Seal[]>([])
  const [loading, setLoading] = useState(true)

  // Curated editorial content: general practice guidance applicable to all seals.
  const PRACTICE_TIPS = [
    { icon: '🧘', title: t('sealDetail.tipMeditation'), desc: t('sealDetail.tipMeditationDesc') },
    { icon: '📖', title: t('sealDetail.tipRecitation'), desc: t('sealDetail.tipRecitationDesc') },
    { icon: '📝', title: t('sealDetail.tipJournal'), desc: t('sealDetail.tipJournalDesc') },
    { icon: '🤝', title: t('sealDetail.tipSharing'), desc: t('sealDetail.tipSharingDesc') },
  ]

  useShareAppMessage(() => ({
    title: seal ? `${seal.name} (${seal.series}) — ${t('sealDetail.shareTitle')}` : t('sealDetail.shareDefault'),
    path: `/pages/seal-detail/index?id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useShareTimeline(() => ({
    title: seal ? `${t('sealDetail.sealNumber')}${seal.id} ${seal.name} | ${seal.series}` : t('sealDetail.shareDefault'),
    query: `id=${id}`,
    imageUrl: '/assets/share-default.png',
  }))

  useEffect(() => {
    if (id) {
      loadSeal()
      loadAllSeals()
    }
  }, [id])

  const loadSeal = async () => {
    try {
      setLoading(true)
      const data = await fetchSealById(id!)
      setSeal(data)
    } catch (err) {
      console.error('Failed to load seal:', err)
      Taro.showToast({ title: t('sealDetail.loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const loadAllSeals = async () => {
    try {
      const data = await fetchSeals()
      setAllSeals(data)
    } catch {
      // non-critical, series progress just won't show
    }
  }

  // --- G4: Series progress ---
  const seriesProgress = useMemo(() => {
    if (!seal || allSeals.length === 0) return null
    const sameSeriesSeals = allSeals.filter(s => s.series === seal.series).sort((a, b) => a.id - b.id)
    const totalInSeries = sameSeriesSeals.length
    const positionInSeries = sameSeriesSeals.findIndex(s => s.id === seal.id) + 1
    const seriesIdx = SERIES_ORDER.indexOf(seal.series)
    const totalSeals = allSeals.length
    const overallPosition = allSeals.sort((a, b) => a.id - b.id).findIndex(s => s.id === seal.id) + 1
    return { totalInSeries, positionInSeries, seriesIdx, totalSeals, overallPosition }
  }, [seal, allSeals])

  // --- G4: Related seals in same series ---
  const relatedSeals = useMemo(() => {
    if (!seal || allSeals.length === 0) return []
    return allSeals
      .filter(s => s.series === seal.series && s.id !== seal.id)
      .sort((a, b) => a.id - b.id)
      .slice(0, 4)
  }, [seal, allSeals])

  if (loading) return <View className='container'><Text className='loading-text'>{t('common.loading')}</Text></View>
  if (!seal) return <View className='container'><Text className='empty-text'>{t('sealDetail.notFound')}</Text></View>

  const seriesColor = SERIES_COLORS[seal.series] || '#0066FF'

  return (
    <ScrollView className='detail-page' scrollY>
      {/* Hero with series gradient */}
      <View className='seal-hero' style={{ background: `linear-gradient(135deg, ${seriesColor}, #003D99)` }}>
        <View className='seal-hero__overlay'>
          <View className='seal-hero__number'>
            <Text className='seal-hero__number-text'>{seal.id}</Text>
          </View>
          <Text className='seal-hero__title'>{seal.name}</Text>
          <Text className='seal-hero__subtitle'>{seal.series}</Text>
          <View className='seal-hero__series'>
            <View className='seal-hero__series-dot' />
            <Text className='seal-hero__series-text'>{seal.series}</Text>
          </View>
        </View>
      </View>

      {/* G4: Series Progress Section */}
      {seriesProgress && (
        <View style={{ margin: '20rpx 24rpx 0', backgroundColor: '#1E293B', borderRadius: '16rpx', padding: '24rpx' }}>
          <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#F8FAFC', marginBottom: '16rpx' }}>{t('sealDetail.practiceProgress')}</Text>

          {/* Overall position */}
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '12rpx' }}>
            <Text style={{ fontSize: '24rpx', color: '#94A3B8' }}>{t('sealDetail.overallProgress')}</Text>
            <Text style={{ fontSize: '24rpx', color: '#D4A855' }}>{t('sealDetail.sealPosition', { position: seriesProgress.overallPosition, total: seriesProgress.totalSeals })}</Text>
          </View>
          <View style={{ height: '10rpx', backgroundColor: '#334155', borderRadius: '5rpx', overflow: 'hidden', marginBottom: '20rpx' }}>
            <View style={{ height: '100%', width: `${(seriesProgress.overallPosition / seriesProgress.totalSeals) * 100}%`, backgroundColor: '#D4A855', borderRadius: '5rpx' }} />
          </View>

          {/* Series position */}
          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '12rpx' }}>
            <Text style={{ fontSize: '24rpx', color: '#94A3B8' }}>{t('sealDetail.seriesProgress', { series: seal.series })}</Text>
            <Text style={{ fontSize: '24rpx', color: seriesColor }}>{t('sealDetail.sealPosition', { position: seriesProgress.positionInSeries, total: seriesProgress.totalInSeries })}</Text>
          </View>
          <View style={{ height: '10rpx', backgroundColor: '#334155', borderRadius: '5rpx', overflow: 'hidden', marginBottom: '16rpx' }}>
            <View style={{ height: '100%', width: `${(seriesProgress.positionInSeries / seriesProgress.totalInSeries) * 100}%`, backgroundColor: seriesColor, borderRadius: '5rpx' }} />
          </View>

          {/* Series dots */}
          <View style={{ display: 'flex', flexDirection: 'row', gap: '8rpx', flexWrap: 'wrap' }}>
            {SERIES_ORDER.map(s => {
              const isActive = s === seal.series
              const color = SERIES_COLORS[s] || '#64748B'
              return (
                <View key={s} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4rpx', marginRight: '12rpx' }}>
                  <View style={{ width: '12rpx', height: '12rpx', borderRadius: '6rpx', backgroundColor: isActive ? color : '#475569' }} />
                  <Text style={{ fontSize: '20rpx', color: isActive ? color : '#64748B' }}>{s}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )}

      {/* Poem/Verse */}
      {seal.poem && (
        <View className='section'>
          <Text className='section__title'>{t('sealDetail.poem')}</Text>
          <View className='poem-card'>
            <Text className='poem-card__text'>{seal.poem}</Text>
          </View>
        </View>
      )}

      {/* Essence/Meaning */}
      {seal.essence && (
        <View className='section'>
          <Text className='section__title'>{t('sealDetail.essence')}</Text>
          <View className='card'>
            <Text className='card__text'>{seal.essence}</Text>
          </View>
        </View>
      )}

      {/* Practice */}
      {seal.practice && (
        <View className='section'>
          <Text className='section__title'>{t('sealDetail.practiceMethod')}</Text>
          <View className='card'>
            <Text className='card__text'>{seal.practice}</Text>
          </View>
        </View>
      )}

      {/* Vow */}
      {seal.vow && (
        <View className='section'>
          <Text className='section__title'>{t('sealDetail.vow')}</Text>
          <View className='vow-card' style={{ borderLeftColor: seriesColor }}>
            <Text className='vow-card__text'>{seal.vow}</Text>
          </View>
        </View>
      )}

      {/* G4: Practice/Contemplation Tips */}
      <View style={{ margin: '20rpx 24rpx 0', backgroundColor: '#1E293B', borderRadius: '16rpx', padding: '24rpx' }}>
        <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#F8FAFC', marginBottom: '16rpx' }}>{t('sealDetail.practiceTips')}</Text>
        {PRACTICE_TIPS.map(tip => (
          <View key={tip.title} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '16rpx', marginBottom: '20rpx' }}>
            <View style={{ width: '56rpx', height: '56rpx', borderRadius: '12rpx', backgroundColor: `${seriesColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Text style={{ fontSize: '28rpx' }}>{tip.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '26rpx', fontWeight: '600', color: '#E2E8F0' }}>{tip.title}</Text>
              <Text style={{ fontSize: '22rpx', color: '#94A3B8', marginTop: '4rpx' }}>{tip.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* G4: Related Seals */}
      {relatedSeals.length > 0 && (
        <View style={{ margin: '20rpx 24rpx 0' }}>
          <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#F8FAFC', marginBottom: '16rpx' }}>{t('sealDetail.relatedSeals')}</Text>
          <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
            <View style={{ display: 'inline-flex', flexDirection: 'row', gap: '16rpx' }}>
              {relatedSeals.map(rs => (
                <View
                  key={rs.id}
                  style={{ width: '200rpx', backgroundColor: '#1E293B', borderRadius: '12rpx', padding: '20rpx', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}
                  onClick={() => Taro.redirectTo({ url: `/pages/seal-detail/index?id=${rs.id}` })}
                >
                  <View style={{ width: '60rpx', height: '60rpx', borderRadius: '30rpx', backgroundColor: `${seriesColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8rpx' }}>
                    <Text style={{ fontSize: '24rpx', fontWeight: '700', color: seriesColor }}>{rs.id}</Text>
                  </View>
                  <Text style={{ fontSize: '24rpx', color: '#E2E8F0', textAlign: 'center' }}>{rs.name}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* G4: Share button */}
      <View style={{ margin: '24rpx 24rpx 0', display: 'flex', flexDirection: 'row', gap: '16rpx' }}>
        <View
          style={{ flex: 1, padding: '20rpx', backgroundColor: '#1E293B', borderRadius: '12rpx', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '8rpx' }}
          onClick={() => {
            Taro.showShareMenu({ showShareItems: ['shareAppMessage', 'shareTimeline'] })
          }}
        >
          <Text style={{ fontSize: '26rpx', color: '#94A3B8' }}>📤 {t('sealDetail.shareSeal')}</Text>
        </View>
      </View>

      {/* G4: Bottom CTA */}
      <View
        style={{ margin: '24rpx 24rpx 0', padding: '24rpx', backgroundColor: seriesColor, borderRadius: '16rpx', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12rpx' }}
        onClick={() => Taro.navigateTo({ url: '/pages/seals/index' })}
      >
        <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#FFFFFF' }}>{t('sealDetail.exploreAllSeals')}</Text>
      </View>

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
