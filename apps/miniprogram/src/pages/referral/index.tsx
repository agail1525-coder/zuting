import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  fetchMyInviteCode,
  fetchReferralStats,
  fetchMyTeam,
  fetchMyRewards,
  type ReferralStats,
  type TeamMember,
  type ReferralRewardItem,
} from '../../lib/api'
import './index.scss'

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

type TabKey = 'level1' | 'level2' | 'rewards'

const STATUS_LABEL: Record<string, string> = {
  PENDING: '待结算',
  SETTLED: '已结算',
  CANCELLED: '已取消',
}

export default function ReferralPage() {
  const [inviteCode, setInviteCode] = useState('')
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [level1, setLevel1] = useState<TeamMember[]>([])
  const [level2, setLevel2] = useState<TeamMember[]>([])
  const [rewards, setRewards] = useState<ReferralRewardItem[]>([])
  const [activeTab, setActiveTab] = useState<TabKey>('level1')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [codeRes, st, team, rew] = await Promise.all([
        fetchMyInviteCode(),
        fetchReferralStats(),
        fetchMyTeam(),
        fetchMyRewards(1, 50),
      ])
      setInviteCode(codeRes.inviteCode || '')
      setStats(st)
      setLevel1(Array.isArray(team.level1) ? team.level1 : [])
      setLevel2(Array.isArray(team.level2) ? team.level2 : [])
      setRewards(Array.isArray(rew.items) ? rew.items : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleCopy = () => {
    if (!inviteCode) return
    Taro.setClipboardData({
      data: inviteCode,
      success: () => Taro.showToast({ title: '已复制邀请码', icon: 'success' }),
    })
  }

  const handleShare = () => {
    if (!inviteCode) return
    const text = `我正在使用JOINUS探索世界祖庭圣地，邀请你加入！邀请码：${inviteCode}`
    Taro.setClipboardData({
      data: text,
      success: () => Taro.showToast({ title: '分享文案已复制', icon: 'success' }),
    })
  }

  if (loading) {
    return (
      <View className='referral-page'>
        <View className='loading-center'>
          <Text className='loading-center__text'>加载中...</Text>
        </View>
      </View>
    )
  }

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'level1', label: '一级下线', count: level1.length },
    { key: 'level2', label: '二级下线', count: level2.length },
    { key: 'rewards', label: '奖励记录', count: rewards.length },
  ]

  return (
    <ScrollView className='referral-page' scrollY>
      {/* Hero: Invite Code */}
      <View className='hero-card'>
        <Text className='hero-card__subtitle'>我的专属邀请码</Text>
        <View className='hero-card__code-row'>
          <Text className='hero-card__code'>{inviteCode || '------'}</Text>
        </View>
        <View className='hero-card__actions'>
          <Text className='hero-card__btn' onClick={handleCopy}>复制</Text>
          <Text className='hero-card__btn' onClick={handleShare}>分享</Text>
        </View>
        <View style={{ height: '16rpx' }} />
        <Text className='hero-card__hint'>分享给好友，好友注册填写邀请码即可建立分销关系</Text>
      </View>

      {error && (
        <View className='error-banner'>
          <Text className='error-banner__text'>{error}</Text>
        </View>
      )}

      {/* Stats Grid */}
      {stats && (
        <View className='stats-grid'>
          <View className='stat-card'>
            <Text className='stat-card__label'>总邀请</Text>
            <Text className='stat-card__value'>{stats.totalInvites}<Text className='stat-card__unit'>人</Text></Text>
          </View>
          <View className='stat-card'>
            <Text className='stat-card__label'>一级下线</Text>
            <Text className='stat-card__value'>{stats.level1Count}<Text className='stat-card__unit'>人</Text></Text>
          </View>
          <View className='stat-card'>
            <Text className='stat-card__label'>二级下线</Text>
            <Text className='stat-card__value'>{stats.level2Count}<Text className='stat-card__unit'>人</Text></Text>
          </View>
          <View className='stat-card'>
            <Text className='stat-card__label'>累计收益</Text>
            <Text className='stat-card__value'>{stats.totalRewards}<Text className='stat-card__unit'>分</Text></Text>
          </View>
          <View className='stat-card'>
            <Text className='stat-card__label'>本月收益</Text>
            <Text className='stat-card__value stat-card__value--accent'>{stats.monthlyRewards}<Text className='stat-card__unit'>分</Text></Text>
          </View>
        </View>
      )}

      {/* Distribution Rules */}
      <View className='rules-card'>
        <Text className='rules-card__title'>分销规则</Text>
        <View className='rule-item'>
          <Text className='rule-item__icon'>🎁</Text>
          <Text className='rule-item__text'>好友注册成功，双方各得50积分</Text>
        </View>
        <View className='rule-item'>
          <Text className='rule-item__icon'>💰</Text>
          <Text className='rule-item__text'>一级好友下单，返佣订单金额5%（上限500分/单）</Text>
        </View>
        <View className='rule-item'>
          <Text className='rule-item__icon'>🔗</Text>
          <Text className='rule-item__text'>二级好友下单，返佣订单金额2%（上限500分/单）</Text>
        </View>
        <View className='rule-item'>
          <Text className='rule-item__icon'>🏆</Text>
          <Text className='rule-item__text'>积分可在积分商城兑换优惠券、专属体验等</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className='tabs-wrapper'>
        <View className='tabs-bar'>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'tab-item--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.label}</Text>
              {tab.count > 0 && <Text className='tab-badge'>{tab.count}</Text>}
            </View>
          ))}
        </View>

        {/* Level 1 Members */}
        {activeTab === 'level1' && (
          <View className='member-list'>
            {level1.length === 0 ? (
              <View className='empty-state'>
                <Text className='empty-state__icon'>👥</Text>
                <Text className='empty-state__text'>暂无一级下线，快去邀请好友吧</Text>
              </View>
            ) : (
              level1.map(m => (
                <View key={m.id} className='member-row'>
                  <View className='member-row__left'>
                    <View className='member-row__avatar member-row__avatar--l1'>
                      <Text>{m.inviteeId.slice(-2).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text className='member-row__name'>用户 {m.inviteeId.slice(0, 8)}</Text>
                      <Text className='member-row__date'>加入于 {formatDate(m.createdAt)}</Text>
                    </View>
                  </View>
                  <Text className='level-badge level-badge--l1'>一级</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Level 2 Members */}
        {activeTab === 'level2' && (
          <View className='member-list'>
            {level2.length === 0 ? (
              <View className='empty-state'>
                <Text className='empty-state__icon'>👥</Text>
                <Text className='empty-state__text'>暂无二级下线</Text>
              </View>
            ) : (
              level2.map(m => (
                <View key={m.id} className='member-row'>
                  <View className='member-row__left'>
                    <View className='member-row__avatar member-row__avatar--l2'>
                      <Text>{m.inviteeId.slice(-2).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text className='member-row__name'>用户 {m.inviteeId.slice(0, 8)}</Text>
                      <Text className='member-row__date'>加入于 {formatDate(m.createdAt)}</Text>
                    </View>
                  </View>
                  <Text className='level-badge level-badge--l2'>二级</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Rewards History */}
        {activeTab === 'rewards' && (
          <View className='member-list'>
            {rewards.length === 0 ? (
              <View className='empty-state'>
                <Text className='empty-state__icon'>💎</Text>
                <Text className='empty-state__text'>暂无奖励记录</Text>
              </View>
            ) : (
              rewards.map(r => (
                <View key={r.id} className='reward-row'>
                  <View className='reward-row__left'>
                    <Text className='reward-row__desc'>
                      {r.level === 1 ? '一级' : '二级'}返佣 · 订单 {r.orderId.slice(0, 8)}
                    </Text>
                    <Text className='reward-row__date'>{formatDate(r.createdAt)}</Text>
                  </View>
                  <View className='reward-row__right'>
                    <Text className='reward-row__amount'>+{r.amount}分</Text>
                    <Text className={`status-badge status-badge--${r.status}`}>
                      {STATUS_LABEL[r.status] ?? r.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>

      <View style={{ height: '60rpx' }} />
    </ScrollView>
  )
}
