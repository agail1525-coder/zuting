import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Teaching, fetchTeachingById } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function TeachingDetailPage() {
  const { t } = useTranslation()
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
      setError(t('teachingDetail.networkError'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <View className='container'><Text className='loading-text'>{t('common.loading')}</Text></View>
  if (error) return <View className='container'><Text className='empty-text'>{error}</Text><Text className='retry-btn' onClick={loadTeaching}>{t('teachingDetail.tapRetry')}</Text></View>
  if (!teaching) return <View className='container'><Text className='empty-text'>{t('teachingDetail.notFound')}</Text></View>

  const originalText = teaching.originalText || ''
  const source = teaching.sourceText || ''
  const religionName = teaching.religion?.name ?? ''

  return (
    <ScrollView className='detail-page' scrollY>
      {/* Hero */}
      <View className='detail-hero detail-hero--short'>
        <View className='detail-hero__image detail-hero__image--gradient' />
        <View className='detail-hero__overlay'>
          {religionName && (
            <View className='detail-hero__badge'>
              <Text className='detail-hero__badge-text'>{religionName}</Text>
            </View>
          )}
          <Text className='detail-hero__title'>{teaching.name}</Text>
          {source && (
            <Text className='detail-hero__subtitle'>📖 {source}</Text>
          )}
        </View>
      </View>

      {/* Original Text */}
      {originalText && (
        <View className='section'>
          <Text className='section__title'>{t('teachingDetail.originalText')}</Text>
          <View className='quote-card'>
            <View className='quote-card__bar' />
            <Text className='quote-card__text'>{originalText}</Text>
          </View>
        </View>
      )}

      {/* Translation */}
      {teaching.translationCn && (
        <View className='section'>
          <Text className='section__title'>{t('teachingDetail.translation')}</Text>
          <View className='card'>
            <Text className='card__text'>{teaching.translationCn}</Text>
          </View>
        </View>
      )}

      {/* Religion */}
      {religionName && (
        <View className='section'>
          <Text className='section__title'>{t('teachingDetail.belongsToReligion')}</Text>
          <View className='card'>
            <Text className='card__text'>{religionName}</Text>
          </View>
        </View>
      )}

      {/* CTA */}
      <View className='cta-row'>
        <View className='cta-row__btn' onClick={() => Taro.navigateTo({ url: '/pages/trips/index' })}>
          <Text className='cta-row__btn-text'>{t('teachingDetail.planTrip')}</Text>
        </View>
        <View className='cta-row__btn cta-row__btn--outline' onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}>
          <Text className='cta-row__btn-text--outline'>{t('teachingDetail.aiPlan')}</Text>
        </View>
      </View>

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
