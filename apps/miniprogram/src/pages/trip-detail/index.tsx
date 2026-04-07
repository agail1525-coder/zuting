import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { fetchTrip, transitionTrip, TripDetail } from '../../lib/api'
import ReviewSection from '../../components/ReviewSection'
import { isLoggedIn } from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const STATUS_I18N_MAP: Record<string, string> = {
  DRAFT: 'tripDetail.statusDraft',
  PLANNING: 'tripDetail.statusPlanning',
  SUBMITTED: 'tripDetail.statusSubmitted',
  CONFIRMED: 'tripDetail.statusConfirmed',
  PAID: 'tripDetail.statusPaid',
  PREPARING: 'tripDetail.statusPreparing',
  IN_PROGRESS: 'tripDetail.statusInProgress',
  COMPLETED: 'tripDetail.statusCompleted',
  REVIEWING: 'tripDetail.statusReviewing',
  CANCELLED: 'tripDetail.statusCancelled',
  REFUNDING: 'tripDetail.statusRefunding',
  REFUNDED: 'tripDetail.statusRefunded',
}

const STATUS_STEPS = ['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED']
const STATUS_STEP_I18N = [
  'tripDetail.statusPlanning',
  'tripDetail.statusConfirmed',
  'tripDetail.statusInProgress',
  'tripDetail.statusCompleted',
]

