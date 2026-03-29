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
import './index.scss'

/* ── Tool entry cards ── */
const TOOLS = [
  {
    key: 'calendar',
    icon: '📅',
    title: '价格日历',
    desc: '按月查看每天价格，选出最低价出行日',
    accent: '#0066FF',
    bg: '#EFF6FF',
  },
  {
    key: 'compare',
    icon: '⚖️',
    title: '路线比价',
    desc: '多条路线价格横向对比，一目了然',
    accent: '#10B981',
    bg: '#ECFDF5',
  },
  {
    key: 'alert',
    icon: '🔔',
    title: '价格提醒',
    desc: '设定目标价，降价立即通知',
    accent: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    key: 'hack',
    icon: '💡',
    title: '省钱攻略',
    desc: '精选省钱技巧 · 错峰出行指南',
    accent: '#8B5CF6',
    bg: '#F5F3FF',
  },
]

/* ── Static tips ── */
const TIPS = [
  { icon: '🗓', title: '错峰出行', desc: '工作日出发比周末便宜 15-30%' },
  { icon: '⏰', title: '提前预订', desc: '提前 45 天以上可锁定早鸟价' },
  { icon: '🌱', title: '淡季首选', desc: '宗教圣地淡季体验更纯粹，价更低' },
  { icon: '📦', title: '选套餐', desc: '套餐组合比单买行程+住宿便宜 20%+' },
]

export default function PricesPage() {
  const [featuredRoutes, setFeaturedRoutes] = useState<Route[]>([])
  const [alerts, setAlerts] = useState<PriceAlertItem[]>([])
  const [loading, setLoading] = useState(true)

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
        Taro.showToast({ title: '请先选择路线', icon: 'none' })
      }
    } else if (key === 'alert') {
      Taro.showToast({ title: '请在路线详情页设置价格提醒', icon: 'none', duration: 2000 })
    } else {
      Taro.showToast({ title: '功能即将上线', icon: 'none' })
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await deletePriceAlert(alertId)
      setAlerts(prev => prev.filter(a => a.id !== alertId))
      Taro.showToast({ title: '已删除', icon: 'success' })
    } catch {
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  return (
    <ScrollView className='prices-page' scrollY>

      {/* ── Hero Banner ── */}
      <View className='prices-hero'>
        <Text className='prices-hero__title'>💰 价格工具</Text>
        <Text className='prices-hero__subtitle'>对标 Skyscanner · Kayak 价格分析能力</Text>
        <View className='prices-hero__badges'>
          <View className='prices-hero__badge'>
            <Text className='prices-hero__badge-text'>最低价提醒</Text>
          </View>
          <View className='prices-hero__badge'>
            <Text className='prices-hero__badge-text'>价格日历</Text>
          </View>
          <View className='prices-hero__badge'>
            <Text className='prices-hero__badge-text'>历史趋势</Text>
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
            <Text className='section-title'>🔔 我的价格提醒</Text>
            <Text className='section-count'>{alerts.length} 个</Text>
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
                        当前: {alert.currentPrice !== null ? `¥${(alert.currentPrice / 100).toFixed(0)}` : '—'}
                      </Text>
                      <Text className='alert-item__target'>
                        目标: ¥{(alert.targetPrice / 100).toFixed(0)}
                      </Text>
                      {diff !== null && diff <= 0 && (
                        <Text className='alert-item__reached'>已达到!</Text>
                      )}
                    </View>
                  </View>
                  <View className='alert-item__right'>
                    {triggered && <Text className='alert-item__triggered-badge'>已触发</Text>}
                    <Text
                      className='alert-item__delete'
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      删除
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
        <Text className='section-title'>📅 查看路线价格日历</Text>
      </View>
      {loading ? (
        <View className='loading-wrap'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      ) : featuredRoutes.length === 0 ? (
        <View className='empty-wrap'>
          <Text className='empty-text'>暂无路线数据</Text>
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
                    ¥{(route.priceFrom / 100).toFixed(0)}起
                  </Text>
                </View>
              </View>
              <View className='route-mini-card__body'>
                <Text className='route-mini-card__title'>{route.title}</Text>
                <Text className='route-mini-card__meta'>{route.duration}天{route.nights}晚</Text>
                <View className='route-mini-card__btn'>
                  <Text className='route-mini-card__btn-text'>看价格日历</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Tips Section ── */}
      <View className='section-header'>
        <Text className='section-title'>💡 省钱攻略</Text>
      </View>
      <View className='tips-grid'>
        {TIPS.map(tip => (
          <View key={tip.title} className='tip-card'>
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
