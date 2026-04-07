import { View, Text, ScrollView } from '@tarojs/components'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function PrivacyPage() {
  const { t } = useTranslation()

  const SECTIONS = [
    {
      title: t('privacy.section1Title'),
      paragraphs: [t('privacy.section1Intro')],
      items: [
        t('privacy.section1Item1'),
        t('privacy.section1Item2'),
        t('privacy.section1Item3'),
        t('privacy.section1Item4'),
        t('privacy.section1Item5'),
      ],
    },
    {
      title: t('privacy.section2Title'),
      paragraphs: [t('privacy.section2Intro')],
      items: [
        t('privacy.section2Item1'),
        t('privacy.section2Item2'),
        t('privacy.section2Item3'),
        t('privacy.section2Item4'),
        t('privacy.section2Item5'),
      ],
    },
    {
      title: t('privacy.section3Title'),
      paragraphs: [t('privacy.section3Intro')],
      items: [
        t('privacy.section3Item1'),
        t('privacy.section3Item2'),
        t('privacy.section3Item3'),
        t('privacy.section3Item4'),
      ],
    },
    {
      title: t('privacy.section4Title'),
      paragraphs: [
        t('privacy.section4Text1'),
        t('privacy.section4Text2'),
      ],
      items: [],
    },
    {
      title: t('privacy.section5Title'),
      paragraphs: [t('privacy.section5Intro')],
      items: [
        t('privacy.section5Item1'),
        t('privacy.section5Item2'),
        t('privacy.section5Item3'),
        t('privacy.section5Item4'),
        t('privacy.section5Item5'),
      ],
    },
    {
      title: t('privacy.section6Title'),
      paragraphs: [t('privacy.section6Text')],
      items: [],
    },
    {
      title: t('privacy.section7Title'),
      paragraphs: [t('privacy.section7Text')],
      items: [],
    },
    {
      title: t('privacy.section8Title'),
      paragraphs: [
        t('privacy.section8Text1'),
        t('privacy.section8Email'),
        t('privacy.section8Text2'),
      ],
      items: [],
    },
  ]

  return (
    <ScrollView className='privacy-page' scrollY enhanced showScrollbar={false}>
      {/* Header */}
      <View className='policy-card'>
        <Text className='policy-card__update'>{t('privacy.lastUpdate')}</Text>
        <Text className='policy-card__intro'>
          {t('privacy.intro')}
        </Text>
      </View>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <View key={section.title} className='policy-section'>
          <Text className='policy-section__title'>{section.title}</Text>
          {section.paragraphs.map((p, i) => (
            <Text key={i} className='policy-section__text'>{p}</Text>
          ))}
          {section.items.map((item, i) => (
            <Text key={i} className='policy-section__item'>{item}</Text>
          ))}
        </View>
      ))}

      {/* Footer */}
      <View className='policy-footer'>
        <Text className='policy-footer__text'>{t('privacy.footer')}</Text>
      </View>
    </ScrollView>
  )
}
