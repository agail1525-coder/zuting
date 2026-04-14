import { useState, useEffect, useMemo, useRef } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PromotionItem, fetchPromotions } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

type PromoTab = 'ALL' | 'FLASH_SALE' | 'EARLY_BIRD' | 'LIMITED_TIME'

const TYPE_COLORS: Record<string, string> = {
  FLASH_SALE: '#EF4444',
  EARLY_BIRD: '#F59E0B',
  LIMITED_TIME: '#8B5CF6',
  COUPON: '#10B981',
  SEASONAL: '#3264ff',
}

const TYPE_LABEL_KEYS: Record<string, string> = {
  FLASH_SALE: 'promotions.typeFlashSale',
  EARLY_BIRD: 'promotions.typeEarlyBird',
  LIMITED_TIME: 'promotions.typeLimitedTime',
  COUPON: 'promotions.typeCoupon',
  SEASONAL: 'promotions.typeSeasonal',
}

const TYPE_ICONS: Record<string, string> = {
  FLASH_SALE: '⚡',
  EARLY_BIRD: '🐦',
  LIMITED_TIME: '⏰',
  COUPON: '🎫',
  SEASONAL: '🌸',
}

function QuotaBar({ used, total, tr }: { used: number; total: number; tr: (key: string, params?: Record<string, string | number>) => string }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  const remaining = total - used
  return (
    <View className='quota-bar'>
      <View className='quota-bar__track'>
        <View className='quota-bar__fill' style={{ width: `${pct}%` }} />
      </View>
      <Text className='quota-bar__text'>
        {remaining > 0 ? tr('promotions.quotaRemaining', { count: remaining }) : tr('promotions.quotaSoldOut')}
      </Text>
    </View>
  )
}

