import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchPgCase, type PersonalGrowthCase } from '../../lib/api'
import './index.scss'

const GOLD = '#8B6914'

export default function PersonalGrowthCasePage() {
  const [data, setData] = useState<PersonalGrowthCase | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { slug } = Taro.getCurrentInstance().router?.params ?? {}
    if (!slug) return
    fetchPgCase(slug)
      .then(setData)
      .catch(() => Taro.showToast({ title: '案例不存在', icon: 'none' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <View className='pgc-loading'><Text>加载中…</Text></View>
  if (!data) return <View className='pgc-loading'><Text>案例不存在</Text></View>

  return (
    <ScrollView scrollY className='pgc-page'>
      <View className='pgc-hero' style={{ background: `linear-gradient(135deg, #1A1200 0%, ${GOLD} 100%)` }}>
        <Text className='pgc-kicker'>PERSONAL GROWTH · CASE</Text>
        <Text className='pgc-title'>{data.teamName}</Text>
        <Text className='pgc-meta'>
          🏢 {data.orgType}{data.industry ? ` · ${data.industry}` : ''}{data.headcount ? ` · ${data.headcount}人团队` : ''}
        </Text>
      </View>

      <View className='pgc-section'>
        <Text className='pgc-section-title'>蜕变故事</Text>
        <Text className='pgc-story'>{data.story}</Text>
      </View>

      {data.highlights && data.highlights.length > 0 && (
        <View className='pgc-section'>
          <Text className='pgc-section-title'>关键收获</Text>
          {data.highlights.map((h, i) => (
            <View key={i} className='pgc-highlight'>
              <Text className='pgc-h-mark' style={{ color: GOLD }}>✓</Text>
              <Text className='pgc-h-text'>{h}</Text>
            </View>
          ))}
        </View>
      )}

      {data.testimonial && (
        <View className='pgc-section pgc-tm'>
          <Text className='pgc-section-title'>学员见证</Text>
          <Text className='pgc-tm-text'>"{data.testimonial}"</Text>
        </View>
      )}

      {data.photos && data.photos.length > 0 && (
        <View className='pgc-section'>
          <Text className='pgc-section-title'>案例图片</Text>
          <View className='pgc-photos'>
            {data.photos.map((p, i) => (
              <Image key={i} src={p} className='pgc-photo' mode='aspectFill' />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}
