import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  MembershipData, PointsHistoryItem,
  fetchMyMembership, checkin,
} from '../../lib/api'
import './index.scss'

const LEVEL_LABELS: Record<string, string> = {
  BRONZE: '铜牌会员',
  SILVER: '银牌会员',
  GOLD: '金牌会员',
  PLATINUM: '白金会员',
}

const LEVEL_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32',
  SILVER: '#9CA3AF',
  GOLD: '#D4A855',
  PLATINUM: '#8B5CF6',
}

const QUICK_ACTIONS = [
  { icon: '🎁', label: '积分商城', url: '/pages/points-mall/index', color: '#EF4444' },
  { icon: '📢', label: '分销推广', url: '/pages/referral/index', color: '#F59E0B' },
  { icon: '📦', label: '我的套餐', url: '/pages/packages/index', color: '#0066FF' },
  { icon: '📅', label: '签到日历', url: '', color: '#10B981' },
]

function formatDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '/')
}

function PointsHistoryRow({ item }: { item: PointsHistoryItem }) {
  const isGain = item.points > 0
  return (
    <View className='history-row'>
      <View className='history-row__left'>
        <Text className='history-row__desc'>{item.description}</Text>
        <Text className='history-row__date'>{formatDate(item.createdAt)}</Text>
      </View>
      <Text className={`history-row__points ${isGain ? 'history-row__points--gain' : 'history-row__points--spend'}`}>
        {isGain ? '+' : ''}{item.points}
      </Text>
    </View>
  )
}

export default function MembershipPage() {
  const [data, setData] = useState<MembershipData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetchMyMembership()
      setData(res)
      setInviteCode(res.inviteCode || '')
    } catch {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async () => {
    if (checkingIn) return
    setCheckingIn(true)
    try {
      const res = await checkin()
      Taro.showToast({ title: `签到成功！+${res.points}积分`, icon: 'success' })
      await loadData()
    } catch {
      Taro.showToast({ title: '今日已签到或签到失败', icon: 'none' })
    } finally {
      setCheckingIn(false)
    }
  }

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.url) {
      Taro.navigateTo({ url: action.url })
    } else if (action.label === '签到日历') {
      Taro.showToast({ title: '签到日历即将上线', icon: 'none' })
    }
  }

  if (loading) {
    return (
      <View className='membership-page'>
        <View className='loading'>
          <Text className='loading__text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!data) {
    return (
      <View className='membership-page'>
        <View className='empty'>
          <Text className='empty__icon'>👤</Text>
          <Text className='empty__text'>请先登录以查看会员信息</Text>
        </View>
      </View>
    )
  }

  const levelColor = LEVEL_COLORS[data.level] || '#0066FF'
  const levelLabel = LEVEL_LABELS[data.level] || data.level
  const todayCheckedIn = data.lastCheckinDate
    ? data.lastCheckinDate.slice(0, 10) === new Date().toISOString().slice(0, 10)
    : false

  return (
    <ScrollView className='membership-page' scrollY>
      {/* Level Card */}
      <View className='level-card' style={{ background: `linear-gradient(135deg, ${levelColor}, ${levelColor}CC)` }}>
        <View className='level-card__header'>
          <View>
            <Text className='level-card__label'>{levelLabel}</Text>
            <Text className='level-card__name'>{data.userId.slice(0, 8)}****</Text>
          </View>
          <View className='level-card__badge'>
            <Text className='level-card__badge-text'>⭐</Text>
          </View>
        </View>
        <View className='level-card__points-row'>
          <View>
            <Text className='level-card__points-num'>{data.points.toLocaleString()}</Text>
            <Text className='level-card__points-label'>积分余额</Text>
          </View>
          <View>
            <Text className='level-card__streak-num'>{data.checkinStreak}</Text>
            <Text className='level-card__points-label'>连续签到天</Text>
          </View>
        </View>
        {/* Checkin Button */}
        <View
          className={`checkin-btn ${todayCheckedIn ? 'checkin-btn--done' : ''}`}
          onClick={todayCheckedIn ? undefined : handleCheckin}
        >
          <Text className='checkin-btn__text'>
            {checkingIn ? '签到中...' : todayCheckedIn ? '✓ 今日已签到' : '📅 立即签到'}
          </Text>
        </View>
      </View>

      {/* Quick Actions Grid */}
      <View className='quick-actions'>
        {QUICK_ACTIONS.map(action => (
          <View
            key={action.label}
            className='quick-action-item'
            hoverClass='quick-action-item--hover'
            onClick={() => handleQuickAction(action)}
          >
            <View className='quick-action-item__icon-wrap' style={{ backgroundColor: `${action.color}20` }}>
              <Text className='quick-action-item__icon'>{action.icon}</Text>
            </View>
            <Text className='quick-action-item__label'>{action.label}</Text>
          </View>
        ))}
      </View>

      {/* Points History */}
      <View className='section-header'>
        <Text className='section-title'>积分明细</Text>
      </View>
      <View className='history-list'>
        {data.pointsHistory.length === 0 ? (
          <View className='empty'>
            <Text className='empty__text'>暂无积分记录</Text>
          </View>
        ) : (
          data.pointsHistory.map(item => (
            <PointsHistoryRow key={item.id} item={item} />
          ))
        )}
      </View>

      <View style={{ height: '60rpx' }} />
    </ScrollView>
  )
}
