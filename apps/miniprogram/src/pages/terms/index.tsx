import { View, Text, ScrollView } from '@tarojs/components'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function TermsPage() {
  const { t } = useTranslation()

  const SECTIONS = [
    {
      title: t('terms.section1Title'),
      paragraphs: [t('terms.section1Text1'), t('terms.section1Text2')],
      items: [],
    },
    {
      title: t('terms.section2Title'),
      paragraphs: [t('terms.section2Intro')],
      items: [
        t('terms.section2Item1'),
        t('terms.section2Item2'),
        t('terms.section2Item3'),
        t('terms.section2Item4'),
      ],
    },
    {
      title: t('terms.section3Title'),
      paragraphs: [t('terms.section3Intro')],
      items: [
        t('terms.section3Item1'),
        t('terms.section3Item2'),
        t('terms.section3Item3'),
        t('terms.section3Item4'),
        t('terms.section3Item5'),
        t('terms.section3Item6'),
      ],
    },
    {
      title: t('terms.section4Title'),
      paragraphs: [t('terms.section4Intro')],
      items: [
        t('terms.section4Item1'),
        t('terms.section4Item2'),
        t('terms.section4Item3'),
        t('terms.section4Item4'),
      ],
    },
    {
      title: t('terms.section5Title'),
      paragraphs: [t('terms.section5Intro')],
      items: [
        t('terms.section5Item1'),
        t('terms.section5Item2'),
        t('terms.section5Item3'),
        t('terms.section5Item4'),
      ],
    },
    {
      title: t('terms.section6Title'),
      paragraphs: [t('terms.section6Text1'), t('terms.section6Text2')],
      items: [],
    },
    {
      title: t('terms.section7Title'),
      paragraphs: [t('terms.section7Intro')],
      items: [
        t('terms.section7Item1'),
        t('terms.section7Item2'),
        t('terms.section7Item3'),
        t('terms.section7Item4'),
      ],
    },
    {
      title: t('terms.section8Title'),
      paragraphs: [t('terms.section8Text')],
      items: [],
    },
    {
      title: t('terms.section9Title'),
      paragraphs: [t('terms.section9Text')],
      items: [],
    },
    {
      title: t('terms.section10Title'),
      paragraphs: [
        t('terms.section10Text1'),
        t('terms.section10Email'),
        t('terms.section10Text2'),
      ],
      items: [],
    },
  ]

  return (
    <ScrollView className='terms-page' scrollY enhanced showScrollbar={false}>
      {/* Header */}
      <View className='terms-card'>
        <Text className='terms-card__update'>{t('terms.lastUpdate')}</Text>
        <Text className='terms-card__intro'>
          {t('terms.intro')}
        </Text>
      </View>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <View key={section.title} className='terms-section'>
          <Text className='terms-section__title'>{section.title}</Text>
          {section.paragraphs.map((p, i) => (
            <Text key={i} className='terms-section__text'>{p}</Text>
          ))}
          {section.items.map((item, i) => (
            <Text key={i} className='terms-section__item'>{item}</Text>
          ))}
        </View>
      ))}

      {/* Footer */}
      <View className='terms-footer'>
        <Text className='terms-footer__text'>{t('terms.footer')}</Text>
      </View>
    </ScrollView>
  )
}
