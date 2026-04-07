import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Route, fetchRouteBySlug, createTrip, createOrder, payOrder, verifyCoupon } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

type PayMethod = 'WECHAT_PAY' | 'BALANCE' | 'ALIPAY'

export default function CheckoutPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const slug = router.params.slug as string
  const tripIdParam = router.params.tripId as string | undefined
  const amountParam = router.params.amount as string | undefined

  const PAY_METHODS: { key: PayMethod; label: string; icon: string }[] = [
    { key: 'WECHAT_PAY', label: t('checkout.payWechat'), icon: '\u{1F49A}' },
    { key: 'BALANCE', label: t('checkout.payBalance'), icon: '\u{1F4B0}' },
    { key: 'ALIPAY', label: t('checkout.payAlipay'), icon: '\u{1F499}' },
  ]

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
      .catch(() => {
        Taro.showToast({ title: t('checkout.loadRouteFailed'), icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <View className='checkout-page'>
        <View className='empty'>
          <Text className='empty__text'>{t('common.loading')}</Text>
        </View>
      </View>
    )
  }

  const personCount = parseInt(persons) || 1

  // If we have a direct tripId+amount (from trip detail page), use those values
  const unitPrice = route ? route.priceFrom / 100 : (amountParam ? Number(amountParam) / 100 : 0)
  const subtotal = unitPrice * personCount
  const finalAmount = Math.max(0, subtotal - couponDiscount)

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      Taro.showToast({ title: t('checkout.enterCouponCode'), icon: 'none' })
      return
    }
    try {
      Taro.showLoading({ title: t('checkout.verifying') })
      const result = await verifyCoupon(code, Math.round(subtotal * 100))
      Taro.hideLoading()
      if (result.valid) {
        const discount = result.discountType === 'PERCENTAGE'
          ? Math.floor(subtotal * result.discount / 100)
          : result.discount / 100
        setCouponDiscount(discount)
        setCouponApplied(true)
        Taro.showToast({ title: t('checkout.couponApplied', { amount: discount }), icon: 'success' })
      } else {
        setCouponApplied(false)
        setCouponDiscount(0)
        Taro.showToast({ title: result.message || t('checkout.invalidCoupon'), icon: 'none' })
      }
    } catch {
      Taro.hideLoading()
      setCouponApplied(false)
      setCouponDiscount(0)
      Taro.showToast({ title: t('checkout.couponVerifyFailed'), icon: 'none' })
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponApplied(false)
    setCouponDiscount(0)
  }

  const handleSubmit = async () => {
    if (!isLoggedIn()) {
      Taro.showToast({ title: t('checkout.loginFirst'), icon: 'none' })
      return
    }
    if (route && !contactName.trim()) {
      Taro.showToast({ title: t('checkout.enterContactName'), icon: 'none' })
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
        Taro.showToast({ title: t('checkout.tripInfoMissing'), icon: 'none' })
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

      // Call payment API
      Taro.showLoading({ title: t('checkout.processingPayment') })
      await payOrder(order.id, payMethod)
      Taro.hideLoading()

      Taro.showToast({ title: t('checkout.paymentSuccess'), icon: 'success' })
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/trips/index' })
      }, 1500)
    } catch {
      Taro.showToast({ title: t('checkout.submitFailed'), icon: 'none' })
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
            <Text className='summary-card__meta-item'>{'\u{1F4C5}'} {t('checkout.durationNights', { days: route.duration, nights: route.nights })}</Text>
            <Text className='summary-card__meta-item'>{'\u{1F324}'} {route.season}</Text>
          </View>
        </View>
      ) : (
        <View className='summary-card'>
          <Text className='summary-card__title'>{t('checkout.confirmOrder')}</Text>
          {tripIdParam && (
            <Text className='summary-card__subtitle'>{t('checkout.tripId')}: {tripIdParam}</Text>
          )}
        </View>
      )}

      {/* Booking Form (only shown when creating from route) */}
      {route && (
        <View className='form-section'>
          <Text className='form-section__title'>{t('checkout.bookingInfo')}</Text>

          <Text className='form-label'>{t('checkout.personCount')}</Text>
          <Input
            className='form-input'
            type='number'
            value={persons}
            onInput={e => setPersons(e.detail.value)}
            placeholder='2'
          />

          <Text className='form-label'>{t('checkout.contactName')} *</Text>
          <Input
            className='form-input'
            value={contactName}
            onInput={e => setContactName(e.detail.value)}
            placeholder={t('checkout.contactNamePlaceholder')}
          />

          <Text className='form-label'>{t('checkout.phone')}</Text>
          <Input
            className='form-input'
            type='number'
            value={contactPhone}
            onInput={e => setContactPhone(e.detail.value)}
            placeholder={t('checkout.phonePlaceholder')}
          />

          <Text className='form-label'>{t('checkout.note')}</Text>
          <Textarea
            className='form-textarea'
            value={note}
            onInput={e => setNote(e.detail.value)}
            placeholder={t('checkout.notePlaceholder')}
            maxlength={500}
          />
        </View>
      )}

      {/* Coupon Code */}
      <View className='coupon-section'>
        <Text className='coupon-section__title'>{'\u{1F3AB}'} {t('checkout.couponCode')}</Text>
        {couponApplied ? (
          <View className='coupon-section__applied'>
            <View className='coupon-section__applied-info'>
              <Text className='coupon-section__applied-code'>{couponCode.toUpperCase()}</Text>
              <Text className='coupon-section__applied-discount'>-\u00a5{couponDiscount}</Text>
            </View>
            <Text className='coupon-section__remove' onClick={handleRemoveCoupon}>
              {t('checkout.removeCoupon')}
            </Text>
          </View>
        ) : (
          <View className='coupon-section__input-row'>
            <Input
              className='coupon-section__input'
              value={couponCode}
              onInput={e => setCouponCode(e.detail.value)}
              placeholder={t('checkout.couponPlaceholder')}
              maxlength={20}
            />
            <View className='coupon-section__apply-btn' onClick={handleApplyCoupon}>
              <Text className='coupon-section__apply-text'>{t('checkout.applyCoupon')}</Text>
            </View>
          </View>
        )}
        <Text
          className='coupon-section__link'
          onClick={() => Taro.navigateTo({ url: '/pages/coupons/index' })}
        >
          {t('checkout.viewMyCoupons')} &gt;
        </Text>
      </View>

      {/* Payment Method */}
      <View className='pay-method-section'>
        <Text className='pay-method-section__title'>{t('checkout.paymentMethod')}</Text>
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
          <Text className='price-card__label'>{t('checkout.routePrice')}</Text>
          <Text className='price-card__value'>\u00a5{unitPrice.toLocaleString()}/{t('checkout.perPerson')}</Text>
        </View>
        {route && (
          <View className='price-card__row'>
            <Text className='price-card__label'>{t('checkout.personCount')}</Text>
            <Text className='price-card__value'>\u00d7 {personCount}</Text>
          </View>
        )}
        <View className='price-card__row'>
          <Text className='price-card__label'>{t('checkout.subtotal')}</Text>
          <Text className='price-card__value'>\u00a5{subtotal.toLocaleString()}</Text>
        </View>
        {couponDiscount > 0 && (
          <View className='price-card__row price-card__row--discount'>
            <Text className='price-card__label price-card__label--discount'>{t('checkout.couponDiscount')}</Text>
            <Text className='price-card__value price-card__value--discount'>-\u00a5{couponDiscount}</Text>
          </View>
        )}
        <View className='price-card__row price-card__row--total'>
          <Text className='price-card__total-label'>{t('checkout.totalDue')}</Text>
          <Text className='price-card__total-value'>\u00a5{finalAmount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Submit Button */}
      <View
        className={`submit-btn ${submitting ? 'submit-btn--disabled' : ''}`}
        onClick={submitting ? undefined : handleSubmit}
      >
        <Text className='submit-btn__text'>
          {submitting ? t('checkout.processing') : `${t('checkout.payNow')} \u00a5${finalAmount.toLocaleString()}`}
        </Text>
      </View>

      <View
        className='promo-entry'
        onClick={() => Taro.navigateTo({ url: '/pages/promotions/index' })}
      >
        <Text className='promo-entry__text'>{'\u{1F525}'} {t('checkout.viewPromotions')}</Text>
        <Text className='promo-entry__arrow'>&gt;</Text>
      </View>

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}

definePageConfig({
  navigationBarTitleText: '\u786E\u8BA4\u8BA2\u5355',
})
