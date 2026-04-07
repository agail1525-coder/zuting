import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PriceCompareItem, fetchCheapestRoutes } from '../../lib/api'
import { useTranslation } from '../../lib/i18n'
import './index.scss'

export default function PriceComparePage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<PriceCompareItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCheapestRoutes(20)
      .then(setItems)
      .catch(err => {
        console.error('Failed to load price compare:', err)
        Taro.showToast({ title: t('priceCompare.loadFailed'), icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [])

  const handleTap = (routeId: string) => {
    Taro.navigateTo({ url: `/pages/route-detail/index?id=${routeId}` })
  }

  return (
    <View className='price-compare'>
      <View className='page-header'>
        <Text className='page-header__title'>{t('priceCompare.title')}</Text>
        <Text className='page-header__count'>{t('priceCompare.routeCount', { count: items.length })}</Text>
      </View>

      <ScrollView className='price-compare__list' scrollY>
        {loading ? (
          <Text className='loading-text'>{t('common.loading')}</Text>
        ) : items.length === 0 ? (
          <Text className='empty-text'>{t('priceCompare.noData')}</Text>
        ) : (
          items.map((item, index) => (
            <View
              key={item.routeId}
              className='price-compare__card'
              hoverClass='price-compare__card--hover'
              onClick={() => handleTap(item.routeId)}
            >
              <View className='price-compare__rank'>
                <Text className={`price-compare__rank-text ${index < 3 ? 'price-compare__rank-text--top' : ''}`}>
                  #{index + 1}
                </Text>
              </View>
              <View className='price-compare__body'>
                <Text className='price-compare__title'>{item.routeTitle}</Text>
                <View className='price-compare__price-row'>
                  <Text className='price-compare__current'>¥{item.priceFrom}</Text>
                  {item.lowestPrice < item.priceFrom && (
                    <Text className='price-compare__low'>{t('priceCompare.lowest')} ¥{item.lowestPrice}</Text>
                  )}
                </View>
                <View className='price-compare__meta'>
                  <Text className='price-compare__duration'>{t('priceCompare.daysNights', { days: item.duration, nights: item.nights })}</Text>
                  <Text className='price-compare__avg'>{t('priceCompare.avgPrice')} ¥{Math.round(item.avgPrice)}</Text>
                </View>
              </View>
            </View>
          ))
        )}
        <View style={{ height: '120rpx' }} />
      </ScrollView>
    </View>
  )
}
