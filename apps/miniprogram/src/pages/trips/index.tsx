import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

type TripStatus = '全部' | '规划中' | '已确认' | '朝圣中' | '已完成'

interface Trip {
  id: string
  title: string
  status: TripStatus
  startDate: string
  endDate: string
  sitesCount: number
  description: string
}

const STATUS_COLORS: Record<string, string> = {
  '规划中': '#60a5fa',
  '已确认': '#D4A855',
  '朝圣中': '#34d399',
  '已完成': '#94a3b8',
}

const STATUS_LIST: TripStatus[] = ['全部', '规划中', '已确认', '朝圣中', '已完成']

const MOCK_TRIPS: Trip[] = [
  {
    id: 'trip-1',
    title: '东亚佛教祖庭朝圣之旅',
    status: '朝圣中',
    startDate: '2026-04-15',
    endDate: '2026-04-28',
    sitesCount: 5,
    description: '探访菩提伽耶、鹿野苑等佛教圣地',
  },
  {
    id: 'trip-2',
    title: '中东三教圣城巡礼',
    status: '规划中',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
    sitesCount: 4,
    description: '耶路撒冷、麦加、麦地那文化之旅',
  },
  {
    id: 'trip-3',
    title: '中国道教名山行',
    status: '已完成',
    startDate: '2026-01-10',
    endDate: '2026-01-20',
    sitesCount: 3,
    description: '武当山、龙虎山、青城山修行体验',
  },
]

export default function TripsPage() {
  const [activeStatus, setActiveStatus] = useState<TripStatus>('全部')

  const filteredTrips =
    activeStatus === '全部'
      ? MOCK_TRIPS
      : MOCK_TRIPS.filter(t => t.status === activeStatus)

  const handleTripTap = (tripId: string) => {
    Taro.navigateTo({ url: `/pages/trip-detail/index?id=${tripId}` })
  }

  const handleCreate = () => {
    Taro.showToast({ title: '创建行程功能即将开放', icon: 'none' })
  }

  return (
    <View className='trips-page'>
      {/* Status Filter */}
      <ScrollView className='status-tabs' scrollX>
        {STATUS_LIST.map(status => (
          <View
            key={status}
            className={`status-tab ${activeStatus === status ? 'status-tab--active' : ''}`}
            onClick={() => setActiveStatus(status)}
          >
            <Text className='status-tab__text'>{status}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Trip List */}
      <ScrollView className='trip-list' scrollY>
        {filteredTrips.length === 0 ? (
          <View className='empty'>
            <Text className='empty__icon'>{'\u{1F9ED}'}</Text>
            <Text className='empty__text'>暂无相关行程</Text>
          </View>
        ) : (
          filteredTrips.map(trip => (
            <View
              key={trip.id}
              className='trip-card'
              hoverClass='trip-card--hover'
              onClick={() => handleTripTap(trip.id)}
            >
              <View className='trip-card__header'>
                <Text className='trip-card__title'>{trip.title}</Text>
                <View
                  className='trip-card__tag'
                  style={{ backgroundColor: `${STATUS_COLORS[trip.status]}20`, borderColor: `${STATUS_COLORS[trip.status]}40` }}
                >
                  <Text className='trip-card__tag-text' style={{ color: STATUS_COLORS[trip.status] }}>
                    {trip.status}
                  </Text>
                </View>
              </View>
              <Text className='trip-card__desc'>{trip.description}</Text>
              <View className='trip-card__footer'>
                <View className='trip-card__info'>
                  <Text className='trip-card__info-icon'>{'\u{1F4C5}'}</Text>
                  <Text className='trip-card__info-text'>{trip.startDate} ~ {trip.endDate}</Text>
                </View>
                <View className='trip-card__info'>
                  <Text className='trip-card__info-icon'>{'\u{1F4CD}'}</Text>
                  <Text className='trip-card__info-text'>{trip.sitesCount} 个圣地</Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: '160rpx' }} />
      </ScrollView>

      {/* Create Button */}
      <View className='create-btn' onClick={handleCreate}>
        <Text className='create-btn__text'>+ 创建行程</Text>
      </View>
    </View>
  )
}

definePageConfig({
  navigationBarTitleText: '我的行程',
})
