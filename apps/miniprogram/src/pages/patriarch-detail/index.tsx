import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Patriarch, fetchPatriarchById, recordView } from '../../lib/api'
import RelatedEntities from '../../components/RelatedEntities'
import SaveButton from '../../components/SaveButton'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function PatriarchDetailPage() {
  const { t } = useTranslation()
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
      recordView('PATRIARCH', id!)
    } catch (err) {
      console.error('Failed to load patriarch:', err)
      setError(t('patriarchDetail.networkError'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <View className='container'><Text className='loading-text'>{t('common.loading')}</Text></View>
  if (error) return <View className='container'><Text className='empty-text'>{error}</Text><Text className='retry-btn' onClick={loadPatriarch}>{t('patriarchDetail.tapRetry')}</Text></View>
  if (!patriarch) return <View className='container'><Text className='empty-text'>{t('patriarchDetail.notFound')}</Text></View>

  const hasImage = !!patriarch.imageUrl
  const era = patriarch.dates ?? ''
  const coreTeaching = patriarch.coreTeaching ?? ''

  return (
    <ScrollView className='detail-page' scrollY>
      {/* Hero */}
      <View className='detail-hero'>
        {hasImage ? (
          <Image className='detail-hero__image' src={patriarch.imageUrl!} mode='aspectFill' />
        ) : (
          <View className='detail-hero__image detail-hero__image--gradient' />
        )}
        <View className='detail-hero__overlay'>
          {patriarch.religion && (
            <View className='detail-hero__badge'>
              <Text className='detail-hero__badge-text'>{patriarch.religion.name}</Text>
            </View>
          )}
          <Text className='detail-hero__title'>{patriarch.name}</Text>
          <Text className='detail-hero__subtitle'>{patriarch.nameEn}</Text>
          <View className='detail-hero__tags'>
            {patriarch.title && (
              <View className='detail-hero__tag'>
                <Text className='detail-hero__tag-text'>{patriarch.title}</Text>
              </View>
            )}
            {era && (
              <View className='detail-hero__tag'>
                <Text className='detail-hero__tag-text'>{era}</Text>
              </View>
            )}
          </View>
        </View>
        <View className='detail-hero__save'>
          <SaveButton entityType='PATRIARCH' entityId={id!} size='small' />
        </View>
      </View>

      {/* Core Teaching */}
      {coreTeaching && (
        <View className='section'>
          <Text className='section__title'>{t('patriarchDetail.coreTeaching')}</Text>
          <View className='teaching-card'>
            <Text className='teaching-card__icon'>📖</Text>
            <Text className='teaching-card__text'>{coreTeaching}</Text>
          </View>
        </View>
      )}

      {/* Biography */}
      {patriarch.biography && (
        <View className='section'>
          <Text className='section__title'>{t('patriarchDetail.biography')}</Text>
          <View className='card'>
            <Text className='card__text'>{patriarch.biography}</Text>
          </View>
        </View>
      )}

      {/* Related Entities */}
      <View className='section'>
        <RelatedEntities entityType='PATRIARCH' entityId={id!} title={t('patriarchDetail.relatedPatriarchs')} />
      </View>

      {/* CTA */}
      <View className='cta-row'>
        <View className='cta-row__btn' onClick={() => Taro.navigateTo({ url: '/pages/trips/index' })}>
          <Text className='cta-row__btn-text'>{t('patriarchDetail.planTrip')}</Text>
        </View>
        <View className='cta-row__btn cta-row__btn--outline' onClick={() => Taro.navigateTo({ url: '/pages/chat/index' })}>
          <Text className='cta-row__btn-text--outline'>{t('patriarchDetail.aiPlan')}</Text>
        </View>
      </View>

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}
