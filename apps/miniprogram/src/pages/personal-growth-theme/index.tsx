import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchPgTheme, type PersonalGrowthTheme } from '../../lib/api'
import './index.scss'

const GOLD = '#8B6914'

export default function PersonalGrowthThemePage() {
  const [data, setData] = useState<PersonalGrowthTheme | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { slug } = Taro.getCurrentInstance().router?.params ?? {}
    if (!slug) return
    fetchPgTheme(slug)
      .then(setData)
      .catch(() => Taro.showToast({ title: '主题不存在', icon: 'none' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View className='pgt-loading'><Text>加载中…</Text></View>
    )
  }
  if (!data) {
    return (
      <View className='pgt-loading'><Text>主题不存在</Text></View>
    )
  }

  const color = data.color || GOLD
  const rc = data.richContent

  return (
    <ScrollView scrollY className='pgt-page'>
      {data.coverUrl ? (
        <Image src={data.coverUrl} className='pgt-cover' mode='aspectFill' />
      ) : null}
      <View className='pgt-hero' style={{ background: `linear-gradient(135deg, #1A1200 0%, ${color} 100%)` }}>
        <Text className='pgt-hero-title'>{data.icon ? `${data.icon} ` : ''}{data.title}</Text>
        {data.subtitle && <Text className='pgt-hero-sub'>{data.subtitle}</Text>}
      </View>

      <View className='pgt-section'>
        <Text className='pgt-desc'>{data.description}</Text>

        <View className='pgt-meta'>
          {data.durationDays != null && <Text className='pgt-meta-item'>⏱ {data.durationDays}天</Text>}
          {data.priceFrom != null && (
            <Text className='pgt-meta-item' style={{ color }}>￥{data.priceFrom.toLocaleString()}起</Text>
          )}
        </View>

        {data.keywords && data.keywords.length > 0 && (
          <View className='pgt-tags'>
            {data.keywords.map((k) => (
              <View key={k} className='pgt-tag'><Text className='pgt-tag-text'>{k}</Text></View>
            ))}
          </View>
        )}
      </View>

      {rc?.dimension && (
        <View className='pgt-section'>
          <Text className='pgt-section-title' style={{ color }}>{rc.dimension.kicker}</Text>
          <Text className='pgt-section-body'>{rc.dimension.label}</Text>
        </View>
      )}

      {rc?.philosophy && (
        <View className='pgt-section'>
          <Text className='pgt-section-title'>{rc.philosophy.title}</Text>
          <Text className='pgt-section-body'>{rc.philosophy.body}</Text>
          {rc.philosophy.quotes && rc.philosophy.quotes.map((q, i) => (
            <View key={i} className='pgt-quote'>
              <Text className='pgt-quote-text'>"{q.text}"</Text>
              {q.translation && <Text className='pgt-quote-trans'>{q.translation}</Text>}
              <Text className='pgt-quote-source'>—— {q.source}</Text>
            </View>
          ))}
        </View>
      )}

      {rc?.dailyItinerary && rc.dailyItinerary.length > 0 && (
        <View className='pgt-section'>
          <Text className='pgt-section-title'>每日行程</Text>
          {rc.dailyItinerary.map((d) => (
            <View key={d.day} className='pgt-day'>
              <Text className='pgt-day-head' style={{ color }}>Day {d.day} · {d.title}</Text>
              <Text className='pgt-day-loc'>📍 {d.location}</Text>
              {d.morning && <Text className='pgt-day-body'>🌅 {d.morning}</Text>}
              {d.afternoon && <Text className='pgt-day-body'>☀️ {d.afternoon}</Text>}
              {d.evening && <Text className='pgt-day-body'>🌙 {d.evening}</Text>}
            </View>
          ))}
        </View>
      )}

      {(data.rituals && data.rituals.length > 0) && (
        <View className='pgt-section'>
          <Text className='pgt-section-title'>修行仪式</Text>
          {data.rituals.map((r, i) => (
            <View key={i} className='pgt-ritual'>
              <Text className='pgt-ritual-name'>{r.name}</Text>
              <Text className='pgt-ritual-dur'>⏱ {r.durationMin}分钟</Text>
              <Text className='pgt-ritual-desc'>{r.description}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}
