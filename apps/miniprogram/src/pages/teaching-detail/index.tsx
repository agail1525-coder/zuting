import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { Teaching, fetchTeachingById } from '../../lib/api'
import './index.scss'

export default function TeachingDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [teaching, setTeaching] = useState<Teaching | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) loadTeaching()
  }, [id])

  const loadTeaching = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTeachingById(id!)
      setTeaching(data)
    } catch (err) {
      console.error('Failed to load teaching:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className='container'>
        <Text className='loading-text'>正在加载...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className='container'>
        <Text className='empty-text'>{error}</Text>
        <Text className='retry-btn' onClick={loadTeaching}>点击重试</Text>
      </View>
    )
  }

  if (!teaching) {
    return (
      <View className='container'>
        <Text className='empty-text'>祖训不存在</Text>
      </View>
    )
  }

  const originalText = teaching.originalText || teaching.content || ''
  const source = teaching.sourceText || teaching.source || ''

  return (
    <ScrollView className='teaching-detail' scrollY>
      {/* Header */}
      <View className='teaching-detail__header'>
        <View className='teaching-detail__icon'>
          <Text className='teaching-detail__icon-text'>{'\u{1F4DC}'}</Text>
        </View>
        {teaching.religion && (
          <Text className='teaching-detail__religion'>
            {teaching.religion.emoji} {teaching.religion.name}
          </Text>
        )}
        {teaching.name && (
          <Text className='teaching-detail__name'>{teaching.name}</Text>
        )}
      </View>

      {/* Original Text */}
      {originalText && (
        <View className='quote-card'>
          <Text className='quote-card__mark'>{'\u{201C}'}</Text>
          <Text className='quote-card__title'>原文</Text>
          <Text className='quote-card__text'>{originalText}</Text>
        </View>
      )}

      {/* Source */}
      {source && (
        <View className='info-card'>
          <View className='info-card__row'>
            <Text className='info-card__icon'>{'\u{1F4D6}'}</Text>
            <View className='info-card__content'>
              <Text className='info-card__label'>出处</Text>
              <Text className='info-card__value'>{source}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Translation */}
      {teaching.translationCn && (
        <View className='translation-card'>
          <Text className='translation-card__title'>白话译文</Text>
          <Text className='translation-card__content'>{teaching.translationCn}</Text>
        </View>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
