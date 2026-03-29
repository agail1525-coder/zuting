import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Route, fetchRouteBySlug, createTrip, createOrder, payOrder } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import './index.scss'

type PayMethod = 'WECHAT_PAY' | 'BALANCE' | 'ALIPAY'

const PAY_METHODS: { key: PayMethod; label: string; icon: string }[] = [
  { key: 'WECHAT_PAY', label: '微信支付', icon: '💚' },
  { key: 'BALANCE', label: '余额支付', icon: '💰' },
  { key: 'ALIPAY', label: '支付宝', icon: '💙' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const slug = router.params.slug as string
  const tripIdParam = router.params.tripId as string | undefined
  const amountParam = router.params.amount as string | undefined

  const [route, setRoute] = useState<Route | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [persons, setPersons] = useState('2')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [note, setNote] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [payMethod, setPayMethod] = useState<PayMethod>('WECHAT_PAY')

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    fetchRouteBySlug(slug)
      .then(setRoute)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <View className='checkout-page'>
        <View className='empty'>
          <Text className='empty__text'>加载中...</Text>
        </View>
      </View>
    )
  }

  const personCount = parseInt(persons) || 1

  // If we have a direct tripId+amount (from trip detail page), use those values
  const unitPrice = route ? route.priceFrom / 100 : (amountParam ? Number(amountParam) / 100 : 0)
  const subtotal = unitPrice * personCount
  const finalAmount = Math.max(0, subtotal - couponDiscount)

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      Taro.showToast({ title: '请输入优惠码', icon: 'none' })
      return
    }
    // Simulate coupon validation: codes starting with "JOINUS" give 100 off
    if (code.startsWith('JOINUS')) {
      setCouponDiscount(100)
      setCouponApplied(true)
      Taro.showToast({ title: '优惠码已应用 -¥100', icon: 'success' })
    } else if (code.startsWith('ZT')) {
      const pct = 0.1
      setCouponDiscount(Math.floor(subtotal * pct))
      setCouponApplied(true)
      Taro.showToast({ title: `九折优惠已应用`, icon: 'success' })
    } else {
      Taro.showToast({ title: '无效优惠码', icon: 'none' })
      setCouponApplied(false)
      setCouponDiscount(0)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponApplied(false)
    setCouponDiscount(0)
  }

  const handleSubmit = async () => {
    if (!isLoggedIn()) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    if (route && !contactName.trim()) {
      Taro.showToast({ title: '请填写联系人姓名', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      let targetTripId = tripIdParam

      // If coming from route detail (slug param), create the trip first
      if (route && !targetTripId) {
        const trip = await createTrip({
          title: route.title,
          startDate: new Date().toISOString().slice(0, 10),
          endDate: new Date(Date.now() + route.duration * 86400000).toISOString().slice(0, 10),
          persons: personCount,
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim() || undefined,
          note: note.trim() || undefined,
        })
        targetTripId = trip.id
      }

      if (!targetTripId) {
        Taro.showToast({ title: '行程信息缺失', icon: 'none' })
        return
      }

      // Create order
      const order = await createOrder({
        tripId: targetTripId,
        amount: Math.round(finalAmount * 100),
        couponCode: couponApplied ? couponCode.trim().toUpperCase() : undefined,
        paymentMethod: payMethod,
        note: note.trim() || undefined,
      })

      // Simulate WeChat Pay flow
      if (payMethod === 'WECHAT_PAY') {
        Taro.showLoading({ title: '正在唤起支付...' })
        await new Promise(r => setTimeout(r, 1500))
        Taro.hideLoading()
        // Simulate success
        await payOrder(order.id, payMethod).catch(() => {})
      } else {
        await payOrder(order.id, payMethod).catch(() => {})
      }

      Taro.showToast({ title: '支付成功 🎉', icon: 'success' })
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/trips/index' })
      }, 1500)
    } catch {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView className='checkout-page' scrollY>
      {/* Route / Trip Summary */}
      {route ? (
        <View className='summary-card'>
          <Text className='summary-card__title'>{route.title}</Text>
          <Text className='summary-card__subtitle'>{route.subtitle}</Text>
          <View className='summary-card__meta'>
            <Text className='summary-card__meta-item'>📅 {route.duration}天{route.nights}晚</Text>
            <Text className='summary-card__meta-item'>🌤 {route.season}</Text>
          </View>
        </View>
      ) : (
        <View className='summary-card'>
          <Text className='summary-card__title'>确认订单</Text>
          {tripIdParam && (
            <Text className='summary-card__subtitle'>行程 ID: {tripIdParam}</Text>
          )}
        </View>
      )}

      {/* Booking Form (only shown when creating from route) */}
      {route && (
        <View className='form-section'>
          <Text className='form-section__title'>预订信息</Text>

          <Text className='form-label'>出行人数</Text>
          <Input
            className='form-input'
            type='number'
            value={persons}
            onInput={e => setPersons(e.detail.value)}
            placeholder='2'
          />

          <Text className='form-label'>联系人 *</Text>
          <Input
            className='form-input'
            value={contactName}
            onInput={e => setContactName(e.detail.value)}
            placeholder='请输入联系人姓名'
          />

          <Text className='form-label'>手机号</Text>
          <Input
            className='form-input'
            type='number'
            value={contactPhone}
            onInput={e => setContactPhone(e.detail.value)}
            placeholder='请输入手机号'
          />

          <Text className='form-label'>备注</Text>
          <Textarea
            className='form-textarea'
            value={note}
            onInput={e => setNote(e.detail.value)}
            placeholder='特殊需求或备注'
            maxlength={500}
          />
        </View>
      )}

      {/* Coupon Code */}
      <View className='coupon-section'>
        <Text className='coupon-section__title'>🎫 优惠码</Text>
        {couponApplied ? (
          <View className='coupon-section__applied'>
            <View className='coupon-section__applied-info'>
              <Text className='coupon-section__applied-code'>{couponCode.toUpperCase()}</Text>
              <Text className='coupon-section__applied-discount'>-¥{couponDiscount}</Text>
            </View>
            <Text className='coupon-section__remove' onClick={handleRemoveCoupon}>
              移除
            </Text>
          </View>
        ) : (
          <View className='coupon-section__input-row'>
            <Input
              className='coupon-section__input'
              value={couponCode}
              onInput={e => setCouponCode(e.detail.value)}
              placeholder='输入优惠码 (如 JOINUS10)'
              maxlength={20}
            />
            <View className='coupon-section__apply-btn' onClick={handleApplyCoupon}>
              <Text className='coupon-section__apply-text'>使用</Text>
            </View>
          </View>
        )}
        <Text
          className='coupon-section__link'
          onClick={() => Taro.navigateTo({ url: '/pages/coupons/index' })}
        >
          查看我的优惠券 &gt;
        </Text>
      </View>

      {/* Payment Method */}
      <View className='pay-method-section'>
        <Text className='pay-method-section__title'>支付方式</Text>
        {PAY_METHODS.map(m => (
          <View
            key={m.key}
            className={`pay-method-item ${payMethod === m.key ? 'pay-method-item--active' : ''}`}
            onClick={() => setPayMethod(m.key)}
          >
            <Text className='pay-method-item__icon'>{m.icon}</Text>
            <Text className='pay-method-item__label'>{m.label}</Text>
            <View className='pay-method-item__radio'>
              {payMethod === m.key && <View className='pay-method-item__radio-dot' />}
            </View>
          </View>
        ))}
      </View>

      {/* Price Summary */}
      <View className='price-card'>
        <View className='price-card__row'>
          <Text className='price-card__label'>路线价格</Text>
          <Text className='price-card__value'>¥{unitPrice.toLocaleString()}/人</Text>
        </View>
        {route && (
          <View className='price-card__row'>
            <Text className='price-card__label'>人数</Text>
            <Text className='price-card__value'>× {personCount}</Text>
          </View>
        )}
        <View className='price-card__row'>
          <Text className='price-card__label'>小计</Text>
          <Text className='price-card__value'>¥{subtotal.toLocaleString()}</Text>
        </View>
        {couponDiscount > 0 && (
          <View className='price-card__row price-card__row--discount'>
            <Text className='price-card__label price-card__label--discount'>优惠码减免</Text>
            <Text className='price-card__value price-card__value--discount'>-¥{couponDiscount}</Text>
          </View>
        )}
        <View className='price-card__row price-card__row--total'>
          <Text className='price-card__total-label'>应付合计</Text>
          <Text className='price-card__total-value'>¥{finalAmount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Submit Button */}
      <View
        className={`submit-btn ${submitting ? 'submit-btn--disabled' : ''}`}
        onClick={submitting ? undefined : handleSubmit}
      >
        <Text className='submit-btn__text'>
          {submitting ? '处理中...' : `微信支付 ¥${finalAmount.toLocaleString()}`}
        </Text>
      </View>

      <View
        className='promo-entry'
        onClick={() => Taro.navigateTo({ url: '/pages/promotions/index' })}
      >
        <Text className='promo-entry__text'>🔥 查看最新优惠活动</Text>
        <Text className='promo-entry__arrow'>&gt;</Text>
      </View>

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}

definePageConfig({
  navigationBarTitleText: '确认订单',
})
