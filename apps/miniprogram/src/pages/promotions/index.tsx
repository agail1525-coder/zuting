import { useState, useEffect, useRef } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PromotionItem, fetchPromotions } from '../../lib/api'
import './index.scss'

type PromoTab = 'ALL' | 'FLASH_SALE' | 'EARLY_BIRD' | 'LIMITED_TIME'

const TABS: { key: PromoTab; label: string }[] = [
  { key: 'ALL', label: '全部' },
  { key: 'FLASH_SALE', label: '闪购' },
  { key: 'EARLY_BIRD', label: '早鸟价' },
  { key: 'LIMITED_TIME', label: '限时折扣' },
]

const TYPE_LABELS: Record<string, string> = {
  FLASH_SALE: '⚡ 闪购',
  EARLY_BIRD: '🐦 早鸟',
  LIMITED_TIME: '⏰ 限时',
  COUPON: '🎫 优惠券',
  SEASONAL: '🌸 季节特惠',
}

const TYPE_COLORS: Record<string, string> = {
  FLASH_SALE: '#EF4444',
  EARLY_BIRD: '#F59E0B',
  LIMITED_TIME: '#8B5CF6',
  COUPON: '#10B981',
  SEASONAL: '#0066FF',
}

function formatCountdown(endAt: string): string {
  const ms = new Date(endAt).getTime() - Date.now()
  if (ms <= 0) return '已结束'
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (days > 0) return `${days}天${hours}时${minutes}分`
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function QuotaBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  const remaining = total - used
  return (
    <View className='quota-bar'>
      <View className='quota-bar__track'>
        <View className='quota-bar__fill' style={{ width: `${pct}%` }} />
      </View>
      <Text className='quota-bar__text'>
        {remaining > 0 ? `剩余 ${remaining} 名额` : '已抢完'}
      </Text>
    </View>
  )
}

function PromotionCard({ promo }: { promo: PromotionItem }) {
  const [countdown, setCountdown] = useState(() => formatCountdown(promo.endAt))
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ended = new Date(promo.endAt) < new Date()
  const accentColor = TYPE_COLORS[promo.type] || '#0066FF'

  useEffect(() => {
    if (ended) return
    timerRef.current = setInterval(() => {
      setCountdown(formatCountdown(promo.endAt))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [promo.endAt, ended])

  const discountLabel = promo.discountType === 'PERCENT'
    ? `${promo.discountValue}折`
    : `¥${promo.discountValue}OFF`

  return (
    <View
      className='promo-card'
      onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
    >
      {/* Cover */}
      <View className='promo-card__cover-wrap'>
        {promo.coverImage ? (
          <Image className='promo-card__cover' src={promo.coverImage} mode='aspectFill' lazyLoad />
        ) : (
          <View className='promo-card__cover promo-card__cover--placeholder'>
            <Text className='promo-card__cover-icon'>🌏</Text>
          </View>
        )}
        {/* Type badge */}
        <View className='promo-card__type-badge' style={{ backgroundColor: accentColor }}>
          <Text className='promo-card__type-text'>{TYPE_LABELS[promo.type] || promo.type}</Text>
        </View>
        {/* Discount badge */}
        <View className='promo-card__discount-badge'>
          <Text className='promo-card__discount-text'>{discountLabel}</Text>
        </View>
      </View>

      {/* Body */}
      <View className='promo-card__body'>
        <Text className='promo-card__name'>{promo.name}</Text>

        {/* Countdown */}
        {!ended ? (
          <View className='promo-card__countdown'>
            <Text className='promo-card__countdown-label'>距结束: </Text>
            <Text className='promo-card__countdown-value'>{countdown}</Text>
          </View>
        ) : (
          <Text className='promo-card__ended'>活动已结束</Text>
        )}

        {/* Quota bar */}
        {promo.totalQuota > 0 && (
          <QuotaBar used={promo.usedQuota} total={promo.totalQuota} />
        )}

        <View className='promo-card__footer'>
          <View
            className={`promo-card__btn ${ended ? 'promo-card__btn--disabled' : ''}`}
            style={ended ? {} : { backgroundColor: accentColor }}
          >
            <Text className='promo-card__btn-text'>{ended ? '已结束' : '立即抢购'}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState<PromoTab>('ALL')
  const [promotions, setPromotions] = useState<PromotionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPromotions() }, [activeTab])

  const loadPromotions = async () => {
    setLoading(true)
    try {
      const type = activeTab === 'ALL' ? undefined : activeTab
      const res = await fetchPromotions(type)
      setPromotions(res.data || [])
    } catch {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
      setPromotions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='promotions-page'>
      {/* Tabs */}
      <View className='tabs'>
        <ScrollView scrollX className='tabs__scroll'>
          {TABS.map(tab => (
            <View
              key={tab.key}
              className={`tabs__item ${activeTab === tab.key ? 'tabs__item--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text className={`tabs__text ${activeTab === tab.key ? 'tabs__text--active' : ''}`}>
                {tab.label}
              </Text>
              {activeTab === tab.key && <View className='tabs__indicator' />}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView className='promotions-list' scrollY>
        {loading ? (
          <View className='empty'>
            <Text className='empty__text'>加载中...</Text>
          </View>
        ) : promotions.length === 0 ? (
          <View className='empty'>
            <Text className='empty__text'>暂无活动</Text>
          </View>
        ) : (
          promotions.map(p => <PromotionCard key={p.id} promo={p} />)
        )}
        <View style={{ height: '60rpx' }} />
      </ScrollView>
    </View>
  )
}
