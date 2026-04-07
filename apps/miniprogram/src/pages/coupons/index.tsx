import { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  CouponItem, UserCoupon,
  fetchAvailableCoupons, fetchMyCoupons, claimCoupon,
} from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

type TabKey = 'available' | 'mine' | 'used'

function formatDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '/')
}

function isExpired(endAt: string) {
  return new Date(endAt) < new Date()
}

/** Days until expiry, or -1 if already expired */
function daysUntilExpiry(endAt: string): number {
  const diff = new Date(endAt).getTime() - Date.now()
  if (diff <= 0) return -1
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function CouponCard({ coupon, onClaim, tr }: { coupon: CouponItem; onClaim?: (id: string) => void; tr: (key: string, params?: Record<string, string | number>) => string }) {
  const expired = isExpired(coupon.endAt)
  const isPercent = coupon.type === 'PERCENT'
  const stripColor = isPercent ? '#0066FF' : '#EF4444'
  const remaining = daysUntilExpiry(coupon.endAt)

  return (
    <View className='coupon-card'>
      <View className='coupon-card__strip' style={{ backgroundColor: stripColor }} />
      <View className='coupon-card__body'>
        <View className='coupon-card__left'>
          <View className='coupon-card__amount-row'>
            {!isPercent && <Text className='coupon-card__currency'>¥</Text>}
            <Text className='coupon-card__amount'>
              {isPercent ? tr('coupons.percentOff', { value: coupon.value }) : coupon.value}
            </Text>
          </View>
          {coupon.minAmount != null && (
            <Text className='coupon-card__min'>{tr('coupons.minAmount', { amount: coupon.minAmount })}</Text>
          )}
        </View>
        <View className='coupon-card__divider' />
        <View className='coupon-card__right'>
          <Text className='coupon-card__name'>{coupon.name}</Text>
          <Text className='coupon-card__code'>{tr('coupons.code')}: {coupon.code}</Text>
          <Text className='coupon-card__date'>
            {expired ? tr('coupons.expired') : tr('coupons.validUntil', { date: formatDate(coupon.endAt) })}
          </Text>
          {/* G4: Expiry countdown */}
          {!expired && remaining <= 3 && remaining >= 0 && (
            <Text style={{ fontSize: '20rpx', color: '#EF4444', marginTop: '4rpx' }}>
              {remaining === 0 ? tr('coupons.expiresToday') : tr('coupons.expiresInDays', { days: remaining })}
            </Text>
          )}
        </View>
        {onClaim && (
          <View
            className={`coupon-card__btn ${expired ? 'coupon-card__btn--disabled' : ''}`}
            onClick={() => !expired && onClaim(coupon.id)}
          >
            <Text className='coupon-card__btn-text'>{tr('coupons.claim')}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

function MyCouponCard({ userCoupon, tr }: { userCoupon: UserCoupon; tr: (key: string, params?: Record<string, string | number>) => string }) {
  const { coupon, status } = userCoupon
  const isPercent = coupon.type === 'PERCENT'
  const isUsed = status === 'USED'
  const isExp = status === 'EXPIRED' || new Date(coupon.endAt) < new Date()
  const stripColor = isUsed || isExp ? '#9CA3AF' : (isPercent ? '#0066FF' : '#EF4444')
  const remaining = daysUntilExpiry(coupon.endAt)

  return (
    <View className={`coupon-card ${isUsed || isExp ? 'coupon-card--dim' : ''}`}>
      <View className='coupon-card__strip' style={{ backgroundColor: stripColor }} />
      <View className='coupon-card__body'>
        <View className='coupon-card__left'>
          <View className='coupon-card__amount-row'>
            {!isPercent && <Text className='coupon-card__currency'>¥</Text>}
            <Text className='coupon-card__amount'>
              {isPercent ? tr('coupons.percentOff', { value: coupon.value }) : coupon.value}
            </Text>
          </View>
          {coupon.minAmount != null && (
            <Text className='coupon-card__min'>{tr('coupons.minAmount', { amount: coupon.minAmount })}</Text>
          )}
        </View>
        <View className='coupon-card__divider' />
        <View className='coupon-card__right'>
          <Text className='coupon-card__name'>{coupon.name}</Text>
          <Text className='coupon-card__code'>{tr('coupons.code')}: {coupon.code}</Text>
          <Text className='coupon-card__date'>{tr('coupons.validUntil', { date: formatDate(coupon.endAt) })}</Text>
          {/* G4: Expiry countdown for active coupons */}
          {!isUsed && !isExp && remaining <= 3 && remaining >= 0 && (
            <Text style={{ fontSize: '20rpx', color: '#EF4444', marginTop: '4rpx' }}>
              {remaining === 0 ? tr('coupons.expiresToday') : tr('coupons.expiresInDays', { days: remaining })}
            </Text>
          )}
        </View>
        {(isUsed || isExp) && (
          <View className='coupon-card__stamp'>
            <Text className='coupon-card__stamp-text'>{isUsed ? tr('coupons.statusUsed') : tr('coupons.statusExpired')}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default function CouponsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabKey>('available')
  const [availableCoupons, setAvailableCoupons] = useState<CouponItem[]>([])
  const [myCoupons, setMyCoupons] = useState<UserCoupon[]>([])
  const [usedCoupons, setUsedCoupons] = useState<UserCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [availRes, mineRes, usedRes] = await Promise.all([
        fetchAvailableCoupons(1).catch((err) => { console.error('Load coupons failed:', err); return { data: [], total: 0, page: 1, limit: 20 } }),
        fetchMyCoupons('ACTIVE').catch((err) => { console.error('Load coupons failed:', err); return { data: [], total: 0, page: 1, limit: 20 } }),
        fetchMyCoupons('USED').catch((err) => { console.error('Load coupons failed:', err); return { data: [], total: 0, page: 1, limit: 20 } }),
      ])
      setAvailableCoupons(availRes.data || [])
      setMyCoupons(mineRes.data || [])
      setUsedCoupons(usedRes.data || [])
    } catch {
      Taro.showToast({ title: t('coupons.loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (couponId: string) => {
    if (claiming) return
    setClaiming(couponId)
    try {
      await claimCoupon(couponId)
      Taro.showToast({ title: t('coupons.claimSuccess'), icon: 'success' })
      await loadData()
    } catch {
      Taro.showToast({ title: t('coupons.claimFailed'), icon: 'none' })
    } finally {
      setClaiming(null)
    }
  }

  // --- G4: Wallet overview stats ---
  const walletStats = useMemo(() => {
    const totalActive = myCoupons.length
    const expiringSoon = myCoupons.filter(uc => {
      const d = daysUntilExpiry(uc.coupon.endAt)
      return d >= 0 && d <= 7
    }).length
    return { totalActive, expiringSoon, totalUsed: usedCoupons.length }
  }, [myCoupons, usedCoupons])

  // --- G4: Tab counts ---
  const tabCounts = useMemo(() => ({
    available: availableCoupons.length,
    mine: myCoupons.length,
    used: usedCoupons.length,
  }), [availableCoupons, myCoupons, usedCoupons])

  // --- G4: Filtered lists (client-side search) ---
  const filteredAvailable = useMemo(() => {
    if (!searchText.trim()) return availableCoupons
    const q = searchText.toLowerCase()
    return availableCoupons.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
  }, [availableCoupons, searchText])

  const filteredMine = useMemo(() => {
    if (!searchText.trim()) return myCoupons
    const q = searchText.toLowerCase()
    return myCoupons.filter(uc => uc.coupon.name.toLowerCase().includes(q) || uc.coupon.code.toLowerCase().includes(q))
  }, [myCoupons, searchText])

  const filteredUsed = useMemo(() => {
    if (!searchText.trim()) return usedCoupons
    const q = searchText.toLowerCase()
    return usedCoupons.filter(uc => uc.coupon.name.toLowerCase().includes(q) || uc.coupon.code.toLowerCase().includes(q))
  }, [usedCoupons, searchText])

  const isSearching = searchText.trim().length > 0

  const renderContent = () => {
    if (loading) {
      return (
        <View className='empty'>
          <Text className='empty__text'>{t('common.loading')}</Text>
        </View>
      )
    }

    if (activeTab === 'available') {
      if (filteredAvailable.length === 0) {
        return (
          <View className='empty'>
            <Text className='empty__icon'>{isSearching ? '🔍' : '🎫'}</Text>
            <Text className='empty__text'>{isSearching ? t('coupons.searchNoResult') : t('coupons.noAvailable')}</Text>
            {isSearching && <Text className='empty__sub'>{t('coupons.tryOtherKeyword')}</Text>}
          </View>
        )
      }
      return filteredAvailable.map(c => (
        <CouponCard key={c.id} coupon={c} onClaim={handleClaim} tr={t} />
      ))
    }

    if (activeTab === 'mine') {
      if (filteredMine.length === 0) {
        return (
          <View className='empty'>
            <Text className='empty__icon'>{isSearching ? '🔍' : '🎫'}</Text>
            <Text className='empty__text'>{isSearching ? t('coupons.searchNoResult') : t('coupons.noMine')}</Text>
            {!isSearching && <Text className='empty__sub'>{t('coupons.goClaimOne')}</Text>}
            {isSearching && <Text className='empty__sub'>{t('coupons.tryOtherKeyword')}</Text>}
          </View>
        )
      }
      return filteredMine.map(uc => <MyCouponCard key={uc.id} userCoupon={uc} tr={t} />)
    }

    if (activeTab === 'used') {
      if (filteredUsed.length === 0) {
        return (
          <View className='empty'>
            <Text className='empty__icon'>{isSearching ? '🔍' : '🎫'}</Text>
            <Text className='empty__text'>{isSearching ? t('coupons.searchNoResult') : t('coupons.noUsed')}</Text>
            {isSearching && <Text className='empty__sub'>{t('coupons.tryOtherKeyword')}</Text>}
          </View>
        )
      }
      return filteredUsed.map(uc => <MyCouponCard key={uc.id} userCoupon={uc} tr={t} />)
    }

    return null
  }

  return (
    <View className='coupons-page'>
      {/* G4: Wallet Overview Card */}
      {!loading && (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', padding: '24rpx', margin: '20rpx 24rpx', backgroundColor: '#1E293B', borderRadius: '16rpx' }}>
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ fontSize: '36rpx', fontWeight: '700', color: '#D4A855' }}>{walletStats.totalActive}</Text>
            <Text style={{ fontSize: '22rpx', color: '#94A3B8' }}>{t('coupons.walletActive')}</Text>
          </View>
          <View style={{ width: '1rpx', backgroundColor: '#334155' }} />
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ fontSize: '36rpx', fontWeight: '700', color: walletStats.expiringSoon > 0 ? '#EF4444' : '#F8FAFC' }}>{walletStats.expiringSoon}</Text>
            <Text style={{ fontSize: '22rpx', color: '#94A3B8' }}>{t('coupons.walletExpiring')}</Text>
          </View>
          <View style={{ width: '1rpx', backgroundColor: '#334155' }} />
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Text style={{ fontSize: '36rpx', fontWeight: '700', color: '#64748B' }}>{walletStats.totalUsed}</Text>
            <Text style={{ fontSize: '22rpx', color: '#94A3B8' }}>{t('coupons.walletUsed')}</Text>
          </View>
        </View>
      )}

      {/* G4: Search Input */}
      <View style={{ padding: '0 24rpx', marginBottom: '16rpx' }}>
        <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', borderRadius: '12rpx', padding: '0 20rpx', height: '72rpx' }}>
          <Text style={{ fontSize: '28rpx', marginRight: '12rpx' }}>🔍</Text>
          <Input
            type='text'
            placeholder={t('coupons.searchPlaceholder')}
            placeholderStyle='color: #64748B'
            value={searchText}
            onInput={e => setSearchText(e.detail.value)}
            style={{ flex: 1, fontSize: '26rpx', color: '#F8FAFC', backgroundColor: 'transparent' }}
          />
          {searchText && (
            <Text
              style={{ fontSize: '24rpx', color: '#94A3B8', padding: '8rpx' }}
              onClick={() => setSearchText('')}
            >
              {t('coupons.clear')}
            </Text>
          )}
        </View>
      </View>

      {/* Tabs with G4: counts */}
      <View className='tabs'>
        {([
          { key: 'available' as TabKey, label: t('coupons.tabAvailable') },
          { key: 'mine' as TabKey, label: t('coupons.tabMine') },
          { key: 'used' as TabKey, label: t('coupons.tabUsed') },
        ]).map(tab => (
          <View
            key={tab.key}
            className={`tabs__item ${activeTab === tab.key ? 'tabs__item--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={`tabs__text ${activeTab === tab.key ? 'tabs__text--active' : ''}`}>
              {tab.label} ({tabCounts[tab.key]})
            </Text>
            {activeTab === tab.key && <View className='tabs__indicator' />}
          </View>
        ))}
      </View>

      {/* Content */}
      <ScrollView className='coupons-list' scrollY>
        {renderContent()}

        {/* G4: Bottom CTA */}
        {!loading && (
          <View
            style={{ margin: '32rpx 24rpx', padding: '24rpx', backgroundColor: '#D4A855', borderRadius: '16rpx', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12rpx' }}
            onClick={() => Taro.navigateTo({ url: '/pages/promotions/index' })}
          >
            <Text style={{ fontSize: '28rpx', fontWeight: '700', color: '#0F172A' }}>🔥 {t('coupons.viewPromotions')}</Text>
          </View>
        )}

        <View style={{ height: '60rpx' }} />
      </ScrollView>
    </View>
  )
}
