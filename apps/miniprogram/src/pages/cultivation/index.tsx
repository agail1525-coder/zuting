import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchCompass, CompassResponse, fetchCultivationMine } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'

const REALM_LABEL: Record<string, string> = {
  AWAKENING: '初觉', CLARIFYING: '明心', SEEING: '见性', ATTAINING: '证道',
  INTEGRATING: '融通', RETURNING: '归源', GIVING_BACK: '布施',
}

const AXES = [
  { label: '十牛图', icon: '🐂', desc: '十阶进度' },
  { label: '每日印', icon: '🪷', desc: '晨晚课打卡' },
  { label: '三生愿景', icon: '🏠', desc: '个人/家庭/事业' },
  { label: '融通问答', icon: '💬', desc: '12 文化大师' },
  { label: '因缘日志', icon: '📖', desc: 'AI 标注' },
  { label: '活佛直播', icon: '📺', desc: '排期' },
]

const gold = '#D4A855'
const g = (o: number) => `rgba(212,168,85,${o})`

export default function CultivationCompassPage() {
  const [data, setData] = useState<CompassResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn()) {
      Taro.redirectTo({ url: '/pages/cultivation/apply' })
      return
    }
    fetchCultivationMine().then(mine => {
      if (!mine.hasAccess) {
        Taro.redirectTo({ url: '/pages/cultivation/apply' })
        return
      }
      fetchCompass().then(setData).catch(e => setError(e.message))
    }).catch(() => Taro.redirectTo({ url: '/pages/cultivation/apply' }))
  }, [])

  if (error) {
    return (
      <View style={{ minHeight: '100vh', background: '#0f0a06', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fda4af' }}>{error}</Text>
      </View>
    )
  }
  if (!data) {
    return (
      <View style={{ minHeight: '100vh', background: '#0f0a06', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: g(0.5), fontSize: '28rpx' }}>加载修行罗盘...</Text>
      </View>
    )
  }

  const { journey, currentSymbol, todaySteps, streakDays } = data

  return (
    <View style={{ minHeight: '100vh', background: '#0f0a06', padding: '24rpx 32rpx 80rpx' }}>
      {/* Hero */}
      <View style={{
        padding: '32rpx', borderRadius: '24rpx', background: g(0.08),
        border: `1rpx solid ${g(0.2)}`, marginBottom: '28rpx'
      }}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '20rpx' }}>
          <View style={{
            width: '80rpx', height: '80rpx', borderRadius: '16rpx',
            background: g(0.2), display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Text style={{ fontSize: '48rpx' }}>☸</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: g(0.5), fontSize: '22rpx', letterSpacing: '2rpx' }}>
              当前境界 · {journey.primaryTradition}
            </Text>
            <Text style={{ color: gold, fontSize: '40rpx', fontWeight: 'bold', display: 'block', marginTop: '4rpx' }}>
              {REALM_LABEL[journey.currentRealm] || journey.currentRealm}
            </Text>
            <Text style={{ color: g(0.5), fontSize: '24rpx', display: 'block', marginTop: '4rpx' }}>
              十牛图 第 {journey.oxStage} 阶 · 连击 {streakDays} 天 · {journey.karmaPoints} 因缘点
            </Text>
          </View>
        </View>
        {currentSymbol && (
          <View style={{ marginTop: '20rpx', padding: '20rpx', borderRadius: '16rpx', background: g(0.06), border: `1rpx solid ${g(0.15)}` }}>
            <Text style={{ color: gold, fontWeight: '600', fontSize: '26rpx' }}>{currentSymbol.symbolName}</Text>
            <Text style={{ color: g(0.6), fontSize: '24rpx', lineHeight: '36rpx', display: 'block', marginTop: '8rpx' }}>
              {currentSymbol.originalText}
            </Text>
            <Text style={{ color: g(0.3), fontSize: '22rpx', display: 'block', marginTop: '8rpx' }}>— {currentSymbol.source}</Text>
          </View>
        )}
      </View>

      {/* Today steps */}
      <Text style={{ color: gold, fontWeight: 'bold', fontSize: '30rpx', marginBottom: '16rpx' }}>今日修行</Text>
      {todaySteps.map(step => (
        <View key={step.id} style={{
          display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16rpx',
          padding: '20rpx', borderRadius: '16rpx', marginBottom: '12rpx',
          background: step.completed ? 'rgba(34,197,94,0.06)' : g(0.06),
          border: `1rpx solid ${step.completed ? 'rgba(34,197,94,0.25)' : g(0.15)}`,
        }}>
          <Text style={{ fontSize: '24rpx', color: step.completed ? '#22C55E' : gold }}>
            {step.completed ? '✓' : '○'}
          </Text>
          <Text style={{ flex: 1, color: gold, fontSize: '26rpx' }}>{step.title}</Text>
          <Text style={{ color: g(0.3), fontSize: '22rpx' }}>{step.kind}</Text>
        </View>
      ))}

      {/* Axis navigation */}
      <Text style={{ color: gold, fontWeight: 'bold', fontSize: '30rpx', marginTop: '28rpx', marginBottom: '16rpx' }}>修行轴</Text>
      <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '16rpx' }}>
        {AXES.map(ax => (
          <View key={ax.label} style={{
            width: 'calc(50% - 8rpx)', padding: '24rpx', borderRadius: '16rpx',
            background: g(0.06), border: `1rpx solid ${g(0.15)}`,
          }}>
            <Text style={{ fontSize: '36rpx', display: 'block', marginBottom: '8rpx' }}>{ax.icon}</Text>
            <Text style={{ color: gold, fontWeight: '600', fontSize: '26rpx' }}>{ax.label}</Text>
            <Text style={{ color: g(0.4), fontSize: '22rpx', display: 'block', marginTop: '4rpx' }}>{ax.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