export default function TripDetailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const tripId = router.params.id ?? ''
  const [authed, setAuthed] = useState(false)
  const [trip, setTrip] = useState<TripDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAuthed(isLoggedIn())
  }, [])

  useEffect(() => {
    if (!authed) return
    if (!tripId) {
      setError(t('tripDetail.missingId'))
      setLoading(false)
      return
    }
    fetchTrip(tripId)
      .then(data => {
        setTrip(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : String(err))
        setLoading(false)
      })
  }, [tripId, authed])

  if (!authed) {
    return (
      <View className='trip-detail-page'>
        <View className='auth-gate'>
          <Text className='auth-gate__icon'>{'\u{1F9ED}'}</Text>
          <Text className='auth-gate__title'>{t('tripDetail.title')}</Text>
          <Text className='auth-gate__desc'>{t('tripDetail.loginRequired')}</Text>
          <View
            className='auth-gate__btn'
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <Text className='auth-gate__btn-text'>{t('tripDetail.goLogin')}</Text>
          </View>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View className='trip-detail-page'>
        <View className='empty'>
          <Text className='empty__text'>{t('common.loading')}</Text>
        </View>
      </View>
    )
  }

  if (error || !trip) {
    return (
      <View className='trip-detail-page'>
        <View className='empty'>
          <Text className='empty__icon'>{'\u274C'}</Text>
          <Text className='empty__text'>{error ?? t('tripDetail.notFound')}</Text>
        </View>
      </View>
    )
  }

  const currentStepIndex = STATUS_STEPS.indexOf(trip.status)

  const refreshTrip = () => {
    fetchTrip(tripId)
      .then(data => setTrip(data))
      .catch(err => console.error('refresh failed:', err))
  }

  const handleAction = async (action: string, label: string) => {
    try {
      Taro.showLoading({ title: t('tripDetail.processing') })
      await transitionTrip(trip.id, action)
      Taro.hideLoading()
      Taro.showToast({ title: `${label}${t('tripDetail.actionSuccess')}`, icon: 'success' })
      refreshTrip()
    } catch (e) {
      Taro.hideLoading()
      Taro.showToast({ title: `${label}${t('tripDetail.actionFailed')}`, icon: 'none' })
    }
  }

  return (
    <ScrollView className='trip-detail-page' scrollY>
      {/* Progress Steps */}
      <View className='progress'>
        {STATUS_STEPS.map((step, idx) => (
          <View key={step} className='progress__step'>
            <View
              className={`progress__dot ${
                idx <= currentStepIndex ? 'progress__dot--active' : ''
              } ${idx === currentStepIndex ? 'progress__dot--current' : ''}`}
            >
              <Text className='progress__dot-text'>
                {idx < currentStepIndex ? '\u2713' : idx + 1}
              </Text>
            </View>
            <Text
              className={`progress__label ${
                idx <= currentStepIndex ? 'progress__label--active' : ''
              }`}
            >
              {t(STATUS_STEP_I18N[idx])}
            </Text>
            {idx < STATUS_STEPS.length - 1 && (
              <View
                className={`progress__line ${
                  idx < currentStepIndex ? 'progress__line--active' : ''
                }`}
              />
            )}
          </View>
        ))}
      </View>

      {/* Trip Info */}
      <View className='info-card'>
        <Text className='info-card__title'>{trip.title}</Text>
        <Text className='info-card__desc'>{trip.note ?? ''}</Text>
        <View className='info-card__meta'>
          <View className='info-card__meta-item'>
            <Text className='info-card__meta-icon'>{'\u{1F4C5}'}</Text>
            <Text className='info-card__meta-text'>
              {trip.startDate ? trip.startDate.slice(0, 10) : t('tripDetail.dateTbd')} ~ {trip.endDate ? trip.endDate.slice(0, 10) : t('tripDetail.dateTbd')}
            </Text>
          </View>
          <View className='info-card__meta-item'>
            <Text className='info-card__meta-icon'>{'\u{1F4CD}'}</Text>
            <Text className='info-card__meta-text'>{t('tripDetail.siteCount', { count: trip.sites.length })}</Text>
          </View>
        </View>
      </View>

      {/* Sites List */}
      <View className='sites-section'>
        <Text className='section-title'>{t('tripDetail.pilgrimageSites')}</Text>
        {trip.sites.map((tripSite, idx) => (
          <View key={tripSite.id} className='site-item'>
            <View className='site-item__order'>
              <Text className='site-item__order-text'>{idx + 1}</Text>
            </View>
            <View className='site-item__info'>
              <Text className='site-item__name'>{tripSite.site.name}</Text>
              <Text className='site-item__location'>
                {tripSite.site.city}, {tripSite.site.country}
              </Text>
            </View>
          </View>
        ))}
        {trip.sites.length === 0 && (
          <View className='empty'>
            <Text className='empty__text'>{t('tripDetail.noSitesAdded')}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {(trip.availableActions?.length ?? 0) > 0 && (
        <View className='action-section'>
          {trip.availableActions.map(action => (
            <View
              key={action.action}
              className='action-btn'
              onClick={() => handleAction(action.action, action.label)}
            >
              <Text className='action-btn__text'>{action.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Related Orders */}
      {trip.orders && trip.orders.length > 0 && (
        <View className='orders-section'>
          <Text className='section-title'>{t('tripDetail.relatedOrders')}</Text>
          {trip.orders.map(order => (
            <View key={order.id} className='order-item'>
              <View className='order-item__left'>
                <Text className='order-item__status'>{order.status === 'PAID' ? '\u2705' : '\u23F3'} {order.status}</Text>
              </View>
              <Text className='order-item__amount'>\u00A5{((order.amount ?? 0) / 100).toFixed(2)}</Text>
              <Text className='order-item__date'>{order.createdAt?.slice(0, 10) ?? ''}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Related Journals */}
      {trip.journals && trip.journals.length > 0 && (
        <View className='journals-section'>
          <Text className='section-title'>{t('tripDetail.pilgrimageJournals')}</Text>
          {trip.journals.map(journal => (
            <View
              key={journal.id}
              className='journal-item'
              onClick={() => Taro.navigateTo({ url: `/pages/journal-detail/index?id=${journal.id}` })}
            >
              <Text className='journal-item__title'>{'\u{1F4DD}'} {journal.title}</Text>
              <Text className='journal-item__date'>{journal.createdAt?.slice(0, 10) ?? ''}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Status History */}
      {(trip.statusHistory?.length ?? 0) > 0 && (
        <View className='history-section'>
          <Text className='section-title'>{t('tripDetail.statusHistory')}</Text>
          <View className='timeline'>
            {trip.statusHistory.map((h, idx) => (
              <View key={h.id} className='timeline__item'>
                <View className='timeline__dot-wrapper'>
                  <View className={`timeline__dot ${idx === 0 ? 'timeline__dot--latest' : ''}`} />
                  {idx < trip.statusHistory.length - 1 && <View className='timeline__line' />}
                </View>
                <View className='timeline__content'>
                  <View className='timeline__header'>
                    <Text className='timeline__status'>
                      {t(STATUS_I18N_MAP[h.status] ?? 'common.noData') ?? h.status}
                    </Text>
                    <Text className='timeline__date'>{h.createdAt?.slice(0, 10) ?? ''}</Text>
                  </View>
                  {h.note && <Text className='timeline__note'>{h.note}</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Reviews */}
      {tripId && (
        <View style={{ padding: '0 32rpx', marginTop: '32rpx' }}>
          <ReviewSection targetType='TRIP' targetId={tripId} />
        </View>
      )}

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}

definePageConfig({
  navigationBarTitleText: '行程详情',
})
