import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { PackageDetail, fetchPackage, createTrip } from '../../lib/api'
import './index.scss'

const TYPE_LABELS: Record<string, string> = {
  CLASSIC: '经典套餐',
  PREMIUM: '精品套餐',
  LUXURY: '奢华套餐',
  CUSTOM: '定制套餐',
}

const TYPE_COLORS: Record<string, string> = {
  CLASSIC: '#0066FF',
  PREMIUM: '#D4A855',
  LUXURY: '#8B5CF6',
  CUSTOM: '#10B981',
}

export default function PackageDetailPage() {
  const router = useRouter()
  const id = router.params.id as string

  const [pkg, setPkg] = useState<PackageDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'overview' | 'itinerary' | 'info'>('overview')
  const [bookingDate, setBookingDate] = useState('')
  const [persons, setPersons] = useState(2)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetchPackage(id)
      setPkg(res)
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async () => {
    if (!pkg) return
    if (!bookingDate) {
      Taro.showToast({ title: '请选择出发日期', icon: 'none' })
      return
    }
    if (persons < 1 || persons > 20) {
      Taro.showToast({ title: '出行人数需在 1-20 之间', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const trip = await createTrip({
        title: `${pkg.title} × ${persons}人`,
        startDate: bookingDate,
        endDate: bookingDate,
        persons,
        note: `通过套餐「${pkg.title}」创建`,
      })
      Taro.showToast({ title: '预约成功！跳转行程页', icon: 'success' })
      setTimeout(() => {
        Taro.navigateTo({ url: `/pages/trip-detail/index?id=${trip.id}` })
      }, 1500)
    } catch {
      Taro.showToast({ title: '预约失败，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <View className='package-detail-page'>
        <View className='loading'>
          <Text className='loading__text'>加载中...</Text>
        </View>
      </View>
    )
  }

  if (!pkg) {
    return (
      <View className='package-detail-page'>
        <View className='empty'>
          <Text className='empty__text'>套餐不存在</Text>
        </View>
      </View>
    )
  }

  const typeColor = TYPE_COLORS[pkg.type] || '#0066FF'
  const typeLabel = TYPE_LABELS[pkg.type] || pkg.type

  return (
    <View className='package-detail-page'>
      <ScrollView className='package-detail-scroll' scrollY>
        {/* Cover */}
        {pkg.coverImage ? (
          <Image className='detail-cover' src={pkg.coverImage} mode='aspectFill' />
        ) : (
          <View className='detail-cover detail-cover--placeholder'>
            <Text className='detail-cover__icon'>🏯</Text>
          </View>
        )}

        {/* Info Card */}
        <View className='info-card'>
          <View className='info-card__badge-row'>
            <View className='info-card__badge' style={{ backgroundColor: typeColor }}>
              <Text className='info-card__badge-text'>{typeLabel}</Text>
            </View>
            {pkg.religion && (
              <View className='info-card__religion'>
                <Text className='info-card__religion-text'>{pkg.religion.emoji} {pkg.religion.name}</Text>
              </View>
            )}
          </View>

          <Text className='info-card__title'>{pkg.title}</Text>
          {pkg.subtitle && <Text className='info-card__subtitle'>{pkg.subtitle}</Text>}

          {/* Stats Row */}
          <View className='stats-row'>
            <View className='stats-item'>
              <Text className='stats-item__num'>{pkg.duration}</Text>
              <Text className='stats-item__label'>天数</Text>
            </View>
            <View className='stats-divider' />
            <View className='stats-item'>
              <Text className='stats-item__num'>{pkg.nights}</Text>
              <Text className='stats-item__label'>住宿晚</Text>
            </View>
            <View className='stats-divider' />
            <View className='stats-item'>
              <Text className='stats-item__num'>{pkg.rating != null ? pkg.rating.toFixed(1) : '--'}</Text>
              <Text className='stats-item__label'>评分</Text>
            </View>
            <View className='stats-divider' />
            <View className='stats-item'>
              <Text className='stats-item__num'>{pkg.reviewCount}</Text>
              <Text className='stats-item__label'>评价</Text>
            </View>
          </View>

          {/* Price */}
          <View className='price-row'>
            <Text className='price-currency'>¥</Text>
            <Text className='price-num'>{pkg.priceFrom.toLocaleString()}</Text>
            <Text className='price-unit'>起 / 人</Text>
          </View>
        </View>

        {/* Section Tabs */}
        <View className='section-tabs'>
          {(['overview', 'itinerary', 'info'] as const).map(s => (
            <View
              key={s}
              className={`section-tab ${activeSection === s ? 'section-tab--active' : ''}`}
              onClick={() => setActiveSection(s)}
            >
              <Text className={`section-tab__text ${activeSection === s ? 'section-tab__text--active' : ''}`}>
                {s === 'overview' ? '概览' : s === 'itinerary' ? '行程' : '须知'}
              </Text>
              {activeSection === s && <View className='section-tab__indicator' />}
            </View>
          ))}
        </View>

        {/* Overview */}
        {activeSection === 'overview' && (
          <View className='section-content'>
            <Text className='section-content__desc'>{pkg.description}</Text>
            {pkg.highlights.length > 0 && (
              <View className='highlight-list'>
                <Text className='highlight-list__title'>亮点特色</Text>
                {pkg.highlights.map((h, i) => (
                  <View key={i} className='highlight-item'>
                    <Text className='highlight-item__dot' style={{ color: typeColor }}>●</Text>
                    <Text className='highlight-item__text'>{h}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Itinerary */}
        {activeSection === 'itinerary' && (
          <View className='section-content'>
            {pkg.itinerary.map(day => (
              <View key={day.day} className='itinerary-day'>
                <View className='itinerary-day__header'>
                  <View className='itinerary-day__num-wrap' style={{ backgroundColor: typeColor }}>
                    <Text className='itinerary-day__num'>D{day.day}</Text>
                  </View>
                  <Text className='itinerary-day__title'>{day.title}</Text>
                </View>
                {day.activities.map((act, i) => (
                  <View key={i} className='itinerary-activity'>
                    <Text className='itinerary-activity__bullet'>·</Text>
                    <Text className='itinerary-activity__text'>{act}</Text>
                  </View>
                ))}
                {day.accommodation && (
                  <Text className='itinerary-day__accommodation'>🏨 {day.accommodation}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Info (Included/Excluded/Tips) */}
        {activeSection === 'info' && (
          <View className='section-content'>
            {pkg.included.length > 0 && (
              <View className='info-block'>
                <Text className='info-block__title'>✅ 费用包含</Text>
                {pkg.included.map((item, i) => (
                  <Text key={i} className='info-block__item'>• {item}</Text>
                ))}
              </View>
            )}
            {pkg.excluded.length > 0 && (
              <View className='info-block'>
                <Text className='info-block__title'>❌ 费用不含</Text>
                {pkg.excluded.map((item, i) => (
                  <Text key={i} className='info-block__item'>• {item}</Text>
                ))}
              </View>
            )}
            {pkg.tips.length > 0 && (
              <View className='info-block'>
                <Text className='info-block__title'>💡 出行提示</Text>
                {pkg.tips.map((tip, i) => (
                  <Text key={i} className='info-block__item'>• {tip}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Booking Form */}
        <View className='booking-form'>
          <Text className='booking-form__title'>立即预约</Text>

          <View className='booking-form__row'>
            <Text className='booking-form__label'>出发日期</Text>
            <View
              className='booking-form__date-picker'
              onClick={() => {
                // Use showModal with editable option (cast to any for Taro type compat)
                ;(Taro.showModal as (opts: Record<string, unknown>) => void)({
                  title: '选择日期',
                  content: '请输入出发日期 (格式: YYYY-MM-DD)',
                  editable: true,
                  placeholderText: '2026-04-01',
                  success: (res: { confirm: boolean; content?: string }) => {
                    if (res.confirm && res.content) {
                      setBookingDate(res.content.trim())
                    }
                  },
                })
              }}
            >
              <Text className='booking-form__date-text'>
                {bookingDate || '点击选择日期'}
              </Text>
            </View>
          </View>

          <View className='booking-form__row'>
            <Text className='booking-form__label'>出行人数</Text>
            <View className='booking-form__persons'>
              <View
                className='persons-btn'
                onClick={() => setPersons(p => Math.max(1, p - 1))}
              >
                <Text className='persons-btn__text'>-</Text>
              </View>
              <Text className='persons-num'>{persons}</Text>
              <View
                className='persons-btn'
                onClick={() => setPersons(p => Math.min(20, p + 1))}
              >
                <Text className='persons-btn__text'>+</Text>
              </View>
            </View>
          </View>

          <View className='booking-form__total'>
            <Text className='booking-form__total-label'>预估费用</Text>
            <Text className='booking-form__total-price'>
              ¥{(pkg.priceFrom * persons).toLocaleString()}+
            </Text>
          </View>
        </View>

        <View style={{ height: '160rpx' }} />
      </ScrollView>

      {/* Submit Bar */}
      <View className='submit-bar'>
        <View className='submit-bar__price'>
          <Text className='submit-bar__price-label'>¥</Text>
          <Text className='submit-bar__price-num'>{(pkg.priceFrom * persons).toLocaleString()}</Text>
          <Text className='submit-bar__price-unit'>+起</Text>
        </View>
        <View
          className={`submit-bar__btn ${submitting ? 'submit-bar__btn--loading' : ''}`}
          style={{ backgroundColor: typeColor }}
          onClick={submitting ? undefined : handleBook}
        >
          <Text className='submit-bar__btn-text'>
            {submitting ? '提交中...' : '立即预约'}
          </Text>
        </View>
      </View>
    </View>
  )
}
