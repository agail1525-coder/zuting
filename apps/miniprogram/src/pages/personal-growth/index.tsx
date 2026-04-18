import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchPgThemes, fetchPgCases, type PersonalGrowthTheme, type PersonalGrowthCase } from '../../lib/api'
import './index.scss'

const GOLD = '#8B6914'

export default function PersonalGrowthPage() {
  const [themes, setThemes] = useState<PersonalGrowthTheme[]>([])
  const [cases, setCases] = useState<PersonalGrowthCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchPgThemes(1, 12).catch(() => null), fetchPgCases(1, 6).catch(() => null)])
      .then(([t, c]) => {
        setThemes(t?.items ?? [])
        setCases(c?.items ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <ScrollView scrollY className='pg-page'>
      <View className='pg-hero'>
        <Text className='pg-hero-kicker'>M34 · PERSONAL GROWTH</Text>
        <Text className='pg-hero-title'>个人圆满</Text>
        <Text className='pg-hero-sub'>觉醒 · 定力 · 格局 · 重生 · 慈悲 · 传灯</Text>
      </View>

      <View className='pg-section'>
        <Text className='pg-section-title'>六大主题</Text>
        {loading ? (
          <View className='pg-empty'><Text>加载中…</Text></View>
        ) : themes.length === 0 ? (
          <View className='pg-empty'><Text>暂无主题</Text></View>
        ) : (
          themes.map((th) => (
            <View
              key={th.id}
              className='pg-theme-card'
              style={{ borderLeftColor: th.color || GOLD }}
              onClick={() => Taro.navigateTo({ url: `/pages/personal-growth-theme/index?slug=${th.slug}` })}
            >
              {th.coverUrl ? (
                <Image src={th.coverUrl} className='pg-theme-cover' mode='aspectFill' />
              ) : null}
              <View className='pg-theme-body'>
                <Text className='pg-theme-title'>{th.icon ? `${th.icon} ` : ''}{th.title}</Text>
                {th.subtitle && <Text className='pg-theme-sub'>{th.subtitle}</Text>}
                <Text className='pg-theme-desc'>{th.description}</Text>
                <View className='pg-theme-meta'>
                  {th.durationDays != null && <Text className='pg-meta'>⏱ {th.durationDays}天</Text>}
                  {th.priceFrom != null && <Text className='pg-price'>￥{th.priceFrom}起</Text>}
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {cases.length > 0 && (
        <View className='pg-section'>
          <Text className='pg-section-title'>蜕变案例</Text>
          {cases.map((c) => (
            <View
              key={c.id}
              className='pg-case-card'
              onClick={() => Taro.navigateTo({ url: `/pages/personal-growth-case/index?slug=${c.slug}` })}
            >
              <Text className='pg-case-badge'>🏢 {c.orgType}</Text>
              <Text className='pg-case-title'>{c.teamName}</Text>
              <Text className='pg-case-story'>{c.story}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
