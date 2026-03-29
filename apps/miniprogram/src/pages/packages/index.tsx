import { useState, useEffect } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { PackageItem, fetchPackages } from '../../lib/api'
import './index.scss'

const TYPES = [
  { value: '', label: '全部' },
  { value: 'CLASSIC', label: '经典' },
  { value: 'PREMIUM', label: '精品' },
  { value: 'LUXURY', label: '奢华' },
  { value: 'CUSTOM', label: '定制' },
]

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

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [total, setTotal] = useState(0)
  const [activeType, setActiveType] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData('') }, [])

  const loadData = async (type: string) => {
    setLoading(true)
    try {
      const res = await fetchPackages({ type: type || undefined, pageSize: '20' })
      setPackages(Array.isArray(res.items) ? res.items : [])
      setTotal(res.total ?? 0)
    } catch {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (type: string) => {
    setActiveType(type)
    loadData(type)
  }

  return (
    <ScrollView className='packages-page' scrollY>
      {/* Type Filter */}
      <ScrollView className='filter-bar' scrollX>
        {TYPES.map(t => (
          <Text
            key={t.value}
            className={`filter-chip ${activeType === t.value ? 'filter-chip--active' : ''}`}
            onClick={() => handleTypeChange(t.value)}
          >
            {t.label}
          </Text>
        ))}
      </ScrollView>

      {/* Count */}
      {!loading && (
        <View className='result-count'>
          <Text className='result-count__text'>共 {total} 个套餐</Text>
        </View>
      )}

      {/* Package Cards */}
      {loading ? (
        <View className='loading'>
          <Text className='loading__text'>加载中...</Text>
        </View>
      ) : packages.length === 0 ? (
        <View className='empty'>
          <Text className='empty__icon'>📦</Text>
          <Text className='empty__text'>暂无相关套餐</Text>
        </View>
      ) : (
        <View className='packages-list'>
          {packages.map(pkg => {
            const typeColor = TYPE_COLORS[pkg.type] || '#0066FF'
            const typeLabel = TYPE_LABELS[pkg.type] || pkg.type
            return (
              <View
                key={pkg.id}
                className='package-card'
                hoverClass='package-card--hover'
                onClick={() => Taro.navigateTo({ url: `/pages/package-detail/index?id=${pkg.id}` })}
              >
                {/* Cover */}
                {pkg.coverImage ? (
                  <Image className='package-card__cover' src={pkg.coverImage} mode='aspectFill' lazyLoad />
                ) : (
                  <View className='package-card__cover package-card__cover--placeholder'>
                    <Text className='package-card__placeholder-icon'>🏯</Text>
                  </View>
                )}

                {/* Type Badge */}
                <View className='package-card__badge' style={{ backgroundColor: typeColor }}>
                  <Text className='package-card__badge-text'>{typeLabel}</Text>
                </View>

                {/* Body */}
                <View className='package-card__body'>
                  <Text className='package-card__title'>{pkg.title}</Text>
                  {pkg.subtitle && (
                    <Text className='package-card__subtitle'>{pkg.subtitle}</Text>
                  )}

                  {/* Meta row */}
                  <View className='package-card__meta'>
                    <Text className='package-card__meta-item'>⏱ {pkg.duration}天{pkg.nights}晚</Text>
                    {pkg.groupSize && (
                      <Text className='package-card__meta-item'>👥 {pkg.groupSize}</Text>
                    )}
                    {pkg.rating != null && (
                      <Text className='package-card__meta-item'>⭐ {pkg.rating.toFixed(1)}</Text>
                    )}
                  </View>

                  {/* Highlights */}
                  {pkg.highlights.length > 0 && (
                    <View className='package-card__highlights'>
                      {pkg.highlights.slice(0, 3).map((h, i) => (
                        <Text key={i} className='package-card__highlight'>✓ {h}</Text>
                      ))}
                    </View>
                  )}

                  {/* Price */}
                  <View className='package-card__footer'>
                    <View className='package-card__price'>
                      <Text className='package-card__price-from'>¥</Text>
                      <Text className='package-card__price-num'>{pkg.priceFrom.toLocaleString()}</Text>
                      <Text className='package-card__price-unit'>起/人</Text>
                    </View>
                    <View className='package-card__cta'>
                      <Text className='package-card__cta-text'>查看详情</Text>
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      )}
      <View style={{ height: '60rpx' }} />
    </ScrollView>
  )
}
