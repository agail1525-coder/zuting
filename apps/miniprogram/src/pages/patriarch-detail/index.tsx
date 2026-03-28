import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import { useRouter } from '@tarojs/taro'
import { Patriarch, fetchPatriarchById } from '../../lib/api'
import './index.scss'

export default function PatriarchDetailPage() {
  const router = useRouter()
  const { id } = router.params
  const [patriarch, setPatriarch] = useState<Patriarch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) loadPatriarch()
  }, [id])

  const loadPatriarch = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPatriarchById(id!)
      setPatriarch(data)
    } catch (err) {
      console.error('Failed to load patriarch:', err)
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
        <Text className='retry-btn' onClick={loadPatriarch}>点击重试</Text>
      </View>
    )
  }

  if (!patriarch) {
    return (
      <View className='container'>
        <Text className='empty-text'>祖师不存在</Text>
      </View>
    )
  }

  return (
    <ScrollView className='patriarch-detail' scrollY>
      {/* Header */}
      <View className='patriarch-detail__header'>
        <View className='patriarch-detail__avatar'>
          <Text className='patriarch-detail__avatar-text'>{'\u{1F9D8}'}</Text>
        </View>
        {patriarch.religion && (
          <Text className='patriarch-detail__religion'>
            {patriarch.religion.emoji} {patriarch.religion.name}
          </Text>
        )}
        <Text className='patriarch-detail__name'>{patriarch.name}</Text>
        <Text className='patriarch-detail__name-en'>{patriarch.nameEn}</Text>
        {patriarch.title && (
          <Text className='patriarch-detail__title'>{patriarch.title}</Text>
        )}
      </View>

      {/* Info Card */}
      {patriarch.era && (
        <View className='info-card'>
          <View className='info-card__row'>
            <Text className='info-card__icon'>{'\u{1F4C5}'}</Text>
            <View className='info-card__content'>
              <Text className='info-card__label'>年代</Text>
              <Text className='info-card__value'>{patriarch.era}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Biography */}
      {patriarch.biography && (
        <View className='bio-card'>
          <Text className='bio-card__title'>生平</Text>
          <Text className='bio-card__content'>{patriarch.biography}</Text>
        </View>
      )}

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
