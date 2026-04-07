import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  Route,
  PriceAlertItem,
  fetchFeaturedRoutes,
  fetchPriceAlerts,
  deletePriceAlert,
} from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function PricesPage() {
  const { t } = useTranslation()
  const [featuredRoutes, setFeaturedRoutes] = useState<Route[]>([])
  const [alerts, setAlerts] = useState<PriceAlertItem[]>([])
  const [loading, setLoading] = useState(true)

  const TOOLS = [
    {
      key: 'calendar',
      icon: '📅',
      title: t('prices.toolCalendar'),
      desc: t('prices.toolCalendarDesc'),
      accent: '#0066FF',
      bg: '#EFF6FF',
    },
    {
      key: 'compare',
      icon: '⚖️',
      title: t('prices.toolCompare'),
      desc: t('prices.toolCompareDesc'),
      accent: '#10B981',
      bg: '#ECFDF5',
    },
    {
      key: 'alert',
      icon: '🔔',
      title: t('prices.toolAlert'),
      desc: t('prices.toolAlertDesc'),
      accent: '#F59E0B',
      bg: '#FFFBEB',
    },
    {
      key: 'hack',
      icon: '💡',
      title: t('prices.toolHack'),
      desc: t('prices.toolHackDesc'),
      accent: '#8B5CF6',
      bg: '#F5F3FF',
    },
  ]

  const TIPS = [
    { icon: '🗓', title: t('prices.tipOffPeak'), desc: t('prices.tipOffPeakDesc') },
    { icon: '⏰', title: t('prices.tipEarlyBook'), desc: t('prices.tipEarlyBookDesc') },
    { icon: '🌱', title: t('prices.tipLowSeason'), desc: t('prices.tipLowSeasonDesc') },
    { icon: '📦', title: t('prices.tipPackage'), desc: t('prices.tipPackageDesc') },
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [routes, alertList] = await Promise.all([
        fetchFeaturedRoutes(8).catch(() => [] as Route[]),
        fetchPriceAlerts().catch(() => [] as PriceAlertItem[]),
      ])
      setFeaturedRoutes(routes)
      setAlerts(alertList)
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }

  const handleToolPress = (key: string) => {
    if (key === 'calendar') {
      if (featuredRoutes.length > 0) {
        Taro.navigateTo({
          url: `/pages/price-calendar/index?routeId=${featuredRoutes[0].id}&routeTitle=${encodeURIComponent(featuredRoutes[0].title)}`,
        })
      } else {
        Taro.showToast({ title: t('prices.selectRouteFirst'), icon: 'none' })
      }
    } else if (key === 'compare') {
      Taro.navigateTo({ url: '/pages/price-compare/index' })
    } else if (key === 'alert') {
      Taro.navigateTo({ url: '/pages/price-alerts/index' })
    } else if (key === 'hack') {
      Taro.pageScrollTo({ scrollTop: 9999, duration: 300 })
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await deletePriceAlert(alertId)
      setAlerts(prev => prev.filter(a => a.id !== alertId))
      Taro.showToast({ title: t('prices.deleted'), icon: 'success' })
    } catch {
      Taro.showToast({ title: t('prices.deleteFailed'), icon: 'none' })
    }
  }

  return (
    <ScrollView className='prices-page' scrollY>

      {/* ── Hero Banner ── */}
      <View className='prices-hero'>
        <Text className='prices-hero__title'>{t('prices.heroTitle')}</Text>
        <Text className='prices-hero__subtitle'>{t('prices.heroSubtitle')}</Text>
        <View className='prices-hero__badges'>
          <View className='prices-hero__badge'>
            <Text className='prices-hero__badge-text'>{t('prices.badgeLowestAlert')}</Text>
          </View>
          <View className='prices-hero__badge'>
            <Text className='prices-hero__badge-text'>{t('prices.badgeCalendar')}</Text>
          </View>
          <View className='prices-hero__badge'>
            <Text className='prices-hero__badge-text'>{t('prices.badgeTrend')}</Text>
          </View>
        </View>
      </View>

      {/* ── 4 Tool Cards ── */}
      <View className='tool-grid'>
        {TOOLS.map(tool => (
          <View
            key={tool.key}
            className='tool-card'
            style={{ backgroundColor: tool.bg, borderColor: tool.accent + '33' }}
            onClick={() => handleToolPress(tool.key)}
          >
            <View className='tool-card__icon-wrap' style={{ backgroundColor: tool.accent + '22' }}>
              <Text className='tool-card__icon'>{tool.icon}</Text>
            </View>
            <Text className='tool-card__title' style={{ color: tool.accent }}>{tool.title}</Text>
            <Text className='tool-card__desc'>{tool.desc}</Text>
            <View className='tool-card__arrow' style={{ backgroundColor: tool.accent }}>
              <Text className='tool-card__arrow-text'>→</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── Price Alert List ── */}
      {alerts.length > 0 && (
        <>
          <View className='section-header'>
            <Text className='section-title'>{t('prices.myAlerts')}</Text>
            <Text className='section-count'>{t('prices.alertCount', { count: alerts.length })}</Text>
          </View>
          <View className='alert-list'>
            {alerts.map(alert => {
              const triggered = alert.triggered
              const diff = alert.currentPrice !== null
                ? alert.currentPrice - alert.targetPrice
                : null
              return (
                <View key={alert.id} className={`alert-item ${triggered ? 'alert-item--triggered' : ''}`}>
                  <View className='alert-item__left'>
                    <Text className='alert-item__route'>{alert.routeTitle}</Text>
                    <View className='alert-item__prices'>
                      <Text className='alert-item__current'>
                        {t('prices.currentPrice')}: {alert.currentPrice !== null ? `¥${(alert.currentPrice / 100).toFixed(0)}` : '—'}
                      </Text>
                      <Text className='alert-item__target'>
                        {t('prices.targetPrice')}: ¥{(alert.targetPrice / 100).toFixed(0)}
                      </Text>
                      {diff !== null && diff <= 0 && (
                        <Text className='alert-item__reached'>{t('prices.reached')}</Text>
                      )}
                    </View>
                  </View>
                  <View className='alert-item__right'>
                    {triggered && <Text className='alert-item__triggered-badge'>{t('prices.triggered')}</Text>}
                    <Text
                      className='alert-item__delete'
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      {t('prices.delete')}
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        </>
      )}

      {/* ── Route List to Open Calendar ── */}
      <View className='section-header'>
        <Text className='section-title'>{t('prices.viewRouteCalendar')}</Text>
      </View>
      {loading ? (
        <View className='loading-wrap'>
          <Text className='loading-text'>{t('common.loading')}</Text>
        </View>
      ) : featuredRoutes.length === 0 ? (
        <View className='empty-wrap'>
          <Text className='empty-text'>{t('prices.noRouteData')}</Text>
        </View>
      ) : (
        <ScrollView className='route-scroll' scrollX>
          {featuredRoutes.map(route => (
            <View
              key={route.id}
              className='route-mini-card'
              onClick={() =>
                Taro.navigateTo({
                  url: `/pages/price-calendar/index?routeId=${route.id}&routeTitle=${encodeURIComponent(route.title)}`,
                })
              }
            >
              <View className='route-mini-card__cover-wrap'>
                {route.coverImage ? (
                  <Image
                    className='route-mini-card__cover'
                    src={route.coverImage}
                    mode='aspectFill'
                    lazyLoad
                  />
                ) : (
                  <View className='route-mini-card__cover route-mini-card__cover--placeholder'>
                    <Text className='route-mini-card__placeholder-icon'>🗺</Text>
                  </View>
                )}
                <View className='route-mini-card__price-badge'>
                  <Text className='route-mini-card__price'>
                    ¥{(route.priceFrom / 100).toFixed(0)}{t('prices.priceUp')}
                  </Text>
                </View>
              </View>
              <View className='route-mini-card__body'>
                <Text className='route-mini-card__title'>{route.title}</Text>
                <Text className='route-mini-card__meta'>{t('prices.daysNights', { days: route.duration, nights: route.nights })}</Text>
                <View className='route-mini-card__btn'>
                  <Text className='route-mini-card__btn-text'>{t('prices.viewCalendar')}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Tips Section ── */}
      <View className='section-header'>
        <Text className='section-title'>{t('prices.savingTips')}</Text>
      </View>
      <View className='tips-grid'>
        {TIPS.map((tip, idx) => (
          <View key={idx} className='tip-card'>
            <Text className='tip-card__icon'>{tip.icon}</Text>
            <View className='tip-card__content'>
              <Text className='tip-card__title'>{tip.title}</Text>
              <Text className='tip-card__desc'>{tip.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}
