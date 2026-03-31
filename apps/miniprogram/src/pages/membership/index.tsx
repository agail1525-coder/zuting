import { useState, useEffect, useMemo } from 'react'
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

const LEVEL_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']

const LEVEL_THRESHOLDS: Record<string, number> = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 5000,
  PLATINUM: 20000,
}

const QUICK_ACTIONS = [
  { icon: '🎁', label: '积分商城', url: '/pages/points-mall/index', color: '#EF4444' },
  { icon: '📢', label: '分销推广', url: '/pages/referral/index', color: '#F59E0B' },
  { icon: '📦', label: '我的套餐', url: '/pages/packages/index', color: '#0066FF' },
  { icon: '📅', label: '签到日历', url: '', color: '#10B981' },
]

const DAILY_TASKS = [
  { icon: '📅', label: '每日签到', points: 10, key: 'checkin' },
  { icon: '📤', label: '分享内容', points: 5, key: 'share' },
  { icon: '⭐', label: '写一条评价', points: 20, key: 'review' },
  { icon: '📖', label: '阅读攻略', points: 3, key: 'read' },
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
      handleCheckin()
    }
  }

  // --- G4: Computed stats & level progress ---
  const todayCheckedIn = useMemo(() => {
    if (!data?.lastCheckinDate) return false
    return data.lastCheckinDate.slice(0, 10) === new Date().toISOString().slice(0, 10)
  }, [data?.lastCheckinDate])

  const levelProgress = useMemo(() => {
    if (!data) return { current: 0, next: 1000, percent: 0, nextLabel: '银牌会员' }
    const currentIdx = LEVEL_ORDER.indexOf(data.level)
    const currentThreshold = LEVEL_THRESHOLDS[data.level] || 0
    if (currentIdx >= LEVEL_ORDER.length - 1) {
      return { current: data.points, next: data.points, percent: 100, nextLabel: '最高等级' }
    }
    const nextLevel = LEVEL_ORDER[currentIdx + 1]
    const nextThreshold = LEVEL_THRESHOLDS[nextLevel] || 10000
    const progress = Math.min(100, Math.round(((data.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
    return { current: data.points, next: nextThreshold, percent: progress, nextLabel: LEVEL_LABELS[nextLevel] || nextLevel }
  }, [data])

  const statsRow = useMemo(() => {
    if (!data) return []
    return [
      { label: '当前等级', value: LEVEL_LABELS[data.level] || data.level, icon: '🏅' },
      { label: '积分余额', value: data.points.toLocaleString(), icon: '💰' },
      { label: '连续签到', value: `${data.checkinStreak}天`, icon: '🔥' },
    ]
  }, [data])

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

      {/* G4: Stats Row */}
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', padding: '24rpx 20rpx', backgroundColor: '#1E293B', borderRadius: '16rpx', margin: '20rpx 24rpx 0' }}>
        {statsRow.map(stat => (
          <View key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ fontSize: '32rpx' }}>{stat.icon}</Text>
            <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#F8FAFC', marginTop: '4rpx' }}>{stat.value}</Text>
            <Text style={{ fontSize: '22rpx', color: '#94A3B8' }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* G4: Level Progress Bar */}
      <View style={{ margin: '20rpx 24rpx 0', backgroundColor: '#1E293B', borderRadius: '16rpx', padding: '24rpx' }}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '12rpx' }}>
          <Text style={{ fontSize: '24rpx', color: '#CBD5E1' }}>{levelLabel}</Text>
          <Text style={{ fontSize: '24rpx', color: '#CBD5E1' }}>{levelProgress.nextLabel}</Text>
        </View>
        <View style={{ height: '12rpx', backgroundColor: '#334155', borderRadius: '6rpx', overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${levelProgress.percent}%`, backgroundColor: levelColor, borderRadius: '6rpx', transition: 'width 0.3s' }} />
        </View>
        <Text style={{ fontSize: '22rpx', color: '#64748B', marginTop: '8rpx' }}>
          {levelProgress.percent < 100
            ? `还需 ${(levelProgress.next - levelProgress.current).toLocaleString()} 积分升级`
            : '已达最高等级'}
        </Text>
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

      {/* G4: Daily Tasks Board */}
      <View style={{ margin: '20rpx 24rpx 0', backgroundColor: '#1E293B', borderRadius: '16rpx', padding: '24rpx' }}>
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16rpx' }}>
          <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#F8FAFC' }}>每日任务</Text>
          <Text style={{ fontSize: '22rpx', color: '#D4A855' }}>完成任务赚积分</Text>
        </View>
        {DAILY_TASKS.map(task => (
          <View
            key={task.key}
            style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '16rpx 0', borderBottom: '1rpx solid #334155' }}
            onClick={() => {
              if (task.key === 'checkin') handleCheckin()
            }}
          >
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12rpx' }}>
              <Text style={{ fontSize: '28rpx' }}>{task.icon}</Text>
              <Text style={{ fontSize: '26rpx', color: '#E2E8F0' }}>{task.label}</Text>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8rpx' }}>
              <Text style={{ fontSize: '22rpx', color: '#D4A855' }}>+{task.points}</Text>
              {task.key === 'checkin' && todayCheckedIn ? (
                <Text style={{ fontSize: '22rpx', color: '#22C55E' }}>已完成</Text>
              ) : (
                <Text style={{ fontSize: '22rpx', color: '#64748B' }}>去完成</Text>
              )}
            </View>
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

      {/* G4: Bottom CTA */}
      <View
        style={{ margin: '32rpx 24rpx', padding: '24rpx', backgroundColor: '#D4A855', borderRadius: '16rpx', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12rpx' }}
        hoverClass='none'
        onClick={() => Taro.navigateTo({ url: '/pages/points-mall/index' })}
      >
        <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#0F172A' }}>🎁 去积分商城兑好礼</Text>
      </View>

      <View style={{ height: '60rpx' }} />
    </ScrollView>
  )
}
