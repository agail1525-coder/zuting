import { useState, useEffect } from 'react'
import { View, Text, Textarea, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchCultivationMine, submitCultivationApplication, redeemCultivationInvite, CultivationMineResponse } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'

const TRADITIONS = [
  { v: 'ZEN', l: '禅宗' }, { v: 'TIBETAN', l: '藏传' }, { v: 'TAOISM', l: '道家' },
  { v: 'CONFUCIANISM', l: '儒家' }, { v: 'HINDUISM', l: '印度' }, { v: 'SIKHISM', l: '锡克' },
  { v: 'CHRISTIANITY', l: '基督' }, { v: 'JUDAISM', l: '犹太' }, { v: 'ISLAM', l: '伊斯兰' },
  { v: 'BAHAI', l: '巴哈伊' }, { v: 'SHINTO', l: '神道' }, { v: 'INDIGENOUS', l: '原住民' },
]

const gold = '#D4A855'
const g = (o: number) => `rgba(212,168,85,${o})`

export default function CultivationApplyPage() {
  const [mine, setMine] = useState<CultivationMineResponse | null>(null)
  const [tab, setTab] = useState<'apply' | 'invite'>('apply')
  const [motivation, setMotivation] = useState('')
  const [tradition, setTradition] = useState('ZEN')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) return
    fetchCultivationMine().then(m => {
      setMine(m)
      if (m.hasAccess) Taro.redirectTo({ url: '/pages/cultivation/index' })
    }).catch(() => {})
  }, [])

  const onApply = async () => {
    if (motivation.trim().length < 50) {
      Taro.showToast({ title: '动机至少50字', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await submitCultivationApplication({ motivation: motivation.trim(), primaryTradition: tradition })
      Taro.showToast({ title: '已提交', icon: 'success' })
      fetchCultivationMine().then(setMine)
    } catch {
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const onRedeem = async () => {
    if (!code.trim()) {
      Taro.showToast({ title: '请输入邀请码', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await redeemCultivationInvite(code.trim())
      Taro.showToast({ title: '兑换成功', icon: 'success' })
      setTimeout(() => Taro.redirectTo({ url: '/pages/cultivation/index' }), 800)
    } catch {
      Taro.showToast({ title: '兑换失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const pending = mine?.application?.status === 'PENDING'

  return (
    <View style={{ minHeight: '100vh', background: '#0f0a06', padding: '24rpx 32rpx 80rpx' }}>
      <Text style={{ fontSize: '44rpx', display: 'block', marginBottom: '12rpx' }}>☸</Text>
      <Text style={{ color: gold, fontSize: '40rpx', fontWeight: 'bold', display: 'block' }}>圆满之路 · 修行圈</Text>
      <Text style={{ color: g(0.5), fontSize: '26rpx', display: 'block', marginTop: '8rpx', marginBottom: '28rpx', lineHeight: '38rpx' }}>
        管理员授权或导师邀请制。禅宗主线，12 文化融通。
      </Text>

      {pending && (
        <View style={{ padding: '24rpx', borderRadius: '16rpx', background: 'rgba(59,130,246,0.1)', border: '1rpx solid rgba(96,165,250,0.3)', marginBottom: '24rpx' }}>
          <Text style={{ color: '#93C5FD', fontWeight: '600', fontSize: '28rpx' }}>⏳ 申请审核中</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={{ display: 'flex', flexDirection: 'row', gap: '8rpx', padding: '6rpx', borderRadius: '16rpx', background: g(0.1), border: `1rpx solid ${g(0.2)}`, marginBottom: '24rpx' }}>
        <View
          onClick={() => setTab('apply')}
          style={{ flex: 1, textAlign: 'center', padding: '16rpx', borderRadius: '12rpx', background: tab === 'apply' ? gold : 'transparent' }}
        >
          <Text style={{ color: tab === 'apply' ? '#fff' : g(0.5), fontWeight: '600', fontSize: '28rpx' }}>提交申请</Text>
        </View>
        <View
          onClick={() => setTab('invite')}
          style={{ flex: 1, textAlign: 'center', padding: '16rpx', borderRadius: '12rpx', background: tab === 'invite' ? gold : 'transparent' }}
        >
          <Text style={{ color: tab === 'invite' ? '#fff' : g(0.5), fontWeight: '600', fontSize: '28rpx' }}>兑换邀请码</Text>
        </View>
      </View>

      {tab === 'apply' && !pending && (
        <View>
          <Text style={{ color: gold, fontWeight: '600', fontSize: '28rpx', marginBottom: '12rpx' }}>修行动机 * (≥50字)</Text>
          <Textarea
            value={motivation}
            onInput={e => setMotivation(e.detail.value)}
            maxlength={2000}
            placeholder='请说明你为什么希望加入修行圈...'
            placeholderStyle={`color: ${g(0.3)}`}
            style={{ width: '100%', minHeight: '200rpx', background: g(0.08), border: `1rpx solid ${g(0.2)}`, borderRadius: '16rpx', padding: '20rpx', color: gold, fontSize: '28rpx' }}
          />

          <Text style={{ color: gold, fontWeight: '600', fontSize: '28rpx', marginTop: '24rpx', marginBottom: '12rpx' }}>主修文化</Text>
          <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '12rpx' }}>
            {TRADITIONS.map(tr => (
              <View
                key={tr.v}
                onClick={() => setTradition(tr.v)}
                style={{
                  padding: '12rpx 24rpx', borderRadius: '12rpx',
                  background: tradition === tr.v ? g(0.2) : g(0.06),
                  border: `1rpx solid ${tradition === tr.v ? gold : g(0.2)}`,
                }}
              >
                <Text style={{ color: tradition === tr.v ? gold : g(0.5), fontSize: '26rpx', fontWeight: '500' }}>{tr.l}</Text>
              </View>
            ))}
          </View>

          <View
            onClick={submitting ? undefined : onApply}
            style={{ marginTop: '32rpx', padding: '24rpx', borderRadius: '16rpx', background: gold, textAlign: 'center', opacity: submitting ? 0.6 : 1 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: '30rpx' }}>{submitting ? '提交中...' : '提交申请'}</Text>
          </View>
        </View>
      )}

      {tab === 'invite' && (
        <View>
          <Text style={{ color: gold, fontWeight: '600', fontSize: '28rpx', marginBottom: '12rpx' }}>邀请码</Text>
          <Input
            value={code}
            onInput={e => setCode(e.detail.value.toUpperCase())}
            placeholder='ZEN-A1B2C3'
            placeholderStyle={`color: ${g(0.3)}`}
            maxlength={32}
            style={{ background: g(0.08), border: `1rpx solid ${g(0.2)}`, borderRadius: '16rpx', padding: '20rpx', color: gold, fontSize: '36rpx', letterSpacing: '8rpx' }}
          />
          <Text style={{ color: g(0.4), fontSize: '22rpx', marginTop: '12rpx', lineHeight: '32rpx' }}>
            邀请码由导师/祖师生成，每月限 5 张
          </Text>
          <View
            onClick={submitting ? undefined : onRedeem}
            style={{ marginTop: '32rpx', padding: '24rpx', borderRadius: '16rpx', background: gold, textAlign: 'center', opacity: submitting ? 0.6 : 1 }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: '30rpx' }}>{submitting ? '兑换中...' : '立即兑换'}</Text>
          </View>
        </View>
      )}
    </View>
  )
}
