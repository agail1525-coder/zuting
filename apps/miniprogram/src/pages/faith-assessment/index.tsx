import { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchFaithQuestions, type FaithMode } from '../../lib/api'
import './index.scss'

const MODE_META: Record<FaithMode, { label: string; icon: string; desc: string; color: string }> = {
  PERSONAL:   { label: '个人版',   icon: '🙋', desc: '自我觉察 · 20 题',    color: '#3264ff' },
  FAMILY:     { label: '家庭版',   icon: '🏡', desc: '家人关系 · 20 题',    color: '#2D8B6F' },
  ENTERPRISE: { label: '企业版',   icon: '🏢', desc: '团队哲学 · 20 题',    color: '#8B6914' },
}

export default function FaithAssessmentPage() {
  const [mode, setMode] = useState<FaithMode>('PERSONAL')
  const [starting, setStarting] = useState(false)

  const handleStart = async () => {
    setStarting(true)
    try {
      await fetchFaithQuestions(mode)
      Taro.showToast({ title: '测评功能即将上线', icon: 'none' })
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setStarting(false)
    }
  }

  const meta = MODE_META[mode]

  return (
    <ScrollView scrollY className='fa-page'>
      <View className='fa-hero' style={{ background: `linear-gradient(135deg, #0f172a 0%, ${meta.color} 100%)` }}>
        <Text className='fa-hero-kicker'>M36 · FAITH ASSESSMENT</Text>
        <Text className='fa-hero-title'>信仰力评估</Text>
        <Text className='fa-hero-sub'>五维度 60 题 · 觉察力 / 定力 / 格局力 / 连接力 / 传承力</Text>
      </View>

      <View className='fa-section'>
        <Text className='fa-section-title'>选择模式</Text>
        {(Object.keys(MODE_META) as FaithMode[]).map((m) => {
          const mm = MODE_META[m]
          const active = m === mode
          return (
            <View
              key={m}
              className={`fa-mode-card${active ? ' fa-mode-active' : ''}`}
              style={active ? { borderColor: mm.color, background: `${mm.color}0d` } : undefined}
              onClick={() => setMode(m)}
            >
              <Text className='fa-mode-icon'>{mm.icon}</Text>
              <View className='fa-mode-body'>
                <Text className='fa-mode-label' style={{ color: active ? mm.color : '#111827' }}>
                  {mm.label}
                </Text>
                <Text className='fa-mode-desc'>{mm.desc}</Text>
              </View>
              {active && <Text className='fa-mode-check' style={{ color: mm.color }}>✓</Text>}
            </View>
          )
        })}
      </View>

      <View className='fa-section'>
        <Text className='fa-section-title'>五维度</Text>
        <View className='fa-dims'>
          {['觉察力', '定力', '格局力', '连接力', '传承力'].map((d) => (
            <View key={d} className='fa-dim'>
              <Text className='fa-dim-text'>{d}</Text>
            </View>
          ))}
        </View>
      </View>

      <View
        className='fa-cta'
        style={{ background: meta.color }}
        onClick={handleStart}
      >
        <Text className='fa-cta-text'>{starting ? '加载中…' : `开始 ${meta.label} 测评`}</Text>
      </View>
    </ScrollView>
  )
}
