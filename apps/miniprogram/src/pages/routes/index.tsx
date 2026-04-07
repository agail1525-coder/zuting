import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Route, PaginatedRoutes, fetchRoutes } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function RoutesPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const initialCategory = (router.params.category as string) || ''
  const [routes, setRoutes] = useState<Route[]>([])
  const [total, setTotal] = useState(0)
  const [category, setCategory] = useState(initialCategory)
  const [loading, setLoading] = useState(true)

  const CATEGORIES = [
    { value: '', label: t('routes.filterAll') },
    { value: 'ZEN', label: t('routes.categoryZen') },
    { value: 'BUDDHIST', label: t('routes.categoryBuddhist') },
    { value: 'TAOIST', label: t('routes.categoryTaoist') },
    { value: 'CHRISTIAN', label: t('routes.categoryChristian') },
    { value: 'ISLAMIC', label: t('routes.categoryIslamic') },
    { value: 'CROSS_CULTURAL', label: t('routes.categoryCrossCultural') },
    { value: 'HINDU', label: t('routes.categoryHindu') },
  ]

  const DIFFICULTY_LABELS: Record<string, string> = {
    EASY: t('routes.difficultyEasy'),
    MODERATE: t('routes.difficultyModerate'),
    CHALLENGING: t('routes.difficultyChallenging'),
  }

  const loadRoutes = async (cat?: string) => {
    try {
      setLoading(true)
      const c = cat ?? category
      const data = await fetchRoutes({
        category: c || undefined,
        pageSize: '20',
      })
      setRoutes(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error('Failed to load routes:', err)
      Taro.showToast({ title: t('routes.loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoutes()
  }, [])

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    loadRoutes(cat)
  }

  return (
    <ScrollView className='routes-page' scrollY>
      {/* Category Filter */}
      <ScrollView className='filter-bar' scrollX>
        {CATEGORIES.map(c => (
          <Text
            key={c.value}
            className={`filter-chip ${category === c.value ? 'filter-chip--active' : ''}`}
            onClick={() => handleCategoryChange(c.value)}
          >
            {c.label}
          </Text>
        ))}
      </ScrollView>

      {/* Route List */}
      {loading ? (
        <View className='loading'>
          <Text className='loading__text'>{t('common.loading')}</Text>
        </View>
      ) : routes.length === 0 ? (
        <View className='empty'>
          <Text className='empty__text'>{t('routes.noRoutes')}</Text>
          <Text
            className='empty__reset'
            onClick={() => handleCategoryChange('')}
          >
            {t('routes.clearFilter')}
          </Text>
        </View>
      ) : (
        <View className='route-list'>
          {routes.map(route => {
            const price = (route.priceFrom / 100).toLocaleString()
            return (
              <View
                key={route.id}
                className='route-item'
                hoverClass='route-item--hover'
                onClick={() => Taro.navigateTo({ url: `/pages/route-detail/index?slug=${route.slug}` })}
              >
                <View className='route-item__image'>
                  <Text className='route-item__emoji'>
                    {route.category === 'ZEN' ? '\u{1F3EF}' : route.category === 'BUDDHIST' ? '\u2638' : route.category === 'TAOIST' ? '\u262F' : route.category === 'CHRISTIAN' ? '\u26EA' : route.category === 'ISLAMIC' ? '\u{1F54C}' : '\u{1F30F}'}
                  </Text>
                </View>
                <View className='route-item__body'>
                  <View className='route-item__tags'>
                    <Text className='route-item__tag'>{t('routes.daysNights', { days: route.duration, nights: route.nights })}</Text>
                    <Text className='route-item__tag'>{DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}</Text>
                  </View>
                  <Text className='route-item__title'>{route.title}</Text>
                  <Text className='route-item__subtitle'>{route.subtitle}</Text>
                  <View className='route-item__footer'>
                    <Text className='route-item__price'>¥{price}<Text className='route-item__price-unit'>{t('routes.perPerson')}</Text></Text>
                    {route.rating && (
                      <Text className='route-item__rating'>★ {route.rating.toFixed(1)}</Text>
                    )}
                  </View>
                </View>
              </View>
            )
          })}
          <Text className='route-total'>{t('routes.totalRoutes', { count: total })}</Text>
        </View>
      )}
    </ScrollView>
  )
}
