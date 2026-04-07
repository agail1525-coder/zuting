import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { fetchPriceTrend, PriceTrendResponse, fetchRoutes, Route } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

const BAR_HEIGHT = 200

export default function PriceTrendPage() {
  const { t } = useTranslation()
  const [routes, setRoutes] = useState<Route[]>([])
  const [routeId, setRouteId] = useState('')
  const [days, setDays] = useState(30)
  const [data, setData] = useState<PriceTrendResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const PERIODS = [
    { days: 7, label: t('priceTrend.period7') },
    { days: 30, label: t('priceTrend.period30') },
    { days: 90, label: t('priceTrend.period90') },
  ]

  useEffect(() => {
    fetchRoutes()
      .then(res => {
        const list = res.items || []
        setRoutes(list)
        if (list.length > 0) setRouteId(list[0].id)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!routeId) return
    setLoading(true)
    fetchPriceTrend(routeId, days)
      .then(setData)
      .catch(err => {
        console.error('Failed to load trend:', err)
        Taro.showToast({ title: t('priceTrend.loadFailed'), icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [routeId, days])

  const renderBars = () => {
    if (!data || data.trend.length < 2) return null
    const prices = data.trend.map(p => p.price)
    const minP = Math.min(...prices)
    const maxP = Math.max(...prices)
    const range = maxP - minP || 1

    const step = Math.max(1, Math.floor(data.trend.length / 12))
    const sampled = data.trend.filter((_, i) => i % step === 0 || i === data.trend.length - 1)

    return (
      <View className='trend-chart'>
        <View className='trend-chart__y-axis'>
          <Text className='trend-chart__y-label'>¥{maxP}</Text>
          <Text className='trend-chart__y-label'>¥{Math.round((maxP + minP) / 2)}</Text>
          <Text className='trend-chart__y-label'>¥{minP}</Text>
        </View>
        <ScrollView className='trend-chart__bars' scrollX>
          <View className='trend-chart__bars-row'>
            {sampled.map((p, i) => {
              const h = Math.max(8, ((p.price - minP) / range) * BAR_HEIGHT)
              return (
                <View key={i} className='trend-chart__bar-col'>
                  <View className='trend-chart__bar' style={{ height: `${h}rpx` }} />
                  <Text className='trend-chart__bar-label'>{p.date.slice(5)}</Text>
                </View>
              )
            })}
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View className='price-trend'>
      {/* Route selector */}
      <ScrollView className='filter-bar' scrollX>
        {routes.map(r => (
          <Text
            key={r.id}
            className={`filter-chip ${routeId === r.id ? 'filter-chip--active' : ''}`}
            onClick={() => setRouteId(r.id)}
          >
            {r.title}
          </Text>
        ))}
      </ScrollView>

      {/* Period selector */}
      <View className='period-row'>
        {PERIODS.map(p => (
          <Text
            key={p.days}
            className={`period-btn ${days === p.days ? 'period-btn--active' : ''}`}
            onClick={() => setDays(p.days)}
          >
            {p.label}
          </Text>
        ))}
      </View>

      <ScrollView className='content' scrollY>
        {loading ? (
          <Text className='loading-text'>{t('common.loading')}</Text>
        ) : !data ? (
          <Text className='empty-text'>{t('priceTrend.noTrendData')}</Text>
        ) : (
          <View>
            {renderBars()}

            <View className='stats-row'>
              <View className='stat-card'>
                <Text className='stat-card__label'>{t('priceTrend.lowestPrice')}</Text>
                <Text className='stat-card__value stat-card__value--green'>¥{data.minPrice}</Text>
              </View>
              <View className='stat-card'>
                <Text className='stat-card__label'>{t('priceTrend.averagePrice')}</Text>
                <Text className='stat-card__value'>¥{Math.round(data.avgPrice)}</Text>
              </View>
              <View className='stat-card'>
                <Text className='stat-card__label'>{t('priceTrend.highestPrice')}</Text>
                <Text className='stat-card__value stat-card__value--red'>¥{data.maxPrice}</Text>
              </View>
            </View>

            {data.recommendation && (
              <View className='rec-card'>
                <Text className='rec-card__text'>💡 {data.recommendation}</Text>
              </View>
            )}
          </View>
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
