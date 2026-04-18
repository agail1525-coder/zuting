import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchFhTheme, type FamilyHarmonyTheme } from '../../lib/api'
import './index.scss'

const JADE = '#2D8B6F'

export default function FamilyHarmonyThemePage() {
  const [data, setData] = useState<FamilyHarmonyTheme | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { slug } = Taro.getCurrentInstance().router?.params ?? {}
    if (!slug) return
    fetchFhTheme(slug)
      .then(setData)
      .catch(() => Taro.showToast({ title: '主题不存在', icon: 'none' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <View className='fht-loading'><Text>加载中…</Text></View>
  if (!data) return <View className='fht-loading'><Text>主题不存在</Text></View>

  const color = data.color || JADE
  const rc = data.richContent

  return (
    <ScrollView scrollY className='fht-page'>
      {data.coverUrl ? <Image src={data.coverUrl} className='fht-cover' mode='aspectFill' /> : null}
      <View className='fht-hero' style={{ background: `linear-gradient(135deg, #0D2E22 0%, ${color} 100%)` }}>
        <Text className='fht-hero-title'>{data.icon ? `${data.icon} ` : ''}{data.title}</Text>
        {data.subtitle && <Text className='fht-hero-sub'>{data.subtitle}</Text>}
      </View>

      <View className='fht-section'>
        <Text className='fht-desc'>{data.description}</Text>
        <View className='fht-meta'>
          {data.durationDays != null && <Text className='fht-meta-item'>⏱ {data.durationDays}天</Text>}
          {data.priceFrom != null && (
            <Text className='fht-meta-item' style={{ color }}>￥{data.priceFrom.toLocaleString()}起</Text>
          )}
        </View>
      </View>

      {rc?.familyPainPoint && (
        <View className='fht-section'>
          <Text className='fht-section-title' style={{ color }}>家庭痛点</Text>
          <Text className='fht-section-h'>{rc.familyPainPoint.title}</Text>
          <Text className='fht-section-body'>{rc.familyPainPoint.body}</Text>
          {rc.familyPainPoint.signs && rc.familyPainPoint.signs.length > 0 && (
            <View>
              {rc.familyPainPoint.signs.map((s, i) => (
                <Text key={i} className='fht-sign'>· {s}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {rc?.philosophy && (
        <View className='fht-section'>
          <Text className='fht-section-title'>{rc.philosophy.title}</Text>
          <Text className='fht-section-body'>{rc.philosophy.body}</Text>
          {rc.philosophy.quotes && rc.philosophy.quotes.map((q, i) => (
            <View key={i} className='fht-quote'>
              <Text className='fht-quote-text'>"{q.text}"</Text>
              {q.translation && <Text className='fht-quote-trans'>{q.translation}</Text>}
              <Text className='fht-quote-source'>—— {q.source}</Text>
            </View>
          ))}
        </View>
      )}

      {rc?.dailyItinerary && rc.dailyItinerary.length > 0 && (
        <View className='fht-section'>
          <Text className='fht-section-title'>每日行程</Text>
          {rc.dailyItinerary.map((d) => (
            <View key={d.day} className='fht-day'>
              <Text className='fht-day-head' style={{ color }}>Day {d.day} · {d.title}</Text>
              <Text className='fht-day-loc'>📍 {d.location}</Text>
              {d.morning && <Text className='fht-day-body'>🌅 {d.morning}</Text>}
              {d.afternoon && <Text className='fht-day-body'>☀️ {d.afternoon}</Text>}
              {d.evening && <Text className='fht-day-body'>🌙 {d.evening}</Text>}
              {d.familyTime && <Text className='fht-day-body'>👨‍👩‍👧‍👦 {d.familyTime}</Text>}
            </View>
          ))}
        </View>
      )}

      {rc?.mentorProfile && (
        <View className='fht-section'>
          <Text className='fht-section-title'>导师简介</Text>
          <Text className='fht-mentor-name' style={{ color }}>{rc.mentorProfile.name}</Text>
          <Text className='fht-mentor-title'>{rc.mentorProfile.title}</Text>
          <Text className='fht-section-body'>{rc.mentorProfile.bio}</Text>
        </View>
      )}
    </ScrollView>
  )
}
