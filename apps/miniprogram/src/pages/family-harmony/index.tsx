import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchFhThemes, fetchFhCases, type FamilyHarmonyTheme, type FamilyHarmonyCase } from '../../lib/api'
import './index.scss'

const JADE = '#2D8B6F'

export default function FamilyHarmonyPage() {
  const [themes, setThemes] = useState<FamilyHarmonyTheme[]>([])
  const [cases, setCases] = useState<FamilyHarmonyCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchFhThemes(1, 12).catch(() => null), fetchFhCases(1, 6).catch(() => null)])
      .then(([t, c]) => {
        setThemes(t?.items ?? [])
        setCases(c?.items ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <ScrollView scrollY className='fh-page'>
      <View className='fh-hero'>
        <Text className='fh-hero-kicker'>M35 · FAMILY HARMONY</Text>
        <Text className='fh-hero-title'>家庭幸福</Text>
        <Text className='fh-hero-sub'>同心 · 传家 · 和解 · 感恩 · 守护 · 归根</Text>
      </View>

      <View className='fh-section'>
        <Text className='fh-section-title'>六大主题</Text>
        {loading ? (
          <View className='fh-empty'><Text>加载中…</Text></View>
        ) : themes.length === 0 ? (
          <View className='fh-empty'><Text>暂无主题</Text></View>
        ) : (
          themes.map((th) => (
            <View
              key={th.id}
              className='fh-theme-card'
              style={{ borderLeftColor: th.color || JADE }}
              onClick={() => Taro.navigateTo({ url: `/pages/family-harmony-theme/index?slug=${th.slug}` })}
            >
              {th.coverUrl ? (
                <Image src={th.coverUrl} className='fh-theme-cover' mode='aspectFill' />
              ) : null}
              <View className='fh-theme-body'>
                <Text className='fh-theme-title'>{th.icon ? `${th.icon} ` : ''}{th.title}</Text>
                {th.subtitle && <Text className='fh-theme-sub'>{th.subtitle}</Text>}
                <Text className='fh-theme-desc'>{th.description}</Text>
                <View className='fh-theme-meta'>
                  {th.durationDays != null && <Text className='fh-meta'>⏱ {th.durationDays}天</Text>}
                  {th.priceFrom != null && <Text className='fh-price'>￥{th.priceFrom}起</Text>}
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {cases.length > 0 && (
        <View className='fh-section'>
          <Text className='fh-section-title'>家族案例</Text>
          {cases.map((c) => (
            <View
              key={c.id}
              className='fh-case-card'
              onClick={() => Taro.navigateTo({ url: `/pages/family-harmony-case/index?slug=${c.slug}` })}
            >
              <Text className='fh-case-badge'>🏡 {c.orgType}</Text>
              <Text className='fh-case-title'>{c.teamName}</Text>
              <Text className='fh-case-story'>{c.story}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
