import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from '../../lib/i18n'
import { BRAND_DOMAIN } from '../../constants/brand'
import './index.scss'

const APP_VERSION = '0.2.0'

export default function AboutPage() {
  const { t } = useTranslation()

  const STATS = [
    { number: '12', label: t('about.statFaiths') },
    { number: '300+', label: t('about.statSites') },
    { number: '27', label: t('about.statTemples') },
    { number: '7', label: t('about.statLanguages') },
  ]

  return (
    <View className='about-page'>
      {/* Hero */}
      <View className='about-hero'>
        <Text className='about-hero__icon'>{'\u{1F3EF}'}</Text>
        <Text className='about-hero__title'>{BRAND_DOMAIN.toUpperCase()}</Text>
        <Text className='about-hero__subtitle'>{t('about.subtitle')}</Text>
      </View>

      {/* Mission */}
      <View className='about-card'>
        <Text className='about-card__title'>{t('about.missionTitle')}</Text>
        <Text className='about-card__text'>
          {t('about.missionText1')}
        </Text>
        <Text className='about-card__text'>
          {t('about.missionText2')}
        </Text>
      </View>

      {/* Stats */}
      <View className='stats-grid'>
        {STATS.map((s) => (
          <View key={s.label} className='stat-item'>
            <Text className='stat-item__number'>{s.number}</Text>
            <Text className='stat-item__label'>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Platform Features */}
      <View className='about-card'>
        <Text className='about-card__title'>{t('about.featuresTitle')}</Text>
        <Text className='about-card__text'>
          {'\u{1F30D}'} {t('about.feature1')}
        </Text>
        <Text className='about-card__text'>
          {'\u{1F9ED}'} {t('about.feature2')}
        </Text>
        <Text className='about-card__text'>
          {'\u{1F4D6}'} {t('about.feature3')}
        </Text>
        <Text className='about-card__text'>
          {'\u{1F3C6}'} {t('about.feature4')}
        </Text>
      </View>

      {/* Links */}
      <View className='about-links'>
        <View
          className='about-link'
          hoverClass='about-link--hover'
          onClick={() => Taro.navigateTo({ url: '/pages/privacy/index' })}
        >
          <Text className='about-link__text'>{t('about.privacyPolicy')}</Text>
          <Text className='about-link__arrow'>&gt;</Text>
        </View>
        <View
          className='about-link'
          hoverClass='about-link--hover'
          onClick={() => Taro.navigateTo({ url: '/pages/terms/index' })}
        >
          <Text className='about-link__text'>{t('about.termsOfService')}</Text>
          <Text className='about-link__arrow'>&gt;</Text>
        </View>
      </View>

      {/* Footer */}
      <View className='about-footer'>
        <Text className='about-footer__version'>v{APP_VERSION}</Text>
        <Text className='about-footer__copyright'>
          JOINUS.COM Global Ancestral Temple Travel Platform
        </Text>
      </View>
    </View>
  )
}
