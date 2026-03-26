import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import './index.scss'

interface TripSite {
  id: string
  name: string
  city: string
  country: string
}

interface StatusHistory {
  status: string
  date: string
  note: string
}

interface TripDetail {
  id: string
  title: string
  status: string
  startDate: string
  endDate: string
  description: string
  sites: TripSite[]
  history: StatusHistory[]
}

const STATUS_STEPS = ['规划中', '已确认', '朝圣中', '已完成']

const MOCK_TRIPS: Record<string, TripDetail> = {
  'trip-1': {
    id: 'trip-1',
    title: '东亚佛教祖庭朝圣之旅',
    status: '朝圣中',
    startDate: '2026-04-15',
    endDate: '2026-04-28',
    description: '探访菩提伽耶、鹿野苑等佛教圣地，体验佛陀足迹，感悟般若智慧。',
    sites: [
      { id: 's1', name: '菩提伽耶', city: 'Bodh Gaya', country: '印度' },
      { id: 's2', name: '鹿野苑', city: 'Sarnath', country: '印度' },
      { id: 's3', name: '拘尸那罗', city: 'Kushinagar', country: '印度' },
      { id: 's4', name: '蓝毗尼', city: 'Lumbini', country: '尼泊尔' },
      { id: 's5', name: '灵鹫山', city: 'Rajgir', country: '印度' },
    ],
    history: [
      { status: '规划中', date: '2026-03-01', note: '创建行程，选择圣地' },
      { status: '已确认', date: '2026-03-20', note: '确认行程安排，预订交通' },
      { status: '朝圣中', date: '2026-04-15', note: '开始朝圣之旅' },
    ],
  },
  'trip-2': {
    id: 'trip-2',
    title: '中东三教圣城巡礼',
    status: '规划中',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    description: '耶路撒冷、麦加、麦地那文化之旅，感受三大宗教的和平交汇。',
    sites: [
      { id: 's6', name: '耶路撒冷圣殿山', city: 'Jerusalem', country: '以色列' },
      { id: 's7', name: '麦加大清真寺', city: 'Mecca', country: '沙特阿拉伯' },
      { id: 's8', name: '先知清真寺', city: 'Medina', country: '沙特阿拉伯' },
      { id: 's9', name: '圣墓教堂', city: 'Jerusalem', country: '以色列' },
    ],
    history: [
      { status: '规划中', date: '2026-03-15', note: '创建行程，初步规划路线' },
    ],
  },
  'trip-3': {
    id: 'trip-3',
    title: '中国道教名山行',
    status: '已完成',
    startDate: '2026-01-10',
    endDate: '2026-01-20',
    description: '武当山、龙虎山、青城山修行体验，探寻道教祖庭。',
    sites: [
      { id: 's10', name: '武当山', city: '十堰', country: '中国' },
      { id: 's11', name: '龙虎山', city: '鹰潭', country: '中国' },
      { id: 's12', name: '青城山', city: '成都', country: '中国' },
    ],
    history: [
      { status: '规划中', date: '2025-12-01', note: '创建行程' },
      { status: '已确认', date: '2025-12-20', note: '确认行程' },
      { status: '朝圣中', date: '2026-01-10', note: '出发朝圣' },
      { status: '已完成', date: '2026-01-20', note: '圆满完成朝圣' },
    ],
  },
}

const ACTION_MAP: Record<string, { text: string; action: string }> = {
  '规划中': { text: '确认行程', action: 'confirm' },
  '已确认': { text: '开始朝圣', action: 'start' },
  '朝圣中': { text: '完成朝圣', action: 'complete' },
  '已完成': { text: '再次朝圣', action: 'restart' },
}

export default function TripDetailPage() {
  const router = useRouter()
  const tripId = router.params.id || 'trip-1'
  const [trip] = useState<TripDetail>(MOCK_TRIPS[tripId] || MOCK_TRIPS['trip-1'])

  const currentStepIndex = STATUS_STEPS.indexOf(trip.status)

  const handleAction = () => {
    Taro.showToast({ title: '功能即将开放', icon: 'none' })
  }

  const actionConfig = ACTION_MAP[trip.status] || ACTION_MAP['规划中']

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
              {step}
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
        <Text className='info-card__desc'>{trip.description}</Text>
        <View className='info-card__meta'>
          <View className='info-card__meta-item'>
            <Text className='info-card__meta-icon'>{'\u{1F4C5}'}</Text>
            <Text className='info-card__meta-text'>{trip.startDate} ~ {trip.endDate}</Text>
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
        {trip.sites.map((site, idx) => (
          <View key={site.id} className='site-item'>
            <View className='site-item__order'>
              <Text className='site-item__order-text'>{idx + 1}</Text>
            </View>
            <View className='site-item__info'>
              <Text className='site-item__name'>{site.name}</Text>
              <Text className='site-item__location'>{site.city}, {site.country}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Button */}
      <View className='action-section'>
        <View className='action-btn' onClick={handleAction}>
          <Text className='action-btn__text'>{actionConfig.text}</Text>
        </View>
      </View>

      {/* Status History */}
      <View className='history-section'>
        <Text className='section-title'>状态历史</Text>
        <View className='timeline'>
          {trip.history.map((h, idx) => (
            <View key={idx} className='timeline__item'>
              <View className='timeline__dot-wrapper'>
                <View className={`timeline__dot ${idx === trip.history.length - 1 ? 'timeline__dot--latest' : ''}`} />
                {idx < trip.history.length - 1 && <View className='timeline__line' />}
              </View>
              <View className='timeline__content'>
                <View className='timeline__header'>
                  <Text className='timeline__status'>{h.status}</Text>
                  <Text className='timeline__date'>{h.date}</Text>
                </View>
                <Text className='timeline__note'>{h.note}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}

definePageConfig({
  navigationBarTitleText: '行程详情',
})
