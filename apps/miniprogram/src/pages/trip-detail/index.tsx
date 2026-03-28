import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { fetchTrip, transitionTrip, TripDetail } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import './index.scss'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: '草稿',
  PLANNING: '规划中',
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
  PAID: '已付款',
  PREPARING: '准备中',
  IN_PROGRESS: '朝圣中',
  COMPLETED: '已完成',
  REVIEWING: '评价中',
  CANCELLED: '已取消',
  REFUNDING: '退款中',
  REFUNDED: '已退款',
}

const STATUS_STEPS = ['PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED']
const STATUS_STEP_LABELS = ['规划中', '已确认', '朝圣中', '已完成']

export default function TripDetailPage() {
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
      setError('缺少行程ID')
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
          <Text className='auth-gate__title'>行程详情</Text>
          <Text className='auth-gate__desc'>请先登录后查看行程详情</Text>
          <View
            className='auth-gate__btn'
            onClick={() => Taro.switchTab({ url: '/pages/profile/index' })}
          >
            <Text className='auth-gate__btn-text'>去登录</Text>
          </View>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View className='trip-detail-page'>
        <View className='empty'>
          <Text className='empty__text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (error || !trip) {
    return (
      <View className='trip-detail-page'>
        <View className='empty'>
          <Text className='empty__icon'>{'\u274C'}</Text>
          <Text className='empty__text'>{error ?? '行程不存在'}</Text>
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
      Taro.showLoading({ title: '处理中...' })
      await transitionTrip(trip.id, action)
      Taro.hideLoading()
      Taro.showToast({ title: `${label}成功`, icon: 'success' })
      refreshTrip()
    } catch (e) {
      Taro.hideLoading()
      Taro.showToast({ title: `${label}失败`, icon: 'none' })
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
              {STATUS_STEP_LABELS[idx]}
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
              {trip.startDate ? trip.startDate.slice(0, 10) : '待定'} ~ {trip.endDate ? trip.endDate.slice(0, 10) : '待定'}
            </Text>
          </View>
          <View className='info-card__meta-item'>
            <Text className='info-card__meta-icon'>{'\u{1F4CD}'}</Text>
            <Text className='info-card__meta-text'>{trip.sites.length} 个圣地</Text>
          </View>
        </View>
      </View>

      {/* Sites List */}
      <View className='sites-section'>
        <Text className='section-title'>朝圣圣地</Text>
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
            <Text className='empty__text'>暂未添加圣地</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {trip.availableActions.length > 0 && (
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

      {/* Status History */}
      {trip.statusHistory.length > 0 && (
        <View className='history-section'>
          <Text className='section-title'>状态历史</Text>
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
                      {STATUS_LABELS[h.status] ?? h.status}
                    </Text>
                    <Text className='timeline__date'>{h.createdAt.slice(0, 10)}</Text>
                  </View>
                  {h.note && <Text className='timeline__note'>{h.note}</Text>}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}

definePageConfig({
  navigationBarTitleText: '行程详情',
})
