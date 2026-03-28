import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { Route, fetchRouteBySlug, createTrip } from '../../lib/api'
import { isLoggedIn } from '../../lib/auth'
import './index.scss'

export default function CheckoutPage() {
  const router = useRouter()
  const slug = router.params.slug as string
  const [route, setRoute] = useState<Route | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [persons, setPersons] = useState('2')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [note, setNote] = useState('')

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

  if (!route) {
    return (
      <View className='checkout-page'>
        <View className='empty'>
          <Text className='empty__text'>❌ 路线不存在</Text>
        </View>
      </View>
    )
  }

  const personCount = parseInt(persons) || 1
  const unitPrice = route.priceFrom / 100
  const totalPrice = unitPrice * personCount

  const handleSubmit = async () => {
    if (!isLoggedIn()) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    if (!contactName.trim()) {
      Taro.showToast({ title: '请填写联系人姓名', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      await createTrip({
        title: route.title,
        startDate: new Date().toISOString().slice(0, 10),
        endDate: new Date(Date.now() + route.duration * 86400000).toISOString().slice(0, 10),
        persons: personCount,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim() || undefined,
        note: note.trim() || undefined,
      })
      Taro.showToast({ title: '预订成功', icon: 'success' })
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/trips/index' })
      }, 1500)
    } catch {
      Taro.showToast({ title: '预订失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ScrollView className='checkout-page' scrollY>
      {/* Route Summary */}
      <View className='summary-card'>
        <Text className='summary-card__title'>{route.title}</Text>
        <Text className='summary-card__subtitle'>{route.subtitle}</Text>
        <View className='summary-card__meta'>
          <Text className='summary-card__meta-item'>📅 {route.duration}天{route.nights}晚</Text>
          <Text className='summary-card__meta-item'>🌤 {route.season}</Text>
        </View>
      </View>

      {/* Booking Form */}
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

      {/* Price Summary */}
      <View className='price-card'>
        <View className='price-card__row'>
          <Text className='price-card__label'>路线价格</Text>
          <Text className='price-card__value'>¥{unitPrice.toLocaleString()}/人</Text>
        </View>
        <View className='price-card__row'>
          <Text className='price-card__label'>人数</Text>
          <Text className='price-card__value'>× {personCount}</Text>
        </View>
        <View className='price-card__row price-card__row--total'>
          <Text className='price-card__total-label'>合计</Text>
          <Text className='price-card__total-value'>¥{totalPrice.toLocaleString()}</Text>
        </View>
      </View>

      {/* Submit Button */}
      <View
        className={`submit-btn ${submitting ? 'submit-btn--disabled' : ''}`}
        onClick={submitting ? undefined : handleSubmit}
      >
        <Text className='submit-btn__text'>{submitting ? '提交中...' : '确认预订'}</Text>
      </View>

      <View style={{ height: '80rpx' }} />
    </ScrollView>
  )
}

definePageConfig({
  navigationBarTitleText: '路线预订',
})
