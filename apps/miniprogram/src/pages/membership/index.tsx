import { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  MembershipData, PointsHistoryItem,
  fetchMyMembership, checkin,
} from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const LEVEL_KEYS: Record<string, string> = {
  BRONZE: 'membership.levelBronze',
  SILVER: 'membership.levelSilver',
  GOLD: 'membership.levelGold',
  PLATINUM: 'membership.levelPlatinum',
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
  const { t } = useTranslation()
  const [data, setData] = useState<MembershipData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  const QUICK_ACTIONS = useMemo(() => [
    { icon: '🎁', label: t('membership.actionPointsMall'), url: '/pages/points-mall/index', color: '#EF4444', key: 'points-mall' },
    { icon: '📢', label: t('membership.actionReferral'), url: '/pages/referral/index', color: '#F59E0B', key: 'referral' },
    { icon: '📦', label: t('membership.actionMyPackages'), url: '/pages/packages/index', color: '#0066FF', key: 'packages' },
    { icon: '📅', label: t('membership.actionCheckinCalendar'), url: '', color: '#10B981', key: 'checkin-calendar' },
  ], [t])

  const DAILY_TASKS = useMemo(() => [
    { icon: '📅', label: t('membership.taskCheckin'), points: 10, key: 'checkin' },
    { icon: '📤', label: t('membership.taskShare'), points: 5, key: 'share' },
    { icon: '⭐', label: t('membership.taskReview'), points: 20, key: 'review' },
    { icon: '📖', label: t('membership.taskRead'), points: 3, key: 'read' },
  ], [t])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetchMyMembership()
      setData(res)
      setInviteCode(res.inviteCode || '')
    } catch {
      Taro.showToast({ title: t('membership.loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async () => {
    if (checkingIn) return
    setCheckingIn(true)
    try {
      const res = await checkin()
      Taro.showToast({ title: t('membership.checkinSuccess', { points: res.points }), icon: 'success' })
      await loadData()
    } catch {
      Taro.showToast({ title: t('membership.checkinFailed'), icon: 'none' })
    } finally {
      setCheckingIn(false)
    }
  }

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.url) {
      Taro.navigateTo({ url: action.url })
    } else if (action.key === 'checkin-calendar') {
      handleCheckin()
    }
  }

  // --- G4: Computed stats & level progress ---
  const todayCheckedIn = useMemo(() => {
    if (!data?.lastCheckinDate) return false
    return data.lastCheckinDate.slice(0, 10) === new Date().toISOString().slice(0, 10)
  }, [data?.lastCheckinDate])

  const levelProgress = useMemo(() => {
    if (!data) return { current: 0, next: 1000, percent: 0, nextLabel: t('membership.levelSilver') }
    const currentIdx = LEVEL_ORDER.indexOf(data.level)
    const currentThreshold = LEVEL_THRESHOLDS[data.level] || 0
    if (currentIdx >= LEVEL_ORDER.length - 1) {
      return { current: data.points, next: data.points, percent: 100, nextLabel: t('membership.maxLevel') }
    }
    const nextLevel = LEVEL_ORDER[currentIdx + 1]
    const nextThreshold = LEVEL_THRESHOLDS[nextLevel] || 10000
    const progress = Math.min(100, Math.round(((data.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
    return { current: data.points, next: nextThreshold, percent: progress, nextLabel: t(LEVEL_KEYS[nextLevel] || 'membership.levelBronze') }
  }, [data, t])

  const statsRow = useMemo(() => {
    if (!data) return []
    return [
      { label: t('membership.statLevel'), value: t(LEVEL_KEYS[data.level] || 'membership.levelBronze'), icon: '🏅' },
      { label: t('membership.statPoints'), value: (data.points ?? 0).toLocaleString(), icon: '💰' },
      { label: t('membership.statStreak'), value: t('membership.streakDays', { days: data.checkinStreak ?? 0 }), icon: '🔥' },
    ]
  }, [data, t])

  if (loading) {
    return (
      <View className='membership-page'>
        <View className='loading'>
          <Text className='loading__text'>{t('common.loading')}</Text>
        </View>
      </View>
    )
  }

  if (!data) {
    return (
      <View className='membership-page'>
        <View className='empty'>
          <Text className='empty__icon'>👤</Text>
          <Text className='empty__text'>{t('membership.loginRequired')}</Text>
        </View>
      </View>
    )
  }

  const levelColor = LEVEL_COLORS[data.level] || '#0066FF'
  const levelLabel = t(LEVEL_KEYS[data.level] || 'membership.levelBronze')

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
            <Text className='level-card__points-num'>{(data.points ?? 0).toLocaleString()}</Text>
            <Text className='level-card__points-label'>{t('membership.statPoints')}</Text>
          </View>
          <View>
            <Text className='level-card__streak-num'>{data.checkinStreak ?? 0}</Text>
            <Text className='level-card__points-label'>{t('membership.streakLabel')}</Text>
          </View>
        </View>
        {/* Checkin Button */}
        <View
          className={`checkin-btn ${todayCheckedIn ? 'checkin-btn--done' : ''}`}
          onClick={todayCheckedIn ? undefined : handleCheckin}
        >
          <Text className='checkin-btn__text'>
            {checkingIn ? t('membership.checkingIn') : todayCheckedIn ? t('membership.checkedInToday') : t('membership.checkinNow')}
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
            ? t('membership.pointsToUpgrade', { points: (levelProgress.next - levelProgress.current).toLocaleString() })
            : t('membership.maxLevel')}
        </Text>
      </View>

      {/* Quick Actions Grid */}
      <View className='quick-actions'>
        {QUICK_ACTIONS.map(action => (
          <View
            key={action.key}
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
          <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#F8FAFC' }}>{t('membership.dailyTasks')}</Text>
          <Text style={{ fontSize: '22rpx', color: '#D4A855' }}>{t('membership.earnPoints')}</Text>
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
                <Text style={{ fontSize: '22rpx', color: '#22C55E' }}>{t('membership.taskDone')}</Text>
              ) : (
                <Text style={{ fontSize: '22rpx', color: '#64748B' }}>{t('membership.taskGo')}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Points History */}
      <View className='section-header'>
        <Text className='section-title'>{t('membership.pointsHistory')}</Text>
      </View>
      <View className='history-list'>
        {(data.pointsHistory ?? []).length === 0 ? (
          <View className='empty'>
            <Text className='empty__text'>{t('membership.noPointsHistory')}</Text>
          </View>
        ) : (
          (data.pointsHistory ?? []).map(item => (
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
        <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#0F172A' }}>🎁 {t('membership.goPointsMall')}</Text>
      </View>

      <View style={{ height: '60rpx' }} />
    </ScrollView>
  )
}
