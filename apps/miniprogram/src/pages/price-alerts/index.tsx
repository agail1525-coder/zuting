import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PriceAlertItem, fetchPriceAlerts, deletePriceAlert } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import './index.scss'

export default function PriceAlertsPage() {
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
      title: '删除提醒',
      content: `确定删除「${routeTitle}」的价格提醒吗？`,
      confirmText: '删除',
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
      Taro.showToast({ title: '已删除', icon: 'success' })
    } catch {
      Taro.showToast({ title: '删除失败', icon: 'none' })
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
          <Text className='pa-empty__title'>请先登录</Text>
          <Text className='pa-empty__desc'>登录后可管理您的价格提醒</Text>
        </View>
      </View>
    )
  }

  const triggeredCount = alerts.filter(a => a.triggered).length

  return (
    <ScrollView className='price-alerts-page' scrollY>
      {/* Header */}
      <View className='pa-header'>
        <Text className='pa-header__title'>🔔 价格提醒</Text>
        <Text className='pa-header__subtitle'>设定目标价，降价立即通知</Text>
      </View>

      {/* Loading */}
      {loading ? (
        <View className='pa-loading'>
          <Text className='pa-loading__text'>加载中...</Text>
        </View>
      ) : alerts.length === 0 ? (
        /* Empty State */
        <View className='pa-empty'>
          <Text className='pa-empty__icon'>🔔</Text>
          <Text className='pa-empty__title'>暂无价格提醒</Text>
          <Text className='pa-empty__desc'>
            前往路线详情页，为心仪路线设定目标价格，降价时第一时间通知您
          </Text>
          <View className='pa-empty__btn' onClick={goToRoutes}>
            <Text className='pa-empty__btn-text'>浏览路线</Text>
          </View>
        </View>
      ) : (
        <>
          {/* Summary */}
          <View className='pa-summary'>
            <Text className='pa-summary__text'>
              共 <Text className='pa-summary__count'>{alerts.length}</Text> 个提醒
              {triggeredCount > 0 && `，${triggeredCount} 个已触发`}
            </Text>
            <View className='pa-summary__btn' onClick={goToRoutes}>
              <Text className='pa-summary__btn-text'>+ 新增</Text>
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
                      {triggered ? '已触发' : '监控中'}
                    </Text>
                  </View>

                  {/* Prices */}
                  <View className='pa-card__prices'>
                    <View className='pa-card__price-col'>
                      <Text className='pa-card__price-label'>目标价</Text>
                      <Text className='pa-card__price-value pa-card__price-value--target'>
                        {formatPrice(alert.targetPrice)}
                      </Text>
                    </View>

                    <View className='pa-card__price-col'>
                      <Text className='pa-card__price-label'>当前价</Text>
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
                      创建于 {alert.createdAt.slice(0, 10)}
                    </Text>
                    <View className='pa-card__actions'>
                      <Text
                        className='pa-card__view-btn'
                        onClick={() => goToRouteDetail(alert.routeId)}
                      >
                        查看路线
                      </Text>
                      <Text
                        className='pa-card__delete-btn'
                        onClick={() => handleDelete(alert.id, alert.routeTitle)}
                      >
                        删除
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
