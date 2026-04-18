import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchFhCase, type FamilyHarmonyCase } from '../../lib/api'
import './index.scss'

const JADE = '#2D8B6F'

export default function FamilyHarmonyCasePage() {
  const [data, setData] = useState<FamilyHarmonyCase | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { slug } = Taro.getCurrentInstance().router?.params ?? {}
    if (!slug) return
    fetchFhCase(slug)
      .then(setData)
      .catch(() => Taro.showToast({ title: '案例不存在', icon: 'none' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <View className='fhc-loading'><Text>加载中…</Text></View>
  if (!data) return <View className='fhc-loading'><Text>案例不存在</Text></View>

  return (
    <ScrollView scrollY className='fhc-page'>
      <View className='fhc-hero' style={{ background: `linear-gradient(135deg, #0D2E22 0%, ${JADE} 100%)` }}>
        <Text className='fhc-kicker'>FAMILY HARMONY · CASE</Text>
        <Text className='fhc-title'>{data.teamName}</Text>
        <Text className='fhc-meta'>
          🏡 {data.orgType}{data.industry ? ` · ${data.industry}` : ''}{data.headcount ? ` · ${data.headcount}人家庭` : ''}
        </Text>
      </View>

      <View className='fhc-section'>
        <Text className='fhc-section-title'>和合故事</Text>
        <Text className='fhc-story'>{data.story}</Text>
      </View>

      {data.highlights && data.highlights.length > 0 && (
        <View className='fhc-section'>
          <Text className='fhc-section-title'>关键转化</Text>
          {data.highlights.map((h, i) => (
            <View key={i} className='fhc-highlight'>
              <Text className='fhc-h-mark' style={{ color: JADE }}>✓</Text>
              <Text className='fhc-h-text'>{h}</Text>
            </View>
          ))}
        </View>
      )}

      {data.testimonial && (
        <View className='fhc-section fhc-tm'>
          <Text className='fhc-section-title'>家人见证</Text>
          <Text className='fhc-tm-text'>"{data.testimonial}"</Text>
        </View>
      )}

      {data.photos && data.photos.length > 0 && (
        <View className='fhc-section'>
          <Text className='fhc-section-title'>家庭影像</Text>
          <View className='fhc-photos'>
            {data.photos.map((p, i) => (
              <Image key={i} src={p} className='fhc-photo' mode='aspectFill' />
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  )
}
