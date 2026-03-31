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
import './index.scss'

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六']

/* ── Colour coding by level ── */
const LEVEL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: '#ECFDF5', text: '#10B981', label: '低价' },
  medium: { bg: '#FFFBEB', text: '#F59E0B', label: '均价' },
  high: { bg: '#FEF2F2', text: '#EF4444', label: '高价' },
  unavailable: { bg: '#F3F4F6', text: '#9CA3AF', label: '不可订' },
}

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
  const router = useRouter()
  const routeId = router.params.routeId || ''
  const routeTitle = router.params.routeTitle ? decodeURIComponent(router.params.routeTitle) : '路线价格'
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [calData, setCalData] = useState<PriceCalendarResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<PriceCalendarDay | null>(null)
  const [alertPrice, setAlertPrice] = useState('')
  const [alertLoading, setAlertLoading] = useState(false)

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
      Taro.showToast({ title: '暂无价格数据', icon: 'none' })
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
      Taro.showToast({ title: '请输入有效价格', icon: 'none' })
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
      Taro.showToast({ title: '价格提醒已设置', icon: 'success' })
      setAlertPrice('')
    } catch {
      Taro.showToast({ title: '设置失败，请重试', icon: 'none' })
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
            <Text className='cal-header__range-low'>最低 {fmt(calData.minPrice)}</Text>
            <Text className='cal-header__range-sep'> · </Text>
            <Text className='cal-header__range-high'>最高 {fmt(calData.maxPrice)}</Text>
          </View>
        )}
      </View>

      {/* ── Month Picker ── */}
      <View className='month-picker'>
        <View className='month-picker__btn' onClick={prevMonth}>
          <Text className='month-picker__btn-text'>＜</Text>
        </View>
        <Text className='month-picker__label'>{year}年{month}月</Text>
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
          <Text className='legend__text legend__text--unavail'>不可订</Text>
        </View>
      </View>

      {/* ── Weekday Header ── */}
      <View className='cal-week-header'>
        {WEEK_DAYS.map(wd => (
          <View key={wd} className='cal-week-header__cell'>
            <Text className={`cal-week-header__text ${wd === '日' || wd === '六' ? 'cal-week-header__text--weekend' : ''}`}>
              {wd}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Calendar Grid ── */}
      {loading ? (
        <View className='cal-loading'>
          <Text className='cal-loading__text'>加载价格中...</Text>
        </View>
      ) : !calData ? (
        <View className='cal-empty'>
          <Text className='cal-empty__icon'>📅</Text>
          <Text className='cal-empty__title'>暂无价格数据</Text>
          <Text className='cal-empty__desc'>该路线本月尚未发布价格</Text>
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
            <Text className='selected-detail__price-label'>当日价格:</Text>
            <Text className='selected-detail__price-value'>
              {selectedDay.price !== null ? fmt(selectedDay.price) : '不可订'}
            </Text>
          </View>
          {selectedDay.available && (
            <View
              className='selected-detail__book-btn'
              onClick={() => Taro.navigateTo({ url: '/pages/routes/index' })}
            >
              <Text className='selected-detail__book-text'>去预订这一天</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Price Alert Setup ── */}
      <View className='alert-setup'>
        <Text className='alert-setup__title'>🔔 设置价格提醒</Text>
        <Text className='alert-setup__desc'>当价格降至目标价时，系统将发送通知给您</Text>
        <View className='alert-setup__row'>
          <View className='alert-setup__input-wrap'>
            <Text className='alert-setup__currency'>¥</Text>
            <Input
              className='alert-setup__input'
              placeholder='输入目标价格'
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
              {alertLoading ? '设置中...' : '设置提醒'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Quick Tips ── */}
      <View className='cal-tips'>
        <Text className='cal-tips__title'>📊 价格规律说明</Text>
        <Text className='cal-tips__item'>· 绿色低价日通常为周二、周三出发</Text>
        <Text className='cal-tips__item'>· 红色高价日集中在周末及节假日</Text>
        <Text className='cal-tips__item'>· 提前 30 天以上预订可享早鸟价</Text>
        <Text className='cal-tips__item'>· 价格随名额减少实时上浮</Text>
      </View>

      <View style={{ height: '120rpx' }} />
    </ScrollView>
  )
}