function PromotionCard({ promo, tr }: { promo: PromotionItem; tr: (key: string, params?: Record<string, string | number>) => string }) {
  const ended = new Date(promo.endAt) < new Date()
  const accentColor = TYPE_COLORS[promo.type] || '#3264ff'

  const formatCountdown = (endAt: string): string => {
    const ms = new Date(endAt).getTime() - Date.now()
    if (ms <= 0) return tr('promotions.ended')
    const totalSeconds = Math.floor(ms / 1000)
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    if (days > 0) return tr('promotions.countdownDHM', { days, hours, minutes })
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const [countdown, setCountdown] = useState(() => formatCountdown(promo.endAt))
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (ended) return
    timerRef.current = setInterval(() => {
      setCountdown(formatCountdown(promo.endAt))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [promo.endAt, ended])

  const discountLabel = promo.discountType === 'PERCENT'
    ? tr('promotions.percentOff', { value: promo.discountValue })
    : tr('promotions.amountOff', { value: promo.discountValue })

  const typeLabel = `${TYPE_ICONS[promo.type] || ''} ${tr(TYPE_LABEL_KEYS[promo.type] || 'promotions.typeFlashSale')}`.trim()

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
          <Text className='promo-card__type-text'>{typeLabel}</Text>
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
            <Text className='promo-card__countdown-label'>{tr('promotions.endsIn')} </Text>
            <Text className='promo-card__countdown-value'>{countdown}</Text>
          </View>
        ) : (
          <Text className='promo-card__ended'>{tr('promotions.eventEnded')}</Text>
        )}

        {/* Quota bar */}
        {promo.totalQuota > 0 && (
          <QuotaBar used={promo.usedQuota} total={promo.totalQuota} tr={tr} />
        )}

        <View className='promo-card__footer'>
          <View
            className={`promo-card__btn ${ended ? 'promo-card__btn--disabled' : ''}`}
            style={ended ? {} : { backgroundColor: accentColor }}
          >
            <Text className='promo-card__btn-text'>{ended ? tr('promotions.ended') : tr('promotions.buyNow')}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default function PromotionsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<PromoTab>('ALL')
  const [promotions, setPromotions] = useState<PromotionItem[]>([])
  const [allPromotions, setAllPromotions] = useState<PromotionItem[]>([])
  const [loading, setLoading] = useState(true)

  const TABS: { key: PromoTab; label: string }[] = useMemo(() => [
    { key: 'ALL', label: t('promotions.tabAll') },
    { key: 'FLASH_SALE', label: t('promotions.tabFlashSale') },
    { key: 'EARLY_BIRD', label: t('promotions.tabEarlyBird') },
    { key: 'LIMITED_TIME', label: t('promotions.tabLimitedTime') },
  ], [t])

  // Load all promotions once for stats, and filtered for display
  useEffect(() => {
    loadAllForStats()
  }, [])

  useEffect(() => { loadPromotions() }, [activeTab])

  const loadAllForStats = async () => {
    try {
      const res = await fetchPromotions(undefined)
      setAllPromotions(res.data || [])
    } catch {
      setAllPromotions([])
    }
  }

  const loadPromotions = async () => {
    setLoading(true)
    try {
      const type = activeTab === 'ALL' ? undefined : activeTab
      const res = await fetchPromotions(type)
      setPromotions(res.data || [])
    } catch {
      Taro.showToast({ title: t('promotions.loadFailed'), icon: 'none' })
      setPromotions([])
    } finally {
      setLoading(false)
    }
  }

  // Stats computed from allPromotions
  const stats = useMemo(() => {
    const now = new Date()
    const flashSaleCount = allPromotions.filter(p => p.type === 'FLASH_SALE').length
    const expiringSoonCount = allPromotions.filter(p => {
      const end = new Date(p.endAt)
      const diffHours = (end.getTime() - now.getTime()) / 3600000
      return diffHours > 0 && diffHours <= 24
    }).length
    return { total: allPromotions.length, flashSaleCount, expiringSoonCount }
  }, [allPromotions])

  // Tab counts from allPromotions
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allPromotions.length }
    TABS.forEach(({ key }) => {
      if (key !== 'ALL') {
        counts[key] = allPromotions.filter(p => p.type === key).length
      }
    })
    return counts
  }, [allPromotions, TABS])

  const hasFlashSales = allPromotions.some(p => p.type === 'FLASH_SALE' && new Date(p.endAt) > new Date())

  return (
    <View className='promotions-page'>
      {/* Stats Header */}
      <View style={{ display: 'flex', flexDirection: 'row', gap: '16rpx', padding: '24rpx 32rpx 0' }}>
        <View style={{ flex: 1, background: 'rgba(212,168,85,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#D4A855' }}>{stats.total}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>{t('promotions.statsTotal')}</Text>
        </View>
        <View style={{ flex: 1, background: 'rgba(239,68,68,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#EF4444' }}>{stats.flashSaleCount}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>⚡ {t('promotions.tabFlashSale')}</Text>
        </View>
        <View style={{ flex: 1, background: 'rgba(245,158,11,0.12)', borderRadius: '16rpx', padding: '20rpx', textAlign: 'center' }}>
          <Text style={{ display: 'block', fontSize: '36rpx', fontWeight: 'bold', color: '#F59E0B' }}>{stats.expiringSoonCount}</Text>
          <Text style={{ display: 'block', fontSize: '22rpx', color: '#94a3b8', marginTop: '4rpx' }}>{t('promotions.statsExpiringSoon')}</Text>
        </View>
      </View>

      {/* Flash Sale Banner */}
      {hasFlashSales && (
        <View style={{
          margin: '20rpx 32rpx 0',
          padding: '24rpx 32rpx',
          background: 'linear-gradient(135deg, #EF4444, #F97316)',
          borderRadius: '16rpx',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '16rpx',
        }}>
          <Text style={{ fontSize: '40rpx' }}>⚡</Text>
          <View>
            <Text style={{ display: 'block', fontSize: '30rpx', fontWeight: 'bold', color: '#fff' }}>{t('promotions.flashSaleOngoing')}</Text>
            <Text style={{ display: 'block', fontSize: '24rpx', color: 'rgba(255,255,255,0.85)', marginTop: '4rpx' }}>{t('promotions.flashSaleHurry')}</Text>
          </View>
          <View style={{ marginLeft: 'auto' }}>
            <Text style={{ fontSize: '24rpx', color: '#fff' }}>{t('promotions.goGrab')} →</Text>
          </View>
        </View>
      )}

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
                {tab.label} ({tabCounts[tab.key] ?? 0})
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
            <Text className='empty__text'>{t('common.loading')}</Text>
          </View>
        ) : promotions.length === 0 && activeTab !== 'ALL' ? (
          <View className='empty'>
            <Text className='empty__icon'>🎯</Text>
            <Text className='empty__text'>{t('promotions.noCategoryEvents')}</Text>
            <View
              style={{ marginTop: '24rpx', padding: '16rpx 40rpx', background: 'rgba(212,168,85,0.15)', borderRadius: '40rpx' }}
              onClick={() => setActiveTab('ALL')}
            >
              <Text style={{ color: '#D4A855', fontSize: '28rpx' }}>{t('promotions.viewAllEvents')}</Text>
            </View>
          </View>
        ) : promotions.length === 0 ? (
          <View className='empty'>
            <Text className='empty__icon'>🎪</Text>
            <Text className='empty__text'>{t('promotions.noActiveEvents')}</Text>
            <Text style={{ display: 'block', fontSize: '24rpx', color: '#64748b', marginTop: '12rpx', textAlign: 'center' }}>{t('promotions.stayTuned')}</Text>
          </View>
        ) : (
          promotions.map(p => <PromotionCard key={p.id} promo={p} tr={t} />)
        )}
        <View style={{ height: '60rpx' }} />
      </ScrollView>
    </View>
  )
}
