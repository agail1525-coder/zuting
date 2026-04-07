import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PriceAlertItem, fetchPriceAlerts, deletePriceAlert } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function PriceAlertsPage() {
  const { t } = useTranslation()
  const [alerts, setAlerts] = useState<PriceAlertItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadAlerts = useCallback(async () => {
    if (!isLoggedIn()) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const list = await fetchPriceAlerts()
      setAlerts(Array.isArray(list) ? list : [])
    } catch {
      console.error('[PriceAlerts] load failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  // Reload on page show (e.g. returning from route detail after creating alert)
  useEffect(() => {
    const handler = () => { loadAlerts() }
    Taro.eventCenter.on('priceAlerts:refresh', handler)
    return () => { Taro.eventCenter.off('priceAlerts:refresh', handler) }
  }, [loadAlerts])

  const handleDelete = (alertId: string, routeTitle: string) => {
    Taro.showModal({
      title: t('priceAlerts.deleteTitle'),
      content: t('priceAlerts.deleteConfirm', { name: routeTitle }),
      confirmText: t('priceAlerts.delete'),
      confirmColor: '#EF4444',
    }).then(res => {
      if (res.confirm) {
        doDelete(alertId)
      }
    })
  }

  const doDelete = async (alertId: string) => {
    try {
      await deletePriceAlert(alertId)
      setAlerts(prev => prev.filter(a => a.id !== alertId))
      Taro.showToast({ title: t('priceAlerts.deleted'), icon: 'success' })
    } catch {
      Taro.showToast({ title: t('priceAlerts.deleteFailed'), icon: 'none' })
    }
  }

  const goToRoutes = () => {
    Taro.navigateTo({ url: '/pages/routes/index' })
  }

  const goToRouteDetail = (routeId: string) => {
    Taro.navigateTo({ url: `/pages/route-detail/index?id=${routeId}` })
  }

  const formatPrice = (cents: number): string => {
    return `¥${(cents / 100).toFixed(0)}`
  }

  // Not logged in
  if (!isLoggedIn()) {
    return (
      <View className='price-alerts-page'>
        <View className='pa-empty'>
          <Text className='pa-empty__icon'>🔐</Text>
          <Text className='pa-empty__title'>{t('priceAlerts.loginRequired')}</Text>
          <Text className='pa-empty__desc'>{t('priceAlerts.loginDesc')}</Text>
        </View>
      </View>
    )
  }

  const triggeredCount = alerts.filter(a => a.triggered).length

  return (
    <ScrollView className='price-alerts-page' scrollY>
      {/* Header */}
      <View className='pa-header'>
        <Text className='pa-header__title'>{t('priceAlerts.title')}</Text>
        <Text className='pa-header__subtitle'>{t('priceAlerts.subtitle')}</Text>
      </View>

      {/* Loading */}
      {loading ? (
        <View className='pa-loading'>
          <Text className='pa-loading__text'>{t('common.loading')}</Text>
        </View>
      ) : alerts.length === 0 ? (
        /* Empty State */
        <View className='pa-empty'>
          <Text className='pa-empty__icon'>🔔</Text>
          <Text className='pa-empty__title'>{t('priceAlerts.emptyTitle')}</Text>
          <Text className='pa-empty__desc'>
            {t('priceAlerts.emptyDesc')}
          </Text>
          <View className='pa-empty__btn' onClick={goToRoutes}>
            <Text className='pa-empty__btn-text'>{t('priceAlerts.browseRoutes')}</Text>
          </View>
        </View>
      ) : (
        <>
          {/* Summary */}
          <View className='pa-summary'>
            <Text className='pa-summary__text'>
              {t('priceAlerts.totalCount', { count: alerts.length })}
              {triggeredCount > 0 && t('priceAlerts.triggeredCount', { count: triggeredCount })}
            </Text>
            <View className='pa-summary__btn' onClick={goToRoutes}>
              <Text className='pa-summary__btn-text'>{t('priceAlerts.addNew')}</Text>
            </View>
          </View>

          {/* Alert List */}
          <View className='pa-list'>
            {alerts.map(alert => {
              const triggered = alert.triggered
              const hasCurrent = alert.currentPrice !== null
              const diff = hasCurrent ? (alert.currentPrice as number) - alert.targetPrice : null

              return (
                <View
                  key={alert.id}
                  className={`pa-card ${triggered ? 'pa-card--triggered' : ''}`}
                >
                  {/* Top: Route name + status */}
                  <View className='pa-card__top'>
                    <Text className='pa-card__route'>{alert.routeTitle}</Text>
                    <Text
                      className={`pa-card__status-badge ${
                        triggered
                          ? 'pa-card__status-badge--triggered'
                          : 'pa-card__status-badge--watching'
                      }`}
                    >
                      {triggered ? t('priceAlerts.statusTriggered') : t('priceAlerts.statusWatching')}
                    </Text>
                  </View>

                  {/* Prices */}
                  <View className='pa-card__prices'>
                    <View className='pa-card__price-col'>
                      <Text className='pa-card__price-label'>{t('priceAlerts.targetPrice')}</Text>
                      <Text className='pa-card__price-value pa-card__price-value--target'>
                        {formatPrice(alert.targetPrice)}
                      </Text>
                    </View>

                    <View className='pa-card__price-col'>
                      <Text className='pa-card__price-label'>{t('priceAlerts.currentPrice')}</Text>
                      <Text
                        className={`pa-card__price-value ${
                          triggered
                            ? 'pa-card__price-value--reached'
                            : 'pa-card__price-value--current'
                        }`}
                      >
                        {hasCurrent ? formatPrice(alert.currentPrice as number) : '—'}
                      </Text>
                    </View>

                    {diff !== null && (
                      <View className='pa-card__diff'>
                        <Text
                          className={`pa-card__diff-text ${
                            diff <= 0
                              ? 'pa-card__diff-text--down'
                              : 'pa-card__diff-text--up'
                          }`}
                        >
                          {diff <= 0 ? '↓' : '↑'} {formatPrice(Math.abs(diff))}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Footer: date + actions */}
                  <View className='pa-card__footer'>
                    <Text className='pa-card__date'>
                      {t('priceAlerts.createdAt')} {alert.createdAt.slice(0, 10)}
                    </Text>
                    <View className='pa-card__actions'>
                      <Text
                        className='pa-card__view-btn'
                        onClick={() => goToRouteDetail(alert.routeId)}
                      >
                        {t('priceAlerts.viewRoute')}
                      </Text>
                      <Text
                        className='pa-card__delete-btn'
                        onClick={() => handleDelete(alert.id, alert.routeTitle)}
                      >
                        {t('priceAlerts.delete')}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>

          <View style={{ height: '120rpx' }} />
        </>
      )}
    </ScrollView>
  )
}
