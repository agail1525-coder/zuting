import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Merchant, fetchMerchants } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function MerchantsPage() {
  const { t } = useTranslation()

  const TYPES = [
    { key: '', label: t('merchants.filterAll') },
    { key: 'TEMPLE', label: t('merchants.typeTemple') },
    { key: 'GUIDE', label: t('merchants.typeGuide') },
    { key: 'HOTEL', label: t('merchants.typeHotel') },
    { key: 'TRANSPORT', label: t('merchants.typeTransport') },
  ]

  const TYPE_LABELS: Record<string, string> = {
    TEMPLE: t('merchants.typeTemple'),
    GUIDE: t('merchants.typeGuide'),
    HOTEL: t('merchants.typeHotel'),
    TRANSPORT: t('merchants.typeTransport'),
  }

  const [activeType, setActiveType] = useState('')
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [activeType])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetchMerchants(activeType || undefined, 1)
      setMerchants(res.items)
    } catch (err) {
      console.error('Failed to load merchants:', err)
      Taro.showToast({ title: t('merchants.loadFailed'), icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className='merchants-page'>
      {/* Type filter tabs */}
      <ScrollView className='type-tabs' scrollX>
        {TYPES.map(tp => (
          <View
            key={tp.key}
            className={`type-tabs__item ${activeType === tp.key ? 'type-tabs__item--active' : ''}`}
            onClick={() => setActiveType(tp.key)}
          >
            <Text className={`type-tabs__text ${activeType === tp.key ? 'type-tabs__text--active' : ''}`}>
              {tp.label}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Merchant list */}
      <ScrollView className='merchant-list' scrollY>
        {loading ? (
          <View className='merchant-list__empty'>
            <Text className='merchant-list__empty-text'>{t('common.loading')}</Text>
          </View>
        ) : merchants.length === 0 ? (
          <View className='merchant-list__empty'>
            <Text className='merchant-list__empty-icon'>🏪</Text>
            <Text className='merchant-list__empty-text'>{t('merchants.noMerchants')}</Text>
          </View>
        ) : (
          merchants.map(m => (
            <View
              key={m.id}
              className='merchant-card'
              hoverClass='merchant-card--hover'
              onClick={() => Taro.navigateTo({ url: `/pages/merchant-detail/index?id=${m.id}` })}
            >
              <View className='merchant-card__icon'>
                <Text className='merchant-card__icon-emoji'>🏪</Text>
              </View>
              <View className='merchant-card__info'>
                <Text className='merchant-card__name'>{m.name}</Text>
                <View className='merchant-card__meta'>
                  <View className='merchant-card__type-badge'>
                    <Text className='merchant-card__type-text'>{TYPE_LABELS[m.type] ?? m.type}</Text>
                  </View>
                  <View className='merchant-card__rating'>
                    <Text className='merchant-card__rating-star'>★</Text>
                    <Text className='merchant-card__rating-text'>{m.rating.toFixed(1)}</Text>
                  </View>
                  <Text className='merchant-card__orders'>{t('merchants.orderCount', { count: m.totalOrders })}</Text>
                </View>
                {m.address && (
                  <Text className='merchant-card__address'>📍 {m.address}</Text>
                )}
              </View>
              <Text className='merchant-card__arrow'>›</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}
