import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import {
  PriceCalendarDay,
  PriceCalendarResponse,
  PriceAlertInput,
  fetchPriceCalendar,
  createPriceAlert,
} from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

/* ── Helpers ── */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function getFirstWeekday(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay()
}

function fmt(price: number): string {
  return `¥${(price / 100).toFixed(0)}`
}


export default function PriceCalendarPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const routeId = router.params.routeId || ''
  const routeTitle = router.params.routeTitle ? decodeURIComponent(router.params.routeTitle) : t('priceCalendar.defaultTitle')
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [calData, setCalData] = useState<PriceCalendarResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<PriceCalendarDay | null>(null)
  const [alertPrice, setAlertPrice] = useState('')
  const [alertLoading, setAlertLoading] = useState(false)

  const WEEK_DAYS = [
    t('priceCalendar.weekSun'), t('priceCalendar.weekMon'), t('priceCalendar.weekTue'),
    t('priceCalendar.weekWed'), t('priceCalendar.weekThu'), t('priceCalendar.weekFri'),
    t('priceCalendar.weekSat'),
  ]

  const LEVEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: '#ECFDF5', text: '#10B981', label: t('priceCalendar.levelLow') },
    medium: { bg: '#FFFBEB', text: '#F59E0B', label: t('priceCalendar.levelMedium') },
    high: { bg: '#FEF2F2', text: '#EF4444', label: t('priceCalendar.levelHigh') },
    unavailable: { bg: '#F3F4F6', text: '#9CA3AF', label: t('priceCalendar.levelUnavailable') },
  }

  useEffect(() => {
    if (routeId) loadCalendar(year, month)
  }, [routeId, year, month])

  const loadCalendar = async (y: number, m: number) => {
    setLoading(true)
    setSelectedDay(null)
    try {
      const data = await fetchPriceCalendar(routeId, y, m)
      setCalData(data)
    } catch {
      setCalData(null)
      Taro.showToast({ title: t('priceCalendar.noPriceData'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const prevMonth = () => {
    if (month === 1) {
      setYear(y => y - 1)
      setMonth(12)
    } else {
      setMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (month === 12) {
      setYear(y => y + 1)
      setMonth(1)
    } else {
      setMonth(m => m + 1)
    }
  }

  const handleDayPress = (day: PriceCalendarDay) => {
    if (!day.available) return
    setSelectedDay(prev => (prev?.date === day.date ? null : day))
  }

  const handleSetAlert = async () => {
    if (!alertPrice || isNaN(Number(alertPrice))) {
      Taro.showToast({ title: t('priceCalendar.enterValidPrice'), icon: 'none' })
      return
    }
    if (!routeId) return
    setAlertLoading(true)
    try {
      const input: PriceAlertInput = {
        routeId,
        targetPrice: Math.round(Number(alertPrice) * 100),
      }
      await createPriceAlert(input)
      Taro.showToast({ title: t('priceCalendar.alertSet'), icon: 'success' })
      setAlertPrice('')
    } catch {
      Taro.showToast({ title: t('priceCalendar.alertSetFailed'), icon: 'none' })
    } finally {
      setAlertLoading(false)
    }
  }

  /* ── Build grid cells ── */
  const renderGrid = () => {
    if (!calData) return null

    const firstWd = getFirstWeekday(year, month)
    const daysCount = getDaysInMonth(year, month)
    const dayMap: Record<string, PriceCalendarDay> = {}
    calData.days.forEach(d => { dayMap[d.date] = d })

    const cells: React.JSX.Element[] = []

    // Empty prefix cells
    for (let i = 0; i < firstWd; i++) {
      cells.push(<View key={`empty-${i}`} className='cal-cell cal-cell--empty' />)
    }

    for (let d = 1; d <= daysCount; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayData = dayMap[dateStr]
      const isToday =
        today.getFullYear() === year &&
        today.getMonth() + 1 === month &&
        today.getDate() === d
      const isSelected = selectedDay?.date === dateStr
      const level = dayData?.level ?? 'unavailable'
      const style = LEVEL_STYLES[level]
      const isLow = level === 'low'
      const isHigh = level === 'high'

      cells.push(
        <View
          key={dateStr}
          className={[
            'cal-cell',
            !dayData?.available ? 'cal-cell--unavailable' : '',
            isSelected ? 'cal-cell--selected' : '',
            isToday ? 'cal-cell--today' : '',
          ].join(' ')}
          style={
            isSelected
              ? { backgroundColor: '#0066FF', borderColor: '#0066FF' }
              : { backgroundColor: style.bg, borderColor: style.text + '44' }
          }
          onClick={() => dayData && handleDayPress(dayData)}
        >
          <Text
            className='cal-cell__day'
            style={{ color: isSelected ? '#FFFFFF' : '#1A1A1A' }}
          >
            {d}
          </Text>
          {dayData?.price !== null && dayData?.price !== undefined ? (
            <Text
              className='cal-cell__price'
              style={{ color: isSelected ? '#FFFFFF' : style.text }}
            >
              {fmt(dayData.price)}
            </Text>
          ) : (
            <Text className='cal-cell__unavail'>—</Text>
          )}
          {isLow && !isSelected && (
            <View className='cal-cell__dot cal-cell__dot--low' />
          )}
          {isHigh && !isSelected && (
            <View className='cal-cell__dot cal-cell__dot--high' />
          )}
        </View>,
      )
    }

    return cells
  }

  return (
    <ScrollView className='price-calendar-page' scrollY>

      {/* ── Title ── */}
      <View className='cal-header'>
        <Text className='cal-header__title'>{routeTitle}</Text>
        {calData && (
          <View className='cal-header__range'>
            <Text className='cal-header__range-low'>{t('priceCalendar.lowest')} {fmt(calData.minPrice)}</Text>
            <Text className='cal-header__range-sep'> · </Text>
            <Text className='cal-header__range-high'>{t('priceCalendar.highest')} {fmt(calData.maxPrice)}</Text>
          </View>
        )}
      </View>

      {/* ── Month Picker ── */}
      <View className='month-picker'>
        <View className='month-picker__btn' onClick={prevMonth}>
          <Text className='month-picker__btn-text'>＜</Text>
        </View>
        <Text className='month-picker__label'>{t('priceCalendar.yearMonth', { year, month })}</Text>
        <View className='month-picker__btn' onClick={nextMonth}>
          <Text className='month-picker__btn-text'>＞</Text>
        </View>
      </View>

      {/* ── Legend ── */}
      <View className='legend'>
        {Object.entries(LEVEL_STYLES)
          .filter(([k]) => k !== 'unavailable')
          .map(([key, s]) => (
            <View key={key} className='legend__item'>
              <View className='legend__dot' style={{ backgroundColor: s.text }} />
              <Text className='legend__text' style={{ color: s.text }}>{s.label}</Text>
            </View>
          ))}
        <View className='legend__item'>
          <View className='legend__dot legend__dot--unavail' />
          <Text className='legend__text legend__text--unavail'>{t('priceCalendar.levelUnavailable')}</Text>
        </View>
      </View>

      {/* ── Weekday Header ── */}
      <View className='cal-week-header'>
        {WEEK_DAYS.map((wd, idx) => (
          <View key={idx} className='cal-week-header__cell'>
            <Text className={`cal-week-header__text ${idx === 0 || idx === 6 ? 'cal-week-header__text--weekend' : ''}`}>
              {wd}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Calendar Grid ── */}
      {loading ? (
        <View className='cal-loading'>
          <Text className='cal-loading__text'>{t('priceCalendar.loadingPrices')}</Text>
        </View>
      ) : !calData ? (
        <View className='cal-empty'>
          <Text className='cal-empty__icon'>📅</Text>
          <Text className='cal-empty__title'>{t('priceCalendar.noPriceData')}</Text>
          <Text className='cal-empty__desc'>{t('priceCalendar.noPriceDataDesc')}</Text>
        </View>
      ) : (
        <View className='cal-grid'>
          {renderGrid()}
        </View>
      )}

      {/* ── Selected Day Detail ── */}
      {selectedDay && (
        <View className='selected-detail'>
          <View className='selected-detail__row'>
            <Text className='selected-detail__date'>{selectedDay.date}</Text>
            <Text
              className='selected-detail__level'
              style={{ color: LEVEL_STYLES[selectedDay.level].text }}
            >
              {LEVEL_STYLES[selectedDay.level].label}
            </Text>
          </View>
          <View className='selected-detail__price-row'>
            <Text className='selected-detail__price-label'>{t('priceCalendar.dayPrice')}:</Text>
            <Text className='selected-detail__price-value'>
              {selectedDay.price !== null ? fmt(selectedDay.price) : t('priceCalendar.levelUnavailable')}
            </Text>
          </View>
          {selectedDay.available && (
            <View
              className='selected-detail__book-btn'
              onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
            >
              <Text className='selected-detail__book-text'>{t('priceCalendar.bookThisDay')}</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Price Alert Setup ── */}
      <View className='alert-setup'>
        <Text className='alert-setup__title'>{t('priceCalendar.alertTitle')}</Text>
        <Text className='alert-setup__desc'>{t('priceCalendar.alertDesc')}</Text>
        <View className='alert-setup__row'>
          <View className='alert-setup__input-wrap'>
            <Text className='alert-setup__currency'>¥</Text>
            <Input
              className='alert-setup__input'
              placeholder={t('priceCalendar.enterTargetPrice')}
              value={alertPrice}
              onInput={(e) => setAlertPrice(e.detail.value)}
              type='number'
            />
          </View>
          <View
            className={`alert-setup__btn ${alertLoading ? 'alert-setup__btn--loading' : ''}`}
            onClick={handleSetAlert}
          >
            <Text className='alert-setup__btn-text'>
              {alertLoading ? t('priceCalendar.settingAlert') : t('priceCalendar.setAlert')}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Quick Tips ── */}
      <View className='cal-tips'>
        <Text className='cal-tips__title'>{t('priceCalendar.tipsTitle')}</Text>
        <Text className='cal-tips__item'>{t('priceCalendar.tip1')}</Text>
        <Text className='cal-tips__item'>{t('priceCalendar.tip2')}</Text>
        <Text className='cal-tips__item'>{t('priceCalendar.tip3')}</Text>
        <Text className='cal-tips__item'>{t('priceCalendar.tip4')}</Text>
      </View>

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}
