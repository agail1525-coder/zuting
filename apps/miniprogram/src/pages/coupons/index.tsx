import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import {
  CouponItem, UserCoupon,
  fetchAvailableCoupons, fetchMyCoupons, claimCoupon,
} from '../../lib/api'
import './index.scss'

type TabKey = 'available' | 'mine' | 'used'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'available', label: '可领取' },
  { key: 'mine', label: '我的券' },
  { key: 'used', label: '已使用' },
]

function formatDate(iso: string) {
  return iso.slice(0, 10).replace(/-/g, '/')
}

function isExpired(endAt: string) {
  return new Date(endAt) < new Date()
}

function CouponCard({ coupon, onClaim }: { coupon: CouponItem; onClaim?: (id: string) => void }) {
  const expired = isExpired(coupon.endAt)
  const isPercent = coupon.type === 'PERCENT'
  const stripColor = isPercent ? '#0066FF' : '#EF4444'

  return (
    <View className='coupon-card'>
      <View className='coupon-card__strip' style={{ backgroundColor: stripColor }} />
      <View className='coupon-card__body'>
        <View className='coupon-card__left'>
          <View className='coupon-card__amount-row'>
            {!isPercent && <Text className='coupon-card__currency'>¥</Text>}
            <Text className='coupon-card__amount'>
              {isPercent ? `${coupon.value}折` : coupon.value}
            </Text>
          </View>
          {coupon.minAmount != null && (
            <Text className='coupon-card__min'>满¥{coupon.minAmount}可用</Text>
          )}
        </View>
        <View className='coupon-card__divider' />
        <View className='coupon-card__right'>
          <Text className='coupon-card__name'>{coupon.name}</Text>
          <Text className='coupon-card__code'>码: {coupon.code}</Text>
          <Text className='coupon-card__date'>
            {expired ? '已过期' : `至 ${formatDate(coupon.endAt)}`}
          </Text>
        </View>
        {onClaim && (
          <View
            className={`coupon-card__btn ${expired ? 'coupon-card__btn--disabled' : ''}`}
            onClick={() => !expired && onClaim(coupon.id)}
          >
            <Text className='coupon-card__btn-text'>领取</Text>
          </View>
        )}
      </View>
    </View>
  )
}

function MyCouponCard({ userCoupon }: { userCoupon: UserCoupon }) {
  const { coupon, status } = userCoupon
  const isPercent = coupon.type === 'PERCENT'
  const isUsed = status === 'USED'
  const isExpired = status === 'EXPIRED' || new Date(coupon.endAt) < new Date()
  const stripColor = isUsed || isExpired ? '#9CA3AF' : (isPercent ? '#0066FF' : '#EF4444')

  return (
    <View className={`coupon-card ${isUsed || isExpired ? 'coupon-card--dim' : ''}`}>
      <View className='coupon-card__strip' style={{ backgroundColor: stripColor }} />
      <View className='coupon-card__body'>
        <View className='coupon-card__left'>
          <View className='coupon-card__amount-row'>
            {!isPercent && <Text className='coupon-card__currency'>¥</Text>}
            <Text className='coupon-card__amount'>
              {isPercent ? `${coupon.value}折` : coupon.value}
            </Text>
          </View>
          {coupon.minAmount != null && (
            <Text className='coupon-card__min'>满¥{coupon.minAmount}可用</Text>
          )}
        </View>
        <View className='coupon-card__divider' />
        <View className='coupon-card__right'>
          <Text className='coupon-card__name'>{coupon.name}</Text>
          <Text className='coupon-card__code'>码: {coupon.code}</Text>
          <Text className='coupon-card__date'>至 {formatDate(coupon.endAt)}</Text>
        </View>
        {(isUsed || isExpired) && (
          <View className='coupon-card__stamp'>
            <Text className='coupon-card__stamp-text'>{isUsed ? '已用' : '过期'}</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('available')
  const [availableCoupons, setAvailableCoupons] = useState<CouponItem[]>([])
  const [myCoupons, setMyCoupons] = useState<UserCoupon[]>([])
  const [usedCoupons, setUsedCoupons] = useState<UserCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [availRes, mineRes, usedRes] = await Promise.all([
        fetchAvailableCoupons(1).catch(() => ({ data: [], total: 0, page: 1, limit: 20 })),
        fetchMyCoupons('ACTIVE').catch(() => ({ data: [], total: 0, page: 1, limit: 20 })),
        fetchMyCoupons('USED').catch(() => ({ data: [], total: 0, page: 1, limit: 20 })),
      ])
      setAvailableCoupons(availRes.data || [])
      setMyCoupons(mineRes.data || [])
      setUsedCoupons(usedRes.data || [])
    } catch {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async (couponId: string) => {
    if (claiming) return
    setClaiming(couponId)
    try {
      await claimCoupon(couponId)
      Taro.showToast({ title: '领取成功！', icon: 'success' })
      await loadData()
    } catch {
      Taro.showToast({ title: '领取失败，请重试', icon: 'none' })
    } finally {
      setClaiming(null)
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <View className='empty'>
          <Text className='empty__text'>加载中...</Text>
        </View>
      )
    }

    if (activeTab === 'available') {
      if (availableCoupons.length === 0) {
        return <View className='empty'><Text className='empty__text'>暂无可领取优惠券</Text></View>
      }
      return availableCoupons.map(c => (
        <CouponCard key={c.id} coupon={c} onClaim={handleClaim} />
      ))
    }

    if (activeTab === 'mine') {
      if (myCoupons.length === 0) {
        return <View className='empty'><Text className='empty__text'>暂无可用优惠券</Text><Text className='empty__sub'>去领取一张吧</Text></View>
      }
      return myCoupons.map(uc => <MyCouponCard key={uc.id} userCoupon={uc} />)
    }

    if (activeTab === 'used') {
      if (usedCoupons.length === 0) {
        return <View className='empty'><Text className='empty__text'>暂无已使用优惠券</Text></View>
      }
      return usedCoupons.map(uc => <MyCouponCard key={uc.id} userCoupon={uc} />)
    }

    return null
  }

  return (
    <View className='coupons-page'>
      {/* Tabs */}
      <View className='tabs'>
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
      </View>

      {/* Content */}
      <ScrollView className='coupons-list' scrollY>
        {renderContent()}
        <View style={{ height: '60rpx' }} />
      </ScrollView>
    </View>
  )
}
